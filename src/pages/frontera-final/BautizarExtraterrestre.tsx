import { HelpCircle, Users, Heart, Rocket } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function BautizarExtraterrestre() {
  return (
    <ArticuloFrontera
      id="bautizar-extraterrestre"
      title="¿Bautizaríamos a un Extraterrestre?"
      subtitle="La postura del Vaticano sobre vida inteligente no humana"
      icon={HelpCircle}
      color="cyan"
      category="Teología"
      quotes={[
        {
          text: "Si mañana viniera a Roma una expedición de marcianos verdes con narices largas y orejas grandes, y uno de ellos pidiera el bautismo, ¿quiénes somos nosotros para decir que no?",
          author: "Papa Francisco",
          source: "Homilía en Santa Marta, 2014"
        },
        {
          text: "Así como hay una multitud de criaturas en la Tierra, podría haber otros seres, incluso inteligentes, creados por Dios. Esto no contradice nuestra fe.",
          author: "José Gabriel Funes, S.J.",
          source: "Director del Observatorio Vaticano, L'Osservatore Romano, 2008"
        }
      ]}
      sections={[
        {
          title: "La Pregunta que Desafía la Imaginación",
          icon: Rocket,
          content: `
            <p>Es quizás la pregunta más audaz de la teología contemporánea: si descubriéramos vida inteligente extraterrestre, ¿qué significaría para nuestra fe?</p>
            
            <p>Lejos de ser ciencia ficción, esta pregunta es tomada muy en serio por teólogos del Vaticano. La razón es simple: la ciencia avanza rápidamente en la búsqueda de vida fuera de la Tierra. Hemos descubierto miles de exoplanetas, algunos en la "zona habitable" de sus estrellas. Las misiones a Marte buscan signos de vida microbiana pasada. El proyecto SETI escanea el cielo buscando señales de civilizaciones tecnológicas.</p>
            
            <p>¿Está la Iglesia preparada para este encuentro? La respuesta, sorprendentemente, es <strong>sí</strong>.</p>
          `
        },
        {
          title: "La Tradición de la Pluralidad de Mundos",
          icon: Users,
          content: `
            <p>La idea de otros mundos habitados no es nueva en el pensamiento católico. Ya en el siglo XV, el cardenal <strong>Nicolás de Cusa</strong> especulaba sobre la posibilidad de habitantes en otros planetas. El filósofo <strong>Giordano Bruno</strong> (quemado por herejías no relacionadas con esta idea) defendía un universo infinito con infinitos mundos.</p>
            
            <p>Santo Tomás de Aquino, el Doctor Angélico, enseñaba que Dios podría haber creado infinitos universos si así lo hubiera querido. Su omnipotencia no tiene límites.</p>
            
            <p>El teólogo jesuita <strong>José Gabriel Funes</strong>, ex director del Observatorio Vaticano, lo expresó claramente en 2008: <em>"Así como existe una multiplicidad de criaturas en la Tierra, podría haber otros seres, incluso inteligentes, creados por Dios. Esto no contradice nuestra fe, porque no podemos poner límites a la libertad creadora de Dios."</em></p>
            
            <p>En otras palabras: si Dios creó un universo con 2 trillones de galaxias, ¿por qué asumir que solo una pequeña roca alrededor de una estrella ordinaria sería digna de albergar vida?</p>
          `
        },
        {
          title: "El Problema de la Redención Cósmica",
          icon: Heart,
          content: `
            <p>Aquí viene la pregunta difícil: si Cristo se encarnó en la Tierra como humano, ¿qué pasa con los extraterrestres? ¿Necesitan salvación? ¿Tienen almas? ¿Jesús murió también por ellos?</p>
            
            <p>Los teólogos católicos han propuesto varias respuestas posibles:</p>
            
            <p><strong>1. Seres sin pecado original:</strong> Es posible que existan criaturas inteligentes que nunca cayeron en pecado. Serían como los ángeles fieles: seres que conocen y aman a Dios sin necesidad de redención.</p>
            
            <p><strong>2. Redención a través de la Encarnación terrestre:</strong> La muerte de Cristo en la cruz podría tener eficacia cósmica, redimiendo a todos los seres racionales del universo, no solo a los humanos. San Pablo sugiere esto cuando habla de que Cristo reconcilia "todas las cosas, tanto en la tierra como en el cielo" (Colosenses 1:20).</p>
            
            <p><strong>3. Múltiples encarnaciones:</strong> Una posibilidad más especulativa: quizás el Verbo de Dios se ha encarnado de diferentes formas en diferentes mundos. Esta idea fue explorada por C.S. Lewis en sus novelas de ciencia ficción.</p>
            
            <p><strong>4. Misterio reservado:</strong> Tal vez simplemente no podemos saber. Como dijo el Papa Francisco: <em>"¿Quiénes somos nosotros para poner límites a Dios?"</em></p>
            
            <p>Lo importante es que la fe católica es lo suficientemente amplia y flexible para acoger esta posibilidad. El descubrimiento de vida extraterrestre, lejos de destruir nuestra fe, podría <strong>expandirla</strong> hacia nuevos horizontes de maravilla ante la creatividad infinita de Dios.</p>
          `
        }
      ]}
      videoId="qi7OFVr8MLg"
      videoTitle="Vida Extraterrestre y Fe (EWTN Perspectiva Católica)"
      reflection="Si Dios creó un universo tan vasto, ¿qué nos dice eso sobre su amor? ¿Cómo cambiaría tu fe si supieras que no estamos solos en el cosmos?"
      relatedArticles={[
        { id: "libro-naturaleza", title: "El Libro de la Naturaleza", href: "/frontera-final/libro-naturaleza" },
        { id: "observatorio-vaticano", title: "El Observatorio Vaticano", href: "/frontera-final/observatorio-vaticano" },
        { id: "colonizar-conquistar", title: "Colonizar sin Conquistar", href: "/frontera-final/colonizar-conquistar" }
      ]}
    />
  );
}
