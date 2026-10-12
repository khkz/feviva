import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

import {
  clearSessionProgress,
  readSessionProgress,
  writeSessionProgress,
  type AudioPlayerContextType,
  type AudioQueueItem,
  type RepeatMode,
} from "@/features/audio";

export type { AudioQueueItem } from "@/features/audio";

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

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
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

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
    clearSessionProgress(currentItem);

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
  }, [repeatMode, currentIndex, queue, currentItem]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      writeSessionProgress(currentItem, audio.currentTime, audio.duration);
    };
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
  }, [playbackRate, handleEnded, currentItem]);

  // Play a single item (adds to queue as single item)
  const play = useCallback((item: AudioQueueItem) => {
    const resumeTime = readSessionProgress(item);
    setQueue([item]);
    setCurrentIndex(0);
    setCurrentItem(item);
    setAudioUrl(item.audioUrl);
    setIsMinimized(false);
    setCurrentTime(resumeTime);
    
    if (item.audioUrl && audioRef.current) {
      audioRef.current.src = item.audioUrl;
      audioRef.current.load();
      audioRef.current.currentTime = resumeTime;
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
    const resumeTime = readSessionProgress(firstItem);
    setCurrentTime(resumeTime);
    
    if (firstItem.audioUrl && audioRef.current) {
      audioRef.current.src = firstItem.audioUrl;
      audioRef.current.load();
      audioRef.current.currentTime = resumeTime;
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
      const resumeTime = readSessionProgress(nextItem);
      setCurrentIndex(nextIndex);
      setCurrentItem(nextItem);
      setAudioUrl(nextItem.audioUrl);
      setCurrentTime(resumeTime);
      
      if (nextItem.audioUrl && audioRef.current) {
        audioRef.current.src = nextItem.audioUrl;
        audioRef.current.load();
        audioRef.current.currentTime = resumeTime;
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
      const resumeTime = readSessionProgress(prevItem);
      setCurrentIndex(prevIndex);
      setCurrentItem(prevItem);
      setAudioUrl(prevItem.audioUrl);
      setCurrentTime(resumeTime);
      
      if (prevItem.audioUrl && audioRef.current) {
        audioRef.current.src = prevItem.audioUrl;
        audioRef.current.load();
        audioRef.current.currentTime = resumeTime;
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
