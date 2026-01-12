import { Atom, GraduationCap, Lightbulb, Award } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function PadreBigBang() {
  return (
    <ArticuloFrontera
      id="padre-big-bang"
      title="El Padre del Big Bang"
      subtitle="Georges Lemaître: El sacerdote que corrigió a Einstein"
      icon={Atom}
      color="amber"
      category="Historia"
      quotes={[
        {
          text: "El científico tiene una fe casi mística en que existen leyes que pueden ser descubiertas. Y no hay razón para suponer que la fe de Lemaître fuera menos mística que la de Einstein.",
          author: "Stephen Hawking",
          source: "Una Breve Historia del Tiempo"
        },
        {
          text: "Hay dos caminos hacia la verdad: el camino de la ciencia y el camino de la fe. Pero no hay conflicto entre ellos.",
          author: "Georges Lemaître",
          source: "Conferencia en la Academia Pontificia de Ciencias, 1951"
        }
      ]}
      sections={[
        {
          title: "El Sacerdote Cosmólogo",
          icon: GraduationCap,
          content: `
            <p><strong>Georges Lemaître</strong> (1894-1966) fue un sacerdote católico belga que revolucionó nuestra comprensión del universo. Fue él quien propuso por primera vez la teoría del <strong>Big Bang</strong>, aunque la llamó el "átomo primordial" o el "huevo cósmico".</p>
            
            <p>Su trayectoria fue extraordinaria. Estudió ingeniería civil antes de la Primera Guerra Mundial, donde sirvió como oficial de artillería y recibió la Cruz de Guerra belga por su valentía. Después de la guerra, sintió una doble vocación: hacia Dios y hacia las matemáticas.</p>
            
            <p>Se ordenó sacerdote en 1923, pero también obtuvo un doctorado en física en el MIT y estudió con Arthur Eddington en Cambridge. Era, literalmente, un genio con sotana.</p>
            
            <p>En 1927, publicó un artículo que cambiaría la historia de la ciencia: "Un universo homogéneo de masa constante y radio creciente". En él, proponía que el universo se está <strong>expandiendo</strong> y que, por lo tanto, tuvo un comienzo.</p>
          `
        },
        {
          title: "Corrigiendo a Einstein",
          icon: Lightbulb,
          content: `
            <p>Cuando Lemaître presentó sus ideas a Albert Einstein, el físico alemán las rechazó. <em>"Sus cálculos son correctos, pero su física es abominable"</em>, le dijo.</p>
            
            <p>El problema era filosófico. Einstein creía en un universo estático y eterno. Había introducido su famosa "constante cosmológica" precisamente para evitar que sus ecuaciones predijeran un universo en expansión. La idea de un comienzo le parecía demasiado cercana a la creación bíblica.</p>
            
            <p>Pero la evidencia se acumuló. En 1929, Edwin Hubble observó que las galaxias se alejaban unas de otras: el universo se estaba expandiendo, tal como Lemaître había predicho. Einstein tuvo que admitir su error, llamando a la constante cosmológica "el mayor error de mi carrera".</p>
            
            <p>En 1933, después de escuchar a Lemaître explicar su teoría en un seminario, Einstein se levantó y aplaudió: <em>"Esta es la explicación más bella y satisfactoria de la creación que jamás he escuchado."</em></p>
          `
        },
        {
          title: "Ciencia y Fe: Dos Alas del Mismo Pájaro",
          icon: Award,
          content: `
            <p>Lo fascinante de Lemaître es que siempre mantuvo separadas, pero en armonía, su vocación científica y su vocación sacerdotal. Cuando el Papa Pío XII intentó usar el Big Bang como "prueba" de la creación bíblica, Lemaître le pidió discretamente que no lo hiciera.</p>
            
            <p><em>"En cuanto puedo ver, tal teoría permanece enteramente fuera de cualquier cuestión metafísica o religiosa"</em>, escribió. <em>"Deja al materialista libre para negar cualquier ser trascendente... Para el creyente, elimina cualquier intento de familiaridad con Dios."</em></p>
            
            <p>Lemaître entendía que la ciencia describe el <strong>cómo</strong> del universo, mientras que la fe responde al <strong>por qué</strong>. Mezclarlos indebidamente perjudica a ambos.</p>
            
            <p>Sin embargo, él personalmente no veía contradicción: <em>"¿Hubo alguna vez un conflicto real entre ciencia y religión? No en mi mente. La ciencia estudia los fenómenos. La fe trata con las realidades últimas. Son dos niveles diferentes del pensamiento humano."</em></p>
            
            <p>Lemaître fue presidente de la Academia Pontificia de Ciencias desde 1960 hasta su muerte en 1966. Su legado es inmenso: no solo nos dio la teoría cosmológica más importante del siglo XX, sino que demostró con su vida que un científico puede ser un hombre de fe profunda sin el menor asomo de contradicción.</p>
            
            <p>Como dijo el cosmólogo Simon Singh: <em>"Lemaître fue el primero en ver que el universo tuvo un principio. Y lo vio porque era tanto un científico como un sacerdote."</em></p>
          `
        }
      ]}
      videoId="frk1bZr6rvs"
      videoTitle="Georges Lemaître: El Sacerdote que Unió Ciencia y Religión"
      reflection="La humildad de Lemaître al separar ciencia y fe, ¿cómo puede inspirarte a buscar la verdad sin imponer tus conclusiones?"
      relatedArticles={[
        { id: "observatorio-vaticano", title: "El Observatorio Vaticano", href: "/frontera-final/observatorio-vaticano" },
        { id: "libro-naturaleza", title: "El Libro de la Naturaleza", href: "/frontera-final/libro-naturaleza" },
        { id: "punto-omega", title: "El Punto Omega", href: "/frontera-final/punto-omega" }
      ]}
    />
  );
}
