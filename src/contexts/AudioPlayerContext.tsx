import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { SleepStory } from "@/hooks/useSleepStories";

interface AudioPlayerState {
  currentStory: SleepStory | null;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMinimized: boolean;
  isGenerating: boolean;
  timerRemaining: number | null;
}

interface AudioPlayerContextType extends AudioPlayerState {
  play: (story: SleepStory, audioUrl: string | null) => void;
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
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [currentStory, setCurrentStory] = useState<SleepStory | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRateState] = useState(0.9);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
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

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.playbackRate = playbackRate;
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playbackRate]);

  const play = useCallback((story: SleepStory, url: string | null) => {
    setCurrentStory(story);
    setAudioUrl(url);
    setIsMinimized(false);
    setCurrentTime(0);
    
    if (url && audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
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
      audioRef.current.play();
      setIsPlaying(true);
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
    setCurrentStory(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setIsMinimized(false);
    setCurrentTime(0);
    setDuration(0);
    setTimerRemaining(null);
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

  const value: AudioPlayerContextType = {
    currentStory,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMinimized,
    isGenerating,
    timerRemaining,
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
