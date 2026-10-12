import { supabase } from "@/integrations/supabase/client";

const BUCKET = "teachings-audio";
const FOLDER = "rosario";

/** File names in teachings-audio/rosario/ (e.g. "aveMaria.mp3"). */
export async function listRosaryAudioFiles(): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 100 });
  if (error) throw error;
  return (data ?? []).map((file) => file.name);
}

/** The listing, cached with the root query defaults (files change only when an admin generates one). */
export const rosaryAudioFilesQuery = {
  queryKey: ["rosario", "audio-files"] as const,
  queryFn: listRosaryAudioFiles,
};

export const getRosaryAudioUrl = (fileName: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${fileName}`).data.publicUrl;

/** Admin only: renders the text with the text-to-speech function (MP3 by default) into rosario/<name>.mp3. */
export async function generateRosaryAudio(name: string, text: string) {
  const { error } = await supabase.functions.invoke("text-to-speech", {
    body: { text, filename: `${FOLDER}/${name}`, voice: "onyx" },
  });
  if (error) throw error;
}
