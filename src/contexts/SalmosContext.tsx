import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { SALMOS_ORBITALES, getSalmoDelDia, Salmo } from '@/lib/salmosData';
import { supabase } from '@/integrations/supabase/client';

interface SalmosState {
  isOpen: boolean;
  isMinimized: boolean;
  currentSalmoIndex: number;
  currentVerseIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  ambientVolume: number;
  meditacionesCompletadas: number;
  userId: string | null;
}

interface SalmosContextType extends SalmosState {
  open: () => void;
  close: () => void;
  minimize: () => void;
  expand: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  reset: () => void;
  setSalmoIndex: (index: number) => void;
  toggleMute: () => void;
  setAmbientVolume: (volume: number) => void;
  
  audioContext: AudioContext | null;
  initAudioContext: () => void;
  
  currentSalmo: Salmo;
  currentVerse: typeof SALMOS_ORBITALES[0]['versiculos'][0];
  totalProgress: number;
}

const SalmosContext = createContext<SalmosContextType | null>(null);

export function useSalmos() {
  const context = useContext(SalmosContext);
  if (!context) {
    throw new Error('useSalmos must be used within SalmosProvider');
  }
  return context;
}

export function SalmosProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSalmoIndex, setCurrentSalmoIndex] = useState(() => {
    const dailySalmo = getSalmoDelDia();
    return SALMOS_ORBITALES.findIndex(s => s.id === dailySalmo.id);
  });
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(30);
  const [meditacionesCompletadas, setMeditacionesCompletadas] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const ambientOscillators = useRef<OscillatorNode[]>([]);
  const ambientGains = useRef<GainNode[]>([]);

  const currentSalmo = SALMOS_ORBITALES[currentSalmoIndex];
  const currentVerse = currentSalmo.versiculos[currentVerseIndex];
  const totalVerses = SALMOS_ORBITALES.reduce((acc, s) => acc + s.versiculos.length, 0);
  const completedVerses = SALMOS_ORBITALES.slice(0, currentSalmoIndex).reduce((acc, s) => acc + s.versiculos.length, 0) + currentVerseIndex;
  const totalProgress = completedVerses / totalVerses;

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Get meditation count from localStorage for now
        const stored = localStorage.getItem('salmos_completados') || '0';
        setMeditacionesCompletadas(parseInt(stored, 10));
      }
    };
    if (isOpen || isMinimized) loadUser();
  }, [isOpen, isMinimized]);

  const initAudioContext = useCallback(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  const ambientFrequencies = [
    { freq: 174, type: 'sine' as OscillatorType, gain: 0.02 }, // Healing frequency
    { freq: 285, type: 'sine' as OscillatorType, gain: 0.015 },
    { freq: 396, type: 'sine' as OscillatorType, gain: 0.01 },
  ];

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

  const playChime = useCallback(() => {
    if (!audioContext || isMuted) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(528, audioContext.currentTime); // Love frequency
    oscillator.frequency.exponentialRampToValueAtTime(264, audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  }, [audioContext, isMuted]);

  const playCompletionChord = useCallback(() => {
    if (!audioContext || isMuted) return;

    const notes = [264, 330, 396, 528]; // C major with love frequency
    
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = "sine";
      
      const startTime = audioContext.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
      
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }, [audioContext, isMuted]);

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

  const saveMeditation = () => {
    const current = parseInt(localStorage.getItem('salmos_completados') || '0', 10);
    localStorage.setItem('salmos_completados', String(current + 1));
    setMeditacionesCompletadas(current + 1);
  };

  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    initAudioContext();
  }, [initAudioContext]);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsPlaying(false);
    stopAmbient();
  }, [stopAmbient]);

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
    playChime();

    if (currentVerseIndex < currentSalmo.versiculos.length - 1) {
      setCurrentVerseIndex(prev => prev + 1);
    } else if (currentSalmoIndex < SALMOS_ORBITALES.length - 1) {
      playCompletionChord();
      setCurrentSalmoIndex(prev => prev + 1);
      setCurrentVerseIndex(0);
    } else {
      playCompletionChord();
      setIsPlaying(false);
      saveMeditation();
    }
  }, [currentVerseIndex, currentSalmoIndex, currentSalmo.versiculos.length, playChime, playCompletionChord]);

  const previous = useCallback(() => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(prev => prev - 1);
    } else if (currentSalmoIndex > 0) {
      const prevSalmo = SALMOS_ORBITALES[currentSalmoIndex - 1];
      setCurrentSalmoIndex(prev => prev - 1);
      setCurrentVerseIndex(prevSalmo.versiculos.length - 1);
    }
  }, [currentVerseIndex, currentSalmoIndex]);

  const reset = useCallback(() => {
    setCurrentSalmoIndex(0);
    setCurrentVerseIndex(0);
    setIsPlaying(false);
  }, []);

  const setSalmoIndex = useCallback((index: number) => {
    setCurrentSalmoIndex(index);
    setCurrentVerseIndex(0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const value: SalmosContextType = {
    isOpen,
    isMinimized,
    currentSalmoIndex,
    currentVerseIndex,
    isPlaying,
    isMuted,
    ambientVolume,
    meditacionesCompletadas,
    userId,
    
    open,
    close,
    minimize,
    expand,
    togglePlay,
    next,
    previous,
    reset,
    setSalmoIndex,
    toggleMute,
    setAmbientVolume,
    
    audioContext,
    initAudioContext,
    
    currentSalmo,
    currentVerse,
    totalProgress,
  };

  return (
    <SalmosContext.Provider value={value}>
      {children}
    </SalmosContext.Provider>
  );
}
