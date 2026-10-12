import { useCallback, useEffect, useRef, useState } from "react";

// Ambient frequencies
const ambientFrequencies = [
  { freq: 60, type: "sine" as OscillatorType, gain: 0.03 },
  { freq: 120, type: "sine" as OscillatorType, gain: 0.02 },
  { freq: 180, type: "sine" as OscillatorType, gain: 0.015 },
];

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

interface UseRosarioSoundsOptions {
  isPlaying: boolean;
  isMuted: boolean;
  ambientVolume: number;
}

/**
 * Web Audio cues for the interactive rosary: ambient drone, bell between
 * prayers and a chord when a mystery is completed.
 */
export function useRosarioSounds({ isPlaying, isMuted, ambientVolume }: UseRosarioSoundsOptions) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Refs for ambient sounds
  const ambientOscillators = useRef<OscillatorNode[]>([]);
  const ambientGains = useRef<GainNode[]>([]);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContext) {
      const AudioContextCtor = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      const ctx = new AudioContextCtor();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  // Ambient sound controls
  const stopAmbient = useCallback(() => {
    ambientOscillators.current.forEach(osc => {
      try {
        osc?.stop();
      } catch {
        // Oscillator was already stopped.
      }
    });
    ambientOscillators.current = [];
    ambientGains.current = [];
  }, []);

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
  }, [audioContext, ambientVolume, stopAmbient]);

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

  return { audioContext, initAudioContext, stopAmbient, playBellSound, playCompletionChord };
}
