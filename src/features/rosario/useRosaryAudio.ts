import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { getRosaryAudioUrls } from "./rosaryAudio";
import {
  buildRosaryQueue,
  isLastPrayer,
  parseRosaryItemId,
  rosaryItemId,
  rosaryStep,
  type RosaryPosition,
} from "./rosaryQueue";

interface MysteryInfo {
  nombre: string;
  misterios: { numero: number; titulo: string }[];
}

interface UseRosaryAudioOptions {
  /** Voice (TTS) switched on in the rosary. */
  enabled: boolean;
  tipo: string;
  position: RosaryPosition;
  getMysteryData: (tipo: string) => MysteryInfo;
  /** The player moved to another prayer on its own (auto-advance, lock screen). */
  onPlayerMoved: (position: RosaryPosition, advanced: boolean) => void;
  /** The final Gloria finished. */
  onCompleted: () => void;
  /** Some prayer has no playable audio yet. */
  onUnavailable: () => void;
  /** Another audio was started while the rosary queue was being prepared. */
  onTakenOver: () => void;
}

/**
 * Plays the audio rosary through the global player: the remaining prayers are
 * loaded as one queue, so the OS player keeps praying with the screen locked,
 * and the rosary UI follows whatever prayer the player is on.
 */
export function useRosaryAudio(options: UseRosaryAudioOptions) {
  const { enabled, tipo, position } = options;
  const queryClient = useQueryClient();
  const {
    currentItem,
    isPlaying: playerIsPlaying,
    hasEnded,
    queue,
    playQueue,
    playIndex,
    pause: pausePlayer,
    togglePlay,
    close: closePlayer,
  } = useAudioPlayer();

  const playerPosition = currentItem?.type === "rosario" ? parseRosaryItemId(currentItem.id) : null;
  const isActive = enabled && playerPosition !== null && playerPosition.tipo === tipo;

  const [isPreparing, setIsPreparing] = useState(false);
  const requestRef = useRef(0);
  /**
   * Item the player was asked to move to; until it gets there (or, for a jump within the
   * queue, a few seconds pass) the items it reports are stale and the UI doesn't follow them.
   */
  const expectedRef = useRef<{ id: string; until: number } | null>(null);
  const completedRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const currentItemRef = useRef(currentItem);
  currentItemRef.current = currentItem;

  const start = useCallback(
    (from: RosaryPosition, queueTipo: string) => {
      const request = ++requestRef.current;
      const itemAtRequest = currentItemRef.current?.id ?? null;
      expectedRef.current = { id: rosaryItemId(queueTipo, from), until: Infinity };
      setIsPreparing(true);
      getRosaryAudioUrls(queryClient)
        .then((urls) => {
          if (request !== requestRef.current) return;
          const latest = currentItemRef.current;
          if (latest && latest.type !== "rosario" && latest.id !== itemAtRequest) {
            // The user started something else while the prayers were being looked up.
            expectedRef.current = null;
            optionsRef.current.onTakenOver();
            return;
          }
          if (!urls) {
            expectedRef.current = null;
            optionsRef.current.onUnavailable();
            return;
          }
          const items = buildRosaryQueue(queueTipo, optionsRef.current.getMysteryData(queueTipo), from, urls);
          expectedRef.current = items[0] ? { id: items[0].id, until: Infinity } : null;
          completedRef.current = false;
          playQueue(items, 0);
        })
        .catch((error) => {
          if (request !== requestRef.current) return;
          console.error("[rosario] audio unavailable", error);
          expectedRef.current = null;
          optionsRef.current.onUnavailable();
        })
        .finally(() => {
          if (request === requestRef.current) setIsPreparing(false);
        });
    },
    [playQueue, queryClient],
  );

  const cancelStart = useCallback(() => {
    requestRef.current += 1;
    expectedRef.current = null;
    setIsPreparing(false);
  }, []);

  /** Releases the player when it holds a rosary queue (of any mystery type). */
  const stop = useCallback(() => {
    cancelStart();
    if (currentItemRef.current?.type === "rosario") closePlayer();
  }, [cancelStart, closePlayer]);

  const pause = useCallback(() => {
    cancelStart();
    if (isActiveRef.current) pausePlayer();
  }, [cancelStart, pausePlayer]);

  const resume = useCallback(() => {
    if (isActiveRef.current && !playerIsPlaying) togglePlay();
  }, [playerIsPlaying, togglePlay]);

  /** User moved to another prayer from the rosary UI. */
  const goTo = useCallback(
    (target: RosaryPosition) => {
      if (isPreparing) {
        start(target, tipo);
        return;
      }
      if (!isActiveRef.current) return;
      if (!playerIsPlaying) {
        // Paused: leave the queue; play rebuilds it from the new prayer.
        stop();
        return;
      }
      const index = queue.findIndex((item) => item.id === rosaryItemId(tipo, target));
      if (index >= 0) {
        expectedRef.current = { id: queue[index].id, until: Date.now() + 3000 };
        playIndex(index);
      } else {
        start(target, tipo);
      }
    },
    [isPreparing, playerIsPlaying, queue, playIndex, start, stop, tipo],
  );

  // Follow the player (auto-advance, lock-screen skips, catching up after the app slept).
  const playerItemId = currentItem?.id;
  const playerStep = playerPosition ? rosaryStep(playerPosition) : -1;
  const stateStep = rosaryStep(position);
  useEffect(() => {
    if (!isActive || !playerPosition || !playerItemId) return;
    const expected = expectedRef.current;
    if (expected) {
      if (expected.id !== playerItemId && Date.now() < expected.until) return;
      expectedRef.current = null;
    }
    if (playerStep !== stateStep) {
      optionsRef.current.onPlayerMoved(
        { mystery: playerPosition.mystery, prayer: playerPosition.prayer },
        playerStep > stateStep,
      );
    }
    // playerPosition is derived from playerItemId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, playerItemId, playerStep, stateStep]);

  // The last Gloria finished playing.
  useEffect(() => {
    if (!isActive || !hasEnded || !playerPosition || completedRef.current) return;
    if (isLastPrayer(playerPosition)) {
      completedRef.current = true;
      optionsRef.current.onCompleted();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, hasEnded, playerStep]);

  const isPlaying = isActive && playerIsPlaying;
  const ended = isActive && hasEnded;
  // Stable between playback ticks, so the rosary screens don't re-render several times a second.
  return useMemo(
    () => ({ isActive, isPreparing, isPlaying, hasEnded: ended, start, stop, pause, resume, goTo }),
    [isActive, isPreparing, isPlaying, ended, start, stop, pause, resume, goTo],
  );
}
