import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react';
import { MISTERIOS, ORACIONES_ROSARIO, getMisterioDelDia, TipoMisterio } from '@/lib/rosarioData';
import { supabase } from '@/integrations/supabase/client';
import { useRosarioTTS } from '@/hooks/useRosarioTTS';

interface RosarioState {
  // Display state
  isOpen: boolean;
  isMinimized: boolean;
  
  // Rosario progress
  currentMysteryType: TipoMisterio;
  currentMysteryIndex: number;
  currentPrayer: number;
  
  // Playback
  isPlaying: boolean;
  isMuted: boolean;
  ttsEnabled: boolean;
  ambientVolume: number;
  
  // User data
  rosariosCompletados: number;
  userId: string | null;
}

interface RosarioContextType extends RosarioState {
  // TTS state
  isTtsGenerating: boolean;
  isTtsPlaying: boolean;
  
  // Actions
  open: () => void;
  close: () => void;
  minimize: () => void;
  expand: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  reset: () => void;
  setMysteryType: (type: TipoMisterio) => void;
  setMysteryIndex: (index: number) => void;
  toggleMute: () => void;
  toggleTts: () => void;
  setAmbientVolume: (volume: number) => void;
  
  // Audio context for ambient sounds
  audioContext: AudioContext | null;
  initAudioContext: () => void;
  
  // Helpers
  getCurrentPrayerName: () => string;
  getCurrentPrayerText: () => string;
  totalProgress: number;
  mysteryData: typeof MISTERIOS[TipoMisterio];
  currentMystery: typeof MISTERIOS[TipoMisterio]['misterios'][0];
}

const RosarioContext = createContext<RosarioContextType | null>(null);

export function useRosario() {
  const context = useContext(RosarioContext);
  if (!context) {
    throw new Error('useRosario must be used within RosarioProvider');
  }
  return context;
}

