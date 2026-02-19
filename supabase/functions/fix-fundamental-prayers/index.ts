import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Oraciones fundamentales con textos litúrgicos oficiales
const FUNDAMENTAL_PRAYERS: Record<string, {
  nombre: string;
  texto: string;
  fuente: string;
  fuente_url: string;
  categoria: string;
  tagline: string;
}> = {
  "Padre Nuestro": {
    nombre: "Padre Nuestro",
    texto: `Padre nuestro, que estás en el cielo,
santificado sea tu Nombre;
venga a nosotros tu reino;
hágase tu voluntad en la tierra como en el cielo.
Danos hoy nuestro pan de cada día;
perdona nuestras ofensas,
como también nosotros perdonamos a los que nos ofenden;
no nos dejes caer en la tentación,
y líbranos del mal.

Amén.`,
    fuente: "Misal Romano - Oración del Señor",
    fuente_url: "https://www.vatican.va/content/vatican/es.html",
    categoria: "Oraciones Básicas",
    tagline: "La oración que Jesús nos enseñó"
  },
  "Ave María": {
    nombre: "Ave María",
    texto: `Dios te salve, María, llena eres de gracia;
el Señor es contigo.
Bendita tú eres entre todas las mujeres,
y bendito es el fruto de tu vientre, Jesús.

Santa María, Madre de Dios,
ruega por nosotros, pecadores,
ahora y en la hora de nuestra muerte.

Amén.`,
    fuente: "Oración Tradicional de la Iglesia Católica",
    fuente_url: "https://www.vatican.va/special/rosary/documents/misteri_sp.html",
    categoria: "Oraciones Marianas",
    tagline: "Saludo angélico a la Virgen María"
  },
  "Gloria": {
    nombre: "Gloria al Padre",
    texto: `Gloria al Padre, y al Hijo, y al Espíritu Santo.
Como era en el principio, ahora y siempre,
por los siglos de los siglos.

Amén.`,
    fuente: "Doxología Menor - Liturgia de las Horas",
    fuente_url: "https://www.vatican.va/content/vatican/es.html",
    categoria: "Oraciones Básicas",
    tagline: "Alabanza a la Santísima Trinidad"
  },
  "Credo": {
    nombre: "Credo de los Apóstoles",
    texto: `Creo en Dios, Padre todopoderoso,
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
y la vida eterna.

Amén.`,
    fuente: "Símbolo de los Apóstoles - Catecismo de la Iglesia Católica",
    fuente_url: "https://www.vatican.va/archive/catechism_sp/p1s1c3a2_sp.html",
    categoria: "Oraciones Básicas",
    tagline: "Profesión de fe de los Apóstoles"
  },
  "Salve Regina": {
    nombre: "Salve Regina",
    texto: `Dios te salve, Reina y Madre de misericordia,
vida, dulzura y esperanza nuestra, Dios te salve.

A ti llamamos los desterrados hijos de Eva;
a ti suspiramos, gimiendo y llorando en este valle de lágrimas.

Ea, pues, Señora, abogada nuestra,
vuelve a nosotros esos tus ojos misericordiosos;
y después de este destierro,
muéstranos a Jesús, fruto bendito de tu vientre.

¡Oh clemente, oh piadosa, oh dulce Virgen María!

V. Ruega por nosotros, Santa Madre de Dios.
R. Para que seamos dignos de alcanzar las promesas de Nuestro Señor Jesucristo.

Amén.`,
    fuente: "Antífona Mariana Final - Liturgia de las Horas",
    fuente_url: "https://www.vatican.va/content/vatican/es.html",
    categoria: "Oraciones Marianas",
    tagline: "Antífona a la Virgen María"
  },
  "Señal de la Cruz": {
    nombre: "La Señal de la Cruz",
    texto: `Por la señal de la Santa Cruz,
de nuestros enemigos
líbranos, Señor, Dios nuestro.

En el nombre del Padre,
y del Hijo,
y del Espíritu Santo.

Amén.`,
    fuente: "Oración Tradicional de la Iglesia Católica",
    fuente_url: "https://www.vatican.va/content/vatican/es.html",
    categoria: "Oraciones Básicas",
    tagline: "Signo distintivo del cristiano"
  },
  "Acto de Contrición": {
    nombre: "Acto de Contrición",
    texto: `Señor mío Jesucristo,
Dios y Hombre verdadero,
Creador, Padre y Redentor mío;
por ser Vos quien sois, Bondad infinita,
y porque os amo sobre todas las cosas,
me pesa de todo corazón haberos ofendido;
también me pesa porque podéis castigarme
con las penas del infierno.

Ayudado de vuestra divina gracia,
propongo firmemente nunca más pecar,
confesarme y cumplir la penitencia que me fuere impuesta.

Amén.`,
    fuente: "Sacramento de la Reconciliación",
    fuente_url: "https://www.vatican.va/content/vatican/es.html",
    categoria: "Oraciones Básicas",
    tagline: "Oración de arrepentimiento"
  },
  "Ángel de la Guarda": {
    nombre: "Oración al Ángel de la Guarda",
    texto: `Ángel de mi guarda,
dulce compañía,
no me desampares
ni de noche ni de día.

No me dejes solo,
que me perdería.
Ángel de mi guarda,
ruega a Dios por mí.

Amén.`,
    fuente: "Oración Tradicional de la Iglesia Católica",
    fuente_url: "https://www.aciprensa.com/recursos/angel-de-la-guarda-1558",
    categoria: "Oraciones a los Ángeles",
    tagline: "Oración tradicional al ángel custodio"
  }
};

