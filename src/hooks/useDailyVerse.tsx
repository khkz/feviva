import { useMemo } from 'react';

interface DailyVerse {
  text: string;
  reference: string;
}

// Collection of motivating verses about growing in faith and being an apostle of Jesus
const APOSTLE_VERSES: DailyVerse[] = [
  { text: "Estén siempre preparados para responder a todo el que les pida razón de la esperanza que hay en ustedes.", reference: "1 Pedro 3:15" },
  { text: "Vayan y hagan discípulos de todas las naciones, bautizándolos en el nombre del Padre y del Hijo y del Espíritu Santo.", reference: "Mateo 28:19" },
  { text: "Ustedes son la luz del mundo. Una ciudad asentada sobre un monte no se puede esconder.", reference: "Mateo 5:14" },
  { text: "Todo lo puedo en Cristo que me fortalece.", reference: "Filipenses 4:13" },
  { text: "No me avergüenzo del evangelio, porque es poder de Dios para salvación de todo aquel que cree.", reference: "Romanos 1:16" },
  { text: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.", reference: "2 Timoteo 1:7" },
  { text: "El Señor es mi luz y mi salvación, ¿de quién temeré?", reference: "Salmo 27:1" },
  { text: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.", reference: "Proverbios 3:5" },
  { text: "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz y no de mal.", reference: "Jeremías 29:11" },
  { text: "Busquen primero el reino de Dios y su justicia, y todas estas cosas les serán añadidas.", reference: "Mateo 6:33" },
  { text: "He aquí, yo estoy contigo, y te guardaré por dondequiera que fueres.", reference: "Génesis 28:15" },
  { text: "Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo.", reference: "Josué 1:9" },
  { text: "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.", reference: "Jeremías 33:3" },
  { text: "El Señor peleará por ustedes; ustedes quédense quietos.", reference: "Éxodo 14:14" },
  { text: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", reference: "Mateo 6:33" },
  { text: "Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto.", reference: "Juan 15:5" },
  { text: "Y conoceréis la verdad, y la verdad os hará libres.", reference: "Juan 8:32" },
  { text: "Pero recibiréis poder cuando haya venido sobre vosotros el Espíritu Santo, y me seréis testigos.", reference: "Hechos 1:8" },
  { text: "Vengan a mí todos ustedes que están cansados y agobiados, y yo les daré descanso.", reference: "Mateo 11:28" },
  { text: "Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos.", reference: "Mateo 18:20" },
  { text: "Si Dios está con nosotros, ¿quién contra nosotros?", reference: "Romanos 8:31" },
  { text: "El amor es paciente, es bondadoso. El amor no es envidioso ni jactancioso ni orgulloso.", reference: "1 Corintios 13:4" },
  { text: "No se amolden al mundo actual, sino sean transformados mediante la renovación de su mente.", reference: "Romanos 12:2" },
  { text: "Porque somos hechura de Dios, creados en Cristo Jesús para buenas obras.", reference: "Efesios 2:10" },
  { text: "El que comenzó la buena obra en ustedes la irá perfeccionando hasta el día de Cristo Jesús.", reference: "Filipenses 1:6" },
  { text: "Por tanto, vayan y hagan discípulos de todas las naciones, bautizándolos en el nombre del Padre.", reference: "Mateo 28:19" },
  { text: "Sean fuertes y valientes. No teman ni se asusten, porque el Señor su Dios los acompañará.", reference: "Deuteronomio 31:6" },
  { text: "Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá.", reference: "Mateo 7:7" },
  { text: "El hierro se afila con hierro, y el hombre en el trato con el hombre.", reference: "Proverbios 27:17" },
  { text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios.", reference: "Isaías 41:10" },
  { text: "Grande es el Señor, y digno de suprema alabanza; su grandeza es inescrutable.", reference: "Salmo 145:3" },
];

/**
 * Returns a different motivating verse each day based on the current date.
 * The verse cycles through the collection, ensuring variety throughout the month.
 */
export function useDailyVerse(): DailyVerse {
  const verse = useMemo(() => {
    const today = new Date();
    // Create a unique index based on the day of the year
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Use modulo to cycle through verses
    const verseIndex = dayOfYear % APOSTLE_VERSES.length;
    return APOSTLE_VERSES[verseIndex];
  }, []);

  return verse;
}
