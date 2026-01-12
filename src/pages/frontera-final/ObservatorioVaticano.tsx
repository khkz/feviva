import { Telescope, History, Mountain, Star } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function ObservatorioVaticano() {
  return (
    <ArticuloFrontera
      id="observatorio-vaticano"
      title="El Observatorio Vaticano"
      subtitle="400 años mirando al cielo antes que la NASA"
      icon={Telescope}
      color="amber"
      category="Historia"
      quotes={[
        {
          text: "La Iglesia y la comunidad científica comparten la búsqueda de la verdad. El Observatorio Vaticano es un signo visible de esta búsqueda común.",
          author: "Papa Juan Pablo II",
          source: "Discurso en Castel Gandolfo, 1987"
        },
        {
          text: "Hacemos astronomía porque es divertido, pero también porque creemos que vale la pena conocer la verdad sobre el universo de Dios.",
          author: "Guy Consolmagno, S.J.",
          source: "Director del Observatorio Vaticano"
        }
      ]}
      sections={[
        {
          title: "Una Historia de Siglos",
          icon: History,
          content: `
            <p>El <strong>Observatorio Vaticano</strong> (Specola Vaticana) es uno de los institutos astronómicos más antiguos del mundo. Sus orígenes se remontan a 1582, cuando el Papa Gregorio XIII convocó a los mejores astrónomos de la época para reformar el calendario juliano.</p>
            
            <p>El resultado fue el <strong>calendario gregoriano</strong>, que usamos hasta hoy. Para calcularlo correctamente, la Iglesia necesitaba observaciones astronómicas precisas. Así comenzó la tradición de la astronomía papal.</p>
            
            <p>A lo largo de los siglos, el observatorio ha tenido varias sedes:</p>
            <ul>
              <li><strong>Torre de los Vientos</strong> (Vaticano, 1580s)</li>
              <li><strong>Colegio Romano</strong> (1787-1870)</li>
              <li><strong>Colina del Vaticano</strong> (1891-1935)</li>
              <li><strong>Castel Gandolfo</strong> (1935-presente)</li>
              <li><strong>Monte Graham, Arizona</strong> (1993-presente)</li>
            </ul>
            
            <p>Sí, leíste bien: el Vaticano tiene un telescopio de última generación en Arizona. Se llama <strong>VATT</strong> (Vatican Advanced Technology Telescope) y es uno de los observatorios más avanzados del mundo.</p>
          `
        },
        {
          title: "Científicos con Sotana",
          icon: Star,
          content: `
            <p>El personal del Observatorio Vaticano está compuesto principalmente por sacerdotes jesuitas, aunque también incluye científicos laicos de diversas nacionalidades. Todos son investigadores de primer nivel con doctorados de universidades prestigiosas.</p>
            
            <p>El actual director, <strong>Guy Consolmagno, S.J.</strong>, es un estadounidense con doctorado del MIT que ha trabajado en Harvard y el MIT antes de unirse al Vaticano. Es una celebridad en el mundo astronómico, ganador de la Medalla Carl Sagan por su trabajo de divulgación científica.</p>
            
            <p>Consolmagno es conocido por su respuesta a la pregunta: <em>"¿Por qué la Iglesia tiene un observatorio?"</em></p>
            
            <p><em>"Primero, porque la ciencia es divertida. Segundo, porque es una forma de adorar a Dios al estudiar su creación. Y tercero, porque queremos mostrar al mundo que la Iglesia apoya la ciencia y siempre lo ha hecho."</em></p>
            
            <p>El Observatorio también organiza la <strong>Escuela de Verano del Vaticano</strong>, donde jóvenes astrónomos de todo el mundo — católicos y no católicos — estudian juntos durante un mes. Es un símbolo poderoso del compromiso de la Iglesia con la educación científica.</p>
          `
        },
        {
          title: "Investigación de Vanguardia",
          icon: Mountain,
          content: `
            <p>El Observatorio Vaticano no es un museo ni una curiosidad histórica. Es un centro de investigación activo que publica regularmente en las revistas científicas más prestigiosas.</p>
            
            <p>Algunas áreas de investigación incluyen:</p>
            
            <p><strong>Meteoritos:</strong> El Vaticano posee una de las colecciones de meteoritos más importantes del mundo. Estudiarlos nos ayuda a entender la formación del sistema solar.</p>
            
            <p><strong>Estrellas variables:</strong> El observatorio tiene décadas de datos sobre estrellas que cambian de brillo, cruciales para medir distancias cósmicas.</p>
            
            <p><strong>Cosmología:</strong> Los científicos del Vaticano investigan temas como la materia oscura, la energía oscura y el origen del universo.</p>
            
            <p><strong>Filosofía de la ciencia:</strong> Además de hacer ciencia, el observatorio reflexiona sobre qué es la ciencia, cómo se relaciona con la fe y la ética.</p>
            
            <p>Como dijo el Papa Juan Pablo II: <em>"La ciencia puede purificar a la religión del error y la superstición; la religión puede purificar a la ciencia de la idolatría y los falsos absolutos. Cada una puede llevar a la otra a un mundo más amplio, un mundo donde ambas pueden florecer."</em></p>
            
            <p>El Observatorio Vaticano es la prueba viviente de que no hay guerra entre fe y ciencia. Son dos caminos que convergen hacia la misma verdad.</p>
          `
        }
      ]}
      videoId="o3eqYbKVYC0"
      videoTitle="El Astrónomo del Papa: Guy Consolmagno (EWTN)"
      reflection="¿Por qué crees que la Iglesia invierte en ciencia? ¿Cómo puede el conocimiento del cosmos acercarte a Dios?"
      relatedArticles={[
        { id: "padre-big-bang", title: "El Padre del Big Bang", href: "/frontera-final/padre-big-bang" },
        { id: "libro-naturaleza", title: "El Libro de la Naturaleza", href: "/frontera-final/libro-naturaleza" },
        { id: "bautizar-extraterrestre", title: "¿Bautizaríamos a un Extraterrestre?", href: "/frontera-final/bautizar-extraterrestre" }
      ]}
    />
  );
}
