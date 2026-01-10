import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Oraciones tradicionales precargadas (extraídas de ACI Prensa y fuentes oficiales)
const TRADITIONAL_PRAYERS_DATA: Record<string, { texto: string; fuente: string; fuente_url: string }> = {
  "San Miguel Arcángel": {
    texto: `San Miguel Arcángel, defiéndenos en la batalla. Sé nuestro amparo contra la perversidad y asechanzas del demonio. Reprímale Dios, pedimos suplicantes, y tú, Príncipe de la Milicia Celestial, arroja al infierno con el divino poder a Satanás y a los otros espíritus malignos que andan dispersos por el mundo para la perdición de las almas. Amén.`,
    fuente: "León XIII - Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-miguel-arcangel-1577"
  },
  "San José": {
    texto: `A ti, bienaventurado San José, acudimos en nuestra tribulación, y después de implorar el auxilio de tu Santísima Esposa, solicitamos también confiadamente tu patrocinio.

Por aquella caridad que con la Inmaculada Virgen María te tuvo unido, y por el paterno amor con que abrazaste al Niño Jesús, humildemente te suplicamos vuelvas benigno los ojos a la herencia que con su Sangre adquirió Jesucristo, y con tu poder y auxilio socorras nuestras necesidades.

Protege, ¡oh providentísimo Custodio de la Sagrada Familia!, la escogida descendencia de Jesucristo; aparta de nosotros toda mancha de error y corrupción; asístenos propicio desde el cielo, fortísimo libertador nuestro, en esta lucha con el poder de las tinieblas; y así como en otro tiempo libraste de la muerte la vida amenazada del Niño Jesús, así ahora defiende a la santa Iglesia de Dios de las asechanzas de sus enemigos y de toda adversidad.

Acógenos a todos bajo tu continuo patrocinio, para que, imitando tus ejemplos, y sostenidos por tu auxilio, podamos vivir virtuosamente, morir piadosamente y alcanzar en el cielo la eterna bienaventuranza. Amén.`,
    fuente: "León XIII - A Ti Bienaventurado San José",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-jose-obrero-1545"
  },
  "San Judas Tadeo": {
    texto: `¡Oh gloriosísimo Apóstol San Judas Tadeo!, siervo fiel y amigo de Jesús, el nombre del traidor que entregó a tu amado Maestro en manos de sus enemigos ha sido la causa de que muchos te hayan olvidado; pero la Iglesia te honra e invoca universalmente como patrón de los casos difíciles y desesperados.

Ruega por mí que soy tan miserable; haz uso, te lo ruego, de ese privilegio especial a ti concedido de socorrer pronta y visiblemente cuando casi se ha perdido toda esperanza.

Ven en mi ayuda en esta gran necesidad para que reciba los consuelos y socorro del cielo en todas mis tribulaciones y angustias, particularmente (aquí se hace la petición) y para que pueda alabar a Dios contigo y con todos los elegidos por toda la eternidad.

Te prometo, oh bienaventurado San Judas, acordarme siempre de este gran favor, y nunca dejar de honrarte como mi especial y poderoso protector y hacer cuanto esté a mi alcance para fomentar tu devoción. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-judas-tadeo-1687"
  },
  "San Antonio de Padua": {
    texto: `¡Oh glorioso San Antonio, escogido por Dios para predicar su palabra!, tú que siempre estás dispuesto a ayudar a los que te invocan, ven en mi auxilio.

Tú, que encontraste al Niño Jesús, ayúdame a encontrar la gracia de Dios. Tú, que abrazaste al Niño Jesús, ayúdame a abrazar su voluntad. Tú, que fuiste tan devoto del Santísimo Sacramento, ayúdame a recibir dignamente la Sagrada Comunión.

Por tu intercesión, que he merecido tantos favores del Señor, ayúdame en mis necesidades actuales (menciona tu petición).

¡Oh glorioso San Antonio!, gloria del pueblo cristiano, honor de la Orden Seráfica, santuario de la bondad y la misericordia, oye nuestras plegarias y alcánzanos las gracias que humildemente solicitamos. Amén.`,
    fuente: "Oración Tradicional Franciscana",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-antonio-de-padua-1519"
  },
  "Santa Rita de Casia": {
    texto: `¡Oh gloriosa Santa Rita!, llamada "Santa de lo Imposible", tú que alcanzaste de Dios gracias tan singulares, te ruego intercedas por mí ante el trono del Altísimo.

Tú que sufriste tanto en tu vida como esposa, madre y religiosa, y que recibiste en tu frente la señal del amor de Cristo crucificado, mira con compasión mis necesidades y escucha mi humilde súplica.

Tú que experimentaste el poder de Dios que hace posible lo imposible, ruega por mí para que obtenga la gracia que tanto necesito (menciona tu petición).

Santa Rita, abogada de los casos difíciles y desesperados, no permitas que me encuentre sin tu protección. Por los méritos de tu vida santa y por la herida que Cristo imprimió en tu frente, alcánzame del Señor lo que te pido, si es para bien de mi alma.

Gloria al Padre, al Hijo y al Espíritu Santo. Amén.`,
    fuente: "Oración Tradicional Agustina",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-rita-de-casia-1565"
  },
  "San Francisco de Asís": {
    texto: `Señor, hazme un instrumento de tu paz.
Donde haya odio, siembre yo amor;
donde haya injuria, perdón;
donde haya duda, fe;
donde haya desaliento, esperanza;
donde haya sombra, luz;
donde haya tristeza, alegría.

Oh Divino Maestro, concédeme que no busque tanto
ser consolado, sino consolar;
ser comprendido, sino comprender;
ser amado, sino amar.
Porque dando se recibe,
perdonando se es perdonado,
y muriendo se resucita a la vida eterna. Amén.`,
    fuente: "Oración de San Francisco de Asís",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-de-san-francisco-de-asis-1524"
  },
  "San Benito": {
    texto: `Gloriosísimo Patriarca San Benito, modelo insigne de todas las virtudes, vaso puro de la gracia divina: he aquí que me postro humildemente ante ti, e imploro tu poderosa intercesión.

Por el amor que tuviste a Nuestro Señor Jesucristo, te ruego intercedas por mí ante el trono de la Divina Majestad, para que yo pueda romper las cadenas con que el demonio pretende tenerme atado, y alcanzar la gracia de encaminarme por la senda de la virtud.

Por el amor que tuviste a María Santísima, alcánzame la gracia de no caer jamás en las redes del pecado, de resistir las tentaciones del demonio, de la carne y del mundo.

Por las penitencias con que maceraste tu cuerpo, y las lágrimas de contrición que derramaste, alcánzame la gracia de llorar sinceramente mis pecados y hacer penitencia de ellos.

Y tú, terrible contra el poder del infierno, líbrame, por tu intercesión, de las asechanzas y tentaciones del espíritu maligno. Amén.

V. Ora pro nobis, Beate Pater Benedicte.
R. Ut digni efficiamur promissionibus Christi.`,
    fuente: "Oración Tradicional Benedictina",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-benito-abad-1629"
  },
  "Nuestra Señora de Guadalupe": {
    texto: `Dios te salve, María Santísima de Guadalupe, Madre de Dios y Madre nuestra.

Tú que te apareciste en el Tepeyac para traer la luz de la fe a los pueblos de América, te suplicamos humildemente que vuelvas tus ojos misericordiosos hacia nosotros, tus hijos.

Tú que consolaste al humilde Juan Diego y dejaste impresa tu imagen bendita en su tilma, escucha nuestras súplicas y presenta nuestras peticiones a tu Hijo Jesús.

Madre de las Américas, bajo tu manto nos acogemos. Defiéndenos del mal, guíanos por el camino de la fe, la esperanza y la caridad. Protege a nuestras familias, a los más necesitados, a los que sufren en cuerpo y alma.

Virgencita morena, que tus palabras al beato Juan Diego sean también para nosotros: "¿No estoy yo aquí que soy tu Madre? ¿No estás bajo mi sombra y resguardo?"

Madre querida, en ti confiamos. Por ti alabamos y bendecimos al Señor. Amén.`,
    fuente: "Oración Tradicional Guadalupana",
    fuente_url: "https://www.aciprensa.com/recursos/oraciones-a-la-virgen-de-guadalupe-2222"
  },
  "San Martín de Porres": {
    texto: `Glorioso San Martín de Porres, con toda la sinceridad de mi corazón te venero y te invoco.

Tú que desde niño manifestaste una humildad admirable, una caridad ardiente y una paciencia heroica, mira mis necesidades y escucha mi oración.

Ayúdame, San Martín, a ser humilde como tú, a amar a todos como hermanos, a servir a los más necesitados.

Tú que fuiste padre de los pobres, médico de los enfermos y consuelo de los afligidos, intercede por mí ante el Señor para que me conceda lo que te pido, si es para bien de mi alma.

San Martín de Porres, gloria de Lima y del Perú, honor de la Orden Dominicana, ruega por nosotros. Amén.`,
    fuente: "Oración Tradicional Dominicana",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-martin-de-porres-1693"
  },
  "Santa Rosa de Lima": {
    texto: `Señor y Dios nuestro, que hiciste arder en tu amor el corazón de Santa Rosa de Lima, Primera Flor de Santidad de América, y la condujiste por el camino de la penitencia y de la contemplación, concédenos, por su intercesión, la gracia de imitar sus virtudes y de gozar un día de su compañía en el cielo.

Santa Rosa de Lima, tú que desde niña elegiste a Jesús como único Esposo de tu alma, y renunciaste a todas las vanidades del mundo, ruega por nosotros para que también nosotros sepamos anteponer los bienes eternos a los pasajeros.

Flor hermosa del Jardín de la Iglesia, que perfumaste con tu santidad el Nuevo Mundo, alcánzanos del Señor la gracia de vivir santamente y morir en su gracia.

Por Cristo nuestro Señor. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-rosa-de-lima-1651"
  },
  "San Pío de Pietrelcina": {
    texto: `Padre Pío, tú que llevaste en tu cuerpo los estigmas de la Pasión de Cristo, intercede por nosotros ante el Señor.

Tú que pasaste largas horas en el confesionario reconciliando a los pecadores con Dios, ayúdanos a hacer buenas confesiones y a vivir en gracia de Dios.

Tú que ofreciste tus sufrimientos por la salvación de las almas, enséñanos a aceptar nuestras cruces con amor.

Tú que viviste intensamente la Santa Misa, ayúdanos a participar con devoción en el Santo Sacrificio.

Padre Pío, por tu intercesión, alcánzanos del Señor las gracias que necesitamos, especialmente (menciona tu petición), si es para gloria de Dios y bien de nuestras almas.

San Pío de Pietrelcina, ruega por nosotros. Amén.`,
    fuente: "Oración Tradicional Capuchina",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-pio-de-pietrelcina-1574"
  },
  "San Juan Pablo II": {
    texto: `Oh Trinidad Santa, te damos gracias por haber concedido a la Iglesia al Papa San Juan Pablo II, y porque en él hiciste resplandecer la ternura de tu paternidad, la gloria de la cruz de Cristo y el esplendor del Espíritu de amor.

Él, confiándose totalmente a tu misericordia y a la intercesión maternal de María, nos ha mostrado una imagen viva de Jesús Buen Pastor, indicándonos la santidad como medida de la vida cristiana ordinaria, como camino para alcanzar la comunión eterna contigo.

Concédenos, por su intercesión, y si es tu voluntad, el favor que imploramos, con la esperanza de que sea pronto incluido en el número de tus santos.

Amén.`,
    fuente: "Oración Oficial para la Canonización",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-juan-pablo-ii-4444"
  },
  "Santa María Magdalena": {
    texto: `Gloriosísima Santa María Magdalena, discípula fiel del Señor, tú que lloraste a los pies de Jesús y con tus lágrimas y ungüento precioso le honraste, intercede por nosotros pecadores.

Tú que fuiste la primera en ver al Señor Resucitado y la primera en anunciar la Buena Nueva de la Resurrección, alcánzanos la gracia de reconocer a Cristo en nuestra vida.

Tú que amaste mucho y por eso mucho se te perdonó, enséñanos a arrepentirnos de nuestros pecados y a amar con todo el corazón a Jesús.

Santa María Magdalena, apóstol de los apóstoles, ruega por nosotros para que también nosotros seamos testigos fieles del Resucitado. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-maria-magdalena-1635"
  },
  "San Juan Bautista": {
    texto: `Oh glorioso San Juan Bautista, precursor del Mesías y el más grande de los nacidos de mujer, tú que preparaste el camino del Señor predicando la penitencia, ayúdanos a convertirnos.

Tú que tuviste el privilegio de bautizar a Jesús en el Jordán y de verlo declarado Hijo de Dios, alcánzanos una fe viva en el Salvador.

Tú que diste testimonio de la verdad hasta derramar tu sangre, concédenos la gracia de ser valientes testigos del Evangelio.

San Juan Bautista, que tu voz que clama en el desierto resuene en nuestros corazones, para que preparemos dignamente el camino del Señor. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-juan-bautista-1603"
  },
  "San Pedro": {
    texto: `Gloriosísimo San Pedro, Príncipe de los Apóstoles, tú que recibiste de Cristo las llaves del Reino de los Cielos y el poder de atar y desatar, mira con bondad a la Iglesia que pastoreaste.

Tú que a pesar de tus debilidades permaneciste fiel hasta el martirio, alcánzanos la gracia de perseverar en la fe.

Tú que lloraste amargamente tu negación, enséñanos a arrepentirnos sinceramente de nuestros pecados.

San Pedro, roca sobre la cual Cristo edificó su Iglesia, ruega por el Papa, por los obispos y por todo el pueblo de Dios, para que permanezcamos unidos en la fe y en el amor. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-los-santos-apostoles-pedro-y-pablo-1525"
  },
  "San Pablo": {
    texto: `Glorioso San Pablo, apóstol de las gentes, vaso de elección para llevar el nombre de Cristo ante reyes y naciones, tú que sufriste prisiones, azotes, naufragios y toda clase de persecuciones por amor a Jesús, mira con bondad a nosotros tus devotos.

Tú que escribiste que nada puede separarnos del amor de Cristo, alcánzanos un amor ardiente al Señor.

Tú que combatiste el buen combate, terminaste la carrera y guardaste la fe, ayúdanos a perseverar hasta el fin.

San Pablo, doctor de las gentes, ilumina nuestras mentes con la luz del Evangelio y enciende nuestros corazones con el fuego del Espíritu Santo. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-los-santos-apostoles-pedro-y-pablo-1525"
  },
  "Santo Tomás de Aquino": {
    texto: `Creador inefable, que de los tesoros de tu sabiduría formaste tres jerarquías de ángeles, los colocaste sobre el empíreo con orden admirable y distribuiste las partes del universo con suma armonía: Tú, que eres la fuente de la luz y la sabiduría, dígnate derramar sobre las tinieblas de mi entendimiento un rayo de tu claridad, apartando de mí la doble oscuridad en que nací: la del pecado y la de la ignorancia.

Tú, que haces elocuentes las lenguas de los niños, instruye la mía y derrama en mis labios la gracia de tu bendición.

Concédeme agudeza para entender, capacidad para retener, método y facilidad para aprender, sutileza para interpretar y gracia abundante para hablar.

Instruye el comienzo, dirige el progreso y perfecciona el fin, Tú que eres verdadero Dios y verdadero Hombre, que vives y reinas por los siglos de los siglos. Amén.`,
    fuente: "Oración de Santo Tomás de Aquino para antes del estudio",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santo-tomas-de-aquino-1515"
  },
  "San Ignacio de Loyola": {
    texto: `Tomad, Señor, y recibid toda mi libertad, mi memoria, mi entendimiento y toda mi voluntad, todo mi haber y mi poseer.

Vos me lo disteis, a Vos, Señor, lo torno. Todo es vuestro: disponed de ello según vuestra voluntad.

Dadme vuestro amor y gracia, que esta me basta. Amén.`,
    fuente: "Oración de San Ignacio de Loyola (Sume et Suscipe)",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-ignacio-de-loyola-1622"
  },
  "Santa Teresa de Jesús": {
    texto: `Nada te turbe, nada te espante, todo se pasa, Dios no se muda, la paciencia todo lo alcanza. Quien a Dios tiene nada le falta: solo Dios basta.

Santa Teresa de Jesús, doctora de la Iglesia, maestra de oración, tú que anduviste por los caminos de España reformando el Carmelo y escribiendo páginas luminosas sobre la vida interior, enséñanos a orar.

Tú que experimentaste las moradas del castillo interior del alma, guíanos por el camino de la perfección hacia la unión con Dios.

Santa Teresa, ruega por nosotros para que busquemos siempre a Dios y encontremos en Él nuestra paz y nuestra alegría. Amén.`,
    fuente: "Oración de Santa Teresa (Nada te turbe)",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-teresa-de-jesus-1683"
  },
  "Santa Teresa de Lisieux": {
    texto: `Santa Teresita del Niño Jesús, durante tu breve vida en la tierra llegaste a ser espejo de pureza angelical, de amor fuerte como la muerte, y de entrega generosa a Dios.

Ahora que gozas del premio de tus virtudes, vuelve hacia nosotros tus ojos misericordiosos. Obtennos la gracia de conservar nuestros corazones tan puros, que merezcamos un día contemplar la faz del Dios de la Majestad infinita.

Santa Teresita, tú que prometiste pasar tu cielo haciendo bien sobre la tierra, derrama sobre nosotros, desde el cielo, esa lluvia de rosas que prometiste.

Pequeña flor del Carmelo, enséñanos tu caminito de infancia espiritual, de confianza y de abandono total en los brazos del Padre. Amén.`,
    fuente: "Oración Tradicional Carmelita",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-teresita-del-nino-jesus-1524"
  },
  "San Expedito": {
    texto: `Glorioso San Expedito, mártir de Cristo, tú que aplastaste al demonio con la cruz en tu mano y pronunciaste la palabra "¡HODIE!" (¡HOY!), no dejándolo para mañana.

Por tu valor y decisión, te pido que intercedas por mí ante Dios Todopoderoso para que me conceda prontamente la gracia que necesito: (hacer la petición).

San Expedito, tú que nunca dejaste para mañana lo que podías hacer hoy, ayúdame a no postergar mi conversión, mi oración, mi servicio a los demás.

Mártir valiente, ayúdame a tomar decisiones firmes y a actuar con prontitud en el servicio de Dios y del prójimo. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-expedito-1538"
  },
  "San Cayetano": {
    texto: `¡Oh glorioso San Cayetano!, aclamado por todos los pueblos como Padre de la Providencia, yo me presento ante ti lleno de fe y de esperanza.

Tú que nunca dejaste de socorrer a los necesitados, no me abandones en mis necesidades presentes. Alcánzame del Señor el trabajo honrado, el pan de cada día, la salud del cuerpo y del alma.

San Cayetano, fundador de los Teatinos, modelo de confianza en la divina Providencia, enséñame a poner toda mi esperanza en Dios, que cuida de las aves del cielo y viste a los lirios del campo.

Padre de los pobres, alcánzame la gracia de ser generoso con los más necesitados, como tú lo fuiste. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-cayetano-1645"
  },
  "San Gabriel Arcángel": {
    texto: `¡Oh San Gabriel Arcángel!, ángel de la Encarnación, tú que tuviste el privilegio de anunciar a María la venida del Hijo de Dios, te pido que intercedas por mí.

Tú que llevaste a la Virgen el mensaje más sublime de la historia, ayúdame a escuchar la voz de Dios y a responder con fe como María.

San Gabriel, mensajero de buenas noticias, lleva mis oraciones ante el trono de Dios y alcánzame las gracias que necesito.

Ángel de la Anunciación, que tu saludo "Ave María, llena de gracia" resuene siempre en mi corazón. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-gabriel-arcangel-1578"
  },
  "San Rafael Arcángel": {
    texto: `Glorioso San Rafael Arcángel, guía de caminantes, medicina de Dios, tú que acompañaste a Tobías en su viaje y le devolviste la salud a su padre, sé mi guía y mi protector.

Tú que revelaste tu nombre como "Medicina de Dios", sana las enfermedades de mi cuerpo y de mi alma.

San Rafael, ángel custodio de los peregrinos, guíame por el camino de la vida hasta llegar a la patria celestial.

Compañero fiel del joven Tobías, acompáñame en todos mis caminos, defiéndeme de los peligros y condúceme a la casa del Padre. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-rafael-arcangel-1579"
  },
  "Santa Lucía": {
    texto: `Gloriosísima Santa Lucía, virgen y mártir, tú que preferiste perder los ojos antes que negar tu fe en Cristo, escucha nuestra humilde oración.

Tú que iluminaste el camino de la fe con tu testimonio de vida, ilumina nuestras mentes para conocer la verdad y nuestros corazones para amar el bien.

Santa Lucía, patrona de los ciegos y protectora de la vista, cuida nuestros ojos corporales, pero sobre todo, danos ojos de fe para ver la luz de Cristo.

Virgen de Siracusa, que tu luz brille en nuestras tinieblas y nos guíe hacia la Luz verdadera. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-lucia-1713"
  },
  "San Blas": {
    texto: `Glorioso San Blas, obispo y mártir, tú que recibiste de Dios el don de curar las enfermedades de la garganta, intercede por nosotros.

Por tu intercesión, el niño que se ahogaba con una espina de pescado fue salvado. Te pedimos que nos protejas de toda enfermedad de la garganta y nos concedas la salud del cuerpo y del alma.

San Blas, médico de las gargantas, cura nuestras voces para que podamos cantar las alabanzas del Señor.

Mártir glorioso, que tu bendición descienda sobre nosotros y nos preserve de todo mal. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-blas-1505"
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { saintName, importAll, limit } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: Array<{ saint: string; status: string; message: string }> = [];

    if (importAll) {
      // Import all available traditional prayers
      const saintsToImport = Object.keys(TRADITIONAL_PRAYERS_DATA).slice(0, limit || 50);

      for (const saint of saintsToImport) {
        try {
          const prayerData = TRADITIONAL_PRAYERS_DATA[saint];

          // Check if saint exists in calendar_saints
          const { data: saintRecord } = await supabase
            .from('calendar_saints')
            .select('id, name, prayer_id')
            .ilike('name', `%${saint}%`)
            .maybeSingle();

          if (!saintRecord) {
            results.push({ saint, status: 'skipped', message: 'Santo no encontrado en calendario' });
            continue;
          }

          // Check if prayer already exists for this saint
          if (saintRecord.prayer_id) {
            // Update existing prayer to traditional
            const { error: updateError } = await supabase
              .from('oraciones')
              .update({
                texto: prayerData.texto,
                fuente: prayerData.fuente,
                fuente_url: prayerData.fuente_url,
                es_tradicional: true,
                tagline: 'Oración tradicional de la Iglesia Católica'
              })
              .eq('id', saintRecord.prayer_id);

            if (updateError) throw updateError;
            results.push({ saint, status: 'updated', message: 'Oración actualizada a tradicional' });
          } else {
            // Create new traditional prayer
            const { data: newPrayer, error: insertError } = await supabase
              .from('oraciones')
              .insert({
                nombre: `Oración a ${saint}`,
                texto: prayerData.texto,
                categoria: 'santos',
                fuente: prayerData.fuente,
                fuente_url: prayerData.fuente_url,
                es_tradicional: true,
                tagline: 'Oración tradicional de la Iglesia Católica'
              })
              .select('id')
              .single();

            if (insertError) throw insertError;

            // Link prayer to saint
            const { error: linkError } = await supabase
              .from('calendar_saints')
              .update({ prayer_id: newPrayer.id })
              .eq('id', saintRecord.id);

            if (linkError) throw linkError;
            results.push({ saint, status: 'created', message: 'Oración tradicional creada y vinculada' });
          }
        } catch (err) {
          results.push({ saint, status: 'error', message: String(err) });
        }
      }
    } else if (saintName) {
      // Import single saint prayer
      const prayerData = TRADITIONAL_PRAYERS_DATA[saintName];
      
      if (!prayerData) {
        return new Response(
          JSON.stringify({ 
            error: 'No hay oración tradicional disponible para este santo',
            available_saints: Object.keys(TRADITIONAL_PRAYERS_DATA)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Find saint in database
      const { data: saintRecord } = await supabase
        .from('calendar_saints')
        .select('id, name, prayer_id')
        .ilike('name', `%${saintName}%`)
        .maybeSingle();

      if (!saintRecord) {
        return new Response(
          JSON.stringify({ error: 'Santo no encontrado en el calendario' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      if (saintRecord.prayer_id) {
        // Update existing prayer
        const { error } = await supabase
          .from('oraciones')
          .update({
            texto: prayerData.texto,
            fuente: prayerData.fuente,
            fuente_url: prayerData.fuente_url,
            es_tradicional: true,
            tagline: 'Oración tradicional de la Iglesia Católica'
          })
          .eq('id', saintRecord.prayer_id);

        if (error) throw error;
        results.push({ saint: saintName, status: 'updated', message: 'Oración actualizada' });
      } else {
        // Create new prayer
        const { data: newPrayer, error: insertError } = await supabase
          .from('oraciones')
          .insert({
            nombre: `Oración a ${saintName}`,
            texto: prayerData.texto,
            categoria: 'santos',
            fuente: prayerData.fuente,
            fuente_url: prayerData.fuente_url,
            es_tradicional: true,
            tagline: 'Oración tradicional de la Iglesia Católica'
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Link to saint
        await supabase
          .from('calendar_saints')
          .update({ prayer_id: newPrayer.id })
          .eq('id', saintRecord.id);

        results.push({ saint: saintName, status: 'created', message: 'Oración creada y vinculada' });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          total: results.length,
          created: results.filter(r => r.status === 'created').length,
          updated: results.filter(r => r.status === 'updated').length,
          skipped: results.filter(r => r.status === 'skipped').length,
          errors: results.filter(r => r.status === 'error').length
        },
        available_saints: Object.keys(TRADITIONAL_PRAYERS_DATA)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error importing traditional prayers:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
