export type TipoMisterio = "gozosos" | "dolorosos" | "gloriosos" | "luminosos";

export interface Misterio {
  numero: number;
  titulo: string;
  fruto: string;
  meditacion: string;
}

export const MISTERIOS: Record<TipoMisterio, { nombre: string; dia: string; misterios: Misterio[] }> = {
  gozosos: {
    nombre: "Misterios Gozosos",
    dia: "Lunes y Sábado",
    misterios: [
      {
        numero: 1,
        titulo: "La Anunciación",
        fruto: "Humildad",
        meditacion: "El ángel Gabriel anuncia a María que será la Madre de Dios. María, llena de gracia, acepta con humildad: 'He aquí la esclava del Señor'.",
      },
      {
        numero: 2,
        titulo: "La Visitación",
        fruto: "Caridad con el prójimo",
        meditacion: "María visita a su prima Isabel. El niño salta de gozo en el vientre de Isabel, quien exclama: '¡Bendita tú entre las mujeres!'",
      },
      {
        numero: 3,
        titulo: "El Nacimiento de Jesús",
        fruto: "Pobreza de espíritu",
        meditacion: "En un humilde pesebre de Belén nace el Salvador del mundo. Los ángeles anuncian: 'Gloria a Dios en las alturas'.",
      },
      {
        numero: 4,
        titulo: "La Presentación en el Templo",
        fruto: "Obediencia",
        meditacion: "María y José presentan a Jesús en el Templo. Simeón profetiza que una espada atravesará el alma de María.",
      },
      {
        numero: 5,
        titulo: "El Niño Perdido y Hallado en el Templo",
        fruto: "Buscar a Jesús",
        meditacion: "Jesús, a los doce años, es encontrado en el Templo dialogando con los doctores. 'No sabíais que debo ocuparme de las cosas de mi Padre'.",
      },
    ],
  },
  dolorosos: {
    nombre: "Misterios Dolorosos",
    dia: "Martes y Viernes",
    misterios: [
      {
        numero: 1,
        titulo: "La Oración en el Huerto",
        fruto: "Contrición",
        meditacion: "Jesús ora en Getsemaní con angustia mortal. 'Padre, si es posible, pase de mí este cáliz, pero no se haga mi voluntad sino la tuya'.",
      },
      {
        numero: 2,
        titulo: "La Flagelación",
        fruto: "Mortificación de los sentidos",
        meditacion: "Jesús es cruelmente azotado por orden de Pilato. Su cuerpo es lacerado por nuestros pecados.",
      },
      {
        numero: 3,
        titulo: "La Coronación de Espinas",
        fruto: "Desprecio del mundo",
        meditacion: "Los soldados coronan a Jesús con espinas y se burlan de Él: '¡Salve, Rey de los judíos!'",
      },
      {
        numero: 4,
        titulo: "Jesús con la Cruz a Cuestas",
        fruto: "Paciencia en las pruebas",
        meditacion: "Jesús carga la pesada cruz camino al Calvario. Cae tres veces pero se levanta por amor a nosotros.",
      },
      {
        numero: 5,
        titulo: "La Crucifixión y Muerte de Jesús",
        fruto: "Amor a Dios sobre todas las cosas",
        meditacion: "Jesús muere en la cruz por nuestra salvación. 'Padre, perdónalos porque no saben lo que hacen'.",
      },
    ],
  },
  gloriosos: {
    nombre: "Misterios Gloriosos",
    dia: "Miércoles y Domingo",
    misterios: [
      {
        numero: 1,
        titulo: "La Resurrección",
        fruto: "Fe",
        meditacion: "Jesús resucita glorioso al tercer día, venciendo a la muerte. '¡Aleluya! ¡Ha resucitado!'",
      },
      {
        numero: 2,
        titulo: "La Ascensión",
        fruto: "Esperanza",
        meditacion: "Jesús asciende al cielo ante los apóstoles. 'Estaré con vosotros hasta el fin del mundo'.",
      },
      {
        numero: 3,
        titulo: "La Venida del Espíritu Santo",
        fruto: "Dones del Espíritu Santo",
        meditacion: "El Espíritu Santo desciende sobre María y los apóstoles en forma de lenguas de fuego.",
      },
      {
        numero: 4,
        titulo: "La Asunción de María",
        fruto: "Gracia de una buena muerte",
        meditacion: "María es llevada al cielo en cuerpo y alma por los ángeles.",
      },
      {
        numero: 5,
        titulo: "La Coronación de María",
        fruto: "Confianza en María",
        meditacion: "María es coronada como Reina del Cielo y la Tierra por la Santísima Trinidad.",
      },
    ],
  },
  luminosos: {
    nombre: "Misterios Luminosos",
    dia: "Jueves",
    misterios: [
      {
        numero: 1,
        titulo: "El Bautismo de Jesús",
        fruto: "Fidelidad a nuestro bautismo",
        meditacion: "Jesús es bautizado por Juan en el Jordán. El Padre declara: 'Este es mi Hijo amado'.",
      },
      {
        numero: 2,
        titulo: "Las Bodas de Caná",
        fruto: "Confianza en María",
        meditacion: "María intercede y Jesús realiza su primer milagro, convirtiendo el agua en vino.",
      },
      {
        numero: 3,
        titulo: "El Anuncio del Reino",
        fruto: "Conversión",
        meditacion: "Jesús proclama: 'El Reino de Dios está cerca. Convertíos y creed en el Evangelio'.",
      },
      {
        numero: 4,
        titulo: "La Transfiguración",
        fruto: "Deseo de santidad",
        meditacion: "Jesús se transfigura en el monte Tabor, mostrando su gloria divina a Pedro, Santiago y Juan.",
      },
      {
        numero: 5,
        titulo: "La Institución de la Eucaristía",
        fruto: "Amor a la Eucaristía",
        meditacion: "En la Última Cena, Jesús instituye la Eucaristía: 'Este es mi Cuerpo, esta es mi Sangre'.",
      },
    ],
  },
};

