import { Atom, Scale, Sparkles, AlertTriangle } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function AjusteFino() {
  return (
    <ArticuloFrontera
      id="ajuste-fino"
      title="El Ajuste Fino del Universo"
      subtitle="Por qué las constantes físicas sugieren un cosmos diseñado para la vida."
      icon={Atom}
      color="cyan"
      category="Cosmos y Credo"
      quotes={[
        {
          text: "El ajuste fino del universo presenta el argumento más poderoso jamás encontrado para la existencia de un diseñador inteligente.",
          author: "John Lennox",
          source: "God's Undertaker"
        },
        {
          text: "Lo más incomprensible del universo es que sea comprensible.",
          author: "Albert Einstein"
        },
        {
          text: "Si el número que representa la entropía inicial del universo hubiera diferido en una parte de 10^10^123, no habría estrellas, galaxias ni vida.",
          author: "Roger Penrose",
          source: "The Road to Reality"
        }
      ]}
      sections={[
        {
          title: "El Universo en el Filo de la Navaja",
          icon: Scale,
          content: `
            <p>Imagina un panel de control con millones de diales, cada uno representando una constante física fundamental. Si cualquiera de ellos se desviara una fracción infinitesimal, el universo sería inhabitable.</p>
            
            <p><strong>Las 6 constantes críticas:</strong></p>
            <ul>
              <li><strong>Fuerza gravitacional:</strong> Si fuera 1 en 10^36 más fuerte, las estrellas quemarían demasiado rápido. Más débil, y nunca se formarían.</li>
              <li><strong>Fuerza nuclear fuerte:</strong> Un 2% más fuerte y no existiría el hidrógeno. Un 2% más débil, solo existiría hidrógeno.</li>
              <li><strong>Fuerza electromagnética:</strong> Alterarla ligeramente impediría la formación de moléculas.</li>
              <li><strong>Constante cosmológica:</strong> Desviada en 1 parte de 10^120, el universo colapsaría o se expandiría demasiado rápido.</li>
              <li><strong>Relación protón-electrón:</strong> Si la masa del protón cambiara un 0.2%, no existirían átomos estables.</li>
              <li><strong>Entropía inicial:</strong> Penrose calcula que las probabilidades son de 1 en 10^10^123.</li>
            </ul>
            
            <p>El físico Fred Hoyle, ateo declarado, admitió: <em>"Un intelecto superinteligente ha manipulado la física, la química y la biología... Los números que calculamos a partir de los hechos me parecen tan abrumadores que casi me parece que esta conclusión es inevitable."</em></p>
          `
        },
        {
          title: "Tres Respuestas Posibles",
          icon: Sparkles,
          content: `
            <p>Ante el ajuste fino, solo hay tres explicaciones lógicas:</p>
            
            <p><strong>1. Pura casualidad</strong></p>
            <p>Simplemente "tuvimos suerte". El problema: las probabilidades son tan astronómicamente bajas que esta explicación es menos creíble que cualquier alternativa. Es como decir que un mono tecleando al azar escribió las obras completas de Shakespeare... billones de veces seguidas.</p>
            
            <p><strong>2. Multiverso</strong></p>
            <p>Existen infinitos universos con todas las combinaciones posibles, y nosotros estamos en uno que funciona. Problemas:</p>
            <ul>
              <li>No hay evidencia empírica de otros universos</li>
              <li>Es científicamente inverificable (no falsificable)</li>
              <li>Requiere tanta "fe" como creer en Dios</li>
              <li>Solo mueve el problema: ¿quién diseñó el mecanismo que genera universos?</li>
            </ul>
            
            <p><strong>3. Diseño inteligente</strong></p>
            <p>Una mente inteligente ajustó las constantes. Esta explicación:</p>
            <ul>
              <li>Es coherente con la experiencia humana (los relojes tienen relojeros)</li>
              <li>Explica tanto el ajuste fino como la inteligibilidad del cosmos</li>
              <li>No contradice la ciencia; la complementa</li>
            </ul>
            
            <p>Como dijo Antony Flew, el filósofo ateo más influyente del siglo XX antes de convertirse al teísmo: <em>"Tuve que ir donde me llevara la evidencia."</em></p>
          `
        },
        {
          title: "El Dios de los Huecos: Lo Que NO Debemos Hacer",
          icon: AlertTriangle,
          content: `
            <p><strong>Una advertencia crucial:</strong> El argumento del ajuste fino NO es un "Dios de los huecos".</p>
            
            <p><strong>¿Qué es el "Dios de los huecos"?</strong></p>
            <p>Es usar a Dios para explicar lo que la ciencia aún no entiende. Ejemplo: "No sabemos cómo se formó la vida, entonces Dios lo hizo." El problema es que cuando la ciencia avanza, "Dios" se vuelve innecesario.</p>
            
            <p><strong>Por qué el ajuste fino es diferente:</strong></p>
            <ul>
              <li>No es un argumento desde la ignorancia, sino desde el conocimiento</li>
              <li>Cuanto más aprendemos sobre física, MÁS impresionante es el ajuste fino</li>
              <li>No decimos "no sabemos, entonces Dios". Decimos "sabemos exactamente los valores y por eso señalan diseño"</li>
            </ul>
            
            <p><strong>Evita estos errores:</strong></p>
            <ol>
              <li><strong>No uses a Dios para tapar ignorancia.</strong> Si no sabes algo, di "no sé", no "Dios lo hizo".</li>
              <li><strong>No confundas mecanismo con sentido.</strong> Explicar CÓMO funciona algo no elimina el PROPÓSITO.</li>
              <li><strong>No tengas miedo de la ciencia.</strong> La verdad no puede contradecir la verdad.</li>
            </ol>
            
            <p>San Juan Pablo II: <em>"La ciencia puede purificar la religión del error y la superstición. La religión puede purificar la ciencia del idolatrarse a sí misma."</em></p>
          `
        },
        {
          title: "Mecanismo vs. Sentido",
          icon: Atom,
          content: `
            <p><strong>La pregunta fundamental:</strong> ¿Es el universo un accidente cósmico o un hogar diseñado?</p>
            
            <p>Considera esta analogía de John Lennox:</p>
            <blockquote>
              <p>"Imagina que encuentras un avión Boeing 747. Un ingeniero te explica cada detalle de cómo funciona: aerodinámica, combustión, hidráulica. ¿Significa eso que el avión no tiene diseñador? Al contrario: cuanto más entiendes el mecanismo, más admiras al ingeniero."</p>
            </blockquote>
            
            <p><strong>La ciencia responde:</strong></p>
            <ul>
              <li>¿Cómo funciona la gravedad?</li>
              <li>¿Qué procesos forman estrellas?</li>
              <li>¿Cuáles son las leyes de la física?</li>
            </ul>
            
            <p><strong>La fe responde:</strong></p>
            <ul>
              <li>¿Por qué existe algo en lugar de nada?</li>
              <li>¿Para qué existe el universo?</li>
              <li>¿Por qué hay leyes en lugar de caos?</li>
            </ul>
            
            <p>Stephen Hawking preguntó: <em>"¿Qué insufla fuego a las ecuaciones y hace que haya un universo que describir?"</em> La ciencia describe las ecuaciones. La fe señala al que insufla el fuego.</p>
            
            <p><strong>Conclusión:</strong> El ajuste fino no es una prueba matemática de Dios, pero es una pista extraordinaria. Como un poema escrito en las leyes de la física, sugiere un Poeta. Como un código de información en el ADN, sugiere un Programador. Como un cosmos inteligible, sugiere una Mente.</p>
            
            <p>San Pablo escribió: <em>"Porque desde la creación del mundo, las cualidades invisibles de Dios, su eterno poder y su naturaleza divina, se perciben claramente por medio de lo creado."</em> (Romanos 1:20)</p>
          `
        }
      ]}
      videoId="EE76nwimuT0"
      videoTitle="El Ajuste Fino del Universo - John Lennox"
      reflection="Si el universo fue diseñado para la vida, y la vida para la conciencia, ¿para qué fue diseñada la conciencia? Quizás para reconocer a su Diseñador."
      relatedArticles={[
        {
          id: "libro-naturaleza",
          title: "El Libro de la Naturaleza",
          href: "/frontera-final/libro-naturaleza"
        },
        {
          id: "punto-omega",
          title: "El Punto Omega",
          href: "/frontera-final/punto-omega"
        },
        {
          id: "padre-big-bang",
          title: "El Padre del Big Bang",
          href: "/frontera-final/padre-big-bang"
        }
      ]}
    />
  );
}
