import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Quote, ChevronDown, ChevronUp, Cross, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

interface Story {
  id: string;
  author: string;
  role: string;
  avatar: string;
  tag: string;
  excerpt: string;
  fullStory: string;
}

const stories: Story[] = [
  {
    id: "hermana-leo",
    author: "Hermana Leo",
    role: "Orden de las Hermanas Pobres de Santa Clara · Murcia, España",
    avatar: "L",
    tag: "Vida Consagrada",
    excerpt: "Caí en un vacío muy grande. Hasta que un día, buscando a una amiga por los conventos de Murcia, Dios me encontró a mí.",
    fullStory: `Paz y bien. Mi nombre es Leo, tengo 37 años y soy de Murcia, España. Desde hace 17 años formo parte de la Orden de las Hermanas Pobres de Santa Clara. Nací en una familia cristiana y tengo la suerte de haber crecido rodeada de ocho hermanos.

En casa siempre se ha respirado un ambiente de amor a Dios. Pero como sucede en tantas historias, llegó la adolescencia, y con ella, una época de sombras y distancias. Empecé a querer descubrir nuevas sensaciones, a querer probarlo todo.

Llegó el momento de dejar el colegio y fue cuando mi vida empezó a caer. No encontraba sentido a nada. Empecé a conocer a gente que no me aportaban nada bueno, y sin darme cuenta caí en un vacío muy grande; ni veía a Dios y también ahora creo que no lo quería ver.

Un día, cuando yo tenía 20 años, una amiga tuvo problemas con su novio y decidió retirarse a un convento. Su novio me pidió ayuda para localizarla. Tres semanas estuvimos recorriendo todos los conventos de Murcia hasta que nos la encontramos casualmente mientras nos tomábamos unas cervezas.

"Tía, tienes que conocer a estas hermanas." Mi respuesta fue rápida: "¡No! He visto suficientes monjas buscándote." Pero ella insistió. Subimos a conocer a las hermanas, y ese encuentro se convirtió en el mejor día de mi vida. Me encontré con una comunidad que me miraba con una ternura y una alegría que parecían de otro mundo.

Ese mismo día recibí la llamada de Elena, mi amiga enferma de cáncer. El cáncer había vuelto a aparecer y esta vez era definitivo. Todo mi mundo se vino abajo. Llamé al convento con reproche. La hermana me dijo: "¿Por qué no subes y hablamos un rato?" Yo le puse mil excusas. "A las 5:00 te esperamos." Yo le dije: "No llegaré, no me esperes."

Cogí mi coche y salí a la autovía a correr. Necesitaba velocidad. Y no sé cómo ni de qué manera a las 5:00 estaba en la puerta del convento. Una de las hermanas me dijo: "¿Y por qué no te pierdes con Dios?" Al principio me pareció un sinsentido. Pero algo en mí me hizo dar el paso.

Pasé nueve días en la hospedería. No hice nada extraordinario: solo comí, dormí, recé y hablé. Pero esos días fueron como una caricia en el alma. Sentí por primera vez en mucho tiempo una paz que no venía de fuera, sino de dentro.

Entré en septiembre del año 2007, y han pasado ya 17 años. Nunca me he arrepentido del paso que di. Lo que verdaderamente me sostiene es Cristo. Él es mi vida, mi fuerza, mi alegría. Todo lo que soy y tengo, lo saco de Él.

Cristo es la felicidad. Descúbrelo, que te lo digo yo, vale la pena.`,
  },
  {
    id: "juan-pablo-obregon",
    author: "Juan Pablo Obregón",
    role: "Actor, esposo y padre de 6 hijos · Colombia",
    avatar: "JP",
    tag: "Conversión",
    excerpt: "Viví en un espiral de fiestas, infidelidades y adicciones. Pero Dios tocó primero el corazón de mi esposa, y a través de ella me llamó a mí.",
    fullStory: `Mi nombre es Juan Pablo Obregón, actor colombiano, esposo y padre de 6 hermosos niños. Todo empezó en un pueblo de Colombia llamado Suaita, donde siendo apenas un adolescente, me enfrenté a la dura realidad de ver a mi padre marcharse de la casa.

Mi infancia quedó herida por experiencias terribles que marcaron mi vida. Sin saberlo, eso fue cambiando mi rumbo. Conocí a muchas mujeres, viví noche tras noche de fiesta, convencido de que eso llenaría los vacíos.

Decidí mudarme a México buscando nuevos horizontes y reencontrarme con Ana María. Pronto volvimos a estar juntos, pero la vida que llevábamos no tenía nada de saludable. Entonces ocurrió lo inesperado: Ana María queda en embarazo. Ese bebé empezó a transformar nuestras vidas profundamente.

Regresamos a Colombia y volví a mis viejos amigos, a las fiestas. Comencé a consumir marihuana y fui infiel. Se rompe todo. Las peleas empezaron a subir de tono. Repetí el patrón de mi papá y abandoné mi hogar. Tener a los dos hijitos suplicándome "Papá, no te vayas" fue lo más doloroso.

El Señor utilizó como instrumento a la mejor amiga de Ana María, que se había convertido. Trajo una imagen de la Virgen a la casa. Ana María empezó un proceso de conversión en obediencia. Hizo una confesión general. Al salir del confesionario sintió como si se quitara un peso enorme de encima.

Me hace una llamada y la encuentro muy cambiada. Me dice: "Juan, ¿por qué no lo intentamos? Intentémoslo de la mano de Dios." Fui al retiro espiritual. Ese fin de semana, definitivamente Dios tocó mi vida. Me mostró lo pecador que era. Hice una confesión de vida y comencé mi proceso de conversión real.

Nos casamos. Fue una boda hermosísima, sencilla. Yo no paré de llorar porque no podía creer que, después de tanto daño, ella estuviera ahí de rodillas dándome el sí.

Con el tiempo descubrimos que tenía una adicción a la pornografía relacionada con heridas de la infancia. Pedimos ayuda y comenzamos un proceso de sanación. Aprendimos a vivir una sexualidad sana de la mano de Dios.

Hoy somos padres de 6 hijos, vivimos de la providencia de Dios. Ya no mostrábamos la foto perfecta, mostrábamos lo que era una familia real. Confía en Dios, incluso en los momentos más oscuros. Él tiene un plan para tu vida.`,
  },
  {
    id: "enrique-rojas",
    author: "Dr. Enrique Rojas",
    role: "Psiquiatra · Director del Instituto Rojas Estapé · Madrid",
    avatar: "ER",
    tag: "Esperanza en el dolor",
    excerpt: "Mi hijo Quique se ahogó en la piscina con dos años. Fue una experiencia terrible. Pero 'omnia in bonum' — todo es para bien.",
    fullStory: `Soy el doctor Enrique Rojas, psiquiatra director del Instituto Rojas Estapé de Madrid. Les voy a contar la experiencia de la muerte de mi hijo Quique.

Teníamos una casa dúplex con una piscina pequeñita en la terraza. La cuidadora se despistó y él, que ya andaba, se subió por las escaleras y se cayó a la piscina. Cuando la cuidadora se dio cuenta, estaba flotando.

Mi mujer y yo estábamos en Milán, en un congreso. Vinimos de prisa, absolutamente chocados. Estuvo en la UVI, se le hizo una traqueotomía y semanas más tarde se murió.

Mi mujer estuvo llorando un año. Fue una experiencia terrible, durísima. Mucha gente decía "tienen que ver lo que Dios os ha mandado", y yo rectificaba: Dios no manda cosas malas. Como dice Santa Teresa de Ávila: "Dios habla por lo que permite."

Dice San Pablo a los Romanos: "omnia in bonum" — todo es para bien. Para los que tienen las ideas claras, para los que tienen una visión espiritual, todo lo que ocurre a la larga es para bien.

Yo recuerdo estar con mi mujer, muchas veces solo cogiéndole la mano. Estoy contigo, me tienes contigo. Ella me decía: "¿Pero cómo me ha pasado a mí esto? El rey de la casa..."

Repetimos juntos con frecuencia la primera carta de San Pablo a los Corintios, capítulo 13: "La caridad es paciente, es bondadosa, no tiene envidia. Todo lo cree, todo lo espera, todo lo tolera. La caridad no pasa jamás."

Y el Salmo 24: "Señor, enséñame tus caminos, instrúyeme en tus sendas. Haz que camine con lealtad todos los días de mi vida."

Me quedo con dos sentencias: "Omnia in bonum" — todo es para bien. Y "Omnia tecum" — Señor, contigo todo.`,
  },
  {
    id: "padre-jose-enrique",
    author: "Padre José Enrique",
    role: "Misionero Claretiano",
    avatar: "JE",
    tag: "Vocación",
    excerpt: "Con 22 años descubrí que Dios me quería como misionero claretiano. Tardé seis años en dar el paso. Tenía tres cadenas que Dios fue rompiendo una a una.",
    fullStory: `Soy el padre José Enrique, misionero claretiano. Un día, con 22 años, descubrí definitivamente esa voz de Dios con claridad. Miré hacia atrás, vi sus huellas en el camino y tuve bien clara la dirección: El Señor me quería como misionero claretiano, sacerdote.

Nací en una familia creyente. En mi infancia tenía dos amores: mi abuela Nana, una figura tangible de cómo es el amor de Dios, y el baloncesto. Me cambié de colegio porque me quitaron una pelota. Fui rumbo al Colegio Claret de Sevilla. Y ahí ocurrió el milagro.

Participé en un programa de voluntariado con los hermanos de Cruz Blanca, atendiendo a personas con discapacidad. Nada más pasar la puerta ya estaban esperándote con un abrazo. A través de ellos y su amor puro, abrí los ojos y dije: "Ok, ya no me lo han contado. Te conozco y te he visto cara a cara, Señor."

Pero sentía un runrún dentro de mí, de que Dios me pedía algo más. Una tarde normal, haciendo oración, sentí fuertemente en el pecho: "¡Te quiero para mí hasta el final!" Pero tenía tres cadenas: mi sueño de emprender, formar una familia, y el miedo a decírselo a mis padres.

La primera cadena se cayó cuando lideré una asociación internacional de estudiantes y descubrí que ese ritmo loco no llenaba el vacío. La segunda, cuando una relación me mostró que estaba disponible para todo el mundo menos para ella, y entendí que Dios me llamaba a entregarme a los demás sin límite. Y la tercera perdió fuerza con las otras dos.

Fui a Taizé, Francia, donde en un taller titulado "De cómo Dios llama", todas las piezas encajaron. Me dije: "José Enrique, dedica un año al Señor a ver qué quiere de ti." Dos días antes de terminar una experiencia de discernimiento, en un momento de oración, llegó la confirmación: "Te quiero para Claretiano, adelante."

Cuando puse el primer pie en la casa de formación de Granada, recibí una confirmación total. Fue una sensación de volver a casa; una sensación imborrable.

Desde entonces, aquí estamos. Confirmando el sí cada día. Usque ad Mortem.`,
  },
  {
    id: "tamara-falco",
    author: "Tamara Falcó",
    role: "Diseñadora de moda y comunicadora · Madrid",
    avatar: "TF",
    tag: "Conversión",
    excerpt: "Crecí en una familia católica no practicante. Mi padrastro se mofaba de la religión. Pero mi abuela Beba rezaba el rosario cada día por nosotros.",
    fullStory: `Mi nombre es Tamara Falcó Preysler. Mi familia se consideraba católica, no practicante. Quien me llevaba a Misa era mi seño. Poco después de nacer yo, mis padres se separaron. Mi madre conoció a Miguel Boyer, a quien yo llamaría cariñosamente "Tío Miguel."

Tío Miguel era socialista. Para él todo lo que era la Iglesia era una superstición. Yo crecí con ese poso. Hice la primera comunión, pero tío Miguel se mofaba de todo el proceso. A los 12 años me cambié a Ética en el colegio.

Mi abuela Beba vino a vivir con nosotros desde Filipinas. Iba a Misa diaria. En nuestros cumpleaños y Navidades nos regalaba una Misa. Le decíamos: "Dile a Beba que deje de regalarnos misas." Nos burlábamos de ella. Pero ella todos los días rezaba el rosario por la casa. Creo que parte de que esté aquí hoy contando mi testimonio es gracias a mi abuela y sus rezos.

Cuando mi padre se separa por tercera vez, yo tenía 27 años. Fui a la Casa del Libro y había una luz que salía del techo, encima de la Biblia didáctica. Mi nombre en hebreo significa palmera, y en la portada había una palmera. Me la compré.

Esa misma noche empecé a leerla por el Génesis. Sentí mucha paz. Mi padre sonrió cuando vio lo que leía y me dijo: "Estoy muy contento de que estés leyendo la Biblia." Fue el primer empujón familiar.

Llegué ese verano con mi rosario y mi Biblia. Mi familia dijo: "Otra moda." Pero ese verano di con mi razón para existir: Dios.

Dios sabía que yo me tenía que acercar a Jesús a través de la Virgen. Fui a un retiro espiritual del Padre Ghislain. Me hablaron del demonio y me dijeron que la forma de cerrar la puerta era confesándome. Salí sintiéndome muchísimo mejor. Cada paso hacia Dios me sentía mejor.

Me confirmé con un montón de niños de 15 años en la explanada de la Inmaculada. Fue precioso. Descubrí el amor de Jesús. Decidí ser su amiga, agradeciéndole todo lo que Él había hecho por mí. Y aquí estoy.`,
  },
  {
    id: "ayram-edery",
    author: "Ayram Edery",
    role: "Creadora de Manual para Enamorarse · Venezuela / EE.UU.",
    avatar: "AE",
    tag: "Conversión",
    excerpt: "Caí en un mundo de vicios, intenté suicidarme con una sobredosis de pastillas. Desperté arropada en mi cama. Dios me fue a buscar en una rumba.",
    fullStory: `Amigos, mi nombre es Ayram Edery, creadora de Manual para Enamorarse. Soy venezolana, tengo 34 años, y este camino con el Señor empezó a los 25.

Crecí en una familia que no practicaba la religión católica. Mis padres fueron bautizados, pero hasta ahí. En el colegio me pintaban el cielo tan aburrido que yo decía: no quiero ir al cielo. Sentía que tenía que cambiar mi esencia, ponerme una camisa de fuerzas, y yo tenía un espíritu muy eufórico.

Crecí en una familia muy disfuncional, con una falta de amor muy grande y con heridas que, tarde o temprano, salieron. Empecé a explorar, caí en un mundo de vicios muy grande: alcohol, muchísimas drogas. Era mi manera de escapar de esa realidad, de ese vacío.

Me vine a vivir a Estados Unidos con una beca universitaria. Me iba muy bien en los estudios, pero la droga me llevó a perder mi dignidad, mi propósito. Me empezaron a dar ataques de pánico, ataques de ansiedad. Empecé a robar, a hacer cosas muy malas.

Y entra en mi cabeza el pensamiento suicida. No quiero vivir más. No entiendo para qué estoy en la Tierra. Llamé a la persona que vendía drogas y le dije: véndeme tantas pastillas. Esa noche me metí aproximadamente unas 30 o 35 pastillas para suicidarme.

Lo único que recuerdo es que yo decía: que se me pare el corazón o que alguien me diga por qué estoy aquí. Grité al cielo: ¡Dios mío! Pierdo el conocimiento.

A la mañana siguiente me despierto en mi cuarto, arropada. ¿Quién me arropó? ¿Quién me llevó a mi cuarto? Digo que fue mi ángel de la guarda.

Después de seis meses en rehabilitación, salí y volví a caer, mucho más fuerte. Un estudio de mi cerebro mostró que no tenía serotonina, dopamina, prácticamente me quemé la mitad de las neuronas.

Pero el Señor me fue a buscar. Así como buscó a la mujer samaritana en el pozo de Siquén. Me buscó en una rumba. Una amiga me dijo: "Ayram, yo creo que tú necesitas a Dios." Me inscribió en un retiro de Emaús. Le dije que no iba a ir.

Un mes después me engañó y me dejó en la casa de retiro. Entré prácticamente drogada. Hasta que me llevan ante el Santísimo Sacramento. Nunca había estado en uno. Cierro los ojos y escucho algo al corazón: "Mira, Ayram, no hay más oportunidades. Si sigues así, la siguiente sobredosis, te vas a morir. Estás condenada."

Y luego otro mensaje: "Pero eres mi hija muy, muy amada."

Sentí un amor que nunca había sentido antes. Empecé a llorar sin parar. Pedí hablar con un sacerdote y conocí al Padre Oswaldo Agudelo. No fui más a psicólogo ni psiquiatra. Solo Eucaristía diaria, rosario diario y acompañamiento espiritual.

El primero de abril del 2017, dejé la droga hasta el sol de hoy. Para Dios nada es imposible. Después de ese camino nace "Manual para enamorarse", como un desahogo del desamor que me llevó al amor.

El Señor no quiere mi pecado, pero quiere mi persona, mi esencia. El Señor no te sacó de Egipto para dejarte morir en el desierto. Te quiere llevar a la tierra prometida.

Hasta el cielo no paramos. Amén.`,
  },
  {
    id: "belen-dominguez",
    author: "Belén Domínguez",
    role: "Autora de 'La vida es bonita, incluso ahora' · Sevilla, España",
    avatar: "BD",
    tag: "Esperanza en el sufrimiento",
    excerpt: "Llevo un año en una cama de hospital, sin movilidad, con un cáncer gravísimo. Pero sé que Dios me quiere, me acompaña y me da fortaleza.",
    fullStory: `Mi nombre es Belén Domínguez, tengo 31 años y soy de Sevilla, España. Llevo un año metida en una habitación de hospital, sin salir de la cama, sin movilidad en las piernas y con poca movilidad en el resto del cuerpo. No me levanto, no ando, no puedo ir al baño sola, no puedo hacer nada sola, ni siquiera comer.

Aun así, teniendo un cáncer gravísimo y pasando por momentos de mucha adversidad, Dios me ilumina y me da fortaleza. Ha habido momentos en los que me ha faltado confianza, pero lo he superado porque Dios me ha dado la mano continuamente y me ha animado a seguir adelante.

Incluso cuando me mandaron a paliativos y me dijeron que ya no había nada más que hacer con mi cáncer, en ese momento, cuando más necesité a Dios, ahí estuvo, y me mandó un ensayo clínico justo para mi tumor. Nadie pensaba que en 2025 yo iba a estar viva, y lo estoy.

Mi vida era muy típica: un novio magnífico, amigas, familia perfecta, trabajo en Madrid. De repente, de un día para otro, me empezó a doler mucho el cuello. Siempre pensé que era una contractura de hacer spinning. Hasta que viajando a Londres por trabajo, el dolor fue tan fuerte que tuve que adelantar mi vuelta. Allí en el aeropuerto me recogió Emilio, fuimos al médico y apareció un tumor intramedular dentro de la médula.

Cuando nos dieron el diagnóstico, lo aceptamos desde el primer momento. No hubo un momento en el que dudásemos de que Dios estaría con nosotros. Nuestra fe era muy normalita antes. Íbamos a Misa cuando nos acordábamos. Rezaba bastante poco. Pero en el momento en que me dijeron que tenía cáncer, nunca dudé de que Dios estaba ahí conmigo.

En febrero de 2024 me dijeron que ya no había más nada que hacer. Me mandaron a paliativos. Rezamos muchísimo Emilio y yo por la noche. Y al día siguiente apareció un ensayo clínico para mí. Desde ese momento jamás dejé de confiar en el Señor.

Mi conversión en la fe ha ido in crescendo. Dios me cogió de la mano. Yo le dije que "sí" y desde ese momento nuestra relación es la más bonita que he tenido nunca con nadie. Sé que está ahí, que me quiere, que me cuida.

Nunca me he preguntado "¿por qué a mí?". Jamás. Sino "¿para qué tengo esta enfermedad?" Y me he dado cuenta de que Dios me lo manda para intentar ayudar a otras personas, para evangelizar, para darme cuenta de que el sufrimiento forma parte de la vida, que es un misterio, pero que siempre será por algo.

Como mensaje de esperanza: siempre hay motivos para estar sonriendo, siempre hay motivos para querer vivir. La vida es un don. Abandonaos en Dios. Él siempre va a poder apoyaros y va a daros fortaleza para superar cualquier cosa. Un cristiano con alegría es una de las cosas más bonitas. La vida es bonita, incluso ahora.

Que Dios te bendiga a ti y a toda tu familia.`,
  },
  {
    id: "bosco-gutierrez",
    author: "Bosco Gutiérrez",
    role: "Arquitecto, esposo y padre de 9 hijos · México",
    avatar: "BG",
    tag: "Fe en el cautiverio",
    excerpt: "Pasé 257 días secuestrado en un cuarto de un metro por tres. En la oscuridad total, Dios me enseñó que seguía siendo libre.",
    fullStory: `Mi nombre es Bosco Gutiérrez. Soy esposo de Gaby, padre de nueve hijos, arquitecto y mexicano. Quiero compartirles mi testimonio de los 257 días que pasé secuestrado en un cuarto de un metro por tres.

En 1990 estaba felizmente casado, con siete hijos. Ese día, al salir de Misa, una persona me agarró por detrás en una llave china. Un cachazo explotó en mi boca. Acabé en la puerta de atrás de un coche. Me esposaron, me vendaron los ojos y me llevaron a un cuarto blanco de un metro por tres, con una cámara que me vigilaba. Los 257 días nunca oí una voz de ellos ni vi sus caras; siempre estuvieron encapuchados.

El tercer día me dieron un interrogatorio con preguntas indignantes sobre mi esposa y mis hijos. Sentí que al contestar traicionaba a mi familia. La pérdida de autoestima fue tal que pensé en dejarme morir. Duré 15 días tirado en el suelo sin comer.

Entonces llegó el 15 de septiembre. Un guardián me ofreció tomar lo que quisiera. Pedí un whisky Chivas. Cuando llegó, llorando de alegría, empecé a consentirlo. Hasta que oí una voz en mi conciencia: "Ofréceme el whisky." Negocié con Dios, pero Él me dijo: "Esto es lo único que depende de ti. El alcance de tu libertad." Me hinqué, le di la espalda a la cámara y tiré el whisky al excusado.

Al despertar me sentí con esperanza. Escribí: "Hoy vencí mi primera batalla; porque después de todo, sigo siendo libre." Me escribí una carta a mí mismo como si fuera de mis hermanos. Al releerla reconocí que me la dictó el Espíritu Santo: "Tú eres el más importante de todos, porque eres el único que puede cuidar el cuerpo y la mente de Bosco. Te queremos perfecto."

Hice un plan en tres columnas: salud mental, salud física, y "¡Haz algo!" Aceptar lo que no podía cambiar me dio paz. Pedí material de limpieza, una Biblia, y organicé mi cuartito. Cambió de ser mi encierro a ser mi refugio.

Decidí reafirmar mi fe. Me pregunté: ¿Crees en Dios? Sí, con toda la consecuencia. ¿En un Dios omnipotente o minusválido? Omnipotente. Entonces, ¿por qué permitió tu secuestro? Porque Dios ve infinito para adelante e infinito para atrás. Dios veía desde hace 30 años a ElRugido en el plan de mi vida, yo no lo veía.

En octubre recé por los secuestradores. En noviembre ofrecí mortificaciones. En diciembre pasé a la acción. El 24 de diciembre mandé un papelito: "Hoy no hay secuestrado ni secuestradores. Todos somos hijos de Dios." Esa noche los cinco guardianes encapuchados vinieron a mi ventana. Les leí el Evangelio, les hablé de la Navidad. Recé un Padrenuestro y diez Avemarías. No contestaron, pero uno por uno pasaron y me dieron la mano con lágrimas en los ojos.

Fue la Navidad más feliz de mi vida. Estaba desnudo, sin nada material, trabajando por mi Jefe.

Un guardián, "Tecate", me preguntó por escrito: "¿De dónde saca usted tanta fortaleza?" Le respondí: "Ya no tengo miedo, porque estoy convencido de que no me voy a morir ni un minuto más ni un minuto menos del que Dios quiera; no el que ustedes quieran."

En Semana Santa pedí un Cristo. Al verlo lloré como nunca había llorado ante un crucifijo. Le dije: "Señor, tú pagaste con tu vida por mi vida eterna. Ya no me pertenezco. Voy a vivir pagando y no cobrando."

Desde diciembre preparé mi escape en secreto: un centímetro de navaja de rastrillo, un alambre enderezado de un resorte del catre, y una botella de Melox como cuña. El 12 de mayo de 1991, cuando el guardián se fue y la regadera sonaba arriba, metí el gancho, empujé la aldaba con la cuña y la ventana se abrió al primer intento.

Salí gateando por el garaje, abrí el portón y corrí. Me subí a un taxi sin dinero. Le di mi medalla como prenda. Cuando el taxi se detuvo en carretera, le dije al taxista: "Ese rosario que cuelga del espejo, ¿es para rezar o de adorno?" Me dijo: "De adorno." Le propuse: "Vamos estrenando su rosario." Le cambió la cara, arrancó el coche y me llevó a México.

Llegué a casa de mis papás. Veinte metros antes vi a Gaby con mis siete hijos entrando. Me bajé del taxi gritando: "¡Me escapé, me escapé!"

Como dice San Josemaría: de que hagas las cosas que el Espíritu Santo te inspira, dependen muchas cosas grandes. Esa invitación a rezar el Rosario me produjo mi libertad.

Que Dios te bendiga a ti y a toda tu familia.`,
  },
  {
    id: "wilson-tamayo",
    author: "Wilson Tamayo",
    role: "Subdirector General de Lazos de Amor Mariano · Colombia",
    avatar: "WT",
    tag: "Conversión",
    excerpt: "A los 15 años caí en un ateísmo práctico. Una noche, hablando con mi primo hasta las 6 de la mañana, el Espíritu Santo tocó mi alma. Experimenté una visión desde la Eucaristía que cambió mi vida para siempre.",
    fullStory: `Mi nombre es Wilson Tamayo. Soy de Colombia, padre, esposo y subdirector general de Lazos de Amor Mariano.

Tenía 15 años y ya me había alejado mucho de la fe. Mi familia era católica por tradición, pero no por convicción. Mis papás nos inculcaron un profundo amor a la lectura y, devorando libros, algunos autores terminaron poniendo en duda mi fe. Caí en una especie de ateísmo práctico. A los 14 años me pegué la primera borrachera. Llegué borracho a las 3:00 de la mañana. Fue espantoso. Al día siguiente elevé una plegaria: "Ya no sé si existes, pero si existes, ayúdame."

El 29 de abril del año 2000 fueron mis "4:00 de la tarde", como la hora en que Andrés y Juan se encontraron con Jesús. Un primo llegó a mi casa. Nos sentamos a hablar desde las 7 de la noche y terminamos a las 6 de la mañana. Cada respuesta suya iba sanando cada duda de mi alma. Mi primo no solo estaba en un grupo de oración: iba a Misa todos los días, rezaba el Rosario, ayunaba los viernes.

A las tres o cuatro de la mañana tuve un quiebre interior. Sabía que lo que me decía era verdad, pero me sentía incapaz. Le dije: "Christian, eso suena increíble. Sé que es cierto. Pero creo que no soy capaz." Él me miró fijamente y me dijo: "Wilson, lo que para ti es imposible, para Dios es posible."

Entonces decidí creer. Mi primo trazó una cruz en mi frente con la bendición de la Virgen María. Quedé tendido en el suelo en un descanso del Espíritu, con una paz que jamás había experimentado.

Lo que me sucedió después es el único fenómeno que podría llamar sobrenatural en toda mi vida espiritual. Me encontré en la iglesia de mi pueblo, viendo todo desde la Eucaristía. Vi unos diablitos sobre las personas, molestándoles, pero nadie lo percibía. Mi vista se elevó hasta lo alto del templo y vi luces que se encendían: eran personas de las que emanaba luz. Me aproximé a una de ellas, arrodillada. Levantó la cabeza y me di cuenta de que era yo. Abrí los ojos bañado en lágrimas.

Hice un profundo examen de conciencia con una lista escrita de cada pecado. Al terminar, el Padre Juan me dijo: "Entrégame esas hojas." Las rompió delante de mí. "Ahora puedes leer tus pecados." Le dije: "Padre, es imposible." Me respondió: "Eso mismo va a pasar cuando yo te absuelva. Dios tiene un corazón de Padre y olvida todo aquello que hicimos cuando pedimos perdón de corazón."

Cuando regresé a casa, mi hermano me dio un libro con la imagen del Espíritu Santo. Al verla, lloré copiosamente. Sentí que el Señor me decía: "Wilson, yo ya te perdoné. Ahora perdónate tú."

Pasé de no ir a Misa nunca a ir todos los días, de no rezar el Rosario a orarlo diariamente. Algunos amigos se alejaron, pero otros empezaron a acercarse como Nicodemo: en la noche, sin que nadie los viera. Formamos un pequeño grupo de oración.

Tiempo después conocí a mi esposa. Vivimos un noviazgo en castidad, como Dios lo quería, y ahora tenemos un matrimonio como nosotros soñábamos. Para mí, mi esposa y mis hijos son un paraíso.

Hoy, a mis 40 años, miro hacia atrás y de lo único que me arrepiento es de no haberme entregado más. Experimentamos el amor de Dios, nos sentimos bendecidos y queremos que todo el mundo experimente ese amor. Ese amor tiene un nombre: Se llama Jesús de Nazaret.

Que Dios les bendiga.`,
  },
  {
    id: "maria-paula-aldana",
    author: "María Paula Aldana",
    role: "Conferencista, escritora y creadora de Somos Suyos · Colombia",
    avatar: "MP",
    tag: "Libertad interior",
    excerpt: "Solo quien se sabe esclavo puede anhelar la libertad. Descubrí que era esclava de la pornografía desde los 7 años, del placer, del dinero. Cristo me mostró que la castidad no es un castigo, sino el camino a la verdadera libertad.",
    fullStory: `Mi nombre es María Paula Aldana, soy conferencista, escritora y creadora de contenido digital. Quiero compartir con ustedes mi camino hacia la verdadera libertad interior.

Solo quien se sabe esclavo puede anhelar la libertad. Ese fue mi encuentro con Cristo: descubrirme tan esclava y al mismo tiempo tan necesitada de un amor liberador.

Nací en Bogotá, Colombia, y crecí en una familia de tradición católica pero no practicante. Recibí los sacramentos como un requisito social. Soñaba con ser una gran abogada, con reconocimiento y dinero. Quería total libertad para hacer lo que yo quería.

Pero además de mi esclavitud al qué dirán, al dinero, a las fiestas, el licor y las drogas, en mi vida había una adicción aún más profunda. Mi primer encuentro con la pornografía fue a los siete años. Un video que distorsionaba por completo la realidad de la unión sexual cambió mi vida para siempre. Tuve múltiples experiencias sexuales desde ese momento hasta mis 13 años. Me abanderé con la causa de la liberación sexual femenina, convencida de que el amor era un riesgo en el que siempre iba a perder.

A mis 19 años, mi familia tuvo una crisis económica muy fuerte. Todo se volvió relativo. Entré en una espiral de autodestrucción y depresión. Consumía alcohol y drogas diariamente en mi habitación para no sentir.

Una prima me invitó a un grupo de oración carismático. Pensé: "He hecho cosas peores. Rezar no puede ser peor." Y fui. Un líder del grupo me dijo al oído sin conocerme: "¡Por fin llegaste! Te he estado esperando por mucho tiempo." En un instante de rara humildad le dije a la Virgen María: "Si esto es verdad, si Dios existe... ¡Háblame!, porque creo que necesito ayuda."

La mujer libre por excelencia vio mi esclavitud y oró a su Hijo por mí. Mi vida nunca más fue la misma. Empecé a leer la Biblia, a renunciar a lo contrario a la ley de Dios. Pero la esclavitud más fuerte de mi corazón me impedía acercarme de verdad. Por más que luchaba contra mi compulsión sexual, solo empeoraba. Descubrí lo engañada que había estado: creía que era libre, pero solo cuando quise detenerme me di cuenta de que no podía.

Ahí comprendí el pregón pascual: "Oh, feliz culpa que mereció tan gran redentor." Vi que, en comparación con su amor, todo lo que antes me satisfacía se quedaba corto.

Después de mucha oración, entré al convento con las franciscanas. Dos de los años más felices y más difíciles de mi vida. En el silencio descubrí lo inquieta que era mi voz interior, lo difícil que era pensar en otros más que en mí. Pero descubrí que no me veía ahí para toda la vida.

Viví cinco años de absoluta oscuridad tras salir del convento. No escuchaba la voz de Dios. Sentía que me había abandonado. Pero Él, en esa aparente oscuridad, me había estado conduciendo.

Una amiga me propuso grabar reflexiones del evangelio. Así nació Somos Suyos. Los videos llegaron a cada vez más personas. Sentí que por fin había encontrado mi lugar.

Entonces la Teología del Cuerpo de san Juan Pablo II llegó a mi vida como un respiro de libertad: la santidad no es dejar de pecar por exigencia moral, sino elegir amar aunque cueste. La castidad dejó de parecerme un castigo. Se volvió un alivio, el camino concreto hacia la libertad que anhelaba.

Hoy me dedico a escribir, a viajar por ciudades y países hablando del amor de Dios que me ha salvado. Sigo descubriendo esclavitudes ocultas, sigo profundizando en mis heridas, y sigo viendo ese amor arriesgado, total, libre, fiel y fecundo de Dios por mí.

La pregunta es solo una: ¿quieres dejarte liberar? No lo olvides: SOMOS SUYOS. Dios te bendiga.`,
  },
];

