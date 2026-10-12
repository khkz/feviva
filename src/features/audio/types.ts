import type React from "react";

export type AudioItemType = "oracion" | "sleep_story" | "lesson";

export type RepeatMode = "off" | "one" | "all";

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
}

export interface AudioPlayerContextType extends AudioPlayerState {
  // Existing functions (backwards compatible)
  play: (item: AudioQueueItem) => void;
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
  // Queue functions
  playQueue: (items: AudioQueueItem[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (item: AudioQueueItem) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleRepeatMode: () => void;
  // Helper to check if there's next/prev
  hasNext: boolean;
  hasPrevious: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}
