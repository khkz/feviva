import {
  Playlist,
  RmxAudioStatusMessage,
  type OnStatusCallbackData,
  type OnStatusCallbackUpdateData,
  type OnStatusErrorCallbackData,
  type OnStatusTrackChangedData,
} from "capacitor-plugin-playlist";
import type { RepeatMode } from "../types";
import { isSettledInForeground, watchAppVisibility } from "./appVisibility";
import { EngineEmitter } from "./emitter";
import {
  parseNativeTrackId,
  toNativeTrack,
  toNativeTrackId,
  type NativePlatform,
  type PlaylistApi,
} from "./nativePlaylist";
import { reportedBuffering, reportedPlaying, reportedProgress } from "./nativeStatus";
import { PlayIntent } from "./playIntent";
import {
  IDLE_SNAPSHOT,
  type AudioEngine,
  type EngineListener,
  type EngineSnapshot,
  type EngineTrack,
  type LoadOptions,
} from "./types";

/**
 * iOS/Android engine backed by capacitor-plugin-playlist: AVQueuePlayer on iOS,
 * Media3 ExoPlayer + MediaSessionService on Android. The OS owns the queue, the
 * lock-screen controls and the background session, so playback keeps advancing
 * while the WebView is suspended. JavaScript state catches up from the status
 * events when the app returns to the foreground.
 *
 * iOS relies on the patched plugin (scripts/patch-native-audio.mjs): setPlaybackRate
 * keeps the speed in AVPlayer.defaultRate and never starts a paused player.
 */
export class NativeAudioEngine implements AudioEngine {
  readonly kind = "native" as const;
  readonly element = null;

  private emitter = new EngineEmitter();
  private tracks: EngineTrack[] = [];
  private generation = 0;
  private snapshot: EngineSnapshot = { ...IDLE_SNAPSHOT };
  private rate = 1;
  private volume = 1;
  private muted = false;
  private repeat: RepeatMode = "off";
  /** Index of the last track that played to its end (COMPLETED), to tell natural advances from skips. */
  private lastCompletedIndex = -1;
  /** Tracks of this queue that failed to load; iOS also reports the one preloading next. */
  private failed = new Set<number>();
  /** While a new queue is handed over, Android first reports track 0 and then the start track. */
  private replacingQueue = false;
  private intent = new PlayIntent((reported) => {
    // The player never confirmed the command: trust what it last reported.
    if (reported !== null && reported !== this.snapshot.isPlaying) {
      this.snapshot = { ...this.snapshot, isPlaying: reported, isBuffering: false };
      this.emitSnapshot();
    }
  });

  private constructor(
    private plugin: PlaylistApi,
    private platform: NativePlatform,
  ) {}

  static async create(plugin: PlaylistApi, platform: NativePlatform) {
    watchAppVisibility();
    const engine = new NativeAudioEngine(plugin, platform);
    await plugin.addListener("status", ({ status }) => engine.handleStatus(status));
    await plugin.setOptions({ verbose: false, options: { icon: "ic_notification" } });
    await plugin.initialize();
    return engine;
  }

  async load(tracks: EngineTrack[], options: LoadOptions) {
    this.generation += 1;
    this.tracks = [...tracks];
    this.failed.clear();
    if (this.tracks.length === 0) {
      await this.stop();
      return;
    }

    const index = Math.min(Math.max(0, Math.trunc(options.index) || 0), this.tracks.length - 1);
    const previousIndex = this.snapshot.index;
    const position = Math.max(0, Math.floor(options.position ?? 0));
    const items = this.tracks.map((track, i) => toNativeTrack(track, toNativeTrackId(this.generation, i)));

    this.lastCompletedIndex = -1;
    if (options.autoplay) this.intent.expect(true);
    else this.intent.clear();
    this.snapshot = {
      index,
      trackId: null,
      isPlaying: options.autoplay,
      isBuffering: options.autoplay,
      position,
      duration: 0,
      ended: false,
    };

    await this.plugin.setLoop({ loop: this.nativeLoop() });
    this.replacingQueue = true;
    try {
      await this.plugin.setPlaylistItems({
        items,
        options: {
          playFromId: items[index].trackId,
          playFromPosition: position,
          startPaused: !options.autoplay,
          retainPosition: false,
        },
      });
    } catch (error) {
      warn("the player rejected the queue", error); // an ERROR status follows for a bad file
    } finally {
      this.replacingQueue = false;
    }
    await this.applyVolume();
    await this.applyRate();

    this.emitter.emit({ type: "trackchange", index, previousIndex, trackId: this.idAt(index) });
    this.emitSnapshot();
  }

  async play() {
    const { index, position } = this.snapshot;
    if (index < 0) return;
    // A track that failed to load can't be played again: load it afresh.
    if (this.failed.has(index)) return this.load(this.tracks, { index, position, autoplay: true });
    this.intent.expect(true);
    this.setPlaying(true);
    await this.plugin.play().catch((error) => warn("play was rejected", error));
  }

