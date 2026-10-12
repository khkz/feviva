import type { AudioItemType, AudioQueueItem } from "./types";
import type { EngineTrack } from "./engine/types";

export const AUDIO_TYPE_LABEL: Record<AudioItemType, string> = {
  oracion: "Oración",
  sleep_story: "Historia para dormir",
  lesson: "Lección",
  ritual: "Oración del día",
  rosario: "Santo Rosario",
};

/** Lock-screen artwork when an item has no image of its own (must be absolute for the OS). */
export const DEFAULT_ARTWORK_URL = "https://elrugido.com/pwa-512x512.png";

const isHttpUrl = (url: string | undefined): url is string => !!url && /^https?:\/\//i.test(url);

/** Identifies an item inside the engine (and in its snapshots). */
export const engineTrackId = (item: AudioQueueItem) => `${item.type}:${item.id}`;

export function toEngineTrack(item: AudioQueueItem): EngineTrack {
  return {
    id: engineTrackId(item),
    url: item.audioUrl ?? "",
    title: item.title,
    artist: item.subtitle || AUDIO_TYPE_LABEL[item.type],
    album: "El Rugido",
    artworkUrl: isHttpUrl(item.imageUrl) ? item.imageUrl : DEFAULT_ARTWORK_URL,
  };
}
