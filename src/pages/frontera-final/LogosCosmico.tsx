import { BookOpen, Atom, Lightbulb, Cross } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function LogosCosmico() {
  return (
    <ArticuloFrontera
      id="logos-cosmico"
      title="El Logos Cósmico"
      subtitle="Jesús: La Lógica que sostiene el Universo"
      icon={BookOpen}
      color="amber"
      category="Teología"
      quotes={[
        {
          text: "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios. Por él fueron hechas todas las cosas.",
          author: "Juan 1:1,3",
          source: "Evangelio según San Juan"
        },
        {
          text: "Él es antes de todas las cosas, y todas las cosas en él subsisten.",
          author: "Colosenses 1:17",
          source: "Epístola a los Colosenses"
        }
      ]}
      sections={[
        {
          title: "¿Por qué el Universo Funciona?",
          icon: Atom,
          content: `
            <p>Los científicos observan que el universo opera según leyes matemáticas precisas y constantes. La velocidad de la luz, la constante de Planck, la fuerza gravitacional... todo parece "calibrado" con exactitud asombrosa.</p>
            
            <p>Pero, ¿por qué debería haber leyes en absoluto? ¿Por qué el universo es ordenado en lugar de caótico?</p>
            
            <p>La Biblia ofrece una respuesta profunda: detrás del orden cósmico hay una <strong>Mente Ordenadora</strong>. Los griegos la llamaban <em>Logos</em> — la Razón, la Lógica, el Principio Ordenador de todo.</p>
            
            <p>El apóstol Juan hizo una declaración revolucionaria: ese Logos no es una fuerza impersonal, sino una Persona. Y esa Persona se hizo carne y habitó entre nosotros.</p>
          `
        },
        {
          title: "Cristo: El Código Fuente de la Realidad",
          icon: Lightbulb,
          content: `
            <p>Piénsalo así: si el universo fuera un programa de computadora, Cristo sería el código fuente. No solo el programador, sino la lógica misma que hace que todo funcione.</p>
            
            <p><strong>"En él fueron creadas todas las cosas, las que hay en los cielos y las que hay en la tierra, visibles e invisibles... todo fue creado por medio de él y para él."</strong> (Colosenses 1:16)</p>
            
            <p>Esto significa que:</p>
            
            <p>• Las <strong>leyes de la física</strong> son expresiones de su voluntad continua.</p>
            <p>• La <strong>matemática</strong> que describe el cosmos refleja su mente.</p>
            <p>• La <strong>belleza</strong> que encontramos en la naturaleza es su firma artística.</p>
            
            <p>Cuando un científico descubre una nueva ley natural, está literalmente "pensando los pensamientos de Dios después de Él", como dijo Johannes Kepler.</p>
          `
        },
        {
          title: "Implicaciones para la Ciencia y la Fe",
          icon: Cross,
          content: `
            <p>Si Cristo es el Logos que sostiene el universo, entonces:</p>
            
            <p><strong>1. La ciencia es un acto de adoración.</strong> Estudiar la creación es estudiar la obra de sus manos. No hay conflicto entre fe y ciencia; la ciencia es una forma de conocer a Dios.</p>
            
            <p><strong>2. El universo tiene propósito.</strong> No somos accidentes en un cosmos sin sentido. Existimos porque una Mente nos pensó, un Amor nos quiso, un Logos nos sostiene.</p>
            
            <p><strong>3. La razón humana es un regalo.</strong> Podemos hacer ciencia porque fuimos hechos a imagen del Logos. Nuestra capacidad de pensar racionalmente refleja la racionalidad del Creador.</p>
            
            <p><strong>4. Cristo es relevante para todo.</strong> No solo para la "religión" del domingo, sino para la física, la biología, la astronomía, la ética, el arte... todo encuentra su significado en Él.</p>
            
            <p>El próximo vez que mires las estrellas o estudies una ecuación, recuerda: estás contemplando la obra del Logos que también murió por ti.</p>
          `
        }
      ]}
      videoId="VxJw0jWp_xo"
      videoTitle="El Logos: Cristo y la Razón del Universo"
      reflection="Si Cristo sostiene todas las cosas, ¿cómo cambia eso tu forma de ver tu trabajo, tus estudios, o tu vida diaria?"
      relatedArticles={[
        { id: "genesis-big-bang", title: "Génesis y Big Bang", href: "/frontera-final/genesis-big-bang" },
        { id: "gigantes-fe", title: "Gigantes de la Fe", href: "/frontera-final/gigantes-fe" },
        { id: "libro-naturaleza", title: "El Libro de la Naturaleza", href: "/frontera-final/libro-naturaleza" }
      ]}
    />
  );
}
