// Contenido mixto para "Cita del Pionero" en Frontera Final
// Alterna entre datos curiosos educativos y frases de científicos creyentes

export interface DailyContent {
  type: 'fact' | 'quote';
  content: string;
  author?: string;
  icon: 'sparkles' | 'star' | 'book' | 'heart';
}

export const fronteraContent: DailyContent[] = [
  // ===== DATOS CURIOSOS EDUCATIVOS =====
  { type: 'fact', content: 'Georges Lemaître, sacerdote católico, propuso la teoría del Big Bang en 1927, antes que Hubble.', icon: 'sparkles' },
  { type: 'fact', content: 'Isaac Newton escribió más sobre teología que sobre física y matemáticas combinadas.', icon: 'star' },
  { type: 'fact', content: 'Gregor Mendel, monje agustino, es el padre de la genética moderna gracias a sus experimentos con guisantes.', icon: 'book' },
  { type: 'fact', content: 'Louis Pasteur, católico devoto, desarrolló la vacuna contra la rabia y la pasteurización.', icon: 'sparkles' },
  { type: 'fact', content: 'Las primeras universidades de Europa fueron fundadas por la Iglesia en la Edad Media.', icon: 'book' },
  { type: 'fact', content: 'El calendario gregoriano que usamos hoy fue creado por el Papa Gregorio XIII en 1582.', icon: 'star' },
  { type: 'fact', content: 'Roger Bacon, fraile franciscano, sentó las bases del método científico en el siglo XIII.', icon: 'book' },
  { type: 'fact', content: 'Nicolás Copérnico era canónigo de la Iglesia Católica cuando propuso el heliocentrismo.', icon: 'star' },
  { type: 'fact', content: 'Johannes Kepler veía su trabajo astronómico como una forma de "pensar los pensamientos de Dios".', icon: 'sparkles' },
  { type: 'fact', content: 'El primer hospital de la historia fue fundado por la Iglesia en Roma en el siglo IV.', icon: 'book' },
  { type: 'fact', content: 'Blaise Pascal, matemático y físico brillante, tuvo una profunda conversión cristiana en 1654.', icon: 'star' },
  { type: 'fact', content: 'Michael Faraday, padre del electromagnetismo, era un cristiano devoto que predicaba regularmente.', icon: 'sparkles' },
  { type: 'fact', content: 'El concepto de "infinito" en matemáticas fue desarrollado por Georg Cantor, un creyente luterano.', icon: 'star' },
  { type: 'fact', content: 'James Clerk Maxwell, quien unificó electricidad y magnetismo, era un cristiano comprometido.', icon: 'book' },
  { type: 'fact', content: 'Werner Heisenberg, padre de la mecánica cuántica, era luterano y escribió sobre ciencia y fe.', icon: 'sparkles' },

  // ===== FRASES DE CIENTÍFICOS CREYENTES =====
  { type: 'quote', content: 'Hacer ciencia es pensar los pensamientos de Dios después de Él.', author: 'Johannes Kepler', icon: 'star' },
  { type: 'quote', content: 'En ausencia de cualquier otra prueba, el pulgar por sí solo me convencería de la existencia de Dios.', author: 'Isaac Newton', icon: 'star' },
  { type: 'quote', content: 'Cuanto más estudio la naturaleza, más me maravillo ante la obra del Creador.', author: 'Louis Pasteur', icon: 'heart' },
  { type: 'quote', content: 'La Biblia me enseña cómo ir al cielo, no cómo van los cielos.', author: 'Galileo Galilei', icon: 'book' },
  { type: 'quote', content: 'Un poco de ciencia aleja de Dios, pero mucha ciencia devuelve a Él.', author: 'Louis Pasteur', icon: 'heart' },
  { type: 'quote', content: 'La ciencia sin religión está coja, y la religión sin ciencia está ciega.', author: 'Albert Einstein', icon: 'star' },
  { type: 'quote', content: 'El primer trago de la copa de las ciencias naturales te hará ateo, pero en el fondo del vaso Dios te espera.', author: 'Werner Heisenberg', icon: 'star' },
  { type: 'quote', content: 'Dios siempre geometriza.', author: 'Platón', icon: 'star' },
  { type: 'quote', content: 'La naturaleza es el arte de Dios.', author: 'Dante Alighieri', icon: 'heart' },
  { type: 'quote', content: 'El silencio eterno de estos espacios infinitos me aterra... pero también me acerca a Dios.', author: 'Blaise Pascal', icon: 'star' },
  { type: 'quote', content: 'Somos polvo de estrellas contemplando las estrellas.', author: 'Carl Sagan', icon: 'star' },
  { type: 'quote', content: 'Los cielos cuentan la gloria de Dios; el firmamento proclama la obra de sus manos.', author: 'Salmo 19:1', icon: 'heart' },
  { type: 'quote', content: 'Buscar la verdad es buscar a Dios, aunque no lo sepamos.', author: 'Edith Stein', icon: 'heart' },
  { type: 'quote', content: 'El universo no fue hecho en broma, y quienes lo estudian no deben tomarlo en broma.', author: 'G.K. Chesterton', icon: 'star' },
  { type: 'quote', content: 'La ciencia nos acerca a Dios, pero nunca podrá reemplazarlo.', author: 'Max Planck', icon: 'star' },
];

export function getDailyContent(date: Date = new Date()): DailyContent {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const facts = fronteraContent.filter(c => c.type === 'fact');
  const quotes = fronteraContent.filter(c => c.type === 'quote');
  
  if (dayOfYear % 2 === 1) {
    return facts[dayOfYear % facts.length];
  } else {
    return quotes[dayOfYear % quotes.length];
  }
}

export function getContentLabel(type: 'fact' | 'quote'): string {
  return type === 'fact' ? 'Dato del Día' : 'Cita del Pionero';
}
