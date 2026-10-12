import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { toEngineTrack } from "./labels";
import type { AudioQueueItem } from "./types";
import type { WithEngine } from "./useEngineCommands";

interface QueueEditingOptions {
  queueRef: MutableRefObject<AudioQueueItem[]>;
  setQueue: Dispatch<SetStateAction<AudioQueueItem[]>>;
  /** Replaces the queue in the UI state (current item, index…). */
  commitQueue: (items: AudioQueueItem[], index: number) => void;
  withEngine: WithEngine;
  currentIndex: number;
  currentTime: number;
  isPlaying: boolean;
}

/** Adding to and removing from the queue while it plays (playlist drawer). */
export function useQueueEditing({
  queueRef,
  setQueue,
  commitQueue,
  withEngine,
  currentIndex,
  currentTime,
  isPlaying,
}: QueueEditingOptions) {
  const addToQueue = useCallback(
    (item: AudioQueueItem) => {
      if (!item.audioUrl) return;
      const items = [...queueRef.current, item];
      queueRef.current = items;
      setQueue(items);
      withEngine((engine) => engine.append(toEngineTrack(item)));
    },
    [queueRef, setQueue, withEngine],
  );

  // Reloads the engine with the given queue, keeping the current item and position.
  const reloadQueue = useCallback(
    (items: AudioQueueItem[], index: number) => {
      commitQueue(items, index);
      withEngine((engine) =>
        engine.load(items.map(toEngineTrack), { index, position: currentTime, autoplay: isPlaying }),
      );
    },
    [commitQueue, currentTime, isPlaying, withEngine],
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      const items = queueRef.current;
      if (index === currentIndex || index < 0 || index >= items.length) return;
      reloadQueue(
        items.filter((_, i) => i !== index),
        index < currentIndex ? currentIndex - 1 : currentIndex,
      );
    },
    [currentIndex, queueRef, reloadQueue],
  );

  const clearQueue = useCallback(() => {
    const current = queueRef.current[currentIndex];
    if (current) reloadQueue([current], 0);
  }, [currentIndex, queueRef, reloadQueue]);

  return { addToQueue, removeFromQueue, clearQueue };
}
