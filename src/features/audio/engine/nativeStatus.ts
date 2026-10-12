import { RmxAudioStatusMessage, type OnStatusCallbackUpdateData } from "capacitor-plugin-playlist";

/** Playing (true) or paused (false) according to a status event, or null when it says neither. */
export function reportedPlaying(msgType: RmxAudioStatusMessage, value: OnStatusCallbackUpdateData | undefined) {
  switch (msgType) {
    case RmxAudioStatusMessage.RMXSTATUS_PLAYING:
      return true;
    case RmxAudioStatusMessage.RMXSTATUS_PAUSE:
      return false;
    case RmxAudioStatusMessage.RMXSTATUS_PLAYBACK_POSITION:
      if (value?.status === "playing") return true;
      if (value?.status === "paused") return false;
      return null;
    default:
      return null;
  }
}

/** Buffering (true) or ready (false) according to a status event, or null when it says neither. */
export function reportedBuffering(msgType: RmxAudioStatusMessage) {
  switch (msgType) {
    case RmxAudioStatusMessage.RMXSTATUS_LOADING:
    case RmxAudioStatusMessage.RMXSTATUS_BUFFERING:
    case RmxAudioStatusMessage.RMXSTATUS_STALLED:
      return true;
    case RmxAudioStatusMessage.RMXSTATUS_CANPLAY:
    case RmxAudioStatusMessage.RMXSTATUS_LOADED:
      return false;
    default:
      return null;
  }
}

/** Position and duration (seconds) carried by a status event, when valid. */
export function reportedProgress(value: OnStatusCallbackUpdateData | undefined) {
  const progress: { position?: number; duration?: number } = {};
  if (typeof value?.currentPosition === "number" && Number.isFinite(value.currentPosition)) {
    progress.position = Math.max(0, value.currentPosition);
  }
  if (typeof value?.duration === "number" && Number.isFinite(value.duration) && value.duration > 0) {
    progress.duration = value.duration;
  }
  return progress;
}
