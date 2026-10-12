/**
 * iOS suspends the WebView while the app is in the background and replays the
 * queued plugin events right after it wakes up. Decisions that move playback
 * (restarting a track for "repeat one") must not be taken from those stale
 * events, so they only run once the app has been in the foreground for a while.
 */
let visibleSince = 0;
let watching = false;

export function watchAppVisibility() {
  if (watching || typeof document === "undefined") return;
  watching = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") visibleSince = Date.now();
  });
}

export function isSettledInForeground(minMs = 1500) {
  if (typeof document === "undefined") return true;
  if (document.visibilityState !== "visible") return false;
  return Date.now() - visibleSince >= minMs;
}
