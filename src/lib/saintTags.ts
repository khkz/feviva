// Formato único de etiquetas de santos para presentación al usuario.
// No cambia los valores guardados en la base — solo cómo se muestran.
// 'opus_dei' -> 'Opus Dei', 'sacerdotes' -> 'Sacerdotes'.

const SPECIAL_CASES: Record<string, string> = {
  opus_dei: 'Opus Dei',
  ewtn: 'EWTN',
  osb: 'OSB',
  ofm: 'OFM',
  sj: 'SJ',
};

export function formatSaintTag(tag: string): string {
  if (!tag) return '';
  const key = tag.toLowerCase().trim();
  if (SPECIAL_CASES[key]) return SPECIAL_CASES[key];
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatSaintTags(tags?: string[] | null): string[] {
  if (!tags) return [];
  return tags.map(formatSaintTag);
}
