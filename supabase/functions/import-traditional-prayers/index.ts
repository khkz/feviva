import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Oraciones tradicionales precargadas (extraídas de ACI Prensa, EWTN, Corazones.org y fuentes oficiales)
const TRADITIONAL_PRAYERS_DATA: Record<string, { texto: string; fuente: string; fuente_url: string }> = {
  // ========== ARCÁNGELES ==========
  "San Miguel Arcángel": {
    texto: `San Miguel Arcángel, defiéndenos en la batalla. Sé nuestro amparo contra la perversidad y asechanzas del demonio. Reprímale Dios, pedimos suplicantes, y tú, Príncipe de la Milicia Celestial, arroja al infierno con el divino poder a Satanás y a los otros espíritus malignos que andan dispersos por el mundo para la perdición de las almas. Amén.`,
    fuente: "León XIII - Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-miguel-arcangel-1577"
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

  // ========== LOS 12 APÓSTOLES ==========
  "San Pedro": {
    texto: `Gloriosísimo San Pedro, Príncipe de los Apóstoles, tú que recibiste de Cristo las llaves del Reino de los Cielos y el poder de atar y desatar, mira con bondad a la Iglesia que pastoreaste.

Tú que a pesar de tus debilidades permaneciste fiel hasta el martirio, alcánzanos la gracia de perseverar en la fe.

Tú que lloraste amargamente tu negación, enséñanos a arrepentirnos sinceramente de nuestros pecados.

San Pedro, roca sobre la cual Cristo edificó su Iglesia, ruega por el Papa, por los obispos y por todo el pueblo de Dios, para que permanezcamos unidos en la fe y en el amor. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/pedro_apostol.htm"
  },
  "San Pablo": {
    texto: `Glorioso San Pablo, apóstol de las gentes, vaso de elección para llevar el nombre de Cristo ante reyes y naciones, tú que sufriste prisiones, azotes, naufragios y toda clase de persecuciones por amor a Jesús, mira con bondad a nosotros tus devotos.

Tú que escribiste que nada puede separarnos del amor de Cristo, alcánzanos un amor ardiente al Señor.

Tú que combatiste el buen combate, terminaste la carrera y guardaste la fe, ayúdanos a perseverar hasta el fin.

San Pablo, doctor de las gentes, ilumina nuestras mentes con la luz del Evangelio y enciende nuestros corazones con el fuego del Espíritu Santo. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/pablo_apostol.htm"
  },
  "San Andrés": {
    texto: `Glorioso San Andrés Apóstol, tú que fuiste el primero en seguir a Jesús y llevaste a tu hermano Pedro hasta Él, ayúdanos a reconocer al Cordero de Dios.

Tú que abrazaste la cruz en forma de X y la besaste con amor, diciendo que desde hacía mucho tiempo la deseabas, danos fortaleza para cargar nuestra cruz.

Apóstol de Grecia y Patrono de Escocia, tú que predicaste el Evangelio hasta dar tu vida, intercede por nosotros para que seamos valientes testigos de Cristo.

San Andrés, primer llamado del Señor, condúcenos a Jesús como condujiste a tu hermano. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/andres-apostol-15153"
  },
  "Santiago el Mayor": {
    texto: `Glorioso Apóstol Santiago, hijo del trueno y patrono de España, tú que bebiste el cáliz del Señor y fuiste el primer apóstol mártir, fortalécenos en las tribulaciones.

Tú que según la tradición predicaste en Hispania antes de tu martirio, bendice a España y a todos los pueblos que invocan tu patrocinio.

Santiago Apóstol, peregrino de los caminos de Dios, acompáñanos en nuestra peregrinación terrenal hacia la Jerusalén celestial.

Glorioso Santiago, patrón de los peregrinos, guíanos por el camino de la fe hasta alcanzar la corona de la gloria. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/santiago_mayor.htm"
  },
  "San Juan Apóstol": {
    texto: `Glorioso San Juan Apóstol y Evangelista, el discípulo amado que reclinó su cabeza sobre el pecho de Jesús en la Última Cena, enséñanos a amar como tú amaste.

Tú que recibiste a María como Madre al pie de la cruz, ayúdanos a acogerla también en nuestros corazones.

Águila de Patmos, tú que escribiste el Evangelio del amor y contemplaste los misterios del Apocalipsis, eleva nuestros corazones a las cosas celestiales.

San Juan, apóstol de la caridad, danos un corazón puro para ver a Dios y un amor ardiente para servirle en los hermanos. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/juan-apostol-evangelista-15164"
  },
  "Santo Tomás Apóstol": {
    texto: `Glorioso Santo Tomás Apóstol, tú que tocaste las llagas del Señor Resucitado y exclamaste "¡Señor mío y Dios mío!", fortalece nuestra fe.

Tú que dudaste para que nosotros creyéramos, ayúdanos a superar nuestras dudas y a creer sin haber visto.

Apóstol de la India, tú que llevaste el Evangelio hasta los confines de la tierra, danos celo misionero.

Santo Tomás, que tu confesión de fe sea también la nuestra: Señor mío y Dios mío, creo en Ti, aumento mi fe. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/tomas_apostol.htm"
  },
  "Santiago el Menor": {
    texto: `Glorioso Santiago el Menor, Apóstol del Señor y primer obispo de Jerusalén, tú que fuiste llamado "el Justo" por tu santidad de vida, ayúdanos a vivir justamente.

Tú que escribiste la epístola que nos enseña que la fe sin obras está muerta, danos una fe viva y operante.

Pariente del Señor según la carne, tú que presidiste la Iglesia madre de Jerusalén, intercede por la unidad de todos los cristianos.

Santiago hermano del Señor, que tu ejemplo de santidad y martirio nos inspire a vivir y morir por Cristo. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/santiago-el-menor-apostol-15171"
  },
  "San Felipe Apóstol": {
    texto: `Glorioso San Felipe Apóstol, tú que llevaste a Natanael hasta Jesús diciéndole "Ven y verás", ayúdanos a conducir almas a Cristo.

Tú que pediste al Señor "Muéstranos al Padre y nos basta", profundiza en nosotros el conocimiento del Padre.

Apóstol evangelizador, tú que predicaste el Evangelio en Asia Menor hasta el martirio, danos valor para anunciar a Cristo.

San Felipe, que tu ardor apostólico nos contagie y seamos también nosotros portadores de la Buena Nueva. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/felipe_apostol.htm"
  },
  "San Bartolomé": {
    texto: `Glorioso San Bartolomé Apóstol, llamado también Natanael, tú a quien Jesús elogió como "un israelita en quien no hay engaño", danos un corazón sincero.

Tú que confesaste a Jesús como Hijo de Dios y Rey de Israel, aumenta nuestra fe.

Apóstol mártir, desollado vivo por confesar a Cristo, danos fortaleza para mantenernos fieles hasta el fin.

San Bartolomé, patrono de los curtidores, que tu ejemplo de integridad y valor nos inspire a vivir sin doblez ante Dios. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/bartolome-apostol-15157"
  },
  "San Mateo": {
    texto: `Glorioso San Mateo Apóstol y Evangelista, tú que dejaste la mesa del cobro de impuestos para seguir a Jesús, danos prontitud para responder a la llamada de Dios.

Tú que escribiste el Evangelio para mostrar que Jesús es el Mesías prometido, ayúdanos a reconocerlo en las Sagradas Escrituras.

Publicano convertido en apóstol, tú que experimentaste la misericordia de Cristo que come con pecadores, danos la gracia de la conversión.

San Mateo, que tu pluma inspirada siga iluminando a la Iglesia, y que nosotros, como tú, dejemos todo para seguir a Jesús. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/mateo_apostol.htm"
  },
  "San Simón": {
    texto: `Glorioso San Simón el Zelote, apóstol del Señor, tú que ardías de celo por la ley de Dios antes de conocer a Cristo, enciende en nosotros el fuego del Espíritu Santo.

Tú que junto con San Judas Tadeo predicaste el Evangelio en Persia hasta el martirio, danos valentía apostólica.

Apóstol celoso, que tu amor apasionado por Cristo transforme nuestro tibio corazón.

San Simón, que junto con San Judas Tadeo, tu compañero en el apostolado y en el martirio, intercedas por nosotros ante el trono de Dios. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/simon-y-judas-apostoles-15184"
  },
  "San Judas Tadeo": {
    texto: `¡Oh gloriosísimo Apóstol San Judas Tadeo!, siervo fiel y amigo de Jesús, el nombre del traidor que entregó a tu amado Maestro en manos de sus enemigos ha sido la causa de que muchos te hayan olvidado; pero la Iglesia te honra e invoca universalmente como patrón de los casos difíciles y desesperados.

Ruega por mí que soy tan miserable; haz uso, te lo ruego, de ese privilegio especial a ti concedido de socorrer pronta y visiblemente cuando casi se ha perdido toda esperanza.

Ven en mi ayuda en esta gran necesidad para que reciba los consuelos y socorro del cielo en todas mis tribulaciones y angustias, particularmente (aquí se hace la petición) y para que pueda alabar a Dios contigo y con todos los elegidos por toda la eternidad.

Te prometo, oh bienaventurado San Judas, acordarme siempre de este gran favor, y nunca dejar de honrarte como mi especial y poderoso protector y hacer cuanto esté a mi alcance para fomentar tu devoción. Amén.`,
    fuente: "Oración Tradicional - ACI Prensa",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-judas-tadeo-1687"
  },
  "San Matías": {
    texto: `Glorioso San Matías Apóstol, elegido por la suerte divina para ocupar el lugar de Judas entre los Doce, obtén para nosotros la gracia de ser fieles a nuestra vocación.

Tú que acompañaste a Jesús desde el bautismo de Juan hasta la Ascensión, ayúdanos a ser testigos de la Resurrección.

Apóstol fiel, que completaste el número de los Doce, intercede por la Iglesia para que nunca falten ministros santos.

San Matías, que tu ejemplo de fidelidad y servicio nos inspire a ocupar el lugar que Dios nos ha asignado en su Iglesia. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/matias_apostol.htm"
  },

  // ========== DOCTORES DE LA IGLESIA ==========
  "Santo Tomás de Aquino": {
    texto: `Creador inefable, que de los tesoros de tu sabiduría formaste tres jerarquías de ángeles, los colocaste sobre el empíreo con orden admirable y distribuiste las partes del universo con suma armonía: Tú, que eres la fuente de la luz y la sabiduría, dígnate derramar sobre las tinieblas de mi entendimiento un rayo de tu claridad, apartando de mí la doble oscuridad en que nací: la del pecado y la de la ignorancia.

Tú, que haces elocuentes las lenguas de los niños, instruye la mía y derrama en mis labios la gracia de tu bendición.

Concédeme agudeza para entender, capacidad para retener, método y facilidad para aprender, sutileza para interpretar y gracia abundante para hablar.

Instruye el comienzo, dirige el progreso y perfecciona el fin, Tú que eres verdadero Dios y verdadero Hombre, que vives y reinas por los siglos de los siglos. Amén.`,
    fuente: "Oración de Santo Tomás de Aquino para antes del estudio",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santo-tomas-de-aquino-1515"
  },
  "San Agustín": {
    texto: `Tarde te amé, Hermosura tan antigua y tan nueva, tarde te amé. Tú estabas dentro de mí y yo afuera, y por fuera te buscaba; y deforme como era, me lanzaba sobre estas cosas hermosas que Tú creaste.

Tú estabas conmigo, mas yo no estaba contigo. Me retenían lejos de Ti aquellas cosas que, si no estuviesen en Ti, no serían.

Llamaste y clamaste, y rompiste mi sordera; brillaste y resplandeciste, y fugaste mi ceguera; exhalaste tu perfume, y respiré, y suspiro por Ti; gusté de Ti, y siento hambre y sed; me tocaste, y me abrasé en tu paz.

San Agustín, Doctor de la Gracia, ruega por nosotros para que encontremos en Dios el descanso de nuestro inquieto corazón. Amén.`,
    fuente: "Confesiones de San Agustín - Libro X",
    fuente_url: "https://www.corazones.org/santos/agustin_hipona.htm"
  },
  "San Jerónimo": {
    texto: `Glorioso San Jerónimo, Doctor de la Iglesia, tú que dedicaste tu vida a traducir y estudiar las Sagradas Escrituras, danos amor a la Palabra de Dios.

Tú que viviste como ermitaño en Belén junto al pesebre del Señor, enséñanos a desprendernos del mundo.

Traductor de la Vulgata, tu obra ha alimentado a la Iglesia durante siglos; que tu ejemplo nos inspire a profundizar en las Escrituras.

San Jerónimo, que dijo "Desconocer las Escrituras es desconocer a Cristo", danos hambre de la Palabra de Dios y sed de la verdad eterna. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/jeronimo.htm"
  },
  "San Ambrosio": {
    texto: `Glorioso San Ambrosio, obispo de Milán y Doctor de la Iglesia, tú que con tu predicación convertiste a San Agustín, alcánzanos la gracia de la conversión.

Tú que defendiste la fe católica contra los arrianos y enseñaste a cantar himnos al Señor, danos fortaleza en la fe.

Patrono de los apicultores, tú cuya elocuencia era dulce como la miel, endulza nuestros labios para alabar a Dios.

San Ambrosio, que tu ejemplo de pastor valiente inspire a los obispos de hoy a defender la verdad sin temor. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/ambrosio-15151"
  },
  "San Gregorio Magno": {
    texto: `Glorioso San Gregorio Magno, Papa y Doctor de la Iglesia, tú que enviaste misioneros a Inglaterra y reformaste la liturgia, ruega por la Iglesia.

Tú que siendo monje llegaste al pontificado por la divina Providencia, enséñanos a aceptar la voluntad de Dios.

Padre del canto gregoriano, que tu música sagrada eleve nuestras almas a Dios.

San Gregorio, pastor de pastores, intercede por el Papa y por todos los obispos para que guíen al pueblo de Dios con sabiduría y santidad. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/gregorio_magno.htm"
  },
  "San Atanasio": {
    texto: `Glorioso San Atanasio, Padre y Doctor de la Iglesia, tú que defendiste la divinidad de Cristo contra los arrianos hasta el exilio, fortalece nuestra fe.

Cinco veces desterrado por confesar que el Hijo es consubstancial al Padre, danos valor para defender la verdad.

Columna de la ortodoxia, pilar de la Iglesia de Alejandría, que tu ejemplo nos inspire a mantenernos firmes en la fe de Nicea.

San Atanasio contra mundum, tú solo contra el mundo, enséñanos que la verdad no depende del número sino de Dios. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/atanasio-15155"
  },
  "San Basilio Magno": {
    texto: `Glorioso San Basilio Magno, obispo de Cesarea y Doctor de la Iglesia, tú que organizaste la vida monástica en Oriente y defendiste la divinidad del Espíritu Santo, ilumínanos.

Padre de los pobres, tú que fundaste la Basiliada para atender a los necesitados, danos caridad con los más pobres.

Liturgo de la Iglesia Oriental, que tu anáfora siga elevando las almas a Dios.

San Basilio, que junto con San Gregorio Nacianceno y San Gregorio de Nisa, los Padres Capadocios, intercedas por la unidad de las Iglesias de Oriente y Occidente. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/basilio_magno.htm"
  },
  "San Gregorio Nacianceno": {
    texto: `Glorioso San Gregorio Nacianceno, el Teólogo, Doctor de la Iglesia, tú que con tu elocuencia defendiste la fe de Nicea, ilumina nuestro entendimiento.

Obispo de Constantinopla, poeta de lo divino, que tus versos sobre la Trinidad enciendan nuestro amor a Dios.

Padre Capadocio, amigo de San Basilio desde la juventud, enséñanos el valor de la amistad santa.

San Gregorio, que tu teología contemplativa nos eleve a contemplar los misterios de Dios. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/gregorio-nacianceno-15161"
  },
  "San Juan Crisóstomo": {
    texto: `Glorioso San Juan Crisóstomo, boca de oro, Doctor de la Iglesia, tú cuya predicación conmovía al pueblo de Antioquía y Constantinopla, danos elocuencia para anunciar el Evangelio.

Patriarca de Constantinopla, exiliado por defender la verdad y la justicia, danos fortaleza en la adversidad.

Autor de la Divina Liturgia que lleva tu nombre, que tu eucaristía siga alimentando a la Iglesia.

San Juan Crisóstomo, patrono de los predicadores, que tus homilías sigan resonando en los corazones de los fieles. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/juan_crisostomo.htm"
  },
  "San Cirilo de Alejandría": {
    texto: `Glorioso San Cirilo de Alejandría, Doctor de la Iglesia, tú que defendiste la maternidad divina de María en el Concilio de Éfeso, aumenta nuestra devoción a la Madre de Dios.

Theotokos: María es Madre de Dios. Este título que proclamaste sigue siendo la confesión de fe de la Iglesia.

Defensor de la unidad de Cristo, una Persona en dos naturalezas, profundiza en nosotros el conocimiento del misterio de la Encarnación.

San Cirilo, que tu teología cristológica siga iluminando a la Iglesia para que confesemos rectamente a Cristo verdadero Dios y verdadero hombre. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/cirilo-de-alejandria-15159"
  },
  "San Hilario de Poitiers": {
    texto: `Glorioso San Hilario de Poitiers, Atanasio de Occidente, tú que combatiste el arrianismo en la Galia, defiende la fe de la Iglesia.

Doctor de la Iglesia, exiliado por el emperador Constancio, tú que preferiste el destierro a la herejía, danos valor.

Obispo de Poitiers, padre de la fe gala, que tu ejemplo inspire a los obispos de Francia.

San Hilario, que tu tratado sobre la Trinidad siga iluminando a los fieles en el conocimiento del Dios uno y trino. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/hilario_poitiers.htm"
  },
  "San Isidoro de Sevilla": {
    texto: `Glorioso San Isidoro de Sevilla, último Padre de la Iglesia occidental, tú que compilaste el saber de tu tiempo en las Etimologías, danos amor al conocimiento.

Arzobispo de Sevilla, reformador de la Iglesia visigoda, presidiste el IV Concilio de Toledo. Que tu sabiduría guíe a la Iglesia en España.

Patrono de internet, tú que quisiste hacer accesible el conocimiento, ayúdanos a usar la tecnología para el bien.

San Isidoro, enciclopedista de la fe, que tu erudición siga sirviendo a la Iglesia para transmitir la verdad. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/isidoro-de-sevilla-15163"
  },
  "San Beda el Venerable": {
    texto: `Glorioso San Beda el Venerable, Doctor de la Iglesia, historiador de la Iglesia inglesa, tú que pasaste tu vida estudiando, enseñando y escribiendo, danos amor al estudio.

Monje de Jarrow, que nunca dejaste tu monasterio, enséñanos a encontrar a Dios en la vida ordinaria.

Padre de la historia inglesa, tú que calculaste la fecha de la Pascua, que tu ciencia siga sirviendo a la Iglesia.

San Beda, que moriste dictando una traducción del Evangelio de San Juan, danos perseverancia en el servicio a Dios hasta el último aliento. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/beda_venerable.htm"
  },
  "San Pedro Damián": {
    texto: `Glorioso San Pedro Damián, Doctor de la Iglesia, reformador del clero, tú que combatiste la simonía y el nicolaísmo, purifica a la Iglesia.

Ermitaño de Fonte Avellana, cardenal obispo de Ostia, que tu vida de penitencia nos inspire a la conversión.

Doctor de la reforma gregoriana, tú que escribiste contra los vicios del clero, intercede por la santidad de los sacerdotes.

San Pedro Damián, que tu celo por la reforma de la Iglesia siga ardiendo en los corazones de los fieles. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/pedro-damian-15176"
  },
  "San Anselmo": {
    texto: `Glorioso San Anselmo, Doctor de la Iglesia, padre de la escolástica, tú que buscabas entender lo que creías, danos una fe que busca comprender.

Arzobispo de Canterbury, exiliado dos veces por defender la libertad de la Iglesia, danos fortaleza.

Autor del argumento ontológico, tú que definiste a Dios como "aquello mayor que lo cual nada puede pensarse", eleva nuestras mentes a contemplar al Altísimo.

San Anselmo, "fides quaerens intellectum", que tu método teológico siga iluminando a la Iglesia. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/anselmo_canterbury.htm"
  },
  "San Bernardo de Claraval": {
    texto: `Glorioso San Bernardo de Claraval, Doctor de la Iglesia, Melífluo Doctor, tú cuyas palabras eran dulces como la miel, endulza nuestros labios para alabar a Dios.

Fundador de Claraval, predicador de la Segunda Cruzada, defensor de la fe contra las herejías, guíanos por el camino de la verdad.

Cantor de María, tú que escribiste bellísimas páginas sobre la Virgen, aumenta nuestra devoción a la Madre de Dios.

San Bernardo, padre del Císter, que tu amor a Cristo crucificado inflame nuestros corazones. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/bernardo-de-claraval-15158"
  },
  "San Antonio de Padua": {
    texto: `¡Oh glorioso San Antonio, escogido por Dios para predicar su palabra!, tú que siempre estás dispuesto a ayudar a los que te invocan, ven en mi auxilio.

Tú, que encontraste al Niño Jesús, ayúdame a encontrar la gracia de Dios. Tú, que abrazaste al Niño Jesús, ayúdame a abrazar su voluntad. Tú, que fuiste tan devoto del Santísimo Sacramento, ayúdame a recibir dignamente la Sagrada Comunión.

Por tu intercesión, que he merecido tantos favores del Señor, ayúdame en mis necesidades actuales (menciona tu petición).

¡Oh glorioso San Antonio!, gloria del pueblo cristiano, honor de la Orden Seráfica, santuario de la bondad y la misericordia, oye nuestras plegarias y alcánzanos las gracias que humildemente solicitamos. Amén.`,
    fuente: "Oración Tradicional Franciscana",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-antonio-de-padua-1519"
  },
  "San Buenaventura": {
    texto: `Glorioso San Buenaventura, Doctor Seráfico, tú que uniste la teología con la mística, eleva nuestros corazones a Dios.

General de los Franciscanos, Cardenal de la Iglesia, que tu humildad y sabiduría guíen a los superiores.

Autor del Itinerario de la mente hacia Dios, condúcenos por el camino que lleva a la contemplación del Altísimo.

San Buenaventura, que dijiste "para conocer a Dios es necesario la humildad más que la ciencia", danos un corazón humilde que busque a Dios. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/buenaventura.htm"
  },
  "San Alberto Magno": {
    texto: `Glorioso San Alberto Magno, Doctor Universal, maestro de Santo Tomás de Aquino, tú que dominabas todas las ciencias, danos amor al conocimiento.

Obispo de Ratisbona, dominico ilustre, patrono de los científicos, que tu ejemplo reconcilie la fe y la razón.

Tú que estudiaste la naturaleza para conocer mejor al Creador, enséñanos a ver la huella de Dios en la creación.

San Alberto, Doctor de la Iglesia, que tu universalidad de saber siga inspirando a los científicos católicos. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/alberto-magno-15149"
  },
  "Santa Teresa de Jesús": {
    texto: `Nada te turbe, nada te espante, todo se pasa, Dios no se muda, la paciencia todo lo alcanza. Quien a Dios tiene nada le falta: solo Dios basta.

Santa Teresa de Jesús, doctora de la Iglesia, maestra de oración, tú que anduviste por los caminos de España reformando el Carmelo y escribiendo páginas luminosas sobre la vida interior, enséñanos a orar.

Tú que experimentaste las moradas del castillo interior del alma, guíanos por el camino de la perfección hacia la unión con Dios.

Santa Teresa, ruega por nosotros para que busquemos siempre a Dios y encontremos en Él nuestra paz y nuestra alegría. Amén.`,
    fuente: "Oración de Santa Teresa (Nada te turbe)",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-teresa-de-jesus-1683"
  },
  "San Juan de la Cruz": {
    texto: `En una noche oscura, con ansias en amores inflamada, ¡oh dichosa ventura!, salí sin ser notada, estando ya mi casa sosegada.

San Juan de la Cruz, Doctor Místico, poeta del amor divino, tú que describiste la noche oscura del alma, acompáñanos en nuestras noches de fe.

Reformador del Carmelo junto con Santa Teresa, tú que subiste al Monte Carmelo de la perfección, ayúdanos a escalar la montaña de la santidad.

San Juan, enséñanos que para llegar a lo que no sabemos, hemos de ir por donde no sabemos; que la noche de la fe conduce a la aurora del encuentro con Dios. Amén.`,
    fuente: "Noche Oscura - San Juan de la Cruz",
    fuente_url: "https://www.corazones.org/santos/juan_cruz.htm"
  },
  "San Pedro Canisio": {
    texto: `Glorioso San Pedro Canisio, Doctor de la Iglesia, segundo apóstol de Alemania, tú que con tu catecismo instrujiste a generaciones de católicos, enséñanos la doctrina.

Jesuita ilustre, defensor de la fe en tiempos de la Reforma, danos celo por la verdad católica.

Tú que escribiste que "María era Madre de Dios, la más grande de las santas", aumenta nuestra devoción mariana.

San Pedro Canisio, patrono de la catequesis, que tu catecismo siga formando católicos fieles. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/pedro-canisio-15177"
  },
  "San Roberto Belarmino": {
    texto: `Glorioso San Roberto Belarmino, Doctor de la Iglesia, defensor de la fe católica contra los errores de la Reforma, ilumina nuestras mentes.

Cardenal, arzobispo, maestro de San Luis Gonzaga, tú que disputabas con humildad y caridad, enséñanos a dialogar con los que piensan diferente.

Autor de las Controversias, tú que con argumentos sólidos defendiste la fe, fortalece nuestra apologética.

San Roberto, patrono de los catequistas, que tu erudición siga sirviendo a la Iglesia. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/roberto_belarmino.htm"
  },
  "San Lorenzo de Brindis": {
    texto: `Glorioso San Lorenzo de Brindis, Doctor de la Iglesia, capuchino políglota, tú que predicabas en muchas lenguas, danos elocuencia para anunciar el Evangelio.

Tú que encabezaste las tropas católicas contra los turcos portando solo un crucifijo, danos valor en la batalla espiritual.

Maestro de la Sagrada Escritura, tú que la comentabas con profundidad y unción, danos amor a la Palabra de Dios.

San Lorenzo, que tu celo apostólico inflame nuestros corazones para la misión. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/lorenzo-de-brindis-15165"
  },
  "San Francisco de Sales": {
    texto: `Glorioso San Francisco de Sales, Doctor del Amor Divino, patrono de escritores y periodistas, tú que con dulzura ganaste almas para Cristo, danos mansedumbre.

Obispo de Ginebra, apóstol del Chablais, tú que convertiste a miles de calvinistas con panfletos y predicación suave, enséñanos la apologética del amor.

Fundador de la Visitación con Santa Juana de Chantal, autor de la Introducción a la Vida Devota, guíanos por el camino de la devoción.

San Francisco de Sales, que dijiste "se cazan más moscas con una gota de miel que con un barril de vinagre", danos la dulzura de Cristo. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/francisco_sales.htm"
  },
  "San Alfonso María de Ligorio": {
    texto: `Glorioso San Alfonso María de Ligorio, Doctor de la Iglesia, fundador de los Redentoristas, patrono de confesores y moralistas, guíanos por el camino de la salvación.

Tú que dejaste la abogacía para ser sacerdote y misionero, danos generosidad en la vocación.

Cantor de María, autor de las Glorias de María, aumenta nuestra devoción a la Virgen.

San Alfonso, que escribiste que "quien ora se salva", enséñanos a orar siempre y a confiar en la misericordia de Dios. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/alfonso-maria-de-ligorio-15150"
  },
  "Santa Teresa de Lisieux": {
    texto: `Santa Teresita del Niño Jesús, durante tu breve vida en la tierra llegaste a ser espejo de pureza angelical, de amor fuerte como la muerte, y de entrega generosa a Dios.

Ahora que gozas del premio de tus virtudes, vuelve hacia nosotros tus ojos misericordiosos. Obtennos la gracia de conservar nuestros corazones tan puros, que merezcamos un día contemplar la faz del Dios de la Majestad infinita.

Santa Teresita, tú que prometiste pasar tu cielo haciendo bien sobre la tierra, derrama sobre nosotros, desde el cielo, esa lluvia de rosas que prometiste.

Pequeña flor del Carmelo, enséñanos tu caminito de infancia espiritual, de confianza y de abandono total en los brazos del Padre. Amén.`,
    fuente: "Oración Tradicional Carmelita",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-teresita-del-nino-jesus-1524"
  },
  "Santa Catalina de Siena": {
    texto: `Gloriosísima Santa Catalina de Siena, virgen y doctora de la Iglesia, tú que con tu ardiente amor a Cristo y a la Iglesia persuadiste al Papa a volver de Aviñón a Roma, intercede por la Iglesia.

Patrona de Italia y de Europa, tú que con tus cartas instruías a papas, reyes y santos, danos celo por la reforma de la Iglesia.

Estigmatizada, mística, diplomática, tú que unías la contemplación con la acción, enséñanos a buscar a Dios en todo.

Santa Catalina, que dijiste "sé quien debes ser y prenderás fuego al mundo", enciende en nosotros el fuego del amor divino. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/catalina_siena.htm"
  },
  "Santa Hildegarda de Bingen": {
    texto: `Gloriosísima Santa Hildegarda de Bingen, abadesa, profetisa, doctora de la Iglesia, tú que recibiste visiones del cielo y las transmitiste con fidelidad, abre nuestros ojos a los misterios de Dios.

Mujer de múltiples talentos: música, medicina, teología, danos creatividad para servir a Dios con todos nuestros dones.

Sibilina del Rin, tú que correspondías con papas y emperadores, danos audacia para hablar la verdad.

Santa Hildegarda, que tu visión de la viriditas, la fuerza vital de Dios en la creación, nos inspire a cuidar nuestro mundo. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/hildegarda-de-bingen-15162"
  },

  // ========== GRANDES SANTOS ==========
  "San José": {
    texto: `A ti, bienaventurado San José, acudimos en nuestra tribulación, y después de implorar el auxilio de tu Santísima Esposa, solicitamos también confiadamente tu patrocinio.

Por aquella caridad que con la Inmaculada Virgen María te tuvo unido, y por el paterno amor con que abrazaste al Niño Jesús, humildemente te suplicamos vuelvas benigno los ojos a la herencia que con su Sangre adquirió Jesucristo, y con tu poder y auxilio socorras nuestras necesidades.

Protege, ¡oh providentísimo Custodio de la Sagrada Familia!, la escogida descendencia de Jesucristo; aparta de nosotros toda mancha de error y corrupción; asístenos propicio desde el cielo, fortísimo libertador nuestro, en esta lucha con el poder de las tinieblas; y así como en otro tiempo libraste de la muerte la vida amenazada del Niño Jesús, así ahora defiende a la santa Iglesia de Dios de las asechanzas de sus enemigos y de toda adversidad.

Acógenos a todos bajo tu continuo patrocinio, para que, imitando tus ejemplos, y sostenidos por tu auxilio, podamos vivir virtuosamente, morir piadosamente y alcanzar en el cielo la eterna bienaventuranza. Amén.`,
    fuente: "León XIII - A Ti Bienaventurado San José",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-jose-obrero-1545"
  },
  "San Juan Bautista": {
    texto: `Oh glorioso San Juan Bautista, precursor del Mesías y el más grande de los nacidos de mujer, tú que preparaste el camino del Señor predicando la penitencia, ayúdanos a convertirnos.

Tú que tuviste el privilegio de bautizar a Jesús en el Jordán y de verlo declarado Hijo de Dios, alcánzanos una fe viva en el Salvador.

Tú que diste testimonio de la verdad hasta derramar tu sangre, concédenos la gracia de ser valientes testigos del Evangelio.

San Juan Bautista, que tu voz que clama en el desierto resuene en nuestros corazones, para que preparemos dignamente el camino del Señor. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-juan-bautista-1603"
  },
  "Santa María Magdalena": {
    texto: `Gloriosísima Santa María Magdalena, discípula fiel del Señor, tú que lloraste a los pies de Jesús y con tus lágrimas y ungüento precioso le honraste, intercede por nosotros pecadores.

Tú que fuiste la primera en ver al Señor Resucitado y la primera en anunciar la Buena Nueva de la Resurrección, alcánzanos la gracia de reconocer a Cristo en nuestra vida.

Tú que amaste mucho y por eso mucho se te perdonó, enséñanos a arrepentirnos de nuestros pecados y a amar con todo el corazón a Jesús.

Santa María Magdalena, apóstol de los apóstoles, ruega por nosotros para que también nosotros seamos testigos fieles del Resucitado. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-maria-magdalena-1635"
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

Y tú, terrible contra el poder del infierno, líbrame, por tu intercesión, de las asechanzas y tentaciones del espíritu maligno. Amén.

V. Ora pro nobis, Beate Pater Benedicte.
R. Ut digni efficiamur promissionibus Christi.`,
    fuente: "Oración Tradicional Benedictina",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-benito-abad-1629"
  },
  "San Ignacio de Loyola": {
    texto: `Tomad, Señor, y recibid toda mi libertad, mi memoria, mi entendimiento y toda mi voluntad, todo mi haber y mi poseer.

Vos me lo disteis, a Vos, Señor, lo torno. Todo es vuestro: disponed de ello según vuestra voluntad.

Dadme vuestro amor y gracia, que esta me basta. Amén.`,
    fuente: "Oración de San Ignacio de Loyola (Sume et Suscipe)",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-ignacio-de-loyola-1622"
  },
  "Santo Domingo de Guzmán": {
    texto: `Glorioso Padre Santo Domingo, fundador de la Orden de Predicadores, tú que ardías en celo por la salvación de las almas, enciende en nosotros el fuego de la caridad.

Tú que predicaste el Rosario como arma contra la herejía, danos amor a esta devoción mariana.

Apóstol de la verdad, tú que combatiste los errores con la predicación y el ejemplo, danos claridad para discernir la verdad.

Santo Domingo, que tu lema "Contemplar y dar a otros lo contemplado" sea también el nuestro. Amén.`,
    fuente: "Oración Tradicional Dominicana",
    fuente_url: "https://www.corazones.org/santos/domingo_guzman.htm"
  },
  "Santa Clara de Asís": {
    texto: `Gloriosísima Santa Clara de Asís, seguidora fiel de San Francisco, tú que abrazaste la santa pobreza por amor a Cristo, desapéganos de los bienes de este mundo.

Fundadora de las Clarisas, madre de las Damas Pobres, tú que con el Santísimo Sacramento ahuyentaste a los sarracenos, aumenta nuestra fe en la Eucaristía.

Tú que dijiste "Alabado sea el Señor porque me ha creado", enséñanos a agradecer a Dios por el don de la vida.

Santa Clara, espejo de pobreza, que tu ejemplo nos inspire a buscar solo a Dios. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/clara-de-asis-15159"
  },
  "San Patricio": {
    texto: `Cristo conmigo, Cristo delante de mí, Cristo detrás de mí, Cristo en mí, Cristo debajo de mí, Cristo encima de mí.

Cristo a mi derecha, Cristo a mi izquierda, Cristo cuando me acuesto, Cristo cuando me siento, Cristo cuando me levanto.

Cristo en el corazón de cada hombre que piense en mí, Cristo en la boca de cada uno que hable de mí, Cristo en cada ojo que me ve, Cristo en cada oído que me oye.

Me levanto hoy con el poder del Dios Trinidad, invocando la Trinidad, confesando la Unidad del Creador del universo. Amén.`,
    fuente: "Coraza de San Patricio (Lorica)",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/patricio-15175"
  },
  "San Jorge": {
    texto: `Glorioso San Jorge, mártir valiente, tú que bajo el emperador Diocleciano diste tu vida por Cristo, danos fortaleza en las pruebas.

Patrono de los soldados, tú que según la leyenda venciste al dragón, defiéndenos del demonio que busca devorar nuestras almas.

Soldado de Cristo, caballero de la fe, protector de los débiles, ruega por nosotros en nuestros combates espirituales.

San Jorge, que tu valor legendario nos inspire a luchar sin miedo la batalla de la fe. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/jorge.htm"
  },
  "San Sebastián": {
    texto: `Glorioso San Sebastián, mártir de Cristo, tú que sobreviviste a las flechas del emperador y volviste a dar testimonio hasta morir apaleado, danos perseverancia.

Patrono de los atletas y los soldados, capitán de la guardia pretoriana, tú que preferiste a Cristo que a los honores del mundo, danos libertad de espíritu.

Mártir dos veces, sanado por Santa Irene para morir de nuevo por Cristo, enséñanos que la muerte por la fe es verdadera victoria.

San Sebastián, defiéndenos de la pestilencia espiritual y guárdanos fieles hasta la muerte. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/sebastian-15183"
  },
  "Santa Inés": {
    texto: `Gloriosísima Santa Inés, virgen y mártir, tú que con solo doce años preferiste la muerte antes que renegar de Cristo tu Esposo, danos amor a la pureza.

Cordera de Dios, cuyo nombre significa cordero, tú que seguiste al Cordero adondequiera que fue, ayúdanos a seguir a Jesús.

Patrona de las jóvenes, tú que despreciaste las proposiciones terrenales por amor al cielo, guía a las jóvenes por el camino de la virtud.

Santa Inés, ruega por nosotros para que mantengamos puro nuestro corazón para Dios. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/ines.htm"
  },
  "Santa Lucía": {
    texto: `Gloriosísima Santa Lucía, virgen y mártir, tú que preferiste perder los ojos antes que negar tu fe en Cristo, escucha nuestra humilde oración.

Tú que iluminaste el camino de la fe con tu testimonio de vida, ilumina nuestras mentes para conocer la verdad y nuestros corazones para amar el bien.

Santa Lucía, patrona de los ciegos y protectora de la vista, cuida nuestros ojos corporales, pero sobre todo, danos ojos de fe para ver la luz de Cristo.

Virgen de Siracusa, que tu luz brille en nuestras tinieblas y nos guíe hacia la Luz verdadera. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-lucia-1713"
  },
  "Santa Águeda": {
    texto: `Gloriosísima Santa Águeda, virgen y mártir de Catania, tú que sufriste terribles tormentos por amor a Cristo, incluyendo la mutilación de tus senos, fortalécenos en el sufrimiento.

Patrona de las mujeres con enfermedades de los senos, intercede por las que sufren estas dolencias.

Tú que fuiste consolada por San Pedro en la cárcel, que los ángeles también nos consuelen en nuestras pruebas.

Santa Águeda, ruega por nosotros para que permanezcamos fieles a Cristo en medio de las tribulaciones. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/agueda-15148"
  },
  "San Blas": {
    texto: `Glorioso San Blas, obispo y mártir, tú que recibiste de Dios el don de curar las enfermedades de la garganta, intercede por nosotros.

Por tu intercesión, el niño que se ahogaba con una espina de pescado fue salvado. Te pedimos que nos protejas de toda enfermedad de la garganta y nos concedas la salud del cuerpo y del alma.

San Blas, médico de las gargantas, cura nuestras voces para que podamos cantar las alabanzas del Señor.

Mártir glorioso, que tu bendición descienda sobre nosotros y nos preserve de todo mal. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-san-blas-1505"
  },
  "San Nicolás": {
    texto: `Glorioso San Nicolás, obispo de Mira, tú que fuiste famoso por tu generosidad con los pobres, danos un corazón generoso.

Patrono de los niños, los marineros y los viajeros, protégenos en nuestros caminos.

Tú que diste en secreto dotes a las tres doncellas para salvarlas de una vida de vergüenza, enséñanos a hacer el bien en silencio.

San Nicolás, modelo de caridad episcopal, intercede por los obispos de hoy para que sean padres generosos de los pobres. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/nicolas_bari.htm"
  },
  "San Lorenzo": {
    texto: `Glorioso San Lorenzo, diácono y mártir, tú que distribuías los bienes de la Iglesia a los pobres y los presentaste como "los verdaderos tesoros de la Iglesia", danos amor a los pobres.

Tú que en la parrilla del martirio dijiste "ya estoy asado de este lado, dame la vuelta", danos humor cristiano ante las pruebas.

Patrón de los diáconos y cocineros, intercede por quienes sirven a la Iglesia y a los hermanos.

San Lorenzo, que tu ejemplo de fortaleza y alegría en el martirio nos inspire a no temer el sufrimiento por Cristo. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/lorenzo-15165"
  },
  "San Esteban": {
    texto: `Glorioso San Esteban Protomártir, primer diácono y primer mártir de la Iglesia, tú que viste los cielos abiertos y a Jesús a la derecha del Padre, abre nuestros ojos a las realidades celestiales.

Tú que predicaste con sabiduría y fuiste apedreado por la verdad, danos valor para dar testimonio.

Tú que perdonaste a tus verdugos como tu Maestro, enséñanos a perdonar a quienes nos hacen daño.

San Esteban, que como tú, podamos decir al morir: "Señor Jesús, recibe mi espíritu." Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/esteban_protomartir.htm"
  },
  "Santa Cecilia": {
    texto: `Gloriosísima Santa Cecilia, virgen y mártir, patrona de los músicos, tú que cantabas en tu corazón al Señor, afina nuestras almas para alabar a Dios.

Tú que convertiste a tu esposo Valeriano y a su hermano Tiburcio, y los tres dieron su vida por Cristo, danos celo por la conversión de las almas.

Santa Cecilia, que la música sagrada que inspiras eleve los corazones a Dios.

Patrona de los músicos, cantores y poetas, haz que toda nuestra vida sea un canto de alabanza al Creador. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/cecilia-15158"
  },
  "Santa Mónica": {
    texto: `Gloriosísima Santa Mónica, madre de San Agustín, tú que lloraste durante años por la conversión de tu hijo, danos paciencia en la oración.

Modelo de madres cristianas, tú que seguiste a tu hijo hasta Milán y no cesaste de rogar por él, ayuda a las madres que sufren por hijos alejados de la fe.

Tú que mereciste ver a tu hijo bautizado por San Ambrosio, alcánzanos la conversión de nuestros seres queridos.

Santa Mónica, patrona de las madres, ruega por nosotros para que nunca perdamos la esperanza. Amén.`,
    fuente: "Oración Tradicional - Corazones.org",
    fuente_url: "https://www.corazones.org/santos/monica.htm"
  },
  "San Martín de Tours": {
    texto: `Glorioso San Martín de Tours, soldado romano que partiste tu capa con un pobre y después viste a Cristo vestido con ella, danos generosidad con los necesitados.

Obispo de Tours, fundador del monacato en Galia, apóstol de los campos, que tu ejemplo misionero nos inspire.

Tú que moriste diciendo "No me niego a trabajar, pero si el Señor quiere, hágase su voluntad", enséñanos la disponibilidad a la voluntad de Dios.

San Martín, patrono de Francia y de los soldados, intercede por nosotros ante el Señor. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/martin-de-tours-15166"
  },

  // ========== SANTOS MODERNOS ==========
  "San Pío de Pietrelcina": {
    texto: `Padre Pío, tú que llevaste en tu cuerpo los estigmas de la Pasión de Cristo, intercede por nosotros ante el Señor.

Tú que pasaste largas horas en el confesionario reconciliando a los pecadores con Dios, ayúdanos a hacer buenas confesiones y a vivir en gracia de Dios.

Tú que ofreciste tus sufrimientos por la salvación de las almas, enséñanos a aceptar nuestras cruces con amor.

Tú que viviste intensamente la Santa Misa, ayúdanos a participar con devoción en el Santo Sacrificio.

Padre Pío, por tu intercesión, alcánzanos del Señor las gracias que necesitamos. San Pío de Pietrelcina, ruega por nosotros. Amén.`,
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
  "Santa Teresa de Calcuta": {
    texto: `Santa Teresa de Calcuta, tú que viste a Cristo en los más pobres entre los pobres, abre nuestros ojos para reconocerlo en cada hermano necesitado.

Tú que experimentaste la noche oscura del alma durante años pero permaneciste fiel, danos perseverancia en la fe.

Fundadora de las Misioneras de la Caridad, tú que serviste a los moribundos de Calcuta con amor, enséñanos a servir con ternura.

Santa Teresa, que dijiste "no estamos llamados a tener éxito sino a ser fieles", danos fidelidad en nuestra vocación. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/teresa-de-calcuta-15186"
  },
  "San Juan Bosco": {
    texto: `Glorioso San Juan Bosco, padre y maestro de la juventud, tú que fundaste la Familia Salesiana para la educación de los jóvenes, guía a los educadores de hoy.

Tú que acogiste a los muchachos abandonados de Turín y les diste un hogar, protege a los jóvenes en situación de riesgo.

Apóstol del sistema preventivo basado en razón, religión y amabilidad, enséñanos a educar con amor.

San Juan Bosco, que dijiste "basta que seas joven para que yo te quiera", intercede por los jóvenes de todo el mundo. Amén.`,
    fuente: "Oración Tradicional Salesiana",
    fuente_url: "https://www.corazones.org/santos/juan_bosco.htm"
  },
  "San Maximiliano Kolbe": {
    texto: `Glorioso San Maximiliano Kolbe, mártir de la caridad, tú que ofreciste tu vida en Auschwitz para salvar a un padre de familia, danos amor heroico al prójimo.

Caballero de la Inmaculada, fundador de la Milicia de María Inmaculada, aumenta nuestra devoción a la Virgen.

Apóstol de los medios de comunicación, tú que usaste la radio y la prensa para evangelizar, inspira a los comunicadores católicos de hoy.

San Maximiliano, que moriste perdonando a tus verdugos, enséñanos el poder del amor sobre el odio. Amén.`,
    fuente: "Oración Tradicional - EWTN",
    fuente_url: "https://www.ewtn.com/es/catolicismo/santos/maximiliano-kolbe-15167"
  },
  "Santa Faustina Kowalska": {
    texto: `Santa Faustina, secretaria de la Divina Misericordia, tú que recibiste la misión de propagar la devoción a la Misericordia de Dios, ayúdanos a confiar en Él.

Tú que escribiste el Diario de la Divina Misericordia según las revelaciones de Jesús, profundiza en nosotros la devoción a Jesús Misericordioso.

Apóstol de la Hora de la Misericordia, recuérdanos rezar cada día a las tres de la tarde.

Santa Faustina, enséñanos a decir con fe: "Jesús, en Ti confío." Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.corazones.org/santos/faustina_kowalska.htm"
  },

  // ========== SANTOS PATRONOS Y OTROS ==========
  "Santa Rita de Casia": {
    texto: `¡Oh gloriosa Santa Rita!, llamada "Santa de lo Imposible", tú que alcanzaste de Dios gracias tan singulares, te ruego intercedas por mí ante el trono del Altísimo.

Tú que sufriste tanto en tu vida como esposa, madre y religiosa, y que recibiste en tu frente la señal del amor de Cristo crucificado, mira con compasión mis necesidades y escucha mi humilde súplica.

Tú que experimentaste el poder de Dios que hace posible lo imposible, ruega por mí para que obtenga la gracia que tanto necesito.

Santa Rita, abogada de los casos difíciles y desesperados, alcánzame del Señor lo que te pido, si es para bien de mi alma. Gloria al Padre, al Hijo y al Espíritu Santo. Amén.`,
    fuente: "Oración Tradicional Agustina",
    fuente_url: "https://www.aciprensa.com/recursos/oracion-a-santa-rita-de-casia-1565"
  },
  "San Expedito": {
    texto: `Glorioso San Expedito, mártir de Cristo, tú que aplastaste al demonio con la cruz en tu mano y pronunciaste la palabra "¡HODIE!" (¡HOY!), no dejándolo para mañana.

Por tu valor y decisión, te pido que intercedas por mí ante Dios Todopoderoso para que me conceda prontamente la gracia que necesito.

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

  // ========== ADVOCACIONES MARIANAS ==========
  "Nuestra Señora de Guadalupe": {
    texto: `Dios te salve, María Santísima de Guadalupe, Madre de Dios y Madre nuestra.

Tú que te apareciste en el Tepeyac para traer la luz de la fe a los pueblos de América, te suplicamos humildemente que vuelvas tus ojos misericordiosos hacia nosotros, tus hijos.

Tú que consolaste al humilde Juan Diego y dejaste impresa tu imagen bendita en su tilma, escucha nuestras súplicas y presenta nuestras peticiones a tu Hijo Jesús.

Madre de las Américas, bajo tu manto nos acogemos. Defiéndenos del mal, guíanos por el camino de la fe, la esperanza y la caridad.

Virgencita morena, que tus palabras al beato Juan Diego sean también para nosotros: "¿No estoy yo aquí que soy tu Madre? ¿No estás bajo mi sombra y resguardo?"

Madre querida, en ti confiamos. Por ti alabamos y bendecimos al Señor. Amén.`,
    fuente: "Oración Tradicional Guadalupana",
    fuente_url: "https://www.aciprensa.com/recursos/oraciones-a-la-virgen-de-guadalupe-2222"
  },
  "Nuestra Señora de Fátima": {
    texto: `Santísima Virgen María, que te apareciste en Fátima a los tres pastorcitos para llamar al mundo a la penitencia y la oración, escucha nuestra súplica.

Tú que pediste la consagración de Rusia a tu Inmaculado Corazón y la comunión reparadora de los primeros sábados, ayúdanos a responder a tu mensaje.

Señora del Rosario, que recomendaste rezar el Rosario todos los días por la paz del mundo, danos fidelidad a esta devoción.

Nuestra Señora de Fátima, que tu Inmaculado Corazón triunfe y que la paz de Cristo reine en el mundo. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.corazones.org/maria/fatima/fatima_oraciones.htm"
  },
  "Nuestra Señora de Lourdes": {
    texto: `Oh María Inmaculada, Nuestra Señora de Lourdes, tú que te apareciste a la humilde Bernardita en la gruta de Massabielle, míranos con compasión.

Tú que dijiste "Yo soy la Inmaculada Concepción" y hiciste brotar la fuente de agua milagrosa, sana nuestros cuerpos y nuestras almas.

Madre de los enfermos, refugio de los pecadores, consuela a todos los que sufren y obtennos la gracia de la conversión.

Nuestra Señora de Lourdes, te pedimos que intercedas por nosotros ante tu Hijo Jesús, para que nos conceda las gracias que necesitamos. Amén.`,
    fuente: "Oración Tradicional",
    fuente_url: "https://www.corazones.org/maria/lourdes/lourdes_oraciones.htm"
  },
  "Nuestra Señora del Carmen": {
    texto: `Oh Santísima Virgen María del Monte Carmelo, Madre de Dios y Madre nuestra, tú que entregaste el santo escapulario a San Simón Stock como signo de tu protección, cúbrenos con tu manto maternal.

Por el escapulario marrón que llevamos con devoción, líbranos del fuego del infierno y llévanos al cielo.

Flor del Carmelo, vid florida, esplendor del cielo, Virgen singular, Madre amable, pura y siempre inmaculada, ruega a tu Hijo por nosotros.

Estrella del mar, puerto de los náufragos, Nuestra Señora del Carmen, ruega por nosotros. Amén.`,
    fuente: "Oración Tradicional Carmelita",
    fuente_url: "https://www.ewtn.com/es/catolicismo/devociones/nuestra-senora-del-carmen-14761"
  },
  "Nuestra Señora de la Altagracia": {
    texto: `Virgen Santísima de la Altagracia, Madre de Dios y Madre nuestra, protectora del pueblo dominicano, acudimos a ti con confianza filial.

Tú que llegaste a nuestra isla en tiempos de la conquista y has sido luz y esperanza de nuestro pueblo, no nos abandones en nuestras necesidades.

Madre de la Altagracia, como los hermanos Trejo trajeron tu imagen bendita, trae también a nuestros hogares la fe, la paz y el amor.

Patrona de la República Dominicana, cubre con tu manto a nuestra nación y guíanos siempre hacia tu Hijo Jesús. Amén.`,
    fuente: "Oración Tradicional Dominicana",
    fuente_url: "https://www.corazones.org/maria/americas/altagracia.htm"
  },
  "Virgen de la Caridad del Cobre": {
    texto: `¡Virgen de la Caridad, Madre de todos los cubanos! Ruega por nuestra Patria, preserva la unidad entre los cubanos, reconcilia a los que están divididos, conforta a los que sufren.

A Ti, Virgen mambisa, te consagramos nuestras familias y nuestras vidas. Protege a los que navegan en las aguas del Caribe buscando libertad y esperanza.

Nuestra Señora de la Caridad del Cobre, estrella de la mañana, tú que apareciste a los tres Juanes sobre las aguas de la bahía de Nipe, sé siempre nuestra guía.

Madre querida, patrona de Cuba, no nos abandones. Bendice a todos los cubanos, los de la isla y los del exilio. Amén.`,
    fuente: "Oración Tradicional Cubana",
    fuente_url: "https://www.corazones.org/maria/americas/caridad_cobre.htm"
  },
  "Virgen de Coromoto": {
    texto: `Virgen de Coromoto, Madre y Patrona de Venezuela, tú que te apareciste al cacique indígena para traer la fe a estas tierras, intercede por nosotros.

Madre de los venezolanos, protege a nuestra nación en estos tiempos difíciles. Consuela a los que sufren, guía a los que gobiernan, reconcilia a los que están divididos.

Señora de Coromoto, que tu imagen milagrosa siga siendo luz de esperanza para nuestro pueblo.

Patrona de Venezuela, te consagramos nuestras familias, nuestra patria y nuestras vidas. Amén.`,
    fuente: "Oración Tradicional Venezolana",
    fuente_url: "https://www.corazones.org/maria/americas/coromoto.htm"
  },
  "Virgen de Luján": {
    texto: `Oh Virgen de Luján, Madre del pueblo argentino, tú que elegiste quedarte en nuestra Pampa cuando los bueyes no quisieron seguir, no nos abandones.

Patrona de la Argentina, del Uruguay y del Paraguay, bendice a los pueblos del Río de la Plata.

Virgencita gaucha, protectora de nuestros campos y ciudades, guarda bajo tu manto a todas las familias.

Nuestra Señora de Luján, te consagramos nuestra patria. Que tu Santuario siga siendo meta de peregrinos y fuente de gracias. Amén.`,
    fuente: "Oración Tradicional Argentina",
    fuente_url: "https://www.corazones.org/maria/americas/lujan.htm"
  },
  "Virgen de Chiquinquirá": {
    texto: `Oh Virgen de Chiquinquirá, Reina de Colombia, tú cuya imagen se renovó milagrosamente en Boyacá, renueva también nuestros corazones.

Madre de Colombia, tú que desde tu santuario de Chiquinquirá bendices a nuestro pueblo, no nos abandones en nuestras tribulaciones.

Virgen del Rosario, reina y patrona de nuestra nación, danos paz, justicia y reconciliación.

Señora de Chiquinquirá, que tu amor maternal abrigue a todos los colombianos, donde quiera que se encuentren. Amén.`,
    fuente: "Oración Tradicional Colombiana",
    fuente_url: "https://www.corazones.org/maria/americas/chiquinquira.htm"
  },
  "Virgen de Caacupé": {
    texto: `Virgen de los Milagros de Caacupé, Madre y Patrona del Paraguay, tú cuya imagen fue tallada por el indígena José para salvarse de sus perseguidores, protégenos.

Tupasy, Madre nuestra, tú que desde tu santuario de Caacupé bendices a la nación guaraní, no nos abandones.

Virgen azul, estrella de nuestra patria, guía a nuestro pueblo por el camino de la fe y la paz.

Nuestra Señora de Caacupé, que cada 8 de diciembre los peregrinos lleguemos a tus pies con corazón renovado. Amén.`,
    fuente: "Oración Tradicional Paraguaya",
    fuente_url: "https://www.corazones.org/maria/americas/caacupe.htm"
  },
  "Virgen de Suyapa": {
    texto: `Santísima Virgen de Suyapa, Madre y Patrona de Honduras, tú cuya pequeña imagen fue encontrada por Alejandro Colindres, vela por nosotros.

Desde tu santuario en Tegucigalpa, escucha las oraciones de todo el pueblo hondureño.

Virgen morena, protege a nuestras familias, a los emigrantes, a los que sufren.

Nuestra Señora de Suyapa, que tu amor maternal nos una como nación y nos conduzca siempre hacia tu Hijo Jesús. Amén.`,
    fuente: "Oración Tradicional Hondureña",
    fuente_url: "https://www.corazones.org/maria/americas/suyapa.htm"
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
      const saintsToImport = Object.keys(TRADITIONAL_PRAYERS_DATA).slice(0, limit || 200);

      for (const saint of saintsToImport) {
        try {
          const prayerData = TRADITIONAL_PRAYERS_DATA[saint];

          // Check if saint exists in calendar_saints - try multiple matching strategies
          let saintRecord = null;
          
          // Strategy 1: Exact match
          const { data: exactMatch } = await supabase
            .from('calendar_saints')
            .select('id, name, prayer_id')
            .eq('name', saint)
            .maybeSingle();
          
          if (exactMatch) {
            saintRecord = exactMatch;
          } else {
            // Strategy 2: ILIKE match
            const { data: ilikeMatch } = await supabase
              .from('calendar_saints')
              .select('id, name, prayer_id')
              .ilike('name', `%${saint}%`)
              .maybeSingle();
            
            if (ilikeMatch) {
              saintRecord = ilikeMatch;
            } else {
              // Strategy 3: Remove prefixes and try again
              const cleanName = saint
                .replace(/^(San |Santa |Santo |Nuestra Señora de |Virgen de |Beato |Beata )/i, '')
                .trim();
              
              const { data: cleanMatch } = await supabase
                .from('calendar_saints')
                .select('id, name, prayer_id')
                .ilike('name', `%${cleanName}%`)
                .maybeSingle();
              
              if (cleanMatch) {
                saintRecord = cleanMatch;
              }
            }
          }

          if (!saintRecord) {
            // For Marian advocations that might not be in calendar_saints,
            // just create the prayer in the oraciones table
            if (saint.includes('Nuestra Señora') || saint.includes('Virgen de')) {
              // Check if prayer already exists
              const { data: existingPrayer } = await supabase
                .from('oraciones')
                .select('id')
                .eq('nombre', `Oración a ${saint}`)
                .maybeSingle();
              
              if (!existingPrayer) {
                const { error: insertError } = await supabase
                  .from('oraciones')
                  .insert({
                    nombre: `Oración a ${saint}`,
                    texto: prayerData.texto,
                    categoria: 'maria',
                    fuente: prayerData.fuente,
                    fuente_url: prayerData.fuente_url,
                    es_tradicional: true,
                    tagline: 'Oración tradicional de la Iglesia Católica'
                  });

                if (insertError) throw insertError;
                results.push({ saint, status: 'created', message: 'Oración mariana creada (sin santo asociado)' });
              } else {
                // Update existing
                const { error: updateError } = await supabase
                  .from('oraciones')
                  .update({
                    texto: prayerData.texto,
                    fuente: prayerData.fuente,
                    fuente_url: prayerData.fuente_url,
                    es_tradicional: true
                  })
                  .eq('id', existingPrayer.id);
                
                if (updateError) throw updateError;
                results.push({ saint, status: 'updated', message: 'Oración mariana actualizada' });
              }
              continue;
            }
            
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
        available_saints: Object.keys(TRADITIONAL_PRAYERS_DATA),
        total_available: Object.keys(TRADITIONAL_PRAYERS_DATA).length
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
