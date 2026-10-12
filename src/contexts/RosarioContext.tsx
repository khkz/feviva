import { createContext, useContext, useState, useCallback, useMemo, useRef, ReactNode, useEffect } from 'react';
import { getMisterioDelDia, TipoMisterio } from '@/lib/rosarioData';
import { supabase } from '@/integrations/supabase/client';
import { useRosarioData } from '@/hooks/useRosarioData';
import { useToast } from '@/hooks/use-toast';
import { prayerName, useRosaryAudio, useRosarioSounds, type RosarioContextType, type RosaryPosition } from '@/features/rosario';

const RosarioContext = createContext<RosarioContextType | null>(null);

export function useRosario() {
  const context = useContext(RosarioContext);
  if (!context) {
    throw new Error('useRosario must be used within RosarioProvider');
  }
  return context;
}

export function RosarioProvider({ children }: { children: ReactNode }) {
  const { misterios: MISTERIOS, oraciones: ORACIONES_ROSARIO } = useRosarioData();
  const { toast } = useToast();
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMysteryType, setCurrentMysteryType] = useState<TipoMisterio>(getMisterioDelDia());
  const [currentMysteryIndex, setCurrentMysteryIndex] = useState(0);
  const [currentPrayer, setCurrentPrayer] = useState(0);
  // What the user asked for; while the voice is on, the global player decides (see isPlaying).
  const [isPlayingIntent, setIsPlayingIntent] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(30);
  const [rosariosCompletados, setRosariosCompletados] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Computed values
  const mysteryData = MISTERIOS[currentMysteryType];
  const currentMystery = mysteryData.misterios[currentMysteryIndex];
  const totalProgress = (currentMysteryIndex * 12 + currentPrayer) / (5 * 12);
  const position = useMemo<RosaryPosition>(
    () => ({ mystery: currentMysteryIndex, prayer: currentPrayer }),
    [currentMysteryIndex, currentPrayer],
  );

  // Load user data when opened
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { count } = await supabase
          .from('user_rosario_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completado', true);
        setRosariosCompletados(count || 0);
      }
    };
    if (isOpen || isMinimized) loadUser();
  }, [isOpen, isMinimized]);

  // Save progress to database
  const saveProgress = async () => {
    if (!userId) return;
    try {
      await supabase.from('user_rosario_progress').insert({
        user_id: userId,
        misterio_tipo: currentMysteryType,
        completado: true,
        decenas_completadas: 5,
      });
      setRosariosCompletados(prev => prev + 1);
    } catch (error) {
      console.error('Error saving rosary progress:', error);
    }
  };
  const saveProgressRef = useRef(saveProgress);
  saveProgressRef.current = saveProgress;
  const soundsRef = useRef({ playBellSound: () => {}, playCompletionChord: () => {} });

  // Voice: the remaining prayers play as one queue in the global player
  const audio = useRosaryAudio({
    enabled: ttsEnabled,
    tipo: currentMysteryType,
    position,
    getMysteryData: (tipo) => MISTERIOS[tipo as TipoMisterio],
    onPlayerMoved: (next, advanced) => {
      if (advanced) {
        soundsRef.current.playBellSound();
        if (next.mystery !== currentMysteryIndex) soundsRef.current.playCompletionChord();
      }
      setCurrentMysteryIndex(next.mystery);
      setCurrentPrayer(next.prayer);
    },
    onCompleted: () => {
      soundsRef.current.playBellSound();
      soundsRef.current.playCompletionChord();
      setIsPlayingIntent(false);
      saveProgressRef.current();
    },
    onUnavailable: () => {
      setTtsEnabled(false);
      toast({
        title: "Audio aún no disponible",
        description: "Estamos preparando el audio de esta oración. Puedes seguir rezando con el texto.",
      });
    },
    onTakenOver: () => setIsPlayingIntent(false),
  });

  const isPlaying = audio.isActive ? audio.isPlaying : isPlayingIntent;

  // Ambient drone, bell and completion chord (Web Audio)
  const { audioContext, initAudioContext, stopAmbient, playBellSound, playCompletionChord } = useRosarioSounds({
    isPlaying,
    isMuted,
    ambientVolume,
  });
  soundsRef.current = { playBellSound, playCompletionChord };

  // Another audio took over the global player while the rosary was playing.
  const wasAudioActiveRef = useRef(false);
  useEffect(() => {
    if (wasAudioActiveRef.current && !audio.isActive && ttsEnabled && !audio.isPreparing) {
      setIsPlayingIntent(false);
    }
    wasAudioActiveRef.current = audio.isActive;
  }, [audio.isActive, audio.isPreparing, ttsEnabled]);

  // Actions
  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    initAudioContext();
  }, [initAudioContext]);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsPlayingIntent(false);
    audio.stop();
    stopAmbient();
  }, [audio, stopAmbient]);

  const minimize = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(true);
  }, []);

  const expand = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!isPlaying) initAudioContext();
    if (!ttsEnabled) {
      setIsPlayingIntent(!isPlaying);
      return;
    }
    if (isPlaying) {
      setIsPlayingIntent(false);
      audio.pause();
      return;
    }
    setIsPlayingIntent(true);
    if (audio.isActive && !audio.hasEnded) audio.resume();
    else audio.start(position, currentMysteryType);
  }, [isPlaying, ttsEnabled, audio, position, currentMysteryType, initAudioContext]);

  const moveTo = useCallback((target: RosaryPosition) => {
    setCurrentMysteryIndex(target.mystery);
    setCurrentPrayer(target.prayer);
    if (ttsEnabled) audio.goTo(target);
  }, [ttsEnabled, audio]);

  const next = useCallback(() => {
    playBellSound();

    if (currentPrayer < 11) {
      moveTo({ mystery: currentMysteryIndex, prayer: currentPrayer + 1 });
    } else if (currentMysteryIndex < 4) {
      playCompletionChord();
      moveTo({ mystery: currentMysteryIndex + 1, prayer: 0 });
    } else {
      playCompletionChord();
      setIsPlayingIntent(false);
      audio.stop();
      saveProgressRef.current();
    }
  }, [currentPrayer, currentMysteryIndex, playBellSound, playCompletionChord, moveTo, audio]);

  const previous = useCallback(() => {
    if (currentPrayer > 0) {
      moveTo({ mystery: currentMysteryIndex, prayer: currentPrayer - 1 });
    } else if (currentMysteryIndex > 0) {
      moveTo({ mystery: currentMysteryIndex - 1, prayer: 11 });
    }
  }, [currentPrayer, currentMysteryIndex, moveTo]);

  const reset = useCallback(() => {
    setCurrentMysteryIndex(0);
    setCurrentPrayer(0);
    setIsPlayingIntent(false);
    audio.stop();
  }, [audio]);

  const setMysteryType = useCallback((type: TipoMisterio) => {
    setCurrentMysteryType(type);
    setCurrentMysteryIndex(0);
    setCurrentPrayer(0);
    if (ttsEnabled && isPlaying) audio.start({ mystery: 0, prayer: 0 }, type);
    else audio.stop(); // don't leave the other mysteries' queue loaded (and on the lock screen)
  }, [ttsEnabled, isPlaying, audio]);

  const setMysteryIndex = useCallback((index: number) => {
    moveTo({ mystery: index, prayer: 0 });
  }, [moveTo]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleTts = useCallback(() => {
    if (!ttsEnabled) {
      // Turning the voice on starts praying aloud from the current prayer.
      setTtsEnabled(true);
      setIsPlayingIntent(true);
      initAudioContext();
      audio.start(position, currentMysteryType);
    } else {
      setIsPlayingIntent(isPlaying);
      setTtsEnabled(false);
      audio.stop();
    }
  }, [ttsEnabled, isPlaying, audio, position, currentMysteryType, initAudioContext]);

  // Helpers
  const getCurrentPrayerName = useCallback(() => prayerName(currentPrayer), [currentPrayer]);

  const getCurrentPrayerText = useCallback(() => {
    if (currentPrayer === 0) return ORACIONES_ROSARIO.padreNuestro;
    if (currentPrayer >= 1 && currentPrayer <= 10) return ORACIONES_ROSARIO.aveMaria;
    return ORACIONES_ROSARIO.gloria;
  }, [currentPrayer, ORACIONES_ROSARIO]);

  const isTtsGenerating = audio.isPreparing;
  const isTtsPlaying = audio.isPlaying;

  // Memoized: the global player re-renders this provider on every playback tick.
  const value = useMemo<RosarioContextType>(
    () => ({
      // State
      isOpen,
      isMinimized,
      currentMysteryType,
      currentMysteryIndex,
      currentPrayer,
      isPlaying,
      isMuted,
      ttsEnabled,
      ambientVolume,
      rosariosCompletados,
      userId,

      // TTS state
      isTtsGenerating,
      isTtsPlaying,

      // Actions
      open,
      close,
      minimize,
      expand,
      togglePlay,
      next,
      previous,
      reset,
      setMysteryType,
      setMysteryIndex,
      toggleMute,
      toggleTts,
      setAmbientVolume,

      // Audio
      audioContext,
      initAudioContext,

      // Helpers
      getCurrentPrayerName,
      getCurrentPrayerText,
      totalProgress,
      mysteryData,
      currentMystery,
    }),
    [
      isOpen,
      isMinimized,
      currentMysteryType,
      currentMysteryIndex,
      currentPrayer,
      isPlaying,
      isMuted,
      ttsEnabled,
      ambientVolume,
      rosariosCompletados,
      userId,
      isTtsGenerating,
      isTtsPlaying,
      open,
      close,
      minimize,
      expand,
      togglePlay,
      next,
      previous,
      reset,
      setMysteryType,
      setMysteryIndex,
      toggleMute,
      toggleTts,
      audioContext,
      initAudioContext,
      getCurrentPrayerName,
      getCurrentPrayerText,
      totalProgress,
      mysteryData,
      currentMystery,
    ],
  );

  return (
    <RosarioContext.Provider value={value}>
      {children}
    </RosarioContext.Provider>
  );
}
