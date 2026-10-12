import { RmxAudioStatusMessage } from "capacitor-plugin-playlist";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toNativeTrackId } from "./nativePlaylist";
import { errorFor, setup, track, trackChanged, update, withoutTrack } from "./testing/fakePlaylist";

// Behaviour that depends on how iOS (AVQueuePlayer) and Android (Media3) report events.
const { RMXSTATUS_PLAYING, RMXSTATUS_COMPLETED, RMXSTATUS_STOPPED } = RmxAudioStatusMessage;
const playlistCompleted = withoutTrack(RmxAudioStatusMessage.RMXSTATUS_PLAYLIST_COMPLETED);

describe("NativeAudioEngine on Android", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps playing through the STOPPED Media3 reports for each finished track", async () => {
    const { engine, emit, events } = await setup("android");
    await engine.load([track(1), track(2)], { index: 0, autoplay: true });
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYING));
    events.length = 0;

    emit(update(toNativeTrackId(1, 0), RMXSTATUS_COMPLETED, { status: "stopped" }));
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_STOPPED, { status: "stopped" }));
    emit(trackChanged(1, 1));
    expect(engine.getSnapshot()).toMatchObject({ index: 1, isPlaying: true });
    expect(events.some((event) => event.type === "snapshot" && !event.snapshot.isPlaying)).toBe(false);

    // A STOPPED without a track is the player itself stopping.
    emit(withoutTrack(RMXSTATUS_STOPPED));
    expect(engine.getSnapshot().isPlaying).toBe(false);
  });

  it("ignores the track changes reported while a new queue is handed over", async () => {
    const { engine, emit, events, during } = await setup("android");
    // setMediaItems reports item 0 before the player seeks to the start track.
    during.setPlaylistItems = () => {
      emit(trackChanged(1, 0));
      emit(trackChanged(1, 2));
    };
    await engine.load([track(1), track(2), track(3)], { index: 2, position: 30, autoplay: true });
    expect(events.filter((event) => event.type === "trackchange")).toEqual([
      { type: "trackchange", index: 2, previousIndex: -1, trackId: "oracion:3" },
    ]);
    expect(engine.getSnapshot()).toMatchObject({ index: 2, position: 30 });
  });

  it("restarts a single track on repeat, since Media3 never loops one item", async () => {
    const { engine, emit, events, callsTo } = await setup("android");
    await engine.setRepeat("all");
    await engine.load([track(1)], { index: 0, autoplay: true });
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYING));
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_COMPLETED));
    emit(playlistCompleted);
    expect(callsTo("playTrackByIndex")).toEqual([{ index: 0, position: 0 }]);
    expect(events).not.toContainEqual({ type: "queueend" });
  });

  it("repeat-all restarts from the first track when the player stops at the end", async () => {
    const { engine, emit, events, callsTo } = await setup("android");
    await engine.setRepeat("all");
    await engine.load([track(1), track(2)], { index: 1, autoplay: true });
    emit(update(toNativeTrackId(1, 1), RMXSTATUS_PLAYING));
    emit(update(toNativeTrackId(1, 1), RMXSTATUS_COMPLETED));
    emit(playlistCompleted);
    emit(playlistCompleted); // a second report: one restart only
    expect(callsTo("playTrackByIndex")).toEqual([{ index: 0, position: 0 }]);
    expect(events).not.toContainEqual({ type: "queueend" });

    emit(trackChanged(1, 0));
    expect(events).toContainEqual({ type: "trackchange", index: 0, previousIndex: 1, trackId: "oracion:1" });
    expect(engine.getSnapshot()).toMatchObject({ index: 0, isPlaying: true, ended: false });
  });

  it("jumps back within the queue without reloading it", async () => {
    const { engine, callsTo } = await setup("android");
    await engine.load([track(1), track(2), track(3)], { index: 2, autoplay: true });
    await engine.skipTo(0);
    expect(callsTo("setPlaylistItems")).toHaveLength(1);
    expect(callsTo("playTrackByIndex")).toEqual([{ index: 0, position: 0 }]);
  });
});

describe("NativeAudioEngine on iOS", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("leaves repeat-all to the native loop, which still reports the end", async () => {
    const { engine, emit, events, callsTo } = await setup("ios");
    await engine.setRepeat("all");
    await engine.load([track(1), track(2)], { index: 1, autoplay: true });
    emit(update(toNativeTrackId(1, 1), RMXSTATUS_PLAYING));
    emit(update(toNativeTrackId(1, 1), RMXSTATUS_COMPLETED));
    emit(playlistCompleted);
    expect(callsTo("playTrackByIndex")).toEqual([]);
    expect(events).not.toContainEqual({ type: "queueend" });
    emit(trackChanged(1, 0)); // the native loop
    expect(engine.getSnapshot()).toMatchObject({ index: 0, ended: false });
  });

  it("goes back within the queue (the patched plugin starts every track from the beginning)", async () => {
    const { engine, callsTo, events } = await setup("ios");
    await engine.load([track(1), track(2), track(3)], { index: 2, autoplay: true });
    events.length = 0;
    await engine.skipTo(1);
    expect(callsTo("setPlaylistItems")).toHaveLength(1);
    expect(callsTo("playTrackByIndex")).toEqual([{ index: 1, position: 0 }]);
    expect(events).toContainEqual({ type: "trackchange", index: 1, previousIndex: 2, trackId: "oracion:2" });
  });

  it("reports a failed track only when the queue reaches it, and retries it with a fresh queue", async () => {
    const { engine, emit, events, callsTo } = await setup("ios");
    await engine.load([track(1), track(2), track(3)], { index: 0, autoplay: true });
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYING));
    events.length = 0;

    emit(errorFor(toNativeTrackId(1, 1))); // the next track failed while preloading
    expect(events).toEqual([]);
    expect(engine.getSnapshot()).toMatchObject({ index: 0, isPlaying: true });

    emit(update(toNativeTrackId(1, 0), RMXSTATUS_COMPLETED));
    emit(trackChanged(1, 1));
    expect(events).toContainEqual({ type: "error", index: 1, message: "No se pudo cargar el audio", trackId: "oracion:2" });

    await engine.play(); // AVPlayer can't replay a failed item
    expect(callsTo("setPlaylistItems")).toHaveLength(2);
    expect(callsTo("play")).toEqual([]);
  });
});
