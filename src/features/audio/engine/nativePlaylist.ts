import type { AudioTrack, PlaylistPlugin } from "capacitor-plugin-playlist";
import type { EngineTrack } from "./types";

export type NativePlatform = "ios" | "android";

/** Subset of capacitor-plugin-playlist used by the native engine; lets tests inject a fake. */
export type PlaylistApi = Pick<
  PlaylistPlugin,
  | "addListener"
  | "setOptions"
  | "initialize"
  | "setPlaylistItems"
  | "addItem"
  | "clearAllItems"
  | "play"
  | "pause"
  | "seekTo"
  | "playTrackByIndex"
  | "setPlaybackVolume"
  | "setLoop"
  | "setPlaybackRate"
>;

const TRACK_ID = /^q(\d+)-(\d+)$/;

/** Native track ids encode the queue generation so events from an older queue are ignored. */
export const toNativeTrackId = (generation: number, index: number) => `q${generation}-${index}`;

export const parseNativeTrackId = (trackId: string | undefined | null) => {
  const match = trackId ? TRACK_ID.exec(trackId) : null;
  return match ? { generation: Number(match[1]), index: Number(match[2]) } : null;
};

/** Lock-screen / notification metadata for one queue item. */
export const toNativeTrack = (track: EngineTrack, trackId: string): AudioTrack => ({
  trackId,
  assetUrl: track.url,
  title: track.title,
  artist: track.artist,
  album: track.album,
  albumArt: track.artworkUrl,
  isStream: false,
});