export function RosarioProvider({ children }: { children: ReactNode }) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMysteryType, setCurrentMysteryType] = useState<TipoMisterio>(getMisterioDelDia());
  const [currentMysteryIndex, setCurrentMysteryIndex] = useState(0);
  const [currentPrayer, setCurrentPrayer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(30);
  const [rosariosCompletados, setRosariosCompletados] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Refs for ambient sounds
  const ambientOscillators = useRef<OscillatorNode[]>([]);
  const ambientGains = useRef<GainNode[]>([]);
  
  // TTS Hook
  const { 
    isGenerating: isTtsGenerating, 
    isPlaying: isTtsPlaying, 
    playPrayer, 
    stop: stopTts,
    getPrayerTypeFromIndex,
  } = useRosarioTTS();

  // Computed values
  const mysteryData = MISTERIOS[currentMysteryType];
  const currentMystery = mysteryData.misterios[currentMysteryIndex];
  const totalProgress = (currentMysteryIndex * 12 + currentPrayer) / (5 * 12);

  // Ambient frequencies
  const ambientFrequencies = [
    { freq: 60, type: 'sine' as OscillatorType, gain: 0.03 },
    { freq: 120, type: 'sine' as OscillatorType, gain: 0.02 },
    { freq: 180, type: 'sine' as OscillatorType, gain: 0.015 },
  ];

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

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  // Ambient sound controls
  const startAmbient = useCallback(() => {
    if (!audioContext) return;
    stopAmbient();

    ambientFrequencies.forEach((config, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = config.type;
      osc.frequency.value = config.freq;
      gain.gain.value = config.gain * (ambientVolume / 100);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      
      ambientOscillators.current[i] = osc;
      ambientGains.current[i] = gain;
    });
  }, [audioContext, ambientVolume]);

  const stopAmbient = useCallback(() => {
    ambientOscillators.current.forEach(osc => {
      try { osc?.stop(); } catch {}
    });
    ambientOscillators.current = [];
    ambientGains.current = [];
  }, []);

  // Play bell sound
  const playBellSound = useCallback(() => {
    if (!audioContext || isMuted) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    filter.type = "lowpass";
    filter.frequency.value = 2000;
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  }, [audioContext, isMuted]);

  // Play completion chord
  const playCompletionChord = useCallback(() => {
    if (!audioContext || isMuted) return;

    const notes = [261.63, 329.63, 392.00, 523.25];
    
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = "sine";
      
      const startTime = audioContext.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
      
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }, [audioContext, isMuted]);

  // Handle ambient start/stop based on play state
  useEffect(() => {
    if (!audioContext || isMuted) {
      stopAmbient();
      return;
    }

    if (isPlaying) {
      startAmbient();
    } else {
      stopAmbient();
    }

    return () => stopAmbient();
  }, [audioContext, isPlaying, isMuted, startAmbient, stopAmbient]);

  // Update ambient volume
  useEffect(() => {
    ambientGains.current.forEach((gain, i) => {
      if (gain) {
        gain.gain.setValueAtTime(
          ambientFrequencies[i].gain * (ambientVolume / 100),
          audioContext?.currentTime || 0
        );
      }
    });
  }, [ambientVolume, audioContext]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => next(), 4000);
    return () => clearInterval(interval);
  }, [isPlaying, currentPrayer, currentMysteryIndex]);

  // Play TTS when prayer changes
  useEffect(() => {
    if (ttsEnabled && (isOpen || isMinimized) && isPlaying && !isTtsPlaying && !isTtsGenerating) {
      const prayerType = getPrayerTypeFromIndex(currentPrayer);
      playPrayer(prayerType);
    }
  }, [currentPrayer, ttsEnabled, isOpen, isMinimized, isPlaying]);

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

  // Actions
  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    initAudioContext();
  }, [initAudioContext]);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsPlaying(false);
    stopTts();
    stopAmbient();
  }, [stopTts, stopAmbient]);

  const minimize = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(true);
  }, []);

  const expand = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
    if (!isPlaying) {
      initAudioContext();
    }
  }, [isPlaying, initAudioContext]);

  const next = useCallback(() => {
    playBellSound();
    stopTts();

    if (currentPrayer < 11) {
      setCurrentPrayer(prev => prev + 1);
    } else if (currentMysteryIndex < 4) {
      playCompletionChord();
      setCurrentMysteryIndex(prev => prev + 1);
      setCurrentPrayer(0);
    } else {
      playCompletionChord();
      setIsPlaying(false);
      saveProgress();
    }
  }, [currentPrayer, currentMysteryIndex, playBellSound, playCompletionChord, stopTts]);

  const previous = useCallback(() => {
    stopTts();
    if (currentPrayer > 0) {
      setCurrentPrayer(prev => prev - 1);
    } else if (currentMysteryIndex > 0) {
      setCurrentMysteryIndex(prev => prev - 1);
      setCurrentPrayer(11);
    }
  }, [currentPrayer, currentMysteryIndex, stopTts]);

  const reset = useCallback(() => {
    setCurrentMysteryIndex(0);
    setCurrentPrayer(0);
    setIsPlaying(false);
    stopTts();
  }, [stopTts]);

  const setMysteryType = useCallback((type: TipoMisterio) => {
    setCurrentMysteryType(type);
    setCurrentMysteryIndex(0);
    setCurrentPrayer(0);
  }, []);

  const setMysteryIndex = useCallback((index: number) => {
    setCurrentMysteryIndex(index);
    setCurrentPrayer(0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleTts = useCallback(async () => {
    if (!ttsEnabled) {
      setTtsEnabled(true);
      const prayerType = getPrayerTypeFromIndex(currentPrayer);
      await playPrayer(prayerType);
    } else {
      setTtsEnabled(false);
      stopTts();
    }
  }, [ttsEnabled, currentPrayer, getPrayerTypeFromIndex, playPrayer, stopTts]);

  // Helpers
  const getCurrentPrayerName = useCallback(() => {
    if (currentPrayer === 0) return "Padre Nuestro";
    if (currentPrayer >= 1 && currentPrayer <= 10) return `Ave María (${currentPrayer}/10)`;
    return "Gloria";
  }, [currentPrayer]);

  const getCurrentPrayerText = useCallback(() => {
    if (currentPrayer === 0) return ORACIONES_ROSARIO.padreNuestro;
    if (currentPrayer >= 1 && currentPrayer <= 10) return ORACIONES_ROSARIO.aveMaria;
    return ORACIONES_ROSARIO.gloria;
  }, [currentPrayer]);

  const value: RosarioContextType = {
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
  };

  return (
    <RosarioContext.Provider value={value}>
      {children}
    </RosarioContext.Provider>
  );
}
