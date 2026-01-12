import { Atom, Sparkles, Clock, BookOpen } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function GenesisYBigBang() {
  return (
    <ArticuloFrontera
      id="genesis-big-bang"
      title="Génesis y Big Bang"
      subtitle="¿Hubo una explosión o un 'Hágase la luz'?"
      icon={Atom}
      color="cyan"
      category="Ciencia y Fe"
      quotes={[
        {
          text: "En el principio creó Dios los cielos y la tierra... Y dijo Dios: Sea la luz; y fue la luz.",
          author: "Génesis 1:1,3",
          source: "La Biblia"
        },
        {
          text: "La teoría del Big Bang y la doctrina bíblica de la creación no se contradicen. El Big Bang describe el 'cómo', Génesis responde el 'por qué'.",
          author: "John Lennox",
          source: "Profesor de Matemáticas, Universidad de Oxford"
        }
      ]}
      sections={[
        {
          title: "El Universo Tuvo un Comienzo",
          icon: Clock,
          content: `
            <p>Durante siglos, muchos científicos asumían que el universo era eterno — siempre había existido. Esta idea parecía eliminar la necesidad de un Creador.</p>
            
            <p>Pero en 1927, un físico llamado <strong>Georges Lemaître</strong> propuso algo revolucionario: el universo tuvo un comienzo. Toda la materia y energía estaban concentradas en un punto de densidad infinita que explotó hace aproximadamente 13.8 mil millones de años.</p>
            
            <p>Lo interesante es que Lemaître era un sacerdote católico. Y su teoría inicialmente fue rechazada por científicos ateos precisamente porque sonaba demasiado... bíblica.</p>
            
            <p><strong>Einstein mismo rechazó la idea al principio</strong>, diciendo que los cálculos de Lemaître eran correctos pero su física era "abominable". ¿Por qué? Porque un universo con comienzo implicaba preguntas incómodas sobre qué — o Quién — lo inició.</p>
          `
        },
        {
          title: "¿Coincidencia o Diseño?",
          icon: Sparkles,
          content: `
            <p>Hoy, la evidencia del Big Bang es abrumadora: la radiación de fondo cósmico, la expansión del universo, la abundancia de elementos ligeros... todo confirma que hubo un "momento cero".</p>
            
            <p>Pero hay algo más sorprendente: las condiciones iniciales del universo están <strong>finamente ajustadas</strong> para permitir la vida:</p>
            
            <p>• Si la fuerza nuclear fuerte variara en 0.5%, no habría carbono ni oxígeno.</p>
            <p>• Si la gravedad fuera ligeramente más fuerte, las estrellas se apagarían demasiado rápido.</p>
            <p>• Si la expansión inicial hubiera sido una fracción más lenta, el universo habría colapsado.</p>
            
            <p>Los físicos llaman a esto el <strong>"Ajuste Fino"</strong> (Fine-Tuning). La probabilidad de que estas constantes surgieran por azar es tan pequeña que es matemáticamente indistinguible de cero.</p>
            
            <p>Como dijo el astrónomo Fred Hoyle (quien era ateo): <em>"Una interpretación de sentido común de los hechos sugiere que un superintelecto ha manipulado la física."</em></p>
          `
        },
        {
          title: "Génesis: Poesía con Propósito",
          icon: BookOpen,
          content: `
            <p>Entonces, ¿cómo reconciliamos el Big Bang con Génesis 1? Hay varias perspectivas legítimas entre creyentes:</p>
            
            <p><strong>1. Los "días" como eras:</strong> La palabra hebrea "yom" puede significar un período largo, no solo 24 horas. Los "días" de la creación podrían representar eras cósmicas.</p>
            
            <p><strong>2. Marco literario:</strong> Génesis 1 es un texto teológico, no un manual de ciencia. Su propósito es declarar QUIÉN creó y POR QUÉ, no explicar el mecanismo físico.</p>
            
            <p><strong>3. Días ordinarios, universo con apariencia de edad:</strong> Algunos creen que Dios creó en días literales, pero con un cosmos que "funciona" como si tuviera miles de millones de años.</p>
            
            <p>Lo que todos los creyentes bíblicos afirman es:</p>
            
            <p>• <strong>Dios es el Creador.</strong> El universo no se creó a sí mismo.</p>
            <p>• <strong>La creación fue intencional.</strong> No somos accidentes cósmicos.</p>
            <p>• <strong>El universo es bueno.</strong> "Y vio Dios que era bueno."</p>
            
            <p>El Big Bang no destruye la fe; la confirma. Hubo un "Hágase la luz", y la luz fue.</p>
          `
        }
      ]}
      videoId="aKjADvF9Jmk"
      videoTitle="El Big Bang y la Biblia - ¿Compatibles?"
      reflection="Si el universo tuvo un comienzo, ¿qué o Quién pudo haberlo iniciado? ¿Cómo cambia esto tu perspectiva sobre el origen de todo?"
      relatedArticles={[
        { id: "logos-cosmico", title: "El Logos Cósmico", href: "/frontera-final/logos-cosmico" },
        { id: "padre-big-bang", title: "El Padre del Big Bang", href: "/frontera-final/padre-big-bang" },
        { id: "gigantes-fe", title: "Gigantes de la Fe", href: "/frontera-final/gigantes-fe" }
      ]}
    />
  );
}
