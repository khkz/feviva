import { Capacitor } from "@capacitor/core";
import type { AudioEngine } from "./types";
import { WebAudioEngine } from "./webAudioEngine";

let enginePromise: Promise<AudioEngine> | null = null;

/**
 * Returns the app-wide playback engine, created on first use.
 * Inside the iOS/Android app it is the native queue player; if that fails to
 * start (for example the native project was not synced) it falls back to the
 * web engine so audio still works in the foreground.
 */
export function getAudioEngine(): Promise<AudioEngine> {
  if (!enginePromise) {
    enginePromise = createEngine();
  }
  return enginePromise;
}

async function createEngine(): Promise<AudioEngine> {
  const platform = Capacitor.getPlatform();
  if (Capacitor.isNativePlatform() && (platform === "ios" || platform === "android")) {
    try {
      const { createNativeAudioEngine } = await import("./nativeAudioEngine");
      return await createNativeAudioEngine(platform);
    } catch (error) {
      console.error("[audio] native player unavailable, using the web player", error);
    }
  }
  return new WebAudioEngine();
}

/** True inside the iOS/Android app, where the OS player owns the lock screen. */
export const isNativeAudio = () => Capacitor.isNativePlatform();
