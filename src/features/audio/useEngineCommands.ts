import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import { getAudioEngine } from "./engine/getAudioEngine";
import type { AudioEngine, EngineEvent } from "./engine/types";
import type { EngineSettings } from "./types";

export type WithEngine = (command: (engine: AudioEngine) => Promise<unknown>) => void;

/**
 * Lazily creates the audio engine on the first command, subscribes the given
 * event handler and runs commands strictly in order (a quick play → pause
 * can't arrive out of order, even while the native player is still starting).
 * `settingsRef` holds the settings applied when the engine is created.
 */
export function useEngineCommands(
  handleEventRef: MutableRefObject<(event: EngineEvent) => void>,
  settingsRef: MutableRefObject<EngineSettings>,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<AudioEngine | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const commandChainRef = useRef<Promise<void>>(Promise.resolve());
  const engineRequestedRef = useRef(false);

  const ensureEngine = useCallback(async () => {
    const engine = await getAudioEngine();
    if (engineRef.current !== engine) {
      unsubscribeRef.current?.();
      engineRef.current = engine;
      audioRef.current = engine.element;
      unsubscribeRef.current = engine.subscribe((event) => handleEventRef.current(event));
      // Best effort: a setting that fails to apply must not block playback.
      const settings = settingsRef.current;
      const apply = [
        () => engine.setRate(settings.playbackRate),
        () => engine.setVolume(settings.volume),
        () => engine.setMuted(settings.isMuted),
        () => engine.setRepeat(settings.repeatMode),
      ];
      for (const step of apply) {
        await step().catch((error) => console.warn("[audio] could not apply a setting", error));
      }
    }
    return engine;
  }, [handleEventRef, settingsRef]);

  const withEngine: WithEngine = useCallback(
    (command: (engine: AudioEngine) => Promise<unknown>) => {
      engineRequestedRef.current = true;
      commandChainRef.current = commandChainRef.current
        .then(ensureEngine)
        .then(command)
        .then(() => undefined)
        .catch((error) => console.error("[audio] command failed", error));
    },
    [ensureEngine],
  );

  /** Like withEngine, but skipped when nothing was ever played (nothing to stop). */
  const withStartedEngine = useCallback(
    (command: (engine: AudioEngine) => Promise<unknown>) => {
      if (engineRequestedRef.current) withEngine(command);
    },
    [withEngine],
  );

  useEffect(
    () => () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      engineRef.current = null;
    },
    [],
  );

  return { audioRef, withEngine, withStartedEngine };
}
