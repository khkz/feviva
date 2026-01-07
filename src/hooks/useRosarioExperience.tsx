import { useEffect, useCallback, useState, useRef } from "react";
import { useTheme } from "next-themes";

interface UseRosarioExperienceOptions {
  enableVibration?: boolean;
  enableDarkMode?: boolean;
  enableAudio?: boolean;
}

export function useRosarioExperience(options: UseRosarioExperienceOptions = {}) {
  const { enableVibration = true, enableDarkMode = true, enableAudio = true } = options;
  const { theme, setTheme } = useTheme();
  const [previousTheme, setPreviousTheme] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(enableAudio);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);

  // Store original theme and switch to dark mode
  useEffect(() => {
    if (enableDarkMode && theme !== "dark") {
      setPreviousTheme(theme || "light");
      setTheme("dark");
    }
    
    return () => {
      // Restore original theme when leaving
      if (previousTheme && previousTheme !== "dark") {
        setTheme(previousTheme);
      }
    };
  }, [enableDarkMode, theme, setTheme, previousTheme]);

  // Vibration patterns
  const vibrate = useCallback((pattern: number | number[]) => {
    if (!enableVibration) return;
    
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.log("Vibration not supported");
      }
    }
  }, [enableVibration]);

  // Short vibration for each Ave Maria
  const vibrateAveMaria = useCallback(() => {
    vibrate(50); // Short, gentle vibration
  }, [vibrate]);

  // Medium vibration for completing a mystery
  const vibrateMysteryComplete = useCallback(() => {
    vibrate([100, 50, 100]); // Double pulse
  }, [vibrate]);

  // Long celebration vibration for completing the rosary
  const vibrateRosaryComplete = useCallback(() => {
    vibrate([100, 50, 100, 50, 200]); // Triple celebration pulse
  }, [vibrate]);

  // Play a soft bell sound
  const playBellSound = useCallback(() => {
    if (!isAudioEnabled) return;
    
    // Create a simple bell-like tone using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Bell-like frequency
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log("Audio not supported");
    }
  }, [isAudioEnabled]);

  // Play completion chime
  const playCompletionChime = useCallback(() => {
    if (!isAudioEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
      
      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = "sine";
        
        const startTime = audioContext.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.8);
      });
    } catch (e) {
      console.log("Audio not supported");
    }
  }, [isAudioEnabled]);

  // Handle Ave Maria completion with haptics and sound
  const onAveMaria = useCallback(() => {
    vibrateAveMaria();
    playBellSound();
  }, [vibrateAveMaria, playBellSound]);

  // Handle mystery completion
  const onMysteryComplete = useCallback(() => {
    vibrateMysteryComplete();
    playCompletionChime();
  }, [vibrateMysteryComplete, playCompletionChime]);

  // Handle rosary completion
  const onRosaryComplete = useCallback(() => {
    vibrateRosaryComplete();
    playCompletionChime();
  }, [vibrateRosaryComplete, playCompletionChime]);

  return {
    isAudioEnabled,
    setIsAudioEnabled,
    isGeneratingAudio,
    setIsGeneratingAudio,
    onAveMaria,
    onMysteryComplete,
    onRosaryComplete,
    vibrate,
    playBellSound,
    playCompletionChime,
  };
}
