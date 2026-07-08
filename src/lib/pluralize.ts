/**
 * Pluralización simple en español.
 * pluralize(1, "día", "días") -> "1 día"
 * pluralize(3, "día", "días") -> "3 días"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  const n = Math.max(0, Math.floor(count || 0));
  return `${n} ${n === 1 ? singular : plural}`;
}

export function dias(count: number): string {
  return pluralize(count, "día", "días");
}
