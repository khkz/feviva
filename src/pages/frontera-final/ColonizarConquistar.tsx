import { Flag, Leaf, Scale, Heart } from 'lucide-react';
import { ArticuloFrontera } from '@/components/frontera-final/ArticuloFrontera';

export default function ColonizarConquistar() {
  return (
    <ArticuloFrontera
      id="colonizar-conquistar"
      title="Colonizar sin Conquistar"
      subtitle="Cómo evitar el pecado del colonialismo en Marte"
      icon={Flag}
      color="purple"
      category="Ética"
      quotes={[
        {
          text: "La tierra no nos pertenece; nosotros pertenecemos a la tierra. Y esta verdad se aplica a cualquier mundo que visitemos.",
          author: "Papa Francisco",
          source: "Laudato Si', 2015 (adaptado)"
        },
        {
          text: "No tenemos derecho a deshacer lo que Dios ha hecho, ni en la Tierra ni en ningún otro lugar.",
          author: "Bartolomé de las Casas",
          source: "Brevísima relación de la destrucción de las Indias, 1552"
        }
      ]}
      sections={[
        {
          title: "Las Lecciones del Pasado",
          icon: Scale,
          content: `
            <p>Cuando los europeos llegaron a las Américas, lo hicieron bajo una lógica de <strong>conquista</strong>: tomar recursos, dominar pueblos, imponer culturas. Las consecuencias fueron devastadoras: genocidio, esclavitud, destrucción de civilizaciones enteras.</p>
            
            <p>Dentro de la Iglesia, hubo voces proféticas que denunciaron estos abusos. <strong>Bartolomé de las Casas</strong>, fraile dominico, dedicó su vida a defender a los pueblos indígenas. <strong>Antonio de Montesinos</strong> predicó contra los abusos en su famoso sermón de 1511: <em>"¿Con qué derecho y con qué justicia tenéis en tan cruel y horrible servidumbre aquestos indios?"</em></p>
            
            <p>Estos misioneros entendieron una verdad que tomó siglos reconocer: la evangelización no justifica la explotación. La fe no se impone; se propone.</p>
            
            <p>Ahora, mientras la humanidad se prepara para colonizar la Luna, Marte y más allá, ¿hemos aprendido la lección?</p>
          `
        },
        {
          title: "Ética Ambiental Espacial",
          icon: Leaf,
          content: `
            <p>La encíclica <strong>Laudato Si'</strong> del Papa Francisco nos llama a ser "custodios" de la creación, no "conquistadores". Este principio se extiende más allá de la Tierra.</p>
            
            <p>¿Qué responsabilidades tenemos hacia otros mundos?</p>
            
            <p><strong>Protección planetaria:</strong> Las agencias espaciales tienen protocolos para evitar contaminar otros planetas con microbios terrestres. Si existe vida microbiana en Marte o Europa (luna de Júpiter), tenemos la obligación moral de no destruirla.</p>
            
            <p><strong>Minería espacial:</strong> Hay billones de dólares en metales preciosos en los asteroides. ¿Quién tiene derecho a explotarlos? ¿Las corporaciones más ricas? ¿O los beneficios deberían compartirse con toda la humanidad, especialmente los más pobres?</p>
            
            <p><strong>Terraformación:</strong> Algunas propuestas sugieren modificar la atmósfera de Marte para hacerlo habitable. ¿Tenemos el derecho de alterar permanentemente otro planeta? ¿O deberíamos preservar su estado natural como lo haríamos con un parque nacional cósmico?</p>
            
            <p>La doctrina social de la Iglesia ofrece principios relevantes: el <strong>destino universal de los bienes</strong> (los recursos existen para todos, no solo para unos pocos) y el <strong>cuidado de la casa común</strong> (somos administradores, no dueños).</p>
          `
        },
        {
          title: "Hacia una Ética Intergaláctica",
          icon: Heart,
          content: `
            <p>Y si encontramos vida inteligente, ¿cómo deberíamos actuar? Aquí es donde la ética cristiana ofrece directrices claras:</p>
            
            <p><strong>Dignidad de todo ser racional:</strong> Si existen seres con conciencia y libre albedrío, poseen una dignidad intrínseca que debe ser respetada. No son recursos a explotar ni amenazas a eliminar.</p>
            
            <p><strong>El mandamiento del amor:</strong> "Ama a tu prójimo como a ti mismo" no especifica que el prójimo tenga que ser humano. El amor cristiano es universal.</p>
            
            <p><strong>Evangelización respetuosa:</strong> Si algún día compartimos el Evangelio con seres de otros mundos, debemos hacerlo como propuesta, no como imposición. La fe es un don que se ofrece, no una conquista que se impone.</p>
            
            <p><strong>Humildad cósmica:</strong> Debemos acercarnos a cualquier encuentro con la humildad de quien sabe que no tiene todas las respuestas. Quizás esos seres tengan mucho que enseñarnos sobre Dios y sobre nosotros mismos.</p>
            
            <p>Como escribió C.S. Lewis en su novela <em>Perelandra</em>: <em>"El enemigo más peligroso que podemos llevar a otros mundos somos nosotros mismos: nuestra codicia, nuestro orgullo, nuestra voluntad de dominio."</em></p>
            
            <p>La conquista del espacio nos ofrece una segunda oportunidad. Esta vez, podemos hacerlo bien. Podemos ir a las estrellas como <strong>peregrinos</strong>, no como conquistadores; como <strong>hermanos</strong>, no como amos; como <strong>custodios</strong>, no como explotadores.</p>
          `
        }
      ]}
      videoId="aSz5BjExs1s"
      videoTitle="Ética de la Colonización Espacial"
      reflection="¿Cómo puedes ser un 'custodio' de la creación en tu vida diaria, aquí en la Tierra? ¿Qué lecciones del pasado debemos recordar para el futuro espacial?"
      relatedArticles={[
        { id: "bautizar-extraterrestre", title: "¿Bautizaríamos a un Extraterrestre?", href: "/frontera-final/bautizar-extraterrestre" },
        { id: "ia-alma", title: "IA y Alma", href: "/frontera-final/ia-alma" },
        { id: "punto-omega", title: "El Punto Omega", href: "/frontera-final/punto-omega" }
      ]}
    />
  );
}
