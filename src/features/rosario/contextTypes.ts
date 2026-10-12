import type { TipoMisterio } from "@/lib/rosarioData";

/** Public shape of RosarioContext (unchanged by the move to the global player). */
export interface RosarioState {
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

export interface RosarioContextType extends RosarioState {
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
  mysteryData: { nombre: string; dia: string; misterios: { numero: number; titulo: string; fruto: string; meditacion: string }[] };
  currentMystery: { numero: number; titulo: string; fruto: string; meditacion: string };
}
