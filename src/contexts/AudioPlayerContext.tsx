import React, { createContext, useCallback, useContext, useRef, useState } from "react";

import {
  DEFAULT_SETTINGS,
  clearSessionProgress,
  engineTrackId,
  readSessionProgress,
  settingsKindOf,
  toEngineTrack,
  useEngineCommands,
  useErrorRecovery,
  usePlayerSettings,
  useQueueEditing,
  useSleepTimer,
  writeSessionProgress,
  type AudioPlayerContextType,
  type AudioQueueItem,
  type EngineEvent,
  type EngineSettings,
  type RepeatMode,
} from "@/features/audio";

export type { AudioQueueItem } from "@/features/audio";

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

const NEXT_REPEAT_MODE: Record<RepeatMode, RepeatMode> = { off: "one", one: "all", all: "off" };

/**
 * Global player state for the whole app. Playback itself runs in the audio
 * engine (one HTMLAudioElement on the web, the OS queue player inside the
 * iOS/Android app); this provider mirrors its state for the UI.
 */
export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  // Latest queue for engine callbacks; written only by the actions below.
  const queueRef = useRef<AudioQueueItem[]>([]);
  const settingsRef = useRef<EngineSettings>(DEFAULT_SETTINGS.library);
  const handleEventRef = useRef<(event: EngineEvent) => void>(() => {});
  const { audioRef, withEngine, withStartedEngine } = useEngineCommands(handleEventRef, settingsRef);
  const settings = usePlayerSettings(settingsRef, withEngine);
  const { activate: activateSettings, updateActive } = settings;
  const { playbackRate, volume, isMuted, repeatMode } = settings.active;

  const [currentItem, setCurrentItem] = useState<AudioQueueItem | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasEnded, setHasEndedState] = useState(false);
  const [queue, setQueue] = useState<AudioQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasEndedRef = useRef(false);
  /** Position picked with the slider after the queue ended: play starts there. */
  const endedSeekRef = useRef<number | null>(null);

  const setHasEnded = useCallback((ended: boolean) => {
    hasEndedRef.current = ended;
    setHasEndedState(ended);
  }, []);

  const { timerRemaining, setTimer, clearTimer, checkTimer } = useSleepTimer(isPlaying, () =>
    withEngine((engine) => engine.pause()),
  );

  const showFailedItem = useCallback((index: number, item: AudioQueueItem) => {
    setCurrentIndex(index);
    setCurrentItem(item);
    setAudioUrl(item.audioUrl);
  }, []);
  const errors = useErrorRecovery({ queueRef, withEngine, onGiveUp: showFailedItem });

  handleEventRef.current = (event: EngineEvent) => {
    switch (event.type) {
      case "snapshot": {
        const { snapshot } = event;
        setIsPlaying(snapshot.isPlaying);
        // Playing again (e.g. from the lock screen) after the queue ended.
        if (snapshot.isPlaying) setHasEnded(false);
        checkTimer();
        // Until the engine has loaded a new queue, its snapshots still describe the previous one.
        const item = queueRef.current[snapshot.index];
        if (!item || engineTrackId(item) !== snapshot.trackId) break;
        setCurrentTime(snapshot.position);
        setDuration(snapshot.duration);
        writeSessionProgress(item, snapshot.position, snapshot.duration);
        if (snapshot.isPlaying && snapshot.position > 0.5) errors.noteProgress();
        break;
      }
      case "trackchange": {
        const item = queueRef.current[event.index];
        if (!item || engineTrackId(item) !== event.trackId) return; // from the previous queue
        setCurrentIndex(event.index);
        setCurrentItem(item);
        setAudioUrl(item.audioUrl);
        setHasEnded(false);
        activateSettings(settingsKindOf(item.type));
        break;
      }
      case "trackend": {
        const item = queueRef.current[event.index];
        if (item && engineTrackId(item) === event.trackId) clearSessionProgress(item);
        break;
      }
      case "queueend":
        setHasEnded(true);
        break;
      case "error": {
        const item = queueRef.current[event.index];
        if (item && engineTrackId(item) === event.trackId) errors.handleError(event.index, item, event.message);
        break;
      }
    }
  };

  const commitQueue = useCallback(
    (items: AudioQueueItem[], index: number) => {
      const item = items[index] ?? null;
      queueRef.current = items;
      setQueue(items);
      setCurrentIndex(index);
      setCurrentItem(item);
      setAudioUrl(item?.audioUrl ?? null);
      setHasEnded(false);
      endedSeekRef.current = null;
      errors.reset();
    },
    [errors, setHasEnded],
  );

  /** Switches to the settings of the item's kind; a sleep timer set for another kind is cancelled. */
  const prepareFor = useCallback(
    (item: AudioQueueItem | undefined) => {
      if (activateSettings(settingsKindOf(item?.type))) clearTimer();
    },
    [activateSettings, clearTimer],
  );

  const startQueue = useCallback(
    (items: AudioQueueItem[], index: number, startAt?: number) => {
      const resumeTime = startAt ?? readSessionProgress(items[index]);
      prepareFor(items[index]);
      commitQueue(items, index);
      setIsMinimized(false);
      setCurrentTime(resumeTime);
      setDuration(0);
      withEngine((engine) =>
        engine.load(items.map(toEngineTrack), { index, position: resumeTime, autoplay: true }),
      );
    },
    [commitQueue, prepareFor, withEngine],
  );

  // Play a single item (adds to queue as single item)
  const play = useCallback(
    (item: AudioQueueItem, startAt?: number) => {
      if (item.audioUrl) {
        startQueue([item], 0, startAt);
        return;
      }
      // No audio yet (e.g. a story waiting for TTS): show the item, nothing to play.
      prepareFor(item);
      commitQueue([item], 0);
      setIsMinimized(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      withStartedEngine((engine) => engine.stop());
    },
    [commitQueue, prepareFor, startQueue, withStartedEngine],
  );

  // Play a queue of items; items without audio are skipped.
  const playQueue = useCallback(
    (items: AudioQueueItem[], startIndex = 0) => {
      if (items.length === 0) return;
      const start = items[Math.min(Math.max(0, startIndex), items.length - 1)];
      const playable = items.filter((item) => !!item.audioUrl);
      if (playable.length === 0) {
        play(start);
        return;
      }
      startQueue(playable, Math.max(0, playable.indexOf(start)));
    },
    [play, startQueue],
  );

  const pause = useCallback(() => withEngine((engine) => engine.pause()), [withEngine]);

  const togglePlay = useCallback(() => {
    if (!audioUrl) return;
    if (errors.isStopped()) {
      errors.retry(currentIndex);
    } else if (isPlaying) {
      withEngine((engine) => engine.pause());
    } else if (hasEnded) {
      // Play again from the start, or from where the slider was moved after the end.
      const from = endedSeekRef.current ?? 0;
      endedSeekRef.current = null;
      setHasEnded(false);
      withEngine((engine) => engine.skipTo(currentIndex, from));
    } else {
      withEngine((engine) => engine.play());
    }
  }, [audioUrl, isPlaying, hasEnded, currentIndex, errors, setHasEnded, withEngine]);

  const seek = useCallback(
    (time: number) => {
      setCurrentTime(time);
      // After the end there may be nothing loaded to seek in (iOS): play starts from here instead.
      if (hasEndedRef.current) {
        endedSeekRef.current = time;
        return;
      }
      withEngine((engine) => engine.seek(time));
    },
    [withEngine],
  );

  const setVolume = useCallback((vol: number) => updateActive({ volume: vol }), [updateActive]);
  const setMuted = useCallback((muted: boolean) => updateActive({ isMuted: muted }), [updateActive]);
  const setPlaybackRate = useCallback((rate: number) => updateActive({ playbackRate: rate }), [updateActive]);
  const toggleRepeatMode = useCallback(
    () => updateActive({ repeatMode: NEXT_REPEAT_MODE[repeatMode] }),
    [repeatMode, updateActive],
  );

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const expand = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const close = useCallback(() => {
    queueRef.current = [];
    setCurrentItem(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setIsMinimized(false);
    setCurrentTime(0);
    setDuration(0);
    clearTimer();
    setQueue([]);
    setCurrentIndex(0);
    setHasEnded(false);
    endedSeekRef.current = null;
    // Idle: the player's speed/repeat controls act on prayers, stories and lessons again.
    activateSettings("library");
    withStartedEngine((engine) => engine.stop());
  }, [activateSettings, clearTimer, setHasEnded, withStartedEngine]);

  // Audio arrived for the item that was waiting for it (e.g. TTS finished): load it without
  // autoplay, as before. Ignored when something with audio is playing by then.
  const updateAudioUrl = useCallback(
    (url: string) => {
      const items = queueRef.current;
      const waiting = items[currentIndex];
      if (!waiting || waiting.audioUrl) return;
      setAudioUrl(url);
      const updated = items.map((item, i) => (i === currentIndex ? { ...item, audioUrl: url } : item));
      commitQueue(updated, currentIndex);
      withEngine((engine) =>
        engine.load(updated.map(toEngineTrack), { index: currentIndex, autoplay: false }),
      );
    },
    [currentIndex, commitQueue, withEngine],
  );

  const goTo = useCallback(
    (index: number) => {
      const item = queueRef.current[index];
      if (!item) return;
      const resumeTime = readSessionProgress(item);
      setCurrentIndex(index);
      setCurrentItem(item);
      setAudioUrl(item.audioUrl);
      setCurrentTime(resumeTime);
      setHasEnded(false);
      endedSeekRef.current = null;
      if (errors.isStopped()) {
        errors.retry(index);
        return;
      }
      errors.noteProgress();
      withEngine((engine) => engine.skipTo(index, resumeTime));
    },
    [errors, setHasEnded, withEngine],
  );

  const playNext = useCallback(() => {
    if (currentIndex < queueRef.current.length - 1) goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const playPrevious = useCallback(() => {
    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      seek(0);
      return;
    }
    if (currentIndex > 0) goTo(currentIndex - 1);
  }, [currentIndex, currentTime, goTo, seek]);

  const { addToQueue, removeFromQueue, clearQueue } = useQueueEditing({
    queueRef,
    setQueue,
    commitQueue,
    withEngine,
    currentIndex,
    currentTime,
    isPlaying,
  });

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
    hasEnded,
    isMuted,
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
    setMuted,
    playQueue,
    playNext,
    playPrevious,
    playIndex: goTo,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleRepeatMode,
    settingsFor: settings.settingsFor,
    updateSettings: settings.update,
    hasNext,
    hasPrevious,
    audioRef,
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
