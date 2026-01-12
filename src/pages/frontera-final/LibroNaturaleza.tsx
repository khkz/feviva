import { BookOpen, Sparkles, ScrollText, Church } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function LibroNaturaleza() {
  return (
    <ArticuloFrontera
      id="libro-naturaleza"
      title="El Libro de la Naturaleza"
      subtitle="Por qué estudiar galaxias es leer la mente de Dios"
      icon={BookOpen}
      color="cyan"
      category="Teología"
      quotes={[
        {
          text: "La creación es como un libro cuyas letras son las criaturas, y al leerlas, descubrimos la sabiduría del Creador.",
          author: "San Agustín",
          source: "De Genesi ad Litteram"
        },
        {
          text: "Las Sagradas Escrituras y el Libro de la Naturaleza proceden ambos de la Palabra divina: las primeras como dictado del Espíritu Santo, la segunda como ejecutora fidelísima de las órdenes de Dios.",
          author: "Galileo Galilei",
          source: "Carta a la Gran Duquesa Cristina, 1615"
        }
      ]}
      sections={[
        {
          title: "La Tradición de los Dos Libros",
          icon: ScrollText,
          content: `
            <p>Desde los primeros siglos del cristianismo, los Padres de la Iglesia desarrollaron una tradición teológica conocida como la <strong>"doctrina de los dos libros"</strong>: Dios se revela a la humanidad a través de dos fuentes complementarias.</p>
            
            <p>El primer libro es la <strong>Sagrada Escritura</strong>, la revelación especial de Dios a través de los profetas, los apóstoles y, supremamente, a través de Jesucristo. El segundo libro es la <strong>Creación misma</strong>, la revelación natural que todo ser humano puede contemplar.</p>
            
            <p>San Pablo ya lo expresaba claramente: <em>"Lo invisible de Dios, su eterno poder y divinidad, se hace visible desde la creación del mundo a través de las cosas creadas"</em> (Romanos 1:20).</p>
            
            <p>Esta visión no es mera poesía. Implica que la investigación científica del cosmos es, en cierto sentido, una forma de <strong>teología natural</strong>: un acto de contemplación que puede llevarnos a conocer mejor al Creador.</p>
          `
        },
        {
          title: "Galileo: El Malentendido Histórico",
          icon: Sparkles,
          content: `
            <p>Contrario al mito popular, Galileo Galilei era un católico devoto que nunca vio contradicción entre su fe y su ciencia. De hecho, fue él quien articuló brillantemente la doctrina de los dos libros en su famosa carta a la Gran Duquesa Cristina.</p>
            
            <p>Galileo argumentaba que la Biblia nos enseña <strong>"cómo ir al cielo, no cómo va el cielo"</strong>. Es decir, las Escrituras tienen un propósito salvífico, no científico. Cuando la Biblia habla del sol que "se detiene" o de la tierra que "no se mueve", usa el lenguaje común de la época para comunicar verdades espirituales.</p>
            
            <p>El conflicto de Galileo con la Iglesia fue más político y personal que teológico. De hecho, muchos clérigos de su tiempo apoyaban sus descubrimientos. El Papa Juan Pablo II reconoció en 1992 que los jueces de Galileo cometieron un error.</p>
            
            <p>Lo importante es que la visión de Galileo <strong>prevaleció</strong>: hoy la Iglesia celebra la ciencia como una forma legítima de conocer la obra de Dios.</p>
          `
        },
        {
          title: "La Astronomía como Contemplación",
          icon: Church,
          content: `
            <p>¿Por qué la Iglesia Católica tiene el observatorio astronómico más antiguo del mundo? Porque mirar las estrellas es, para el creyente, una forma de <strong>oración</strong>.</p>
            
            <p>Cuando contemplamos la inmensidad del universo — 100 mil millones de galaxias, cada una con 100 mil millones de estrellas — experimentamos lo que los filósofos llaman el <strong>mysterium tremendum</strong>: un asombro reverencial ante la grandeza de lo divino.</p>
            
            <p>El Salmo 19 lo expresa perfectamente: <em>"Los cielos proclaman la gloria de Dios, el firmamento anuncia la obra de sus manos. Un día transmite el mensaje al otro día, una noche a la otra noche se lo hace saber."</em></p>
            
            <p>Para el científico creyente, cada nuevo descubrimiento — desde los agujeros negros hasta las ondas gravitacionales — es una nueva página en el Libro de la Naturaleza, una nueva revelación del ingenio y la majestad del Creador.</p>
            
            <p>Como dijo el astrofísico y sacerdote jesuita <strong>George Coyne</strong>, antiguo director del Observatorio Vaticano: <em>"El universo es tan rico y complejo que no puede haber conflicto entre ciencia y fe. Ambas buscan la verdad, y la verdad es una."</em></p>
          `
        }
      ]}
      videoId="2eWrQBf6WqE"
      videoTitle="El Origen del Universo y la Creación - Universidad de Navarra"
      reflection="Si el cosmos es un libro escrito por Dios, ¿qué página estás leyendo hoy? ¿Cómo puedes ver la huella del Creador en la naturaleza que te rodea?"
      relatedArticles={[
        { id: "punto-omega", title: "El Punto Omega", href: "/frontera-final/punto-omega" },
        { id: "observatorio-vaticano", title: "El Observatorio Vaticano", href: "/frontera-final/observatorio-vaticano" },
        { id: "padre-big-bang", title: "El Padre del Big Bang", href: "/frontera-final/padre-big-bang" }
      ]}
    />
  );
}
