// Datos para Salmos Orbitales - Meditación Bíblica Universal

export interface Versiculo {
  numero: number;
  texto: string;
  meditacion: string;
}

export interface Salmo {
  id: string;
  numero: number;
  titulo: string;
  tema: string;
  color: string;
  planeta: string;
  versiculos: Versiculo[];
}

export const SALMOS_ORBITALES: Salmo[] = [
  {
    id: "salmo-8",
    numero: 8,
    titulo: "La Gloria del Hombre",
    tema: "Maravilla ante la Creación",
    color: "#F59E0B", // Gold
    planeta: "Sol",
    versiculos: [
      {
        numero: 3,
        texto: "Cuando contemplo el cielo, obra de tus dedos, la luna y las estrellas que tú formaste...",
        meditacion: "El salmista mira hacia arriba y reconoce la huella del Creador. Las estrellas no son accidentes cósmicos, sino obras de arte divino."
      },
      {
        numero: 4,
        texto: "¿Qué es el hombre para que te acuerdes de él, el ser humano para que lo cuides?",
        meditacion: "En la inmensidad del cosmos, Dios no nos olvida. Cada uno de nosotros tiene un lugar en su corazón infinito."
      },
      {
        numero: 5,
        texto: "Lo hiciste poco menor que los ángeles, lo coronaste de gloria y de honor.",
        meditacion: "Fuimos creados para reinar, para cuidar, para reflejar la gloria de Dios en la creación."
      },
      {
        numero: 9,
        texto: "¡Oh Señor, Soberano nuestro, cuán grande es tu nombre en toda la tierra!",
        meditacion: "Desde el átomo hasta la galaxia más lejana, todo proclama su grandeza."
      }
    ]
  },
  {
    id: "salmo-19",
    numero: 19,
    titulo: "Los Cielos Proclaman",
    tema: "Revelación Natural",
    color: "#06B6D4", // Cyan
    planeta: "Mercurio",
    versiculos: [
      {
        numero: 1,
        texto: "Los cielos cuentan la gloria de Dios, y el firmamento anuncia la obra de sus manos.",
        meditacion: "El universo es el primer libro de revelación. Antes de la Biblia, Dios escribió en las estrellas."
      },
      {
        numero: 2,
        texto: "Un día emite palabra a otro día, y una noche a otra noche declara sabiduría.",
        meditacion: "La creación no calla. Cada amanecer y cada noche estrellada son sermones silenciosos."
      },
      {
        numero: 4,
        texto: "Por toda la tierra salió su voz, y hasta el extremo del mundo sus palabras.",
        meditacion: "No hay idioma, cultura o galaxia donde no llegue este mensaje cósmico."
      },
      {
        numero: 14,
        texto: "Sean gratos los dichos de mi boca y la meditación de mi corazón delante de ti, oh Señor, roca mía y redentor mío.",
        meditacion: "Que nuestra respuesta al cosmos sea adoración, y nuestra ciencia sea oración."
      }
    ]
  },
  {
    id: "salmo-104",
    numero: 104,
    titulo: "El Creador Sustentador",
    tema: "Providencia Divina",
    color: "#22C55E", // Green
    planeta: "Tierra",
    versiculos: [
      {
        numero: 2,
        texto: "Te cubres de luz como con un manto, extiendes los cielos como una tienda.",
        meditacion: "Dios se viste de luz. La energía que impulsa las estrellas es su ropa."
      },
      {
        numero: 5,
        texto: "Él fundó la tierra sobre sus cimientos; no será jamás removida.",
        meditacion: "Las leyes de la física son su fidelidad. La gravedad es su abrazo constante."
      },
      {
        numero: 24,
        texto: "¡Cuántas son tus obras, oh Señor! Todas ellas las hiciste con sabiduría; la tierra está llena de tus criaturas.",
        meditacion: "La biodiversidad de la Tierra refleja la creatividad infinita del Artista Supremo."
      },
      {
        numero: 30,
        texto: "Envías tu Espíritu y son creados, y renuevas la faz de la tierra.",
        meditacion: "La vida no es un accidente. Es el aliento continuo de Dios sobre la materia."
      }
    ]
  },
  {
    id: "salmo-139",
    numero: 139,
    titulo: "Creación Maravillosa",
    tema: "Intimidad con el Creador",
    color: "#A855F7", // Purple
    planeta: "Venus",
    versiculos: [
      {
        numero: 7,
        texto: "¿A dónde me iré de tu Espíritu? ¿Y a dónde huiré de tu presencia?",
        meditacion: "No hay rincón del universo donde Dios no esté. No hay planeta lo suficientemente lejano."
      },
      {
        numero: 8,
        texto: "Si subiere a los cielos, allí estás tú; y si en el Seol hiciere mi estrado, he aquí, allí tú estás.",
        meditacion: "Desde la cima del cosmos hasta las profundidades del abismo, su presencia nos rodea."
      },
      {
        numero: 14,
        texto: "Te alabaré; porque formidables, maravillosas son tus obras; estoy maravillado, y mi alma lo sabe muy bien.",
        meditacion: "Somos obras maestras. Nuestro ADN es un poema, nuestro cerebro una catedral."
      },
      {
        numero: 17,
        texto: "¡Cuán preciosos me son, oh Dios, tus pensamientos! ¡Cuán grande es la suma de ellos!",
        meditacion: "Los pensamientos de Dios hacia ti son más que las estrellas. Su amor es infinito."
      }
    ]
  },
  {
    id: "salmo-147",
    numero: 147,
    titulo: "Él Cuenta las Estrellas",
    tema: "Poder y Ternura",
    color: "#EF4444", // Red
    planeta: "Marte",
    versiculos: [
      {
        numero: 4,
        texto: "Él cuenta el número de las estrellas; a todas ellas llama por sus nombres.",
        meditacion: "Hay 200 mil millones de estrellas solo en nuestra galaxia. Y Él conoce el nombre de cada una... y también el tuyo."
      },
      {
        numero: 5,
        texto: "Grande es el Señor nuestro, y de mucho poder; y su entendimiento es infinito.",
        meditacion: "El mismo Dios que calcula las órbitas de los planetas cuenta los cabellos de tu cabeza."
      },
      {
        numero: 3,
        texto: "Él sana a los quebrantados de corazón, y venda sus heridas.",
        meditacion: "El Arquitecto del cosmos es también el Médico de las almas rotas."
      },
      {
        numero: 15,
        texto: "Él envía su palabra a la tierra; velozmente corre su palabra.",
        meditacion: "Su Palabra es más rápida que la luz. Su verdad atraviesa galaxias."
      }
    ]
  }
];

export function getSalmoDelDia(): Salmo {
  const day = new Date().getDay();
  return SALMOS_ORBITALES[day % SALMOS_ORBITALES.length];
}
