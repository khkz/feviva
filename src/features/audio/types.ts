import type React from "react";

export type AudioItemType =
  | "oracion"
  | "sleep_story"
  | "lesson"
  // Daily audio: laudes, completas, verse, reflection, tip, gratitude.
  | "ritual"
  // Prayers of the audio rosary; the rosary has its own UI (RosarioInterstellar).
  | "rosario";

export type RepeatMode = "off" | "one" | "all";

/** Player settings, kept per kind of audio (see playerSettings.ts). */
export interface EngineSettings {
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
}

/**
 * Prayers, stories and lessons share the library settings; the daily audios keep their
 * own speed and mute button, and the rosary always plays once at normal speed.
 */
export type SettingsKind = "library" | "ritual" | "rosario";

// Generic audio queue item that works for both sleep stories and prayers
export interface AudioQueueItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  audioUrl: string | null;
  type: AudioItemType;
  // Original data for reference
  originalData?: unknown;
}

export interface AudioPlayerState {
  // Current item (backwards compatible with currentStory)
  currentItem: AudioQueueItem | null;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMinimized: boolean;
  isGenerating: boolean;
  timerRemaining: number | null;
  // Queue management
  queue: AudioQueueItem[];
  currentIndex: number;
  repeatMode: RepeatMode;
  /** True after the last item of the queue finished playing. */
  hasEnded: boolean;
  isMuted: boolean;
}

export interface AudioPlayerContextType extends AudioPlayerState {
  // Existing functions (backwards compatible)
  /** Play one item; `startAt` (seconds) overrides the position saved for this session. */
  play: (item: AudioQueueItem, startAt?: number) => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  minimize: () => void;
  expand: () => void;
  close: () => void;
  setAudioUrl: (url: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setTimer: (minutes: number) => void;
  setMuted: (muted: boolean) => void;
  // Queue functions
  playQueue: (items: AudioQueueItem[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  /** Jump to an item of the current queue and play it. */
  playIndex: (index: number) => void;
  addToQueue: (item: AudioQueueItem) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleRepeatMode: () => void;
  /** Settings of a kind of audio, whether or not it is playing (playbackRate etc. above are the current kind's). */
  settingsFor: (kind: SettingsKind) => EngineSettings;
  updateSettings: (kind: SettingsKind, patch: Partial<EngineSettings>) => void;
  // Helper to check if there's next/prev
  hasNext: boolean;
  hasPrevious: boolean;
  /** @deprecated Web-only element (null inside the native app). Use the context actions instead. */
  audioRef: React.RefObject<HTMLAudioElement>;
}
