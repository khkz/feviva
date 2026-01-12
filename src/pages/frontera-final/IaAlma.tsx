import { Cpu, Brain, Fingerprint, Sparkles } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function IaAlma() {
  return (
    <ArticuloFrontera
      id="ia-alma"
      title="IA y Alma"
      subtitle="La diferencia entre inteligencia computacional y espíritu"
      icon={Cpu}
      color="purple"
      category="Ética"
      quotes={[
        {
          text: "La inteligencia artificial puede simular muchas capacidades humanas, pero el alma —la capacidad de amar, de tener conciencia moral, de relacionarse con Dios— es un don único e irrepetible.",
          author: "Pontificia Academia para la Vida",
          source: "Rome Call for AI Ethics, 2020"
        },
        {
          text: "El ser humano ha sido creado a imagen y semejanza de Dios. Ninguna máquina, por sofisticada que sea, puede replicar esta dignidad única.",
          author: "Papa Francisco",
          source: "Mensaje para la Jornada Mundial de las Comunicaciones, 2024"
        }
      ]}
      sections={[
        {
          title: "¿Puede una Máquina Pensar?",
          icon: Brain,
          content: `
            <p>La inteligencia artificial ha avanzado a pasos agigantados. ChatGPT puede escribir poesía, programar software, y mantener conversaciones que parecen humanas. Sistemas como AlphaGo derrotan a los mejores jugadores del mundo. Robots realizan cirugías con precisión milimétrica.</p>
            
            <p>Ante estos logros, surge la pregunta: ¿puede una máquina realmente <strong>pensar</strong>? ¿Puede ser <strong>consciente</strong>? Y si es así, ¿tendría <strong>alma</strong>?</p>
            
            <p>Para responder, primero debemos entender qué es la inteligencia artificial. En su núcleo, la IA es <strong>procesamiento de información</strong>: algoritmos que detectan patrones en datos y generan respuestas basadas en esos patrones. Es extraordinariamente poderoso, pero es fundamentalmente diferente de la mente humana.</p>
            
            <p>El filósofo <strong>John Searle</strong> lo ilustró con su famoso experimento mental de la "habitación china": una persona que no habla chino puede, siguiendo instrucciones detalladas, manipular símbolos chinos de manera que parezca que entiende el idioma. Pero en realidad, no hay comprensión alguna, solo manipulación de símbolos.</p>
            
            <p>La IA, por sofisticada que sea, manipula símbolos. No <strong>comprende</strong>.</p>
          `
        },
        {
          title: "El Misterio de la Conciencia",
          icon: Fingerprint,
          content: `
            <p>Los científicos no entienden cómo surge la conciencia. Sabemos que el cerebro procesa información, pero no sabemos cómo eso se convierte en <strong>experiencia subjetiva</strong>: el rojo del atardecer, el sabor del chocolate, el dolor de la pérdida.</p>
            
            <p>El filósofo <strong>David Chalmers</strong> llama a esto el "problema difícil de la conciencia". Podemos explicar cómo el cerebro procesa la luz, pero no por qué hay "algo que se siente" al ver.</p>
            
            <p>La filosofía católica ofrece una respuesta: el alma. Santo Tomás de Aquino enseñaba que el alma humana es la "forma" del cuerpo, el principio que lo anima y lo hace capaz de pensamiento abstracto, libre albedrío y amor.</p>
            
            <p>El alma no es un "fantasma en la máquina" ni un software que corre en el hardware cerebral. Es el principio de vida racional que hace que un cuerpo sea una <strong>persona</strong>.</p>
            
            <p>Y aquí está la diferencia crucial: el alma es <strong>creada directamente por Dios</strong>. No emerge de la complejidad material. No puede ser programada ni replicada. Es un don único e irrepetible para cada ser humano.</p>
          `
        },
        {
          title: "Lo que Nos Hace Únicos",
          icon: Sparkles,
          content: `
            <p>Entonces, ¿qué puede hacer un ser humano que una IA nunca podrá?</p>
            
            <p><strong>Amar genuinamente:</strong> La IA puede simular respuestas afectuosas, pero no puede amar. El amor requiere una voluntad libre que elige el bien del otro por encima del propio. Las máquinas no eligen; ejecutan programas.</p>
            
            <p><strong>Tener experiencia moral:</strong> Un humano puede sentir remordimiento, gratitud, admiración, vergüenza. Estas experiencias morales presuponen una conciencia que evalúa sus propios actos. La IA no tiene un "yo" que se examine a sí mismo.</p>
            
            <p><strong>Relacionarse con Dios:</strong> El ser humano es "capax Dei" —capaz de Dios—. Podemos orar, adorar, experimentar la gracia. Ningún algoritmo puede tener una experiencia mística ni recibir los sacramentos.</p>
            
            <p><strong>Crear belleza desde la inspiración:</strong> La IA puede generar arte imitando estilos, pero no tiene la chispa creativa que nace de la experiencia vivida, el sufrimiento, la alegría, la búsqueda de sentido.</p>
            
            <p><strong>Morir y resucitar:</strong> El destino humano es eterno. Nuestras almas están llamadas a la vida eterna con Dios. Las máquinas, por definición, no tienen destino más allá de su obsolescencia.</p>
            
            <p>Esto no significa que la IA sea mala. Es una herramienta poderosa que puede usarse para el bien: curar enfermedades, resolver problemas complejos, expandir el conocimiento. Pero debemos recordar siempre que es una <strong>herramienta</strong>, no un reemplazo del ser humano.</p>
            
            <p>Como advierte el Papa Francisco: <em>"La IA debe estar al servicio de la persona humana, no al revés. Nunca debemos permitir que las máquinas tomen decisiones sobre la dignidad y el destino de las personas."</em></p>
          `
        }
      ]}
      videoId="qxPBB6MCn8o"
      videoTitle="Inteligencia Artificial y Fe Cristiana"
      reflection="¿Qué te hace único e irrepetible ante Dios? ¿Cómo puedes usar la tecnología para servir al bien común sin perder tu humanidad?"
      relatedArticles={[
        { id: "punto-omega", title: "El Punto Omega", href: "/frontera-final/punto-omega" },
        { id: "colonizar-conquistar", title: "Colonizar sin Conquistar", href: "/frontera-final/colonizar-conquistar" },
        { id: "libro-naturaleza", title: "El Libro de la Naturaleza", href: "/frontera-final/libro-naturaleza" }
      ]}
    />
  );
}
