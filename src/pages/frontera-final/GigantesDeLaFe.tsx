import { Telescope, Atom, Dna, FlaskConical } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function GigantesDeLaFe() {
  return (
    <ArticuloFrontera
      id="gigantes-fe"
      title="Gigantes de la Fe"
      subtitle="Newton, Kepler, Mendel y Pasteur: Creyentes que cambiaron la ciencia"
      icon={Telescope}
      color="amber"
      category="Historia"
      quotes={[
        {
          text: "Hacer ciencia es pensar los pensamientos de Dios después de Él.",
          author: "Johannes Kepler",
          source: "Astrónomo, descubridor de las leyes del movimiento planetario"
        },
        {
          text: "Cuanto más estudio la naturaleza, más me maravillo ante la obra del Creador.",
          author: "Louis Pasteur",
          source: "Padre de la microbiología"
        }
      ]}
      sections={[
        {
          title: "Johannes Kepler (1571-1630): El Astrónomo Adorador",
          icon: Telescope,
          content: `
            <p>Kepler descubrió las tres leyes del movimiento planetario que transformaron nuestra comprensión del sistema solar. Sin su trabajo, Newton no habría podido formular la ley de gravitación universal.</p>
            
            <p>Pero para Kepler, la astronomía no era solo ciencia — era <strong>adoración</strong>.</p>
            
            <p>Él escribió: <em>"Yo estaba meramente pensando los pensamientos de Dios después de Él. Ya que nosotros los astrónomos somos sacerdotes del Dios Altísimo con respecto al libro de la naturaleza, nos corresponde no buscar la gloria de nuestras propias mentes, sino por encima de todo, la gloria de Dios."</em></p>
            
            <p>Kepler veía en las órbitas elípticas de los planetas la firma de un Diseñador inteligente. Para él, cada descubrimiento era un acto de revelación divina.</p>
          `
        },
        {
          title: "Isaac Newton (1643-1727): El Físico Teólogo",
          icon: Atom,
          content: `
            <p>Newton es considerado uno de los científicos más influyentes de la historia. Formuló las leyes del movimiento, la ley de gravitación universal, desarrolló el cálculo y revolucionó la óptica.</p>
            
            <p>Lo que muchos no saben es que Newton escribió más sobre teología que sobre ciencia. Estudió la Biblia intensamente, especialmente las profecías de Daniel y Apocalipsis.</p>
            
            <p>En su obra maestra, los <em>Principia Mathematica</em>, escribió: <em>"Este sistema tan hermoso del Sol, los planetas y los cometas solo pudo proceder del consejo y dominio de un Ser inteligente y poderoso."</em></p>
            
            <p>Newton también dijo: <em>"En ausencia de cualquier otra prueba, el pulgar solo me convencería de la existencia de Dios."</em></p>
            
            <p>Para Newton, las leyes de la física eran evidencia de una Mente Legisladora.</p>
          `
        },
        {
          title: "Gregor Mendel (1822-1884): El Monje Genetista",
          icon: Dna,
          content: `
            <p>Gregor Mendel era un monje agustino en un monasterio de Brno (actual República Checa). En el jardín del monasterio, realizó experimentos con plantas de guisantes que establecerían las bases de la <strong>genética moderna</strong>.</p>
            
            <p>Sus "Leyes de Mendel" explican cómo se heredan los rasgos de padres a hijos. Sin embargo, su trabajo fue ignorado durante décadas hasta ser redescubierto en 1900.</p>
            
            <p>Mendel no veía conflicto entre su fe y su ciencia. Para él, estudiar la herencia genética era otra forma de entender el diseño del Creador.</p>
            
            <p>Hoy, cada vez que un genetista habla de "genes dominantes" o "recesivos", está usando el lenguaje que inventó este humilde monje.</p>
          `
        },
        {
          title: "Louis Pasteur (1822-1895): El Microbiólogo Devoto",
          icon: FlaskConical,
          content: `
            <p>Pasteur revolucionó la medicina y la biología. Desarrolló la teoría germinal de las enfermedades, creó la pasteurización, y desarrolló vacunas contra la rabia y el ántrax.</p>
            
            <p>También refutó definitivamente la teoría de la generación espontánea, demostrando que la vida solo proviene de la vida.</p>
            
            <p>Pasteur era un católico devoto. Famosamente dijo: <em>"Un poco de ciencia aleja de Dios, pero mucha ciencia devuelve a Él."</em></p>
            
            <p>También declaró: <em>"Cuanto más estudio la naturaleza, más me quedo asombrado ante la obra del Creador. Yo oro mientras trabajo en el laboratorio."</em></p>
            
            <p>Para Pasteur, el microscopio no era solo una herramienta científica — era una ventana a la creatividad infinita de Dios.</p>
          `
        }
      ]}
      videoId="0lFSNfQlOCg"
      videoTitle="Científicos Creyentes que Cambiaron el Mundo"
      reflection="Estos gigantes no veían conflicto entre fe y ciencia. ¿Qué podemos aprender de su ejemplo para nuestra propia búsqueda de la verdad?"
      relatedArticles={[
        { id: "logos-cosmico", title: "El Logos Cósmico", href: "/frontera-final/logos-cosmico" },
        { id: "genesis-big-bang", title: "Génesis y Big Bang", href: "/frontera-final/genesis-big-bang" },
        { id: "libro-naturaleza", title: "El Libro de la Naturaleza", href: "/frontera-final/libro-naturaleza" }
      ]}
    />
  );
}