  async pause() {
    if (this.snapshot.index < 0) return;
    this.intent.expect(false);
    this.setPlaying(false);
    await this.plugin.pause();
  }

  async stop() {
    const hadQueue = this.tracks.length > 0;
    this.generation += 1;
    this.tracks = [];
    this.failed.clear();
    this.lastCompletedIndex = -1;
    this.intent.clear();
    this.snapshot = { ...IDLE_SNAPSHOT };
    // Clearing the queue doesn't pause AVQueuePlayer; a later paused load would then start playing.
    if (hadQueue) await this.plugin.pause().catch((error) => warn("could not pause", error));
    await this.plugin.clearAllItems();
    this.emitSnapshot();
  }

  async seek(position: number) {
    if (this.snapshot.index < 0) return;
    const target = Math.max(0, position);
    this.snapshot = { ...this.snapshot, position: target };
    await this.plugin.seekTo({ position: target });
    this.emitSnapshot();
  }

  async skipTo(index: number, position = 0) {
    if (index < 0 || index >= this.tracks.length) return;
    // AVPlayer can't replay an item that failed to load: retry it with a fresh queue.
    if (this.platform === "ios" && this.failed.has(index)) {
      return this.load(this.tracks, { index, position, autoplay: true });
    }
    const previousIndex = this.snapshot.index;
    this.lastCompletedIndex = -1;
    this.intent.expect(true);
    this.snapshot = {
      ...this.snapshot,
      index,
      position: Math.max(0, position),
      duration: 0,
      ended: false,
      isPlaying: true,
      isBuffering: true,
    };
    await this.plugin
      .playTrackByIndex({ index, position: Math.max(0, position) })
      .catch((error) => warn("could not switch track", error));
    if (previousIndex !== index) this.emitter.emit({ type: "trackchange", index, previousIndex, trackId: this.idAt(index) });
    this.emitSnapshot();
  }

  async append(track: EngineTrack) {
    const index = this.tracks.length;
    this.tracks.push(track);
    await this.plugin.addItem({ item: toNativeTrack(track, toNativeTrackId(this.generation, index)) });
    await this.plugin.setLoop({ loop: this.nativeLoop() });
  }

  // Settings are stored while idle and applied when a queue is loaded: some plugin
  // implementations reject volume/rate calls before any track exists.
  async setRate(rate: number) {
    this.rate = rate;
    if (this.tracks.length > 0) await this.applyRate();
  }