// Más oraciones fundamentales de Corazones.org y EWTN
const MORE_FUNDAMENTAL_PRAYERS: Record<string, {
  nombre: string;
  texto: string;
  fuente: string;
  fuente_url: string;
  categoria: string;
  tagline: string;
}> = {
  "Alma de Cristo": {
    nombre: "Alma de Cristo (Anima Christi)",
    texto: `Alma de Cristo, santifícame.
Cuerpo de Cristo, sálvame.
Sangre de Cristo, embriágame.
Agua del costado de Cristo, lávame.
Pasión de Cristo, confórtame.

¡Oh buen Jesús!, óyeme.
Dentro de tus llagas, escóndeme.
No permitas que me aparte de Ti.
Del maligno enemigo, defiéndeme.
En la hora de mi muerte, llámame.
Y mándame ir a Ti,
para que con tus santos te alabe
por los siglos de los siglos.

Amén.`,
    fuente: "Oración del siglo XIV - Ejercicios Espirituales de San Ignacio",
    fuente_url: "https://www.corazones.org/oraciones/anima_christi.htm",
    categoria: "Oraciones Eucarísticas",
    tagline: "Oración después de la Comunión"
  },
  "Memorare": {
    nombre: "Acordaos (Memorare)",
    texto: `Acordaos, oh piadosísima Virgen María,
que jamás se ha oído decir
que ninguno de los que han acudido a vuestra protección,
implorando vuestro auxilio,
haya sido desamparado.

Animado por esta confianza,
a Vos acudo, oh Madre, Virgen de las vírgenes,
y gimiendo bajo el peso de mis pecados
me atrevo a comparecer ante Vos.

Oh Madre de Dios,
no desechéis mis súplicas,
antes bien, inclinad a ellas vuestros oídos
y dignaos atenderlas favorablemente.

Amén.`,
    fuente: "Oración atribuida a San Bernardo de Claraval (s. XII)",
    fuente_url: "https://www.corazones.org/oraciones/memorare.htm",
    categoria: "Oraciones Marianas",
    tagline: "Súplica confiada a la Virgen"
  },
  "Magnificat": {
    nombre: "Magnificat",
    texto: `Proclama mi alma la grandeza del Señor,
se alegra mi espíritu en Dios, mi salvador;
porque ha mirado la humillación de su esclava.
Desde ahora me felicitarán todas las generaciones,
porque el Poderoso ha hecho obras grandes por mí:
su nombre es santo,
y su misericordia llega a sus fieles
de generación en generación.

Él hace proezas con su brazo:
dispersa a los soberbios de corazón,
derriba del trono a los poderosos
y enaltece a los humildes,
a los hambrientos los colma de bienes
y a los ricos los despide vacíos.

Auxilia a Israel, su siervo,
acordándose de la misericordia
—como lo había prometido a nuestros padres—
en favor de Abrahán y su descendencia por siempre.

Gloria al Padre, y al Hijo, y al Espíritu Santo.
Como era en el principio, ahora y siempre, 
por los siglos de los siglos. Amén.`,
    fuente: "Cántico de la Virgen María - Lucas 1,46-55 (Vísperas)",
    fuente_url: "https://www.deiverbum.org/liturgia-de-las-horas/",
    categoria: "Oraciones Marianas",
    tagline: "Cántico de la Virgen María"
  },
  "Bendita sea tu pureza": {
    nombre: "Bendita sea tu pureza",
    texto: `Bendita sea tu pureza
y eternamente lo sea,
pues todo un Dios se recrea
en tan graciosa belleza.

A Ti, celestial Princesa,
Virgen Sagrada María,
te ofrezco en este día
alma, vida y corazón.

Mírame con compasión,
no me dejes, Madre mía.

Amén.`,
    fuente: "Oración Popular Mariana Tradicional",
    fuente_url: "https://www.ewtn.com/es/catolicismo/devociones",
    categoria: "Oraciones Marianas",
    tagline: "Consagración sencilla a María"
  },
  "Bajo tu amparo": {
    nombre: "Bajo tu amparo (Sub tuum praesidium)",
    texto: `Bajo tu amparo nos acogemos,
Santa Madre de Dios;
no desprecies las súplicas
que te dirigimos en nuestras necesidades,
antes bien líbranos siempre de todo peligro,
oh Virgen gloriosa y bendita.

Amén.`,
    fuente: "Antífona Mariana más antigua (s. III) - Papiro Rylands 470",
    fuente_url: "https://www.corazones.org/oraciones/sub_tuum.htm",
    categoria: "Oraciones Marianas",
    tagline: "La oración mariana más antigua"
  },
  "Oración a San Miguel Arcángel": {
    nombre: "Oración a San Miguel Arcángel",
    texto: `San Miguel Arcángel, defiéndenos en la batalla.
Sé nuestro amparo contra la perversidad y asechanzas del demonio.
Reprímale Dios, pedimos suplicantes,
y tú, Príncipe de la Milicia Celestial,
arroja al infierno con el divino poder
a Satanás y a los otros espíritus malignos
que andan dispersos por el mundo
para la perdición de las almas.

Amén.`,
    fuente: "Oración compuesta por el Papa León XIII (1886)",
    fuente_url: "https://www.corazones.org/santos/miguel_arcangel.htm",
    categoria: "Oraciones a los Ángeles",
    tagline: "Oración de protección espiritual"
  },
  "Oración de la Mañana": {
    nombre: "Oración de la Mañana (Ofrecimiento del Día)",
    texto: `Oh Señor, en unión con el Corazón Inmaculado de María,
te ofrezco las oraciones, obras, alegrías y sufrimientos de este día
por todas las intenciones de tu Sagrado Corazón,
en unión con el Santo Sacrificio de la Misa,
en reparación de los pecados,
por la salvación de las almas,
la unión de todos los cristianos,
nuestro Santo Padre el Papa,
y por las intenciones de todos nuestros asociados.

Amén.`,
    fuente: "Apostolado de la Oración - Ofrecimiento tradicional",
    fuente_url: "https://www.ewtn.com/es/catolicismo/devociones",
    categoria: "Oraciones Básicas",
    tagline: "Ofrecimiento del día al Señor"
  },
  "Oración de la Noche": {
    nombre: "Oración antes de Dormir",
    texto: `Visita, Señor, esta habitación:
aleja de ella las insidias del enemigo;
que tus santos ángeles habiten en ella
y nos guarden en paz;
y que tu bendición permanezca siempre sobre nosotros.
Por Jesucristo, nuestro Señor.

Amén.`,
    fuente: "Completas - Liturgia de las Horas",
    fuente_url: "https://www.deiverbum.org/liturgia-de-las-horas/",
    categoria: "Oraciones Básicas",
    tagline: "Oración de las Completas"
  }
};

