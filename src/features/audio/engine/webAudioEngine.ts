import type { RepeatMode } from "../types";
import { EngineEmitter } from "./emitter";
import type { AudioEngine, EngineListener, EngineSnapshot, EngineTrack, LoadOptions } from "./types";

const MEDIA_ERROR_MESSAGES: Record<number, string> = {
  1: "Reproducción cancelada",
  2: "Error de red",
  3: "No se pudo decodificar el audio",
  4: "Formato de audio no soportado",
};

/**
 * Browser engine: one HTMLAudioElement for the whole app. The queue advances
 * by swapping the source of that same element inside its `ended` handler,
 * which mobile browsers keep alive in the background far better than creating
 * a new Audio() per track.
 */
export class WebAudioEngine implements AudioEngine {
  readonly kind = "web" as const;
  readonly element: HTMLAudioElement;

  private emitter = new EngineEmitter();
  private tracks: EngineTrack[] = [];
  private index = -1;
  private repeat: RepeatMode = "off";
  private rate = 1;
  private pendingSeek: number | null = null;
  private isBuffering = false;
  private ended = false;
  /** play() was requested and the element has not started or failed yet (avoids a paused flash). */
  private playPending = false;
  /** The current source failed to load; the element still reports paused === false then. */
  private failed = false;

  constructor(element: HTMLAudioElement = new Audio()) {
    this.element = element;
    this.element.preload = "metadata";

    const emitSnapshot = () => this.emitSnapshot();
    this.element.addEventListener("timeupdate", emitSnapshot);
    this.element.addEventListener("durationchange", emitSnapshot);
    this.element.addEventListener("pause", () => {
      this.playPending = false;
      this.emitSnapshot();
    });
    this.element.addEventListener("play", () => {
      this.ended = false;
      this.emitSnapshot();
    });
    this.element.addEventListener("playing", () => {
      this.playPending = false;
      this.isBuffering = false;
      this.emitSnapshot();
    });
    this.element.addEventListener("waiting", () => {
      this.isBuffering = true;
      this.emitSnapshot();
    });
    this.element.addEventListener("loadedmetadata", () => {
      this.applyPendingSeek();
      this.emitSnapshot();
    });
    this.element.addEventListener("ended", () => {
      void this.handleEnded();
    });
    this.element.addEventListener("error", () => {
      if (this.index < 0) return; // Errors while idle come from clearing the source.
      this.failed = true;
      this.playPending = false;
      this.isBuffering = false;
      const code = this.element.error?.code ?? 0;
      this.emitter.emit({
        type: "error",
        index: this.index,
        message: MEDIA_ERROR_MESSAGES[code] ?? "Error de reproducción",
        trackId: this.idAt(this.index),
      });
      this.emitSnapshot();
    });
  }

  async load(tracks: EngineTrack[], options: LoadOptions) {
    this.tracks = [...tracks];
    if (this.tracks.length === 0) {
      await this.stop();
      return;
    }
    const index = clampIndex(options.index, this.tracks.length);
    await this.setIndex(index, options.position ?? 0, options.autoplay, true);
  }

  // Commands don't wait for playback to start (that can take seconds on a slow network);
  // a pause in the meantime interrupts it.
  async play() {
    if (this.index < 0) return;
    void this.safePlay();
  }

  async pause() {
    this.element.pause();
  }

  async stop() {
    this.playPending = false;
    this.element.pause();
    this.tracks = [];
    this.index = -1;
    this.pendingSeek = null;
    this.isBuffering = false;
    this.ended = false;
    this.failed = false;
    this.element.removeAttribute("src");
    this.element.load();
    this.emitSnapshot();
  }

  async seek(position: number) {
    if (this.index < 0) return;
    if (this.element.readyState < HTMLMediaElement.HAVE_METADATA) {
      this.pendingSeek = position;
      return;
    }
    this.element.currentTime = Math.max(0, position);
    this.emitSnapshot();
  }

  async skipTo(index: number, position = 0) {
    if (index < 0 || index >= this.tracks.length) return;
    await this.setIndex(index, position, true, false);
  }

  async append(track: EngineTrack) {
    this.tracks.push(track);
  }

  async setRate(rate: number) {
    this.rate = rate;
    // defaultPlaybackRate survives source changes; playbackRate is reset by load().
    this.element.defaultPlaybackRate = rate;
    this.element.playbackRate = rate;
  }

  async setVolume(volume: number) {
    this.element.volume = Math.min(1, Math.max(0, volume));
  }

  async setMuted(muted: boolean) {
    this.element.muted = muted;
  }

  async setRepeat(mode: RepeatMode) {
    this.repeat = mode;
  }

  getSnapshot(): EngineSnapshot {
    const duration = this.element.duration;
    return {
      index: this.index,
      trackId: this.idAt(this.index),
      isPlaying:
        this.index >= 0 && !this.failed && (this.playPending || (!this.element.paused && !this.element.ended)),
      isBuffering: this.isBuffering,
      position: this.index >= 0 ? this.element.currentTime || 0 : 0,
      duration: Number.isFinite(duration) ? duration : 0,
      ended: this.ended,
    };
  }

  subscribe(listener: EngineListener) {
    return this.emitter.subscribe(listener);
  }

  private idAt(index: number) {
    return this.tracks[index]?.id ?? null;
  }

  private async setIndex(index: number, position: number, autoplay: boolean, isNewQueue: boolean) {
    const previousIndex = this.index;
    const track = this.tracks[index];
    this.index = index;
    this.ended = false;
    this.failed = false;
    this.isBuffering = autoplay;
    this.playPending = autoplay;
    this.pendingSeek = position > 0 ? position : null;

    this.element.src = track.url;
    this.element.defaultPlaybackRate = this.rate;
    this.element.playbackRate = this.rate;
    this.element.load();

    if (isNewQueue || previousIndex !== index) {
      this.emitter.emit({ type: "trackchange", index, previousIndex, trackId: this.idAt(index) });
    }
    this.emitSnapshot();

    if (autoplay) void this.safePlay();
  }

  private applyPendingSeek() {
    if (this.pendingSeek === null) return;
    const target = this.pendingSeek;
    this.pendingSeek = null;
    const duration = this.element.duration;
    if (Number.isFinite(duration) && target >= duration) return;
    this.element.currentTime = target;
  }

  private async handleEnded() {
    const finished = this.index;
    if (finished < 0) return;
    this.emitter.emit({ type: "trackend", index: finished, trackId: this.idAt(finished) });

    if (this.repeat === "one") {
      this.element.currentTime = 0;
      await this.safePlay();
      return;
    }
    if (finished + 1 < this.tracks.length) {
      await this.setIndex(finished + 1, 0, true, false);
      return;
    }
    if (this.repeat === "all" && this.tracks.length > 0) {
      await this.setIndex(0, 0, true, false);
      return;
    }

    this.ended = true;
    this.isBuffering = false;
    this.emitter.emit({ type: "queueend" });
    this.emitSnapshot();
  }

  private async safePlay() {
    this.playPending = true;
    try {
      await this.element.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // The source changed before playback started; the newer request owns playPending.
        return;
      }
      this.playPending = false;
      // NotAllowedError: the browser blocked autoplay; the UI stays paused.
      console.warn("[audio] play() was rejected", error);
      this.isBuffering = false;
      this.emitSnapshot();
    }
  }

  private emitSnapshot() {
    this.emitter.emit({ type: "snapshot", snapshot: this.getSnapshot() });
  }
}

function clampIndex(index: number, length: number) {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(0, Math.trunc(index)), length - 1);
}
