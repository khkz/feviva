import { RmxAudioStatusMessage } from "capacitor-plugin-playlist";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function fakeDocument() {
  const listeners: Array<() => void> = [];
  const doc = {
    visibilityState: "visible" as "visible" | "hidden",
    addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
  };
  const setVisibility = (state: "visible" | "hidden") => {
    doc.visibilityState = state;
    listeners.forEach((listener) => listener());
  };
  return { doc, setVisibility };
}

describe("app visibility (iOS replays events queued while the app slept)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(100_000);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("trusts events only once the app has been in the foreground for a moment", async () => {
    const { doc, setVisibility } = fakeDocument();
    vi.stubGlobal("document", doc);
    const { isSettledInForeground, watchAppVisibility } = await import("./appVisibility");
    watchAppVisibility();
    expect(isSettledInForeground()).toBe(true);

    setVisibility("hidden");
    expect(isSettledInForeground()).toBe(false);
    setVisibility("visible");
    expect(isSettledInForeground()).toBe(false);
    vi.advanceTimersByTime(1500);
    expect(isSettledInForeground()).toBe(true);
  });

  it("does not jump back for repeat-one on iOS from events replayed on wake-up", async () => {
    const { doc, setVisibility } = fakeDocument();
    vi.stubGlobal("document", doc);
    const { setup, track, trackChanged, update } = await import("./testing/fakePlaylist");
    const { toNativeTrackId } = await import("./nativePlaylist");
    const { engine, emit, events, callsTo } = await setup("ios");
    await engine.setRepeat("one");
    await engine.load([track(1), track(2)], { index: 0, autoplay: true });

    setVisibility("hidden");
    setVisibility("visible"); // the queued events arrive right after this
    emit(update(toNativeTrackId(1, 0), RmxAudioStatusMessage.RMXSTATUS_COMPLETED));
    emit(trackChanged(1, 1));
    expect(callsTo("playTrackByIndex")).toEqual([]);
    expect(events).toContainEqual({ type: "trackchange", index: 1, previousIndex: 0, trackId: "oracion:2" });
  });
});
