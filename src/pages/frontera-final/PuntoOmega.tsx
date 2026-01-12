import { Infinity as InfinityIcon, Dna, Globe, Flame } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function PuntoOmega() {
  return (
    <ArticuloFrontera
      id="punto-omega"
      title="El Punto Omega"
      subtitle="La teoría de Teilhard de Chardin: El universo evoluciona hacia Cristo"
      icon={InfinityIcon}
      color="cyan"
      category="Teología"
      quotes={[
        {
          text: "El cosmos en el que el hombre se encuentra viviendo constituye un todo orgánicamente estructurado, dotado de un significado intrínseco.",
          author: "Papa Juan Pablo II",
          source: "Fides et Ratio, 1998"
        },
        {
          text: "Todo lo que asciende, converge.",
          author: "Pierre Teilhard de Chardin",
          source: "El Fenómeno Humano, 1955"
        }
      ]}
      sections={[
        {
          title: "Un Científico con Sotana",
          icon: Dna,
          content: `
            <p><strong>Pierre Teilhard de Chardin</strong> (1881-1955) fue una de las figuras más fascinantes del siglo XX: paleontólogo de renombre mundial, sacerdote jesuita, y místico visionario que intentó reconciliar la evolución darwiniana con la fe cristiana.</p>
            
            <p>Participó en el descubrimiento del <strong>Hombre de Pekín</strong>, uno de los hallazgos más importantes en la historia de la paleoantropología. Pero sus excavaciones físicas eran solo el reflejo de una excavación más profunda: la búsqueda de un marco teológico que integrara toda la historia cósmica.</p>
            
            <p>Sus ideas fueron controvertidas en su tiempo. La Iglesia le prohibió publicar sus obras teológicas mientras vivía. Sin embargo, tras su muerte, su pensamiento ha sido rehabilitado. El Papa Benedicto XVI citó favorablemente su visión de una "liturgia cósmica", y el Papa Francisco lo mencionó en su encíclica <em>Laudato Si'</em>.</p>
          `
        },
        {
          title: "La Noósfera: El Despertar de la Conciencia",
          icon: Globe,
          content: `
            <p>Teilhard propuso que la evolución no es solo biológica, sino también <strong>espiritual</strong>. Observó que la materia ha ido complejificándose a lo largo de miles de millones de años: de partículas a átomos, de átomos a moléculas, de moléculas a células, de células a organismos, de organismos a seres conscientes.</p>
            
            <p>A esta capa de conciencia que envuelve la Tierra la llamó <strong>noósfera</strong> (del griego <em>nous</em>, mente). Así como la biosfera es la capa de vida que cubre el planeta, la noósfera es la capa de pensamiento.</p>
            
            <p>Hoy, cuando vemos Internet y la conexión global instantánea, las ideas de Teilhard parecen proféticas. Él veía esta convergencia de mentes como parte del plan divino: la humanidad evolucionando hacia una unidad cada vez mayor.</p>
            
            <p>Pero la noósfera no es el destino final. Es solo una etapa en el camino hacia algo mucho más grande.</p>
          `
        },
        {
          title: "Cristo como Punto Omega",
          icon: Flame,
          content: `
            <p>Aquí está el corazón de la visión de Teilhard: toda la evolución cósmica tiene un <strong>propósito</strong> y una <strong>meta</strong>. Esa meta es lo que él llamó el <strong>Punto Omega</strong>.</p>
            
            <p>El Punto Omega es el estado final de máxima complejidad y máxima conciencia hacia el cual converge el universo. Y para Teilhard, cristiano hasta la médula, este Punto Omega tiene un nombre: <strong>Jesucristo</strong>.</p>
            
            <p>San Pablo ya lo había intuido: <em>"Él es antes de todas las cosas, y todas las cosas en Él subsisten... Dios tuvo a bien hacer que en Él habitara toda la plenitud, y por Él reconciliar consigo todas las cosas"</em> (Colosenses 1:17-20).</p>
            
            <p>Para Teilhard, Cristo no es solo el Salvador de las almas humanas, sino el <strong>Cristo Cósmico</strong> que atrae hacia sí toda la creación. La evolución biológica, el desarrollo de la conciencia, la historia humana: todo es un largo proceso de <strong>cristificación</strong> del universo.</p>
            
            <p>El Big Bang no fue el comienzo de un proceso ciego. Fue el primer latido de un cosmos que camina hacia su plenitud en Cristo. Y cada acto de amor, cada avance hacia la verdad, cada momento de comunión, acelera esta convergencia cósmica.</p>
            
            <p>Como escribió Teilhard: <em>"Llegará un día en que, después de dominar los vientos, las olas, las mareas y la gravedad, dominaremos para Dios las energías del amor. Y ese día, por segunda vez en la historia del mundo, el hombre habrá descubierto el fuego."</em></p>
          `
        }
      ]}
      videoId="KOQT-Bo2wZE"
      videoTitle="Teilhard de Chardin: El Punto Omega y la Noósfera"
      reflection="Si el universo evoluciona hacia Cristo, ¿hacia dónde evoluciona tu propia alma? ¿Qué pasos puedes dar hoy para acercarte más al Punto Omega?"
      relatedArticles={[
        { id: "libro-naturaleza", title: "El Libro de la Naturaleza", href: "/frontera-final/libro-naturaleza" },
        { id: "padre-big-bang", title: "El Padre del Big Bang", href: "/frontera-final/padre-big-bang" },
        { id: "ia-alma", title: "IA y Alma", href: "/frontera-final/ia-alma" }
      ]}
    />
  );
}