export function getMisterioDelDia(): TipoMisterio {
  const day = new Date().getDay();
  switch (day) {
    case 0: return "gloriosos"; // Domingo
    case 1: return "gozosos";   // Lunes
    case 2: return "dolorosos"; // Martes
    case 3: return "gloriosos"; // Miércoles
    case 4: return "luminosos"; // Jueves
    case 5: return "dolorosos"; // Viernes
    case 6: return "gozosos";   // Sábado
    default: return "gozosos";
  }
}

export const ORACIONES_ROSARIO = {
  padreNuestro: `Padre nuestro, que estás en el cielo,
santificado sea tu Nombre;
venga a nosotros tu reino;
hágase tu voluntad en la tierra como en el cielo.
Danos hoy nuestro pan de cada día;
perdona nuestras ofensas,
como también nosotros perdonamos a los que nos ofenden;
no nos dejes caer en la tentación,
y líbranos del mal. Amén.`,

  aveMaria: `Dios te salve, María, llena eres de gracia;
el Señor es contigo.
Bendita tú eres entre todas las mujeres,
y bendito es el fruto de tu vientre, Jesús.
Santa María, Madre de Dios,
ruega por nosotros, pecadores,
ahora y en la hora de nuestra muerte. Amén.`,

  gloria: `Gloria al Padre, y al Hijo, y al Espíritu Santo.
Como era en el principio, ahora y siempre,
por los siglos de los siglos. Amén.`,

  salveRegina: `Dios te salve, Reina y Madre de misericordia,
vida, dulzura y esperanza nuestra; Dios te salve.
A ti llamamos los desterrados hijos de Eva;
a ti suspiramos, gimiendo y llorando
en este valle de lágrimas.
Ea, pues, Señora, abogada nuestra,
vuelve a nosotros esos tus ojos misericordiosos;
y después de este destierro,
muéstranos a Jesús, fruto bendito de tu vientre.
¡Oh, clementísima, oh piadosa, oh dulce Virgen María! Amén.`,

  credo: `Creo en Dios, Padre todopoderoso,
Creador del cielo y de la tierra.
Creo en Jesucristo, su único Hijo, nuestro Señor,
que fue concebido por obra y gracia del Espíritu Santo,
nació de Santa María Virgen,
padeció bajo el poder de Poncio Pilato,
fue crucificado, muerto y sepultado,
descendió a los infiernos,
al tercer día resucitó de entre los muertos,
subió a los cielos
y está sentado a la derecha de Dios, Padre todopoderoso.
Desde allí ha de venir a juzgar a vivos y muertos.
Creo en el Espíritu Santo,
la santa Iglesia católica,
la comunión de los santos,
el perdón de los pecados,
la resurrección de la carne
y la vida eterna. Amén.`,
};
