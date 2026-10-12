import { useEffect, useRef } from "react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { AUDIO_TYPE_LABEL, isNativeAudio } from "@/features/audio";

const SEEK_STEP_SECONDS = 15;
const FALLBACK_ARTWORK = "/pwa-512x512.png";

// Inside the iOS/Android app the native player owns the lock screen; this bridge is for browsers.
const hasMediaSession = () =>
  !isNativeAudio() && typeof navigator !== "undefined" && "mediaSession" in navigator;

const setHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    // Some browsers do not support every action (e.g. seekto on older Safari).
  }
};

const ACTIONS: MediaSessionAction[] = [
  "play",
  "pause",
  "stop",
  "previoustrack",
  "nexttrack",
  "seekbackward",
  "seekforward",
  "seekto",
];

/**
 * Publishes the global audio player to the OS media controls
 * (lock screen, notification shade, headphones, Bluetooth, smartwatch).
 * Renders nothing. Must live inside AudioPlayerProvider.
 */
export function MediaSessionBridge() {
  const player = useAudioPlayer();
  const { currentItem, isPlaying, currentTime, duration, playbackRate } = player;

  // Handlers registered with the OS must always call the latest player functions.
  const playerRef = useRef(player);
  playerRef.current = player;

  // Metadata: title, subtitle and artwork shown on the lock screen.
  useEffect(() => {
    if (!hasMediaSession()) return;
    if (!currentItem) {
      navigator.mediaSession.metadata = null;
      return;
    }
    const artworkSrc = currentItem.imageUrl || FALLBACK_ARTWORK;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentItem.title,
      artist: currentItem.subtitle || AUDIO_TYPE_LABEL[currentItem.type],
      album: "El Rugido",
      artwork: [
        { src: artworkSrc, sizes: "512x512", type: artworkSrc.endsWith(".png") ? "image/png" : "image/jpeg" },
      ],
    });
  }, [currentItem]);

  // Play/pause state.
  useEffect(() => {
    if (!hasMediaSession()) return;
    navigator.mediaSession.playbackState = currentItem ? (isPlaying ? "playing" : "paused") : "none";
  }, [currentItem, isPlaying]);

  // Action handlers (registered once while an item is active).
  const isActive = Boolean(currentItem);
  useEffect(() => {
    if (!hasMediaSession() || !isActive) return;

    const seekBy = (delta: number) => {
      const { currentTime: position, duration: length, seek } = playerRef.current;
      const max = length > 0 ? length : Infinity;
      seek(Math.min(Math.max(0, position + delta), max));
    };

    setHandler("play", () => {
      if (!playerRef.current.isPlaying) playerRef.current.togglePlay();
    });
    setHandler("pause", () => playerRef.current.pause());
    setHandler("stop", () => playerRef.current.close());
    setHandler("previoustrack", () => {
      if (playerRef.current.hasPrevious) playerRef.current.playPrevious();
    });
    setHandler("nexttrack", () => {
      if (playerRef.current.hasNext) playerRef.current.playNext();
    });
    setHandler("seekbackward", (details) => seekBy(-(details.seekOffset ?? SEEK_STEP_SECONDS)));
    setHandler("seekforward", (details) => seekBy(details.seekOffset ?? SEEK_STEP_SECONDS));
    setHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") playerRef.current.seek(details.seekTime);
    });

    return () => {
      ACTIONS.forEach((action) => setHandler(action, null));
    };
  }, [isActive]);

  // Progress bar on the lock screen; refreshed every ~5 s instead of every timeupdate.
  const positionBucket = Math.floor(currentTime / 5);
  useEffect(() => {
    if (!hasMediaSession() || !("setPositionState" in navigator.mediaSession)) return;
    if (!currentItem || !Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: playbackRate || 1,
        position: Math.min(Math.max(0, currentTime), duration),
      });
    } catch {
      // Ignore invalid states (e.g. position briefly beyond duration while loading).
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem, duration, playbackRate, positionBucket]);

  return null;
}
