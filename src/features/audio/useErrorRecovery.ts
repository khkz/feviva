import { useCallback, useMemo, useRef, type MutableRefObject } from "react";
import { toast } from "@/hooks/use-toast";
import { toEngineTrack } from "./labels";
import type { AudioQueueItem } from "./types";
import type { WithEngine } from "./useEngineCommands";

/** A broken item is skipped once; a second failure in a row (e.g. offline) stops and tells the user. */
const MAX_ERROR_SKIPS = 1;

interface ErrorRecoveryOptions {
  queueRef: MutableRefObject<AudioQueueItem[]>;
  withEngine: WithEngine;
  /** The player gave up on this item: show it as the current one. */
  onGiveUp: (index: number, item: AudioQueueItem) => void;
}

/**
 * What the global player does when an item fails: keep a queue (rosary, "play all")
 * moving past one broken file, but stop instead of racing through it when nothing
 * plays (offline). After giving up the engine is stopped, so play loads the queue again.
 */
export function useErrorRecovery({ queueRef, withEngine, onGiveUp }: ErrorRecoveryOptions) {
  /** Errors in a row without any audio playing in between. */
  const streakRef = useRef(0);
  const stoppedRef = useRef(false);

  const handleError = useCallback(
    (index: number, item: AudioQueueItem, message: string) => {
      if (stoppedRef.current) return;
      console.warn(`[audio] "${item.title}" failed: ${message}`);
      streakRef.current += 1;
      if (index + 1 < queueRef.current.length && streakRef.current <= MAX_ERROR_SKIPS) {
        withEngine(async (engine) => {
          // Unless the player moved on already (Media3 skips failed items by itself).
          if (engine.getSnapshot().index === index) await engine.skipTo(index + 1);
        });
        return;
      }
      // Give up: stop the player too, or Media3 would keep skipping on its own.
      stoppedRef.current = true;
      onGiveUp(index, item);
      withEngine((engine) => engine.stop());
      toast({ title: "No se pudo reproducir el audio", description: "Revisa tu conexión e inténtalo de nuevo." });
    },
    [onGiveUp, queueRef, withEngine],
  );

  /** A new queue, or audio actually playing: start counting again. */
  const reset = useCallback(() => {
    streakRef.current = 0;
    stoppedRef.current = false;
  }, []);

  const noteProgress = useCallback(() => {
    streakRef.current = 0;
  }, []);

  /** True when the player was stopped after errors; then retry() must be used to play. */
  const isStopped = useCallback(() => stoppedRef.current, []);

  const retry = useCallback(
    (index: number) => {
      streakRef.current = 0;
      stoppedRef.current = false;
      const items = queueRef.current;
      withEngine((engine) => engine.load(items.map(toEngineTrack), { index, autoplay: true }));
    },
    [queueRef, withEngine],
  );

  // Stable, so the player's actions that use it don't change on every render.
  return useMemo(
    () => ({ handleError, reset, noteProgress, isStopped, retry }),
    [handleError, reset, noteProgress, isStopped, retry],
  );
}
