import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

// Generic audio queue item that works for both sleep stories and prayers
export interface AudioQueueItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  audioUrl: string | null;
  type: 'oracion' | 'sleep_story' | 'lesson';
  // Original data for reference
  originalData?: unknown;
}

interface AudioPlayerState {
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
  repeatMode: 'off' | 'one' | 'all';
}

interface AudioPlayerContextType extends AudioPlayerState {
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

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

const SESSION_PROGRESS_KEY = "elrugido.audio.sessionProgress";

const getProgressKey = (item: AudioQueueItem) => `${item.type}:${item.id}`;

const readSessionProgress = (item: AudioQueueItem | null) => {
  if (!item || typeof window === "undefined") return 0;
  try {
    const progress = JSON.parse(sessionStorage.getItem(SESSION_PROGRESS_KEY) || "{}");
    const savedTime = Number(progress[getProgressKey(item)] || 0);
    return Number.isFinite(savedTime) ? savedTime : 0;
  } catch {
    return 0;
  }
};

const writeSessionProgress = (item: AudioQueueItem | null, time: number, duration: number) => {
  if (!item || typeof window === "undefined" || !Number.isFinite(time) || time < 1) return;
  if (Number.isFinite(duration) && duration > 0 && duration - time < 5) return;
  try {
    const progress = JSON.parse(sessionStorage.getItem(SESSION_PROGRESS_KEY) || "{}");
    progress[getProgressKey(item)] = time;
    sessionStorage.setItem(SESSION_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Session progress is a convenience feature; playback should never fail because storage is unavailable.
  }
};

const clearSessionProgress = (item: AudioQueueItem | null) => {
  if (!item || typeof window === "undefined") return;
  try {
    const progress = JSON.parse(sessionStorage.getItem(SESSION_PROGRESS_KEY) || "{}");
    delete progress[getProgressKey(item)];
    sessionStorage.setItem(SESSION_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors.
  }
};

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [currentItem, setCurrentItem] = useState<AudioQueueItem | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRateState] = useState(0.9);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  
  // Queue state
  const [queue, setQueue] = useState<AudioQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');

  // Timer countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying && timerRemaining !== null && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timerRemaining]);

  // Handle audio ended - with queue and repeat logic
  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    const hasNextTrack = currentIndex < queue.length - 1;
    
    if (hasNextTrack) {
      // Play next in queue
      const nextIndex = currentIndex + 1;
      const nextItem = queue[nextIndex];
      setCurrentIndex(nextIndex);
      setCurrentItem(nextItem);
      setAudioUrl(nextItem.audioUrl);
      setCurrentTime(0);
      
      if (nextItem.audioUrl && audioRef.current) {
        audioRef.current.src = nextItem.audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch(console.error);
      }
    } else if (repeatMode === 'all' && queue.length > 0) {
      // Loop back to first
      const firstItem = queue[0];
      setCurrentIndex(0);
      setCurrentItem(firstItem);
      setAudioUrl(firstItem.audioUrl);
      setCurrentTime(0);
      
      if (firstItem.audioUrl && audioRef.current) {
        audioRef.current.src = firstItem.audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch(console.error);
      }
    } else {
      // Stop playing
      setIsPlaying(false);
    }
  }, [repeatMode, currentIndex, queue]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.playbackRate = playbackRate;
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playbackRate, handleEnded]);

  // Play a single item (adds to queue as single item)
  const play = useCallback((item: AudioQueueItem) => {
    setQueue([item]);
    setCurrentIndex(0);
    setCurrentItem(item);
    setAudioUrl(item.audioUrl);
    setIsMinimized(false);
    setCurrentTime(0);
    
    if (item.audioUrl && audioRef.current) {
      audioRef.current.src = item.audioUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, []);

  // Play a queue of items
  const playQueue = useCallback((items: AudioQueueItem[], startIndex = 0) => {
    if (items.length === 0) return;
    
    const validIndex = Math.min(Math.max(0, startIndex), items.length - 1);
    const firstItem = items[validIndex];
    
    setQueue(items);
    setCurrentIndex(validIndex);
    setCurrentItem(firstItem);
    setAudioUrl(firstItem.audioUrl);
    setIsMinimized(false);
    setCurrentTime(0);
    
    if (firstItem.audioUrl && audioRef.current) {
      audioRef.current.src = firstItem.audioUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying, audioUrl]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const expand = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const close = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentItem(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setIsMinimized(false);
    setCurrentTime(0);
    setDuration(0);
    setTimerRemaining(null);
    setQueue([]);
    setCurrentIndex(0);
  }, []);

  const updateAudioUrl = useCallback((url: string) => {
    setAudioUrl(url);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
  }, []);

  const setTimer = useCallback((minutes: number) => {
    if (minutes > 0) {
      setTimerRemaining(minutes * 60);
    } else {
      setTimerRemaining(null);
    }
  }, []);

  // Queue management
  const playNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextItem = queue[nextIndex];
      setCurrentIndex(nextIndex);
      setCurrentItem(nextItem);
      setAudioUrl(nextItem.audioUrl);
      setCurrentTime(0);
      
      if (nextItem.audioUrl && audioRef.current) {
        audioRef.current.src = nextItem.audioUrl;
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  }, [currentIndex, queue]);

  const playPrevious = useCallback(() => {
    // If more than 3 seconds in, restart current track
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevItem = queue[prevIndex];
      setCurrentIndex(prevIndex);
      setCurrentItem(prevItem);
      setAudioUrl(prevItem.audioUrl);
      setCurrentTime(0);
      
      if (prevItem.audioUrl && audioRef.current) {
        audioRef.current.src = prevItem.audioUrl;
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  }, [currentIndex, currentTime, queue]);

  const addToQueue = useCallback((item: AudioQueueItem) => {
    setQueue(prev => [...prev, item]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    // Adjust current index if needed
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
  }, []);

  const toggleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'one';
      if (prev === 'one') return 'all';
      return 'off';
    });
  }, []);

  const hasNext = currentIndex < queue.length - 1;
  const hasPrevious = currentIndex > 0 || currentTime > 3;

  const value: AudioPlayerContextType = {
    currentItem,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMinimized,
    isGenerating,
    timerRemaining,
    queue,
    currentIndex,
    repeatMode,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    minimize,
    expand,
    close,
    setAudioUrl: updateAudioUrl,
    setIsGenerating,
    setTimer,
    playQueue,
    playNext,
    playPrevious,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleRepeatMode,
    hasNext,
    hasPrevious,
    audioRef,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      {/* Global audio element */}
      <audio ref={audioRef} preload="metadata" />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