  async setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.tracks.length > 0) await this.applyVolume();
  }

  async setMuted(muted: boolean) {
    this.muted = muted;
    if (this.tracks.length > 0) await this.applyVolume();
  }

  async setRepeat(mode: RepeatMode) {
    this.repeat = mode;
    await this.plugin.setLoop({ loop: this.nativeLoop() });
  }

  getSnapshot(): EngineSnapshot {
    return { ...this.snapshot, trackId: this.idAt(this.snapshot.index) };
  }

  private idAt(index: number) {
    return this.tracks[index]?.id ?? null;
  }

  subscribe(listener: EngineListener) {
    return this.emitter.subscribe(listener);
  }

  /** Exposed for tests; called for every native status event. */
  handleStatus(status: OnStatusCallbackData) {
    const { msgType } = status;
    const track = parseNativeTrackId(status.trackId);

    if (msgType === RmxAudioStatusMessage.RMXSTATUS_TRACK_CHANGED) {
      this.handleTrackChanged(status);
      return;
    }
    if (msgType === RmxAudioStatusMessage.RMXSTATUS_PLAYLIST_COMPLETED) {
      this.handlePlaylistCompleted();
      return;
    }
    if (
      msgType === RmxAudioStatusMessage.RMXSTATUS_STOPPED ||
      msgType === RmxAudioStatusMessage.RMXSTATUS_PLAYLIST_CLEARED
    ) {
      // Android reports STOPPED with the id of each track that finishes while the next one
      // keeps playing; only a STOPPED without a track means the player stopped. Replacing the
      // queue also reports it cleared: held back while playback is expected.
      if (track) return;
      if (this.intent.report(false) === false && (this.snapshot.isPlaying || this.snapshot.isBuffering)) {
        this.setPlaying(false);
      }
      return;
    }

    if (!track || track.generation !== this.generation) return;

    if (msgType === RmxAudioStatusMessage.RMXSTATUS_ERROR) {
      this.failed.add(track.index);
      if (track.index !== this.snapshot.index) return; // the next track preloading; reported if reached
      const error = status.value as OnStatusErrorCallbackData;
      this.intent.clear();
      this.snapshot = { ...this.snapshot, isPlaying: false, isBuffering: false };
      this.emitter.emit({
        type: "error",
        index: track.index,
        message: error?.message || "Error de reproducción",
        trackId: this.idAt(track.index),
      });
      this.emitSnapshot();
      return;
    }
    if (msgType === RmxAudioStatusMessage.RMXSTATUS_COMPLETED) {
      this.lastCompletedIndex = track.index;
      this.emitter.emit({ type: "trackend", index: track.index, trackId: this.idAt(track.index) });
      return;
    }
    if (track.index !== this.snapshot.index) return; // e.g. the next item preloading

    const value = status.value as OnStatusCallbackUpdateData | undefined;
    const next: EngineSnapshot = { ...this.snapshot, ...reportedProgress(value) };
    const buffering = reportedBuffering(msgType);
    if (buffering !== null) next.isBuffering = buffering;

    const reported = reportedPlaying(msgType, value);
    const applied = reported === null ? null : this.intent.report(reported);
    if (applied !== null) {
      next.isPlaying = applied;
      next.isBuffering = false;
      if (applied) next.ended = false;
    }

    this.snapshot = next;
    this.emitSnapshot();
  }

  private handleTrackChanged(status: OnStatusCallbackData) {
    if (this.replacingQueue) return;
    const value = status.value as OnStatusTrackChangedData | undefined;
    // Only our own track ids count: at the end of the queue iOS reports "NONE" with currentIndex 0.
    const track = parseNativeTrackId(value?.currentItem?.trackId) ?? parseNativeTrackId(status.trackId);
    if (!track || track.generation !== this.generation) return;
    const { index } = track;
    if (index >= this.tracks.length || index === this.snapshot.index) return;

    const previousIndex = this.snapshot.index;
    const finishedNaturally = previousIndex >= 0 && this.lastCompletedIndex === previousIndex;
    this.lastCompletedIndex = -1;

    // Repeat-one over a multi-track queue: when a track ends on its own (not a skip from
    // the lock screen), go back to it. Only while JavaScript is awake and the event is live.
    if (finishedNaturally && this.repeat === "one" && this.tracks.length > 1 && this.canRestartFromJs()) {
      void this.restart(previousIndex);
      return;
    }

    this.snapshot = { ...this.snapshot, index, position: 0, duration: 0, ended: false };
    this.emitter.emit({ type: "trackchange", index, previousIndex, trackId: this.idAt(index) });
    this.emitSnapshot();
    if (this.failed.has(index)) {
      this.emitter.emit({ type: "error", index, message: "No se pudo cargar el audio", trackId: this.idAt(index) });
    }
  }

  private handlePlaylistCompleted() {
    // Only once per queue, and only after its last track played to the end: iOS may report it
    // twice, and a report left over from a replaced queue carries no track id to filter by.
    if (this.tracks.length === 0 || this.snapshot.ended) return;
    if (this.lastCompletedIndex !== this.tracks.length - 1) return;
    if (this.repeat !== "off") {
      // iOS loops by itself when told to (and still reports the end). Android never loops a
      // single track and the web implementation never loops: restart from JavaScript.
      if (this.platform === "ios" && this.nativeLoop()) return;
      if (this.intent.pending === true) return; // a restart is already on its way
      if (this.canRestartFromJs()) {
        void this.restart(this.repeat === "one" ? this.snapshot.index : 0);
        return;
      }
    }
    this.intent.clear();
    this.snapshot = { ...this.snapshot, isPlaying: false, isBuffering: false, ended: true };
    this.emitter.emit({ type: "queueend" });
    this.emitSnapshot();
  }

  /** iOS replays events queued while the app slept; restarting from those would jump back late. */
  private canRestartFromJs() {
    return this.platform !== "ios" || isSettledInForeground();
  }

  private async restart(index: number) {
    this.lastCompletedIndex = -1;
    this.intent.expect(true);
    await this.plugin.playTrackByIndex({ index, position: 0 }).catch((error) => warn("could not restart the track", error));
  }

  private setPlaying(isPlaying: boolean) {
    if (this.snapshot.isPlaying === isPlaying && !this.snapshot.isBuffering) return;
    this.snapshot = { ...this.snapshot, isPlaying, isBuffering: false };
    this.emitSnapshot();
  }

  private nativeLoop() {
    return this.repeat === "all" || (this.repeat === "one" && this.tracks.length === 1);
  }

  private async applyRate() {
    await this.plugin.setPlaybackRate({ rate: this.rate });
  }

  private async applyVolume() {
    await this.plugin.setPlaybackVolume({ volume: this.muted ? 0 : this.volume });
  }

  private emitSnapshot() {
    this.emitter.emit({ type: "snapshot", snapshot: this.getSnapshot() });
  }
}

function warn(message: string, error: unknown) {
  console.warn(`[audio] ${message}`, error);
}

/** This module is itself loaded on demand (see getAudioEngine), so the plugin never reaches the web bundle. */
export function createNativeAudioEngine(platform: NativePlatform) {
  return NativeAudioEngine.create(Playlist, platform);
}
