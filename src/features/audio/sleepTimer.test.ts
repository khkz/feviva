import { describe, expect, it } from "vitest";
import { SleepTimerClock } from "./sleepTimer";

const makeClock = () => {
  let now = 1_000_000;
  const clock = new SleepTimerClock(() => now);
  return { clock, advance: (ms: number) => (now += ms) };
};

describe("SleepTimerClock", () => {
  it("counts down only while playing", () => {
    const { clock, advance } = makeClock();
    clock.start(15, true);
    advance(5 * 60_000);
    expect(clock.remainingSeconds()).toBe(10 * 60);

    clock.setPlaying(false);
    advance(30 * 60_000); // paused time does not count
    expect(clock.remainingSeconds()).toBe(10 * 60);

    clock.setPlaying(true);
    advance(60_000);
    expect(clock.remainingSeconds()).toBe(9 * 60);
  });

  it("expires even if no tick ran while the phone was asleep", () => {
    const { clock, advance } = makeClock();
    clock.start(30, true);
    advance(45 * 60_000); // JavaScript suspended for 45 minutes
    expect(clock.isExpired()).toBe(true);
    expect(clock.remainingSeconds()).toBe(0);
  });

  it("does not start counting until playback starts", () => {
    const { clock, advance } = makeClock();
    clock.start(1, false);
    advance(10 * 60_000);
    expect(clock.remainingSeconds()).toBe(60);
    clock.setPlaying(true);
    advance(59_500);
    expect(clock.remainingSeconds()).toBe(1);
    advance(500);
    expect(clock.isExpired()).toBe(true);
  });

  it("clears with 0 minutes", () => {
    const { clock } = makeClock();
    clock.start(15, true);
    clock.start(0, true);
    expect(clock.isActive).toBe(false);
    expect(clock.remainingSeconds()).toBeNull();
    expect(clock.isExpired()).toBe(false);
  });
});
