import { RmxAudioStatusMessage, type OnStatusCallbackData } from "capacitor-plugin-playlist";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseNativeTrackId, toNativeTrackId } from "./nativePlaylist";
import { errorFor, setup, track, trackChanged, update, withoutTrack } from "./testing/fakePlaylist";

const { RMXSTATUS_PLAYING, RMXSTATUS_PAUSE, RMXSTATUS_PLAYBACK_POSITION, RMXSTATUS_COMPLETED } = RmxAudioStatusMessage;
const playlistCompleted = withoutTrack(RmxAudioStatusMessage.RMXSTATUS_PLAYLIST_COMPLETED);

describe("native track ids", () => {
  it("round-trips generation and index", () => {
    expect(parseNativeTrackId(toNativeTrackId(7, 42))).toEqual({ generation: 7, index: 42 });
    expect(parseNativeTrackId("NONE")).toBeNull();
    expect(parseNativeTrackId("INVALID")).toBeNull();
  });
});

describe("NativeAudioEngine", () => {
  // Deterministic clock for the play/pause hold-back window.
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("hands the whole queue to the OS player, starting at the requested track and position", async () => {
    const { engine, callsTo } = await setup();
    await engine.load([track(1), track(2), track(3)], { index: 1, position: 42.7, autoplay: true });

    const [args] = callsTo("setPlaylistItems") as Array<{
      items: Array<{ trackId: string; assetUrl: string; title: string }>;
      options: Record<string, unknown>;
    }>;
    expect(args.items).toHaveLength(3);
    expect(args.items[1].assetUrl).toBe("https://cdn.example/audio-2.mp3");
    expect(args.options).toEqual({
      playFromId: args.items[1].trackId,
      playFromPosition: 42,
      startPaused: false,
      retainPosition: false,
    });
    expect(engine.getSnapshot()).toMatchObject({ index: 1, trackId: "oracion:2", isPlaying: true, position: 42 });
  });

  it("follows native auto-advance and position updates", async () => {
    const { engine, emit, events } = await setup();
    await engine.load([track(1), track(2)], { index: 0, autoplay: true });
    events.length = 0;

    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYBACK_POSITION, { currentPosition: 12, duration: 30 }));
    expect(engine.getSnapshot()).toMatchObject({ index: 0, position: 12, duration: 30, isPlaying: true });

    emit(update(toNativeTrackId(1, 0), RMXSTATUS_COMPLETED));
    emit(trackChanged(1, 1));
    expect(events).toContainEqual({ type: "trackend", index: 0, trackId: "oracion:1" });
    expect(events).toContainEqual({ type: "trackchange", index: 1, previousIndex: 0, trackId: "oracion:2" });
    expect(engine.getSnapshot()).toMatchObject({ index: 1, trackId: "oracion:2", position: 0 });
  });

  it("reads the new index from the track id when currentIndex is missing", async () => {
    const { engine, emit, events } = await setup();
    await engine.load([track(1), track(2)], { index: 0, autoplay: true });
    events.length = 0;
    emit({
      trackId: toNativeTrackId(1, 1),
      msgType: RmxAudioStatusMessage.RMXSTATUS_TRACK_CHANGED,
      value: { currentItem: { trackId: toNativeTrackId(1, 1) } },
    } as unknown as OnStatusCallbackData);
    expect(events).toContainEqual({ type: "trackchange", index: 1, previousIndex: 0, trackId: "oracion:2" });
  });

  it("ignores events from a previous queue", async () => {
    const { engine, emit, events } = await setup();
    await engine.load([track(1), track(2)], { index: 0, autoplay: true }); // generation 1
    await engine.load([track(3)], { index: 0, autoplay: true }); // generation 2
    events.length = 0;

    emit(trackChanged(1, 1));
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYBACK_POSITION, { currentPosition: 99 }));
    expect(events).toEqual([]);
    expect(engine.getSnapshot().position).toBe(0);
  });

  it("reports the end of the queue once, ignoring iOS's trackless TRACK_CHANGED", async () => {
    const { engine, emit, events } = await setup();
    await engine.load([track(1), track(2)], { index: 1, autoplay: true });
    events.length = 0;
    emit(update(toNativeTrackId(1, 1), RMXSTATUS_COMPLETED, { status: "stopped" }));
    emit(playlistCompleted);
    emit({
      trackId: "NONE",
      msgType: RmxAudioStatusMessage.RMXSTATUS_TRACK_CHANGED,
      value: { currentItem: {}, currentIndex: 0 },
    } as unknown as OnStatusCallbackData);
    emit(playlistCompleted);
    emit(withoutTrack(RmxAudioStatusMessage.RMXSTATUS_STOPPED));

    expect(events.filter((event) => event.type === "queueend")).toHaveLength(1);
    expect(events.some((event) => event.type === "trackchange")).toBe(false);
    expect(engine.getSnapshot()).toMatchObject({ index: 1, isPlaying: false, ended: true });
  });

  it("ignores an end-of-queue report left over from a replaced queue, or while idle", async () => {
    const { engine, emit, events } = await setup();
    emit(playlistCompleted); // idle
    await engine.load([track(1)], { index: 0, autoplay: true }); // generation 1
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_COMPLETED));
    await engine.load([track(2), track(3)], { index: 0, autoplay: true }); // generation 2
    emit(playlistCompleted);
    expect(events).not.toContainEqual({ type: "queueend" });
    expect(engine.getSnapshot()).toMatchObject({ index: 0, ended: false });
  });

  it("tracks play/pause from status events once playback is confirmed", async () => {
    const { engine, emit } = await setup();
    await engine.load([track(1)], { index: 0, autoplay: true });
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYING));
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PAUSE, { status: "paused" }));
    expect(engine.getSnapshot().isPlaying).toBe(false);
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYING));
    expect(engine.getSnapshot().isPlaying).toBe(true);
  });

  it("holds back the pause iOS reports while it switches tracks", async () => {
    const { engine, emit, events } = await setup();
    await engine.load([track(1), track(2), track(3)], { index: 0, autoplay: true });
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYING));
    await engine.skipTo(2);
    events.length = 0;

    emit(update(toNativeTrackId(1, 2), RMXSTATUS_PAUSE, { status: "paused" }));
    emit(withoutTrack(RmxAudioStatusMessage.RMXSTATUS_PLAYLIST_CLEARED));
    expect(engine.getSnapshot().isPlaying).toBe(true);
    expect(events.some((event) => event.type === "snapshot" && !event.snapshot.isPlaying)).toBe(false);

    emit(update(toNativeTrackId(1, 2), RMXSTATUS_PLAYING));
    // Confirmed: a later pause (lock screen, call) is followed again.
    emit(update(toNativeTrackId(1, 2), RMXSTATUS_PAUSE, { status: "paused" }));
    expect(engine.getSnapshot().isPlaying).toBe(false);
  });

  it("pauses at once and ignores a position update that was already on its way", async () => {
    const { engine, emit, callsTo } = await setup();
    await engine.load([track(1)], { index: 0, autoplay: true });
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYING));

    await engine.pause();
    expect(callsTo("pause")).toHaveLength(1);
    expect(engine.getSnapshot().isPlaying).toBe(false);
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYBACK_POSITION, { status: "playing", currentPosition: 3 }));
    expect(engine.getSnapshot()).toMatchObject({ isPlaying: false, position: 3 });
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PAUSE, { status: "paused" }));

    // Play from the lock screen afterwards is followed.
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PLAYING));
    expect(engine.getSnapshot().isPlaying).toBe(true);
  });

  it("applies what the player last reported when a command is never confirmed", async () => {
    const { engine, emit } = await setup();
    await engine.load([track(1)], { index: 0, autoplay: true });
    emit(update(toNativeTrackId(1, 0), RMXSTATUS_PAUSE, { status: "paused" }));
    expect(engine.getSnapshot().isPlaying).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(engine.getSnapshot()).toMatchObject({ isPlaying: false, isBuffering: false });
  });

  it("sets the speed with the queue and whenever it changes, never before a queue exists", async () => {
    const { engine, callsTo } = await setup("ios");
    await engine.setVolume(0.5);
    await engine.setMuted(true);
    await engine.setRate(0.9);
    expect(callsTo("setPlaybackVolume")).toEqual([]);
    expect(callsTo("setPlaybackRate")).toEqual([]);

    // Paused load: the patched iOS plugin keeps the speed without starting playback.
    await engine.load([track(1), track(2)], { index: 0, autoplay: false });
    expect(callsTo("setPlaybackVolume")).toEqual([{ volume: 0 }]);
    expect(callsTo("setPlaybackRate")).toEqual([{ rate: 0.9 }]);
    await engine.setRate(1.25);
    expect(callsTo("setPlaybackRate")).toEqual([{ rate: 0.9 }, { rate: 1.25 }]);
  });

  it("pauses before clearing the queue, since clearing alone leaves AVQueuePlayer running", async () => {
    const { engine, calls } = await setup();
    await engine.load([track(1)], { index: 0, autoplay: true });
    calls.length = 0;
    await engine.stop();
    expect(calls.map(([name]) => name)).toEqual(["pause", "clearAllItems"]);
    expect(engine.getSnapshot()).toMatchObject({ index: -1, trackId: null, isPlaying: false });
  });

  it("mutes by setting the native volume to 0 and restores it", async () => {
    const { engine, callsTo } = await setup();
    await engine.load([track(1)], { index: 0, autoplay: true });
    await engine.setVolume(0.6);
    await engine.setMuted(true);
    await engine.setMuted(false);
    expect(callsTo("setPlaybackVolume")).toEqual([{ volume: 1 }, { volume: 0.6 }, { volume: 0 }, { volume: 0.6 }]);
  });

  it("repeat-one: a single track loops natively, a queue jumps back after a natural end", async () => {
    const { engine, emit, callsTo } = await setup();
    await engine.setRepeat("one");
    await engine.load([track(1)], { index: 0, autoplay: true });
    expect(callsTo("setLoop").at(-1)).toEqual({ loop: true });

    await engine.load([track(1), track(2)], { index: 0, autoplay: true }); // generation 2
    expect(callsTo("setLoop").at(-1)).toEqual({ loop: false });
    emit(update(toNativeTrackId(2, 0), RMXSTATUS_COMPLETED));
    emit(trackChanged(2, 1));
    expect(callsTo("playTrackByIndex").at(-1)).toEqual({ index: 0, position: 0 });
  });

  it("repeat-one does not block a skip from the lock screen", async () => {
    const { engine, emit, events, callsTo } = await setup();
    await engine.setRepeat("one");
    await engine.load([track(1), track(2)], { index: 0, autoplay: true });
    emit(trackChanged(1, 1)); // no COMPLETED before: the user pressed "next"
    expect(callsTo("playTrackByIndex")).toEqual([]);
    expect(events).toContainEqual({ type: "trackchange", index: 1, previousIndex: 0, trackId: "oracion:2" });
  });

  it("surfaces playback errors for the current track", async () => {
    const { engine, emit, events } = await setup();
    await engine.load([track(1), track(2)], { index: 0, autoplay: true });
    emit(errorFor(toNativeTrackId(1, 0)));
    expect(events).toContainEqual({ type: "error", index: 0, message: "decode", trackId: "oracion:1" });
    expect(engine.getSnapshot().isPlaying).toBe(false);
  });
});
