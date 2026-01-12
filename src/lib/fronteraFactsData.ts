// Contenido mixto para "Dato del Día" en Frontera Final
// Alterna entre datos curiosos educativos y frases motivacionales según la fecha

export interface DailyContent {
  type: 'fact' | 'quote';
  content: string;
  author?: string;
  icon: 'sparkles' | 'star' | 'book' | 'heart';
}

export const fronteraContent: DailyContent[] = [
  // ===== DATOS CURIOSOS EDUCATIVOS =====
  { type: 'fact', content: 'Georges Lemaître, sacerdote católico, propuso la teoría del Big Bang en 1927, antes que Hubble.', icon: 'sparkles' },
  { type: 'fact', content: 'El Observatorio Vaticano fue fundado en 1891, décadas antes que la NASA (1958).', icon: 'star' },
  { type: 'fact', content: '35 cráteres lunares llevan nombres de científicos jesuitas.', icon: 'star' },
  { type: 'fact', content: 'Nicolás Copérnico era canónigo de la Iglesia Católica.', icon: 'book' },
  { type: 'fact', content: 'Gregor Mendel, monje agustino, es el padre de la genética moderna.', icon: 'sparkles' },
  { type: 'fact', content: 'Roger Bacon, fraile franciscano, sentó las bases del método científico en el siglo XIII.', icon: 'book' },
  { type: 'fact', content: 'San Alberto Magno (siglo XIII) es el santo patrón de los científicos.', icon: 'star' },
  { type: 'fact', content: 'Louis Pasteur, católico devoto, desarrolló la vacuna contra la rabia y la pasteurización.', icon: 'sparkles' },
  { type: 'fact', content: 'Las primeras universidades de Europa fueron fundadas por la Iglesia Católica.', icon: 'book' },
  { type: 'fact', content: 'El calendario gregoriano que usamos hoy fue creado por el Papa Gregorio XIII en 1582.', icon: 'star' },
  { type: 'fact', content: 'Nicole Oresme, obispo del siglo XIV, anticipó la rotación de la Tierra.', icon: 'book' },
  { type: 'fact', content: 'El primer hospital de la historia fue fundado por la Iglesia en Roma (siglo IV).', icon: 'sparkles' },
  { type: 'fact', content: 'El jesuita Athanasius Kircher (siglo XVII) fue pionero en microbiología y geología.', icon: 'star' },
  { type: 'fact', content: 'La teoría de las manchas solares fue desarrollada por el jesuita Christoph Scheiner.', icon: 'sparkles' },
  { type: 'fact', content: 'Pierre Teilhard de Chardin, sacerdote jesuita, co-descubrió el Hombre de Pekín.', icon: 'book' },
  { type: 'fact', content: 'El sacerdote Nicolas Steno es considerado el padre de la geología moderna.', icon: 'star' },
  { type: 'fact', content: 'El Vaticano tiene su propio grupo de astrónomos investigando el cosmos desde Arizona.', icon: 'sparkles' },
  { type: 'fact', content: 'Alexander Fleming, descubridor de la penicilina, era católico practicante.', icon: 'star' },
  { type: 'fact', content: 'El jesuita Ruđer Bošković formuló la primera teoría atómica moderna en el siglo XVIII.', icon: 'book' },
  { type: 'fact', content: 'La Iglesia Católica opera más de 5,000 hospitales en todo el mundo.', icon: 'sparkles' },
  { type: 'fact', content: 'Francesco Grimaldi, jesuita, descubrió la difracción de la luz.', icon: 'star' },
  { type: 'fact', content: 'El sacerdote belga Georges Lemaître corrigió a Einstein sobre la expansión del universo.', icon: 'sparkles' },
  { type: 'fact', content: 'La Iglesia preservó los textos de Aristóteles y Platón durante la Edad Media.', icon: 'book' },
  { type: 'fact', content: 'El monje Basilio Valentín es considerado el padre de la química moderna.', icon: 'star' },
  { type: 'fact', content: 'Los jesuitas establecieron la primera red global de observatorios sísmicos.', icon: 'sparkles' },
  { type: 'fact', content: 'Giovanni Battista Riccioli, jesuita, nombró los mares y cráteres de la Luna.', icon: 'star' },
  { type: 'fact', content: 'El sacerdote Marin Mersenne fue fundamental en el desarrollo de la acústica.', icon: 'book' },
  { type: 'fact', content: 'El Vaticano posee una de las colecciones de meteoritos más importantes del mundo.', icon: 'sparkles' },
  { type: 'fact', content: 'El concepto de "infinito" en matemáticas fue desarrollado por el sacerdote Bernhard Bolzano.', icon: 'star' },
  { type: 'fact', content: 'Jérôme Lejeune, católico devoto, descubrió la causa del síndrome de Down.', icon: 'book' },

  // ===== FRASES MOTIVACIONALES =====
  { type: 'quote', content: 'La fe y la razón son como las dos alas con las cuales el espíritu humano se eleva hacia la contemplación de la verdad.', author: 'San Juan Pablo II', icon: 'heart' },
  { type: 'quote', content: 'El universo es el libro donde Dios escribió su sabiduría.', author: 'Galileo Galilei', icon: 'heart' },
  { type: 'quote', content: 'La ciencia sin religión está coja, y la religión sin ciencia está ciega.', author: 'Albert Einstein', icon: 'star' },
  { type: 'quote', content: 'Cuanto más estudio la naturaleza, más me maravillo ante la obra del Creador.', author: 'Louis Pasteur', icon: 'heart' },
  { type: 'quote', content: 'Estudiar las leyes del cosmos es estudiar los pensamientos de Dios.', author: 'Johannes Kepler', icon: 'star' },
  { type: 'quote', content: 'En el corazón del átomo más pequeño, encontrarás a Dios.', author: 'San Agustín', icon: 'heart' },
  { type: 'quote', content: 'La naturaleza es el arte de Dios.', author: 'Dante Alighieri', icon: 'heart' },
  { type: 'quote', content: 'El silencio eterno de estos espacios infinitos me aterra... pero también me acerca a Dios.', author: 'Blaise Pascal', icon: 'star' },
  { type: 'quote', content: 'Dios siempre geometriza.', author: 'Platón', icon: 'star' },
  { type: 'quote', content: 'La verdad científica y la verdad revelada provienen del mismo Dios.', author: 'Papa León XIII', icon: 'heart' },
  { type: 'quote', content: 'Cuanto más conozco la ciencia, más creo en Dios.', author: 'Louis Pasteur', icon: 'heart' },
  { type: 'quote', content: 'El Creador de las estrellas te ama personalmente.', author: 'Santa Teresa de Calcuta', icon: 'heart' },
  { type: 'quote', content: 'La humildad es la madre de todas las virtudes; porque ninguna otra puede existir sin ella.', author: 'San Agustín', icon: 'heart' },
  { type: 'quote', content: 'La Iglesia no teme a la ciencia; la abraza como camino hacia la verdad.', author: 'Papa Benedicto XVI', icon: 'star' },
  { type: 'quote', content: 'Somos polvo de estrellas contemplando las estrellas.', author: 'Carl Sagan', icon: 'star' },
  { type: 'quote', content: 'El cosmos revela la gloria del Creador; el firmamento proclama la obra de sus manos.', author: 'Salmo 19', icon: 'heart' },
  { type: 'quote', content: 'La verdadera sabiduría consiste en descubrir a Dios en todas las cosas.', author: 'San Ignacio de Loyola', icon: 'heart' },
  { type: 'quote', content: 'Orar es elevar el corazón a Dios... incluso cuando contemplamos las estrellas.', author: 'San Juan Damasceno', icon: 'heart' },
  { type: 'quote', content: 'El universo no fue hecho en broma, y quienes lo estudian no deben tomarlo en broma.', author: 'G.K. Chesterton', icon: 'star' },
  { type: 'quote', content: 'La ciencia nos acerca a Dios, pero nunca podrá reemplazarlo.', author: 'Max Planck', icon: 'star' },
  { type: 'quote', content: 'En la luz de las estrellas, veo el reflejo del amor infinito de Dios.', author: 'San Francisco de Asís', icon: 'heart' },
  { type: 'quote', content: 'El asombro ante el cosmos es el primer paso hacia la adoración.', author: 'Abraham Heschel', icon: 'heart' },
  { type: 'quote', content: 'Quien no se asombra ante el misterio del universo, está muerto por dentro.', author: 'Albert Einstein', icon: 'star' },
  { type: 'quote', content: 'Todo en el universo tiene un propósito, incluso tú.', author: 'Papa Francisco', icon: 'heart' },
  { type: 'quote', content: 'La ciencia investiga; la religión interpreta. Son dos alas del mismo pájaro.', author: 'Martin Luther King Jr.', icon: 'star' },
  { type: 'quote', content: 'Dios escribe derecho con líneas torcas... y con órbitas elípticas.', author: 'Proverbio adaptado', icon: 'heart' },
  { type: 'quote', content: 'El que contempla la belleza del cosmos ya ha comenzado a orar.', author: 'San Basilio Magno', icon: 'heart' },
  { type: 'quote', content: 'Las estrellas son las ventanas del cielo por donde los ángeles nos observan.', author: 'Tradición popular', icon: 'heart' },
  { type: 'quote', content: 'Buscar la verdad es buscar a Dios, aunque no lo sepamos.', author: 'Santa Edith Stein', icon: 'heart' },
  { type: 'quote', content: 'El cosmos es el primer libro de la Revelación; la Biblia es el segundo.', author: 'Hugo de San Víctor', icon: 'star' },
];

/**
 * Obtiene el contenido del día basado en la fecha actual
 * Los días impares muestran datos curiosos, los días pares muestran citas
 */
export function getDailyContent(date: Date = new Date()): DailyContent {
  // Calcular el día del año (1-366)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Separar contenido por tipo
  const facts = fronteraContent.filter(c => c.type === 'fact');
  const quotes = fronteraContent.filter(c => c.type === 'quote');
  
  // Alternar: días impares = facts, días pares = quotes
  if (dayOfYear % 2 === 1) {
    // Día impar: mostrar dato curioso
    return facts[dayOfYear % facts.length];
  } else {
    // Día par: mostrar cita motivacional
    return quotes[dayOfYear % quotes.length];
  }
}

/**
 * Obtiene el tipo de contenido para mostrar en la UI
 */
export function getContentLabel(type: 'fact' | 'quote'): string {
  return type === 'fact' ? 'Dato del Día' : 'Reflexión del Día';
}
