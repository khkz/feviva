import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sleep-timer arithmetic, kept pure so it can be unit-tested.
 * The timer only counts down while audio is playing (as before), but it is
 * measured with timestamps instead of decrementing once per tick: a phone that
 * throttles or suspends JavaScript still stops on time as soon as it wakes up.
 */
export class SleepTimerClock {
  /** Milliseconds left at the moment counting last paused (or at start). */
  private budgetMs: number | null = null;
  /** Timestamp when the countdown last resumed, null while paused. */
  private runningSince: number | null = null;

  constructor(private now: () => number = Date.now) {}

  start(minutes: number, isPlaying: boolean) {
    if (minutes <= 0) {
      this.clear();
      return;
    }
    this.budgetMs = minutes * 60_000;
    this.runningSince = isPlaying ? this.now() : null;
  }

  clear() {
    this.budgetMs = null;
    this.runningSince = null;
  }

  get isActive() {
    return this.budgetMs !== null;
  }

  /** Call whenever playback starts or stops. */
  setPlaying(isPlaying: boolean) {
    if (this.budgetMs === null) return;
    if (isPlaying && this.runningSince === null) {
      this.runningSince = this.now();
    } else if (!isPlaying && this.runningSince !== null) {
      this.budgetMs = this.remainingMs();
      this.runningSince = null;
    }
  }

  remainingMs() {
    if (this.budgetMs === null) return 0;
    const elapsed = this.runningSince === null ? 0 : this.now() - this.runningSince;
    return Math.max(0, this.budgetMs - elapsed);
  }

  /** Whole seconds left for the UI, or null when no timer is set. */
  remainingSeconds() {
    return this.budgetMs === null ? null : Math.ceil(this.remainingMs() / 1000);
  }

  isExpired() {
    return this.budgetMs !== null && this.remainingMs() <= 0;
  }
}

/** React wrapper: ticks the UI once per second and calls onExpire when time is up. */
export function useSleepTimer(isPlaying: boolean, onExpire: () => void) {
  const clockRef = useRef(new SleepTimerClock());
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const timerActive = timerRemaining !== null;

  const check = useCallback(() => {
    const clock = clockRef.current;
    if (!clock.isActive) return;
    if (clock.isExpired()) {
      clock.clear();
      setTimerRemaining(null);
      onExpireRef.current();
      return;
    }
    setTimerRemaining(clock.remainingSeconds());
  }, []);

  useEffect(() => {
    clockRef.current.setPlaying(isPlaying);
    if (!isPlaying || !clockRef.current.isActive) return;
    const interval = setInterval(check, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isPlaying, timerActive, check]);

  const setTimer = useCallback(
    (minutes: number) => {
      clockRef.current.start(minutes, isPlaying);
      setTimerRemaining(clockRef.current.remainingSeconds());
    },
    [isPlaying],
  );

  const clearTimer = useCallback(() => {
    clockRef.current.clear();
    setTimerRemaining(null);
  }, []);

  return { timerRemaining, setTimer, clearTimer, checkTimer: check };
}
