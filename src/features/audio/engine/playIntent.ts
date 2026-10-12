/**
 * A play or pause sent from JavaScript that the native player has not confirmed yet.
 *
 * Native players report transient states while they obey a command: iOS pauses
 * AVQueuePlayer while it switches tracks, and replacing the queue reports it
 * cleared before the new one starts. Until the player confirms the command, or a
 * short grace period passes, reports that contradict it are held back. Otherwise
 * the play button flickers and a quick tap on play/pause is read backwards.
 */
export class PlayIntent {
  private expected: boolean | null = null;
  private since = 0;
  /** Last contradicting report, applied if the command is never confirmed. */
  private heldBack: boolean | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly onUnconfirmed: (reported: boolean | null) => void,
    private readonly graceMs = 2000,
    private readonly now: () => number = () => Date.now(),
  ) {}

  /** true while waiting for playback to start, false while waiting for it to stop, null otherwise. */
  get pending() {
    return this.expected;
  }

  expect(playing: boolean) {
    this.clear();
    this.expected = playing;
    this.since = this.now();
    this.timer = setTimeout(() => this.expire(), this.graceMs);
  }

  clear() {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.expected = null;
    this.heldBack = null;
  }

  /** Native reported playing (true) or paused (false): returns the state to apply, or null while held back. */
  report(playing: boolean): boolean | null {
    if (this.expected === null) return playing;
    if (playing === this.expected || this.now() - this.since >= this.graceMs) {
      this.clear();
      return playing;
    }
    this.heldBack = playing;
    return null;
  }

  private expire() {
    const reported = this.heldBack;
    this.clear();
    this.onUnconfirmed(reported);
  }
}
