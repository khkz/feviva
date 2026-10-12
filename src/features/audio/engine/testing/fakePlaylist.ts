import { RmxAudioStatusMessage, type OnStatusCallbackData } from "capacitor-plugin-playlist";
import { vi } from "vitest";
import { NativeAudioEngine } from "../nativeAudioEngine";
import { toNativeTrackId, type PlaylistApi } from "../nativePlaylist";
import type { EngineEvent, EngineTrack } from "../types";

/** Test helpers: a fake capacitor-plugin-playlist and the status events it would send. */

export const track = (n: number): EngineTrack => ({
  id: `oracion:${n}`,
  url: `https://cdn.example/audio-${n}.mp3`,
  title: `Track ${n}`,
  artist: "Oración",
  album: "El Rugido",
  artworkUrl: "https://elrugido.com/pwa-512x512.png",
});

export function fakePlugin() {
  const calls: Array<[string, unknown]> = [];
  let listener: ((data: { action: string; status: OnStatusCallbackData }) => void) | null = null;
  /** Runs inside a plugin call before it resolves, to emit events the way the native side does. */
  const during: Partial<Record<string, (arg: unknown) => void>> = {};
  const record =
    (name: string) =>
    async (arg?: unknown) => {
      calls.push([name, arg]);
      during[name]?.(arg);
    };
  const plugin = {
    addListener: vi.fn(async (_event: string, fn: typeof listener) => {
      listener = fn;
      return { remove: async () => undefined };
    }),
    setOptions: record("setOptions"),
    initialize: record("initialize"),
    setPlaylistItems: record("setPlaylistItems"),
    addItem: record("addItem"),
    clearAllItems: record("clearAllItems"),
    play: record("play"),
    pause: record("pause"),
    seekTo: record("seekTo"),
    playTrackByIndex: record("playTrackByIndex"),
    setPlaybackVolume: record("setPlaybackVolume"),
    setLoop: record("setLoop"),
    setPlaybackRate: record("setPlaybackRate"),
  } as unknown as PlaylistApi;
  const emit = (status: OnStatusCallbackData) => listener?.({ action: "status", status });
  const callsTo = (name: string) => calls.filter(([n]) => n === name).map(([, arg]) => arg);
  return { plugin, emit, calls, callsTo, during };
}

export async function setup(platform: "ios" | "android" = "ios") {
  const fake = fakePlugin();
  const engine = await NativeAudioEngine.create(fake.plugin, platform);
  const events: EngineEvent[] = [];
  engine.subscribe((event) => events.push(event));
  return { ...fake, engine, events };
}

export const update = (trackId: string, msgType: RmxAudioStatusMessage, extra: Record<string, unknown> = {}) =>
  ({
    trackId,
    msgType,
    value: { trackId, currentIndex: 0, status: "playing", currentPosition: 0, duration: 0, ...extra },
  }) as unknown as OnStatusCallbackData;

export const trackChanged = (generation: number, index: number) =>
  ({
    trackId: toNativeTrackId(generation, index),
    msgType: RmxAudioStatusMessage.RMXSTATUS_TRACK_CHANGED,
    value: { currentIndex: index, currentItem: { trackId: toNativeTrackId(generation, index) } },
  }) as unknown as OnStatusCallbackData;

export const withoutTrack = (msgType: RmxAudioStatusMessage) =>
  ({ trackId: "INVALID", msgType, value: null }) as unknown as OnStatusCallbackData;

export const errorFor = (trackId: string, message = "decode") =>
  ({ trackId, msgType: RmxAudioStatusMessage.RMXSTATUS_ERROR, value: { code: 3, message } }) as unknown as OnStatusCallbackData;
