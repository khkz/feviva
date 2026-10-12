import { Capacitor } from "@capacitor/core";
import type { QueryClient } from "@tanstack/react-query";
import { generateRosaryAudio, getRosaryAudioUrl, rosaryAudioFilesQuery } from "@/data/rosario";
import { isCurrentUserAdmin } from "@/lib/isCurrentUserAdmin";
import { ORACIONES_ROSARIO } from "@/lib/rosarioData";
import { missingPrayers, pickRosaryFiles, type RosaryAudioUrls } from "./rosaryQueue";

function canPlayOggOpus() {
  const platform = Capacitor.getPlatform();
  if (platform === "ios") return false;
  if (platform === "android") return true; // ExoPlayer decodes Ogg Opus.
  try {
    return new Audio().canPlayType('audio/ogg; codecs="opus"') !== "";
  } catch {
    return false;
  }
}

/**
 * Public URLs of the rosary prayers for every user (they used to live only in the
 * browser of the admin who generated them). Missing MP3s are generated when an
 * admin opens the audio rosary, so iOS gets a format it can play.
 * Resolves to null when some prayer has no playable audio yet.
 */
export async function getRosaryAudioUrls(queryClient: QueryClient): Promise<RosaryAudioUrls | null> {
  let files = await queryClient.fetchQuery(rosaryAudioFilesQuery);

  const withoutMp3 = missingPrayers(pickRosaryFiles(files, false));
  if (withoutMp3.length > 0 && (await isCurrentUserAdmin())) {
    for (const prayer of withoutMp3) await generateRosaryAudio(prayer, ORACIONES_ROSARIO[prayer]);
    await queryClient.invalidateQueries({ queryKey: rosaryAudioFilesQuery.queryKey });
    files = await queryClient.fetchQuery(rosaryAudioFilesQuery);
  }

  const picked = pickRosaryFiles(files, canPlayOggOpus());
  if (missingPrayers(picked).length > 0) return null;
  return {
    padreNuestro: getRosaryAudioUrl(picked.padreNuestro!),
    aveMaria: getRosaryAudioUrl(picked.aveMaria!),
    gloria: getRosaryAudioUrl(picked.gloria!),
  };
}
