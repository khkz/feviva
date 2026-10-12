import { afterEach, describe, expect, it, vi } from "vitest";
import { PlayIntent } from "./playIntent";

describe("PlayIntent", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes reports through when nothing is pending", () => {
    const intent = new PlayIntent(() => undefined);
    expect(intent.report(true)).toBe(true);
    expect(intent.report(false)).toBe(false);
  });

  it("holds back contradicting reports until the command is confirmed", () => {
    const intent = new PlayIntent(() => undefined);
    intent.expect(true);
    expect(intent.report(false)).toBeNull();
    expect(intent.pending).toBe(true);
    expect(intent.report(true)).toBe(true);
    expect(intent.pending).toBeNull();
    expect(intent.report(false)).toBe(false);
    intent.clear();
  });

  it("hands over the last held-back report when the command is never confirmed", () => {
    vi.useFakeTimers();
    const onUnconfirmed = vi.fn();
    const intent = new PlayIntent(onUnconfirmed, 2000);
    intent.expect(false);
    intent.report(true);
    vi.advanceTimersByTime(1999);
    expect(onUnconfirmed).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onUnconfirmed).toHaveBeenCalledWith(true);
    expect(intent.pending).toBeNull();
  });

  it("accepts any report once the grace period is over", () => {
    let now = 0;
    const intent = new PlayIntent(() => undefined, 2000, () => now);
    intent.expect(true);
    now = 2500;
    expect(intent.report(false)).toBe(false);
    intent.clear();
  });
});
