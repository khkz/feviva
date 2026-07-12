// Etiquetas en español para categorías litúrgicas y tipos de santo.
// Fuente única de verdad — no repetir strings sueltos en componentes.

export const SAINT_CATEGORY_LABELS: Record<string, string> = {
  solemnity: 'Solemnidad',
  feast: 'Fiesta',
  memorial: 'Memoria',
  optional_memorial: 'Memoria opcional',
  patron_country: 'Patrono de país',
  universal_helper: 'Santo auxiliador',
};

export function formatSaintCategory(category?: string | null): string {
  if (!category) return '';
  return (
    SAINT_CATEGORY_LABELS[category] ??
    category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
