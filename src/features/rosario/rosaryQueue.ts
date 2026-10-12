import type { AudioQueueItem } from "@/features/audio";

export type RosaryPrayer = "padreNuestro" | "aveMaria" | "gloria";

export const ROSARY_PRAYERS: RosaryPrayer[] = ["padreNuestro", "aveMaria", "gloria"];

/** Per decade: Padre Nuestro, 10 Ave Marías, Gloria. */
export const PRAYERS_PER_MYSTERY = 12;
export const MYSTERIES_PER_ROSARY = 5;

export type RosaryAudioUrls = Record<RosaryPrayer, string>;

export interface RosaryPosition {
  mystery: number;
  prayer: number;
}

interface MysteryInfo {
  nombre: string;
  misterios: { numero: number; titulo: string }[];
}

export function prayerTypeForIndex(prayer: number): RosaryPrayer {
  if (prayer === 0) return "padreNuestro";
  if (prayer >= 1 && prayer <= 10) return "aveMaria";
  return "gloria";
}

export function prayerName(prayer: number): string {
  if (prayer === 0) return "Padre Nuestro";
  if (prayer >= 1 && prayer <= 10) return `Ave María (${prayer}/10)`;
  return "Gloria";
}

export const rosaryItemId = (tipo: string, { mystery, prayer }: RosaryPosition) =>
  `rosario:${tipo}:${mystery}:${prayer}`;

export function parseRosaryItemId(id: string | undefined | null): (RosaryPosition & { tipo: string }) | null {
  const match = id ? /^rosario:([a-z]+):(\d):(\d{1,2})$/.exec(id) : null;
  if (!match) return null;
  const mystery = Number(match[2]);
  const prayer = Number(match[3]);
  if (mystery >= MYSTERIES_PER_ROSARY || prayer >= PRAYERS_PER_MYSTERY) return null;
  return { tipo: match[1], mystery, prayer };
}

/** Linear order of a prayer within the whole rosary (0…59). */
export const rosaryStep = ({ mystery, prayer }: RosaryPosition) => mystery * PRAYERS_PER_MYSTERY + prayer;

export const isLastPrayer = (position: RosaryPosition) =>
  rosaryStep(position) === MYSTERIES_PER_ROSARY * PRAYERS_PER_MYSTERY - 1;

/**
 * Everything left to pray from `from` to the final Gloria, as one queue: the
 * OS player then advances prayer by prayer even with the screen locked.
 */
export function buildRosaryQueue(
  tipo: string,
  mysteryData: MysteryInfo,
  from: RosaryPosition,
  urls: RosaryAudioUrls,
): AudioQueueItem[] {
  const items: AudioQueueItem[] = [];
  for (let mystery = from.mystery; mystery < MYSTERIES_PER_ROSARY; mystery++) {
    const info = mysteryData.misterios[mystery];
    const subtitle = info ? `${mysteryData.nombre} · ${info.numero}.º ${info.titulo}` : mysteryData.nombre;
    const firstPrayer = mystery === from.mystery ? from.prayer : 0;
    for (let prayer = firstPrayer; prayer < PRAYERS_PER_MYSTERY; prayer++) {
      items.push({
        id: rosaryItemId(tipo, { mystery, prayer }),
        title: prayerName(prayer),
        subtitle,
        audioUrl: urls[prayerTypeForIndex(prayer)],
        type: "rosario",
      });
    }
  }
  return items;
}

/**
 * Picks one file per prayer from the names in storage, MP3 first.
 * Ogg Opus is used only where the player can decode it (the iOS native player can't).
 */
export function pickRosaryFiles(fileNames: string[], allowOpus: boolean): Partial<Record<RosaryPrayer, string>> {
  const available = new Set(fileNames);
  const picked: Partial<Record<RosaryPrayer, string>> = {};
  for (const prayer of ROSARY_PRAYERS) {
    if (available.has(`${prayer}.mp3`)) picked[prayer] = `${prayer}.mp3`;
    else if (allowOpus && available.has(`${prayer}.opus`)) picked[prayer] = `${prayer}.opus`;
  }
  return picked;
}

export const missingPrayers = (picked: Partial<Record<RosaryPrayer, string>>) =>
  ROSARY_PRAYERS.filter((prayer) => !picked[prayer]);
