import type { RepeatMode } from "../types";

/** A playable track as the engine sees it (no React or app-specific data). */
export interface EngineTrack {
  /** App-level identifier, used for logs and debugging. */
  id: string;
  url: string;
  title: string;
  artist: string;
  album: string;
  /** Absolute http(s) URL shown on the lock screen (native only). */
  artworkUrl?: string;
}

export interface EngineSnapshot {
  /** Index of the current track in the loaded queue, -1 when idle. */
  index: number;
  /** EngineTrack.id of the current track, null when idle. Tells which queue a snapshot belongs to. */
  trackId: string | null;
  isPlaying: boolean;
  isBuffering: boolean;
  /** Seconds. */
  position: number;
  /** Seconds, 0 while unknown. */
  duration: number;
  /** True once the last track finished and nothing else will play. */
  ended: boolean;
}

// trackId (EngineTrack.id) tells which queue an event belongs to: the UI may already hold a
// newer queue while the engine still reports on the previous one.
export type EngineEvent =
  | { type: "snapshot"; snapshot: EngineSnapshot }
  | { type: "trackchange"; index: number; previousIndex: number; trackId: string | null }
  | { type: "trackend"; index: number; trackId: string | null }
  | { type: "queueend" }
  | { type: "error"; index: number; message: string; trackId: string | null };

export type EngineListener = (event: EngineEvent) => void;

export interface LoadOptions {
  index: number;
  /** Start position in seconds for the first track. */
  position?: number;
  autoplay: boolean;
}

/**
 * Playback engine behind the global player. The web implementation uses one
 * HTMLAudioElement; the native one hands the whole queue to the OS player so
 * it keeps advancing with the screen locked.
 */
export interface AudioEngine {
  readonly kind: "web" | "native";
  /** The underlying element on web; null on native. Legacy consumers only. */
  readonly element: HTMLAudioElement | null;
  load(tracks: EngineTrack[], options: LoadOptions): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(position: number): Promise<void>;
  skipTo(index: number, position?: number): Promise<void>;
  append(track: EngineTrack): Promise<void>;
  setRate(rate: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  setRepeat(mode: RepeatMode): Promise<void>;
  getSnapshot(): EngineSnapshot;
  subscribe(listener: EngineListener): () => void;
}

export const IDLE_SNAPSHOT: EngineSnapshot = {
  index: -1,
  trackId: null,
  isPlaying: false,
  isBuffering: false,
  position: 0,
  duration: 0,
  ended: false,
};
