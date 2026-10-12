import type { AudioItemType, AudioQueueItem } from "./types";

const SESSION_PROGRESS_KEY = "elrugido.audio.sessionProgress";

// Rosary prayers and daily audios always start from the beginning.
const RESUMABLE_TYPES = new Set<AudioItemType>(["oracion", "sleep_story", "lesson"]);
const isResumable = (item: AudioQueueItem | null): item is AudioQueueItem =>
  !!item && RESUMABLE_TYPES.has(item.type);

const getProgressKey = (item: AudioQueueItem) => `${item.type}:${item.id}`;

export const readSessionProgress = (item: AudioQueueItem | null) => {
  if (!isResumable(item) || typeof window === "undefined") return 0;
  try {
    const progress = JSON.parse(sessionStorage.getItem(SESSION_PROGRESS_KEY) || "{}");
    const savedTime = Number(progress[getProgressKey(item)] || 0);
    return Number.isFinite(savedTime) ? savedTime : 0;
  } catch {
    return 0;
  }
};

export const writeSessionProgress = (item: AudioQueueItem | null, time: number, duration: number) => {
  if (!isResumable(item) || typeof window === "undefined" || !Number.isFinite(time) || time < 1) return;
  if (Number.isFinite(duration) && duration > 0 && duration - time < 5) return;
  try {
    const progress = JSON.parse(sessionStorage.getItem(SESSION_PROGRESS_KEY) || "{}");
    progress[getProgressKey(item)] = time;
    sessionStorage.setItem(SESSION_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Session progress is a convenience feature; playback should never fail because storage is unavailable.
  }
};

export const clearSessionProgress = (item: AudioQueueItem | null) => {
  if (!isResumable(item) || typeof window === "undefined") return;
  try {
    const progress = JSON.parse(sessionStorage.getItem(SESSION_PROGRESS_KEY) || "{}");
    delete progress[getProgressKey(item)];
    sessionStorage.setItem(SESSION_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors.
  }
};