// Advocaciones marianas latinoamericanas
const MARIAN_ADVOCATIONS: Record<string, {
  nombre: string;
  texto: string;
  fuente: string;
  fuente_url: string;
  pais: string;
  tagline: string;
}> = {
  "Nuestra Señora de la Caridad del Cobre": {
    nombre: "Oración a la Virgen de la Caridad del Cobre",
    texto: `Virgen de la Caridad del Cobre, Patrona de Cuba,
Madre querida de todos los cubanos,
te consagramos nuestra Patria, nuestros hogares y nuestras vidas.

Tú que eres la estrella que guía a los marineros,
guíanos a nosotros en medio de las tempestades de la vida.
Tú que un día viniste sobre las aguas del mar,
ven a nuestro encuentro en medio de las dificultades.

Virgen mambisa, que acompañaste a nuestros libertadores,
acompaña hoy a todos los que luchan por la paz y la reconciliación.

Madre de todos los cubanos, de aquí y de allá,
únenos en tu amor y en la fe de tus hijos.

Virgen de la Caridad, ruega por nosotros.

Amén.`,
    fuente: "Oración Tradicional Cubana",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-la-virgen-de-la-caridad-del-cobre-2224",
    pais: "CU",
    tagline: "Patrona de Cuba"
  },
  "Nuestra Señora de Coromoto": {
    nombre: "Oración a la Virgen de Coromoto",
    texto: `Oh Virgen Santísima de Coromoto, Patrona de Venezuela,
que te apareciste a nuestros indígenas
para traerles la luz de la fe,
mira con amor a tu pueblo venezolano.

Tú que dejaste tu imagen sagrada como prenda de tu protección,
protégenos de todo mal y peligro.
Tú que eres Madre de misericordia,
ten piedad de nosotros en estos tiempos difíciles.

Virgen de Coromoto, Reina y Madre de Venezuela,
te consagramos nuestras familias, nuestra patria, nuestras vidas.
Guárdanos bajo tu manto protector
y condúcenos siempre hacia tu Hijo Jesús.

Amén.`,
    fuente: "Oración Tradicional Venezolana",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-nuestra-senora-de-coromoto-2226",
    pais: "VE",
    tagline: "Patrona de Venezuela"
  },
  "Virgen de Luján": {
    nombre: "Oración a la Virgen de Luján",
    texto: `Oh Virgen de Luján, Madre del pueblo argentino,
que elegiste esta tierra para derramar tus gracias,
te agradecemos tu presencia maternal entre nosotros.

Tú que no quisiste seguir viaje y quedarte con nosotros,
quédate siempre en nuestros corazones.
Tú que eres la Patrona de Argentina, Uruguay y Paraguay,
une a los pueblos del Río de la Plata en la fe y la caridad.

Virgencita gaucha, amparo de los humildes,
defiéndenos del mal y guíanos por el camino del bien.
Madre de Luján, enséñanos a ser fieles a tu Hijo Jesús
y a construir una patria más justa y fraterna.

Amén.`,
    fuente: "Oración Tradicional Argentina",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-nuestra-senora-de-lujan-2227",
    pais: "AR",
    tagline: "Patrona de Argentina, Uruguay y Paraguay"
  },
  "Nuestra Señora de Chiquinquirá": {
    nombre: "Oración a la Virgen de Chiquinquirá",
    texto: `Oh Virgen Santísima de Chiquinquirá, Reina de Colombia,
que quisiste renovar tu imagen para manifestar tu amor a tu pueblo,
renueva también nuestros corazones.

Tú que eres la Rosa del cielo colombiano,
perfuma nuestras vidas con el aroma de tus virtudes.
Tú que desde hace siglos proteges a Colombia,
sigue siendo nuestro refugio y nuestra esperanza.

Madre de Chiquinquirá, intercede por nuestra patria,
para que reine la paz, la justicia y la reconciliación.
Enséñanos a ser verdaderos hijos tuyos,
imitando tu fe, tu humildad y tu amor a Jesús.

Amén.`,
    fuente: "Oración Tradicional Colombiana",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-nuestra-senora-de-chiquinquira-2225",
    pais: "CO",
    tagline: "Patrona de Colombia"
  },
  "Virgen de Caacupé": {
    nombre: "Oración a la Virgen de Caacupé",
    texto: `Oh Virgen Santísima de Caacupé, Madre del pueblo paraguayo,
que en medio de la selva guaraní manifestaste tu amor,
sigue acompañando a tus hijos en el camino de la vida.

Tú que eres la "Virgencita Azul" de Paraguay,
cubre con tu manto a todas las familias paraguayas.
Tú que proteges a los más humildes y sencillos,
no nos abandones en nuestras necesidades.

Madre de Caacupé, te ofrecemos nuestro amor y nuestra devoción.
Haz que seamos fieles a las tradiciones de fe de nuestros mayores
y que sepamos transmitir esta fe a las nuevas generaciones.

Amén.`,
    fuente: "Oración Tradicional Paraguaya",
    fuente_url: "https://www.aciprensa.com/recursos/virgen-de-caacupe-2228",
    pais: "PY",
    tagline: "Patrona de Paraguay"
  },
  "Virgen del Carmen de Chile": {
    nombre: "Oración a la Virgen del Carmen, Patrona de Chile",
    texto: `Oh Virgen Santísima del Carmen, Patrona de Chile,
que extiendes tu manto protector sobre nuestra patria,
mira con amor a todos tus hijos chilenos.

Tú que acompañaste al Ejército Libertador,
acompaña hoy a todo el pueblo chileno.
Tú que eres Reina y Madre de Chile,
reina en nuestros corazones y en nuestros hogares.

Virgen del Carmen, Estrella de Chile,
guíanos en medio de las dificultades,
fortalece nuestra fe en los momentos de prueba
y condúcenos siempre hacia tu Hijo Jesús.

Amén.`,
    fuente: "Oración Tradicional Chilena",
    fuente_url: "https://www.aciprensa.com/recursos/virgen-del-carmen-patrona-de-chile-2229",
    pais: "CL",
    tagline: "Patrona de Chile"
  },
  "Nuestra Señora de Suyapa": {
    nombre: "Oración a la Virgen de Suyapa",
    texto: `Oh Virgen Santísima de Suyapa, Patrona de Honduras,
pequeña imagen que encierras un amor inmenso,
mira con ternura a todos tus hijos hondureños.

Tú que fuiste encontrada por humildes campesinos,
escucha las súplicas de los más pobres y necesitados.
Tú que desde tu santuario irradias gracias,
derrama tus bendiciones sobre nuestra patria.

Madre de Suyapa, protege a Honduras,
líbranos de todo mal, concédenos la paz,
y haz que todos los hondureños vivamos unidos
en la fe, la esperanza y el amor.

Amén.`,
    fuente: "Oración Tradicional Hondureña",
    fuente_url: "https://www.aciprensa.com/recursos/virgen-de-suyapa-2230",
    pais: "HN",
    tagline: "Patrona de Honduras"
  },
  "Nuestra Señora de la Inmaculada Concepción de El Viejo": {
    nombre: "Oración a la Virgen de El Viejo",
    texto: `Oh Virgen Santísima de la Inmaculada Concepción,
Patrona de Nicaragua, venerada en El Viejo,
que desde hace siglos proteges a nuestro pueblo,
sigue siendo nuestro amparo y nuestra esperanza.

Tú que eres la Purísima, Madre inmaculada,
líbranos del pecado y de todo mal.
Tú que eres la Reina de los nicaragüenses,
reina en nuestros corazones y en nuestra patria.

Madre querida, intercede por Nicaragua,
para que alcancemos la paz y la reconciliación.
Enséñanos a ser verdaderos discípulos de tu Hijo
y constructores de un país más justo y fraterno.

Amén.`,
    fuente: "Oración Tradicional Nicaragüense",
    fuente_url: "https://www.aciprensa.com/recursos/inmaculada-concepcion-de-maria-2231",
    pais: "NI",
    tagline: "Patrona de Nicaragua"
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const adminKey = req.headers.get('X-Admin-Api-Key');
    const ADMIN_KEY = Deno.env.get('ADMIN_API_KEY');
    if (adminKey && ADMIN_KEY && adminKey === ADMIN_KEY) { /* Admin OK */ }
    else if (authHeader?.startsWith('Bearer ')) {
      const _ac = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
      const { error: authErr } = await _ac.auth.getUser(authHeader.replace('Bearer ', ''));
      if (authErr) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'Autenticación requerida' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { fixFundamental = true, fixMarian = true } = await req.json().catch(() => ({}));

    const results = {
      fundamental: { updated: 0, created: 0, errors: [] as string[] },
      marian: { updated: 0, created: 0, errors: [] as string[] }
    };

    // Fix fundamental prayers (combine both dictionaries)
    const allFundamentalPrayers = { ...FUNDAMENTAL_PRAYERS, ...MORE_FUNDAMENTAL_PRAYERS };
    
    if (fixFundamental) {
      for (const [key, prayer] of Object.entries(allFundamentalPrayers)) {
        try {
          // Check if prayer exists
          const { data: existing } = await supabase
            .from('oraciones')
            .select('id')
            .or(`nombre.ilike.%${key}%,nombre.ilike.%${prayer.nombre}%`)
            .limit(1);

          if (existing && existing.length > 0) {
            // Update existing prayer
            const { error } = await supabase
              .from('oraciones')
              .update({
                texto: prayer.texto,
                es_tradicional: true,
                es_fundamental: true,
                fuente: prayer.fuente,
                fuente_url: prayer.fuente_url,
                categoria: prayer.categoria,
                tagline: prayer.tagline
              })
              .eq('id', existing[0].id);

            if (error) throw error;
            results.fundamental.updated++;
          } else {
            // Create new prayer
            const { error } = await supabase
              .from('oraciones')
              .insert({
                nombre: prayer.nombre,
                texto: prayer.texto,
                categoria: prayer.categoria,
                es_tradicional: true,
                es_fundamental: true,
                fuente: prayer.fuente,
                fuente_url: prayer.fuente_url,
                tagline: prayer.tagline,
                orden: Object.keys(allFundamentalPrayers).indexOf(key) + 1
              });

            if (error) throw error;
            results.fundamental.created++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.fundamental.errors.push(`${key}: ${errorMessage}`);
        }
      }
    }

    // Fix Marian advocations
    if (fixMarian) {
      for (const [key, prayer] of Object.entries(MARIAN_ADVOCATIONS)) {
        try {
          // Check if prayer exists
          const { data: existing } = await supabase
            .from('oraciones')
            .select('id')
            .or(`nombre.ilike.%${key}%,nombre.ilike.%${prayer.nombre}%`)
            .limit(1);

          if (existing && existing.length > 0) {
            // Update existing
            const { error } = await supabase
              .from('oraciones')
              .update({
                texto: prayer.texto,
                es_tradicional: true,
                fuente: prayer.fuente,
                fuente_url: prayer.fuente_url,
                categoria: "Oraciones Marianas",
                subcategoria: "Advocaciones Latinoamericanas",
                tagline: prayer.tagline
              })
              .eq('id', existing[0].id);

            if (error) throw error;
            results.marian.updated++;
          } else {
            // Create new
            const { error } = await supabase
              .from('oraciones')
              .insert({
                nombre: prayer.nombre,
                texto: prayer.texto,
                categoria: "Oraciones Marianas",
                subcategoria: "Advocaciones Latinoamericanas",
                es_tradicional: true,
                fuente: prayer.fuente,
                fuente_url: prayer.fuente_url,
                tagline: prayer.tagline
              });

            if (error) throw error;
            results.marian.created++;
          }

          // Try to link to saint if exists
          const { data: saint } = await supabase
            .from('calendar_saints')
            .select('id')
            .ilike('name', `%${key}%`)
            .limit(1);

          if (saint && saint.length > 0) {
            // Get the prayer we just created/updated
            const { data: prayerRecord } = await supabase
              .from('oraciones')
              .select('id')
              .or(`nombre.ilike.%${key}%,nombre.ilike.%${prayer.nombre}%`)
              .limit(1);

            if (prayerRecord && prayerRecord.length > 0) {
              await supabase
                .from('calendar_saints')
                .update({ prayer_id: prayerRecord[0].id })
                .eq('id', saint[0].id);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.marian.errors.push(`${key}: ${errorMessage}`);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        fundamentalUpdated: results.fundamental.updated,
        fundamentalCreated: results.fundamental.created,
        marianUpdated: results.marian.updated,
        marianCreated: results.marian.created,
        totalErrors: results.fundamental.errors.length + results.marian.errors.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