const HistoriasDeFe = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleStory = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/60" />
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 container mx-auto px-4 py-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Cross className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
                  Historias de Fe
                </h1>
                <p className="text-white/80 mt-1">
                  Testimonios reales de cómo Dios transforma vidas
                </p>
              </div>
            </div>
          </motion.header>
        </div>

        {/* Stories */}
        <main className="container mx-auto px-4 py-8 max-w-3xl -mt-4 relative z-10">
          <div className="space-y-6">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300">
                  <div className="p-5 md:p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {story.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{story.author}</h3>
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            {story.tag}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5">{story.role}</p>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="mb-4">
                      <Quote className="w-6 h-6 text-primary/25 mb-2" />
                      <p className="text-foreground italic leading-relaxed">
                        "{story.excerpt}"
                      </p>
                    </div>

                    {/* Expand/Collapse */}
                    <AnimatePresence>
                      {expandedId === story.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-border/50">
                            <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
                              {story.fullStory}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      variant="ghost"
                      onClick={() => toggleStory(story.id)}
                      className="w-full mt-3 gap-2 text-primary hover:text-primary hover:bg-primary/5"
                    >
                      {expandedId === story.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Cerrar historia
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Leer historia completa
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Biblical quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/15"
          >
            <Heart className="w-10 h-10 mx-auto mb-4 text-primary/40" />
            <blockquote className="text-lg md:text-xl font-display italic text-foreground max-w-2xl mx-auto mb-3">
              "Venid a mí todos los que estáis fatigados y sobrecargados, y yo os daré descanso"
            </blockquote>
            <cite className="text-primary font-medium text-sm">— Mateo 11:28</cite>
          </motion.div>
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
};

export default HistoriasDeFe;
