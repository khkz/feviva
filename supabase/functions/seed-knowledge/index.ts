import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- CATECISMO DE LA IGLESIA CATÓLICA (extractos clave) ---
const catechismChunks = [
  // PARTE 1: LA PROFESIÓN DE FE
  { reference: "CIC #1", title: "El deseo de Dios", content: "Dios, infinitamente perfecto y bienaventurado en sí mismo, en un designio de pura bondad ha creado libremente al hombre para hacerle partícipe de su vida bienaventurada. Por eso, en todo tiempo y en todo lugar, está cerca del hombre. Le llama y le ayuda a buscarle, a conocerle y a amarle con todas sus fuerzas." },
  { reference: "CIC #27", title: "El deseo de Dios", content: "El deseo de Dios está inscrito en el corazón del hombre, porque el hombre ha sido creado por Dios y para Dios; y Dios no cesa de atraer al hombre hacia sí, y sólo en Dios encontrará el hombre la verdad y la dicha que no cesa de buscar." },
  { reference: "CIC #50", title: "Dios sale al encuentro del hombre", content: "Mediante la razón natural, el hombre puede conocer a Dios con certeza a partir de sus obras. Pero existe otro orden de conocimiento que el hombre no puede de ningún modo alcanzar por sus propias fuerzas, el de la Revelación divina." },
  { reference: "CIC #101", title: "La Sagrada Escritura", content: "En la condescendencia de su bondad, Dios, para revelarse a los hombres, les habla en palabras humanas: 'La Palabra de Dios, expresada en lenguas humanas, se hace semejante al lenguaje humano, como la Palabra del Padre eterno, asumiendo nuestra débil condición humana, se hizo semejante a los hombres'." },
  { reference: "CIC #105", title: "Inspiración de la Escritura", content: "Dios es el autor de la Sagrada Escritura. Las verdades reveladas por Dios, que se contienen y manifiestan en la Sagrada Escritura, se consignaron por inspiración del Espíritu Santo. La santa Madre Iglesia, según la fe de los Apóstoles, reconoce que todos los libros del Antiguo y del Nuevo Testamento, con todas sus partes, son sagrados y canónicos, en cuanto que, escritos por inspiración del Espíritu Santo, tienen a Dios como autor." },
  { reference: "CIC #185", title: "El Credo", content: "Quien dice 'Yo creo', dice 'Yo me adhiero a lo que nosotros creemos'. La comunión en la fe necesita un lenguaje común de la fe, normativo para todos y que una en la misma confesión de fe." },
  { reference: "CIC #198", title: "El Símbolo de los Apóstoles", content: "Nuestro Credo comienza por Dios, porque Dios es 'el primero y el último' (Is 44,6), el Principio y el Fin de todo. El Credo comienza por Dios Padre, porque el Padre es la primera Persona divina de la Santísima Trinidad; nuestro Símbolo comienza por la creación del cielo y de la tierra, ya que la creación es el comienzo y el fundamento de todas las obras de Dios." },
  { reference: "CIC #232", title: "La Santísima Trinidad", content: "Los cristianos son bautizados 'en el nombre del Padre y del Hijo y del Espíritu Santo' (Mt 28,19). Antes responden 'Creo' a la triple pregunta que les pide confesar su fe en el Padre, en el Hijo y en el Espíritu Santo. La fe de todos los cristianos se cimenta en la Santísima Trinidad." },
  { reference: "CIC #234", title: "Misterio de la Trinidad", content: "El misterio de la Santísima Trinidad es el misterio central de la fe y de la vida cristiana. Es el misterio de Dios en sí mismo. Es, pues, la fuente de todos los otros misterios de la fe; es la luz que los ilumina. Es la enseñanza más fundamental y esencial en la 'jerarquía de las verdades de fe'." },
  { reference: "CIC #279", title: "La Creación", content: "'En el principio, Dios creó el cielo y la tierra' (Gn 1,1). Con estas palabras solemnes comienza la Sagrada Escritura. El Símbolo de la fe las recoge confesando a Dios Padre Todopoderoso como 'el Creador del cielo y de la tierra', 'de todo lo visible y lo invisible'." },
  { reference: "CIC #355", title: "Creación del hombre", content: "'Dios creó al hombre a su imagen, a imagen de Dios lo creó, hombre y mujer los creó' (Gn 1,27). El hombre ocupa un lugar único en la creación: fue hecho 'a imagen de Dios'; en su propia naturaleza une el mundo espiritual y el mundo material; es creado 'hombre y mujer'; Dios lo estableció en la amistad con Él." },
  { reference: "CIC #385", title: "El pecado original", content: "Dios es infinitamente bueno y todas sus obras son buenas. Sin embargo, nadie escapa a la experiencia del sufrimiento, de los males en la naturaleza —que aparecen como ligados a los límites propios de las criaturas—, y sobre todo a la cuestión del mal moral. ¿De dónde viene el mal? La respuesta de la fe cristiana se da por el relato de la caída." },
  { reference: "CIC #422", title: "Jesucristo, Hijo de Dios", content: "'Pero, al llegar la plenitud de los tiempos, envió Dios a su Hijo, nacido de mujer, nacido bajo la ley, para rescatar a los que se hallaban bajo la ley, y para que recibiéramos la filiación adoptiva' (Ga 4,4-5). Esta es 'la Buena Nueva de Jesucristo, Hijo de Dios': Dios ha visitado a su pueblo." },
  { reference: "CIC #456", title: "Por qué el Verbo se hizo carne", content: "Con el Credo Niceno-Constantinopolitano respondemos confesando: 'Por nosotros los hombres y por nuestra salvación bajó del cielo, y por obra del Espíritu Santo se encarnó de María, la Virgen, y se hizo hombre'." },
  { reference: "CIC #461", title: "La Encarnación", content: "Tomando la expresión de San Juan ('El Verbo se hizo carne': Jn 1,14), la Iglesia llama 'Encarnación' al hecho de que el Hijo de Dios haya asumido una naturaleza humana para llevar a cabo por ella nuestra salvación." },
  { reference: "CIC #599", title: "Muerte redentora de Cristo", content: "La muerte violenta de Jesús no fue fruto del azar en una desafortunada conjunción de circunstancias. Pertenece al misterio del designio de Dios, como lo explica San Pedro a los judíos de Jerusalén ya en su primer discurso de Pentecostés: 'fue entregado según el determinado designio y previo conocimiento de Dios' (Hch 2,23)." },
  { reference: "CIC #638", title: "La Resurrección", content: "'Os anunciamos la Buena Nueva de que la Promesa hecha a los padres Dios la ha cumplido en nosotros, los hijos, al resucitar a Jesús' (Hch 13,32-33). La Resurrección de Jesús es la verdad culminante de nuestra fe en Cristo, creída y vivida por la primera comunidad cristiana como verdad central, transmitida como fundamental por la Tradición." },
  // PARTE 2: LOS SACRAMENTOS
  { reference: "CIC #1210", title: "Los siete sacramentos", content: "Los sacramentos de la Nueva Ley fueron instituidos por Cristo y son siete, a saber: Bautismo, Confirmación, Eucaristía, Penitencia, Unción de los enfermos, Orden sacerdotal y Matrimonio. Los siete sacramentos corresponden a todas las etapas y todos los momentos importantes de la vida del cristiano." },
  { reference: "CIC #1213", title: "El Bautismo", content: "El santo Bautismo es el fundamento de toda la vida cristiana, el pórtico de la vida en el espíritu y la puerta que abre el acceso a los otros sacramentos. Por el Bautismo somos liberados del pecado y regenerados como hijos de Dios, llegamos a ser miembros de Cristo y somos incorporados a la Iglesia." },
  { reference: "CIC #1322", title: "La Eucaristía", content: "La Sagrada Eucaristía culmina la iniciación cristiana. Los que han sido elevados a la dignidad del sacerdocio real por el Bautismo y configurados más profundamente con Cristo por la Confirmación, participan por medio de la Eucaristía con toda la comunidad en el sacrificio mismo del Señor." },
  { reference: "CIC #1324", title: "Fuente y cumbre", content: "La Eucaristía es 'fuente y cumbre de toda la vida cristiana'. 'Los demás sacramentos, como también todos los ministerios eclesiales y las obras de apostolado, están unidos a la Eucaristía y a ella se ordenan. La sagrada Eucaristía, en efecto, contiene todo el bien espiritual de la Iglesia, es decir, Cristo mismo, nuestra Pascua'." },
  { reference: "CIC #1374", title: "Presencia real", content: "En el santísimo sacramento de la Eucaristía están 'contenidos verdadera, real y sustancialmente el Cuerpo y la Sangre junto con el alma y la divinidad de nuestro Señor Jesucristo, y, por consiguiente, Cristo entero'. 'Esta presencia se denomina real, no a título exclusivo, como si las otras presencias no fuesen reales, sino por excelencia'." },
  { reference: "CIC #1422", title: "Sacramento de la Penitencia", content: "Los que se acercan al sacramento de la penitencia obtienen de la misericordia de Dios el perdón de los pecados cometidos contra Él y, al mismo tiempo, se reconcilian con la Iglesia, a la que ofendieron con sus pecados. Ella les mueve a conversión con su amor, su ejemplo y sus oraciones." },
  { reference: "CIC #1601", title: "El Matrimonio", content: "'La alianza matrimonial, por la que el varón y la mujer constituyen entre sí un consorcio de toda la vida, ordenado por su misma índole natural al bien de los cónyuges y a la generación y educación de la prole, fue elevada por Cristo Señor a la dignidad de sacramento entre bautizados'." },
  // PARTE 3: LA VIDA EN CRISTO - LOS MANDAMIENTOS
  { reference: "CIC #2052", title: "Los Diez Mandamientos", content: "'Maestro, ¿qué he de hacer yo de bueno para conseguir la vida eterna?' Jesús le dijo: 'Si quieres entrar en la vida, guarda los mandamientos' (Mt 19,16-17). Luego los enumera: 'No matarás, no cometerás adulterio, no robarás, no levantarás testimonio falso, honra a tu padre y a tu madre'." },
  { reference: "CIC #2083", title: "Primer mandamiento", content: "'Amarás al Señor tu Dios con todo tu corazón, con toda tu alma y con todas tus fuerzas' (Dt 6,5). El primer mandamiento llama al hombre para que crea en Dios, espere en Él y lo ame sobre todas las cosas." },
  { reference: "CIC #2196", title: "Cuarto mandamiento", content: "'Honra a tu padre y a tu madre, para que se prolonguen tus días sobre la tierra que el Señor, tu Dios, te va a dar' (Ex 20,12). Ordena honrar y respetar a nuestros padres, y a todos aquellos a los que Dios, para nuestro bien, ha investido de su autoridad." },
  { reference: "CIC #2258", title: "Quinto mandamiento", content: "'No matarás' (Ex 20,13). 'Habéis oído que se dijo a los antepasados: «No matarás»; y aquel que mate será reo ante el tribunal. Pues yo os digo: Todo aquel que se encolerice contra su hermano, será reo ante el tribunal' (Mt 5,21-22). La vida humana es sagrada porque desde su inicio es fruto de la acción creadora de Dios." },
  { reference: "CIC #2331", title: "Sexto mandamiento", content: "'Dios es amor y vive en sí mismo un misterio de comunión personal de amor. Creándola a su imagen, Dios inscribe en la humanidad del hombre y de la mujer la vocación, y consiguientemente la capacidad y la responsabilidad del amor y de la comunión'." },
  { reference: "CIC #2401", title: "Séptimo mandamiento", content: "'No robarás' (Ex 20,15; Dt 5,19). El séptimo mandamiento prohíbe tomar o retener el bien del prójimo injustamente y perjudicar de cualquier manera al prójimo en sus bienes. Prescribe la justicia y la caridad en la gestión de los bienes terrenos y de los frutos del trabajo de los hombres." },
  { reference: "CIC #2464", title: "Octavo mandamiento", content: "'No darás testimonio falso contra tu prójimo' (Ex 20,16). El octavo mandamiento prohíbe falsear la verdad en las relaciones con el prójimo. Prohíbe, en particular, la mentira, la calumnia, la difamación." },
  // PARTE 4: LA ORACIÓN
  { reference: "CIC #2559", title: "La oración cristiana", content: "'La oración es la elevación del alma hacia Dios o la petición a Dios de bienes convenientes' (San Juan Damasceno). ¿Desde dónde hablamos cuando oramos? ¿Desde la altura de nuestro orgullo y de nuestra propia voluntad, o desde 'lo más profundo' (Sal 130,1) de un corazón humilde y contrito?" },
  { reference: "CIC #2700", title: "La oración vocal", content: "Por medio de su Palabra, Dios habla al hombre. La oración toma cuerpo mediante palabras, mentales o vocales. Pero lo más importante es la presencia del corazón ante Aquel a quien hablamos en la oración." },
  { reference: "CIC #2705", title: "La meditación", content: "La meditación es, sobre todo, una búsqueda. El espíritu trata de comprender el por qué y el cómo de la vida cristiana para adherirse y responder a lo que el Señor pide. Hace falta una atención difícil de mantener. Habitualmente, se hace con la ayuda de algún libro." },
  { reference: "CIC #2709", title: "La oración contemplativa", content: "¿Qué es la oración contemplativa? Santa Teresa de Jesús responde: 'Oración mental no es otra cosa, a mi parecer, sino tratar de amistad, estando muchas veces tratando a solas con quien sabemos nos ama'." },
  { reference: "CIC #2759", title: "El Padrenuestro", content: "'Un día, Jesús estaba orando en cierto lugar. Cuando terminó, uno de sus discípulos le dijo: Señor, enséñanos a orar' (Lc 11,1). En respuesta a esta petición, el Señor confía a sus discípulos y a su Iglesia la oración cristiana fundamental: el Padrenuestro." },
  { reference: "CIC #2761", title: "Resumen del Evangelio", content: "El Padrenuestro es 'el resumen de todo el Evangelio', 'la oración más perfecta'. Está en el centro de las Escrituras." },
  // TEMAS ESPECIALES
  { reference: "CIC #963", title: "María, Madre de la Iglesia", content: "Después de haber hablado del papel de la Virgen María en el misterio de Cristo y del Espíritu, es conveniente considerar ahora su lugar en el misterio de la Iglesia. Se la reconoce y se la venera como verdadera Madre de Dios y del Redentor." },
  { reference: "CIC #966", title: "La Asunción de María", content: "La Virgen Inmaculada, preservada libre de toda mancha de pecado original, terminado el curso de su vida en la tierra, fue llevada en cuerpo y alma a la gloria del cielo y satisfecha por el Señor como Reina del universo, para ser conformada más plenamente a su Hijo, Señor de los señores y vencedor del pecado y de la muerte." },
  { reference: "CIC #1030", title: "El Purgatorio", content: "Los que mueren en la gracia y en la amistad de Dios, pero imperfectamente purificados, aunque están seguros de su eterna salvación, sufren después de su muerte una purificación, a fin de obtener la santidad necesaria para entrar en la alegría del cielo." },
  { reference: "CIC #1033", title: "El Infierno", content: "No podemos estar unidos a Dios si no elegimos libremente amarle. Pero no podemos amar a Dios si pecamos gravemente contra Él, contra nuestro prójimo o contra nosotros mismos. Morir en pecado mortal sin estar arrepentido y sin acoger el amor misericordioso de Dios, significa permanecer separados de Él para siempre por nuestra propia y libre elección." },
  { reference: "CIC #1023", title: "El Cielo", content: "Los que mueren en la gracia y la amistad de Dios y están perfectamente purificados, viven para siempre con Cristo. Son para siempre semejantes a Dios, porque lo ven 'tal cual es' (1 Jn 3,2), cara a cara." },
  { reference: "CIC #846", title: "Fuera de la Iglesia no hay salvación", content: "¿Cómo entender esta afirmación tantas veces repetida por los Padres de la Iglesia? Formulada de modo positivo significa que toda salvación viene de Cristo-Cabeza por la Iglesia que es su Cuerpo. No podrían salvarse los que, sabiendo que la Iglesia católica fue fundada como necesaria por Dios a través de Jesucristo, no quisieran entrar en ella o perseverar en ella." },
  { reference: "CIC #891", title: "La infalibilidad papal", content: "El Romano Pontífice, Cabeza del Colegio episcopal, goza de esta infalibilidad en virtud de su ministerio cuando, como Pastor y Maestro supremo de todos los fieles que confirma en la fe a sus hermanos, proclama por un acto definitivo la doctrina en cuestiones de fe y moral." },
  { reference: "CIC #1131", title: "Los sacramentos como signos eficaces", content: "Los sacramentos son signos eficaces de la gracia, instituidos por Cristo y confiados a la Iglesia por los cuales nos es dispensada la vida divina. Los ritos visibles bajo los cuales los sacramentos son celebrados significan y realizan las gracias propias de cada sacramento." },
  { reference: "CIC #2267", title: "La pena de muerte", content: "La Iglesia enseña, a la luz del Evangelio, que 'la pena de muerte es inadmisible, porque atenta contra la inviolabilidad y la dignidad de la persona', y se compromete con determinación a su abolición en todo el mundo." },
  { reference: "CIC #2270", title: "El aborto", content: "La vida humana debe ser respetada y protegida de manera absoluta desde el momento de la concepción. Desde el primer momento de su existencia, el ser humano debe ver reconocidos sus derechos de persona, entre los cuales está el derecho inviolable de todo ser inocente a la vida." },
  { reference: "CIC #2357", title: "La homosexualidad", content: "La homosexualidad designa las relaciones entre hombres o mujeres que experimentan una atracción sexual, exclusiva o predominante, hacia personas del mismo sexo. La Tradición ha declarado siempre que 'los actos homosexuales son intrínsecamente desordenados'. Son contrarios a la ley natural." },
  { reference: "CIC #2358", title: "Respeto a personas homosexuales", content: "Un número apreciable de hombres y mujeres presentan tendencias homosexuales profundamente arraigadas. Esta inclinación, objetivamente desordenada, constituye para la mayoría de ellos una auténtica prueba. Deben ser acogidos con respeto, compasión y delicadeza. Se evitará, respecto a ellos, todo signo de discriminación injusta." },
];

// --- BIBLIA (pasajes clave) ---
const bibleChunks = [
  // GÉNESIS
  { reference: "Gn 1:1-5", title: "La Creación", content: "En el principio creó Dios los cielos y la tierra. La tierra estaba desordenada y vacía, las tinieblas cubrían la superficie del abismo y el espíritu de Dios se movía sobre las aguas. Dijo Dios: 'Sea la luz'. Y fue la luz. Vio Dios que la luz era buena y separó la luz de las tinieblas. Llamó a la luz 'día' y a las tinieblas 'noche'. Fue la tarde y la mañana del primer día." },
  { reference: "Gn 1:26-28", title: "Creación del hombre", content: "Entonces dijo Dios: 'Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; que domine sobre los peces del mar, las aves del cielo, el ganado, y sobre toda la tierra.' Creó Dios al hombre a su imagen, a imagen de Dios lo creó; varón y mujer los creó. Los bendijo Dios diciéndoles: 'Sean fecundos y multiplíquense, llenen la tierra y sométanla'." },
  { reference: "Gn 3:15", title: "Protoevangelio", content: "Pondré enemistad entre ti y la mujer, entre tu descendencia y la suya; ella te pisará la cabeza mientras tú acecharás su talón." },
  // ÉXODO
  { reference: "Ex 20:1-17", title: "Los Diez Mandamientos", content: "Dios pronunció estas palabras: 'Yo soy el Señor, tu Dios, que te saqué de Egipto. No tendrás otros dioses fuera de mí. No te harás imagen. No tomarás el nombre del Señor en vano. Recuerda el sábado para santificarlo. Honra a tu padre y a tu madre. No matarás. No cometerás adulterio. No robarás. No darás falso testimonio. No codiciarás los bienes de tu prójimo.'" },
  // SALMOS
  { reference: "Sal 23:1-6", title: "El Señor es mi pastor", content: "El Señor es mi pastor, nada me falta. En verdes praderas me hace reposar, me conduce hacia fuentes tranquilas y repara mis fuerzas. Me guía por senderos de justicia, por amor de su nombre. Aunque camine por un valle tenebroso, ningún mal temeré, porque tú vas conmigo; tu vara y tu cayado me sosiegan." },
  { reference: "Sal 51:3-6", title: "Miserere", content: "Misericordia, Dios mío, por tu bondad; por tu inmensa compasión borra mi culpa. Lava del todo mi delito, limpia mi pecado. Pues yo reconozco mi culpa, tengo siempre presente mi pecado. Contra ti, contra ti solo pequé, cometí la maldad que aborreces." },
  { reference: "Sal 91:1-4", title: "Al amparo del Altísimo", content: "El que habita al amparo del Altísimo y vive a la sombra del Omnipotente, dice al Señor: 'Refugio mío, alcázar mío, Dios mío, confío en ti.' Él te librará de la red del cazador, de la peste funesta. Te cubrirá con sus plumas, bajo sus alas te refugiarás." },
  // ISAÍAS
  { reference: "Is 7:14", title: "El Emmanuel", content: "Pues el Señor, por su cuenta, os dará una señal: Mirad, la virgen está encinta y da a luz un hijo, y le pondrá por nombre Emmanuel." },
  { reference: "Is 53:3-5", title: "El Siervo Sufriente", content: "Despreciado y desechado entre los hombres, varón de dolores, experimentado en quebranto. Fue despreciado, y no lo estimamos. Ciertamente llevó él nuestras enfermedades, y sufrió nuestros dolores. Mas él fue herido por nuestras rebeliones, molido por nuestros pecados. El castigo de nuestra paz fue sobre él, y por su llaga fuimos nosotros curados." },
  // EVANGELIOS
  { reference: "Mt 5:3-12", title: "Las Bienaventuranzas", content: "Bienaventurados los pobres de espíritu, porque de ellos es el Reino de los Cielos. Bienaventurados los que lloran, porque serán consolados. Bienaventurados los mansos, porque heredarán la tierra. Bienaventurados los que tienen hambre y sed de justicia, porque serán saciados. Bienaventurados los misericordiosos, porque alcanzarán misericordia. Bienaventurados los limpios de corazón, porque verán a Dios. Bienaventurados los que trabajan por la paz, porque serán llamados hijos de Dios." },
  { reference: "Mt 16:18-19", title: "Pedro, roca de la Iglesia", content: "Y yo te digo que tú eres Pedro, y sobre esta piedra edificaré mi Iglesia, y el poder de la muerte no prevalecerá contra ella. Te daré las llaves del Reino de los Cielos; lo que ates en la tierra quedará atado en los cielos, y lo que desates en la tierra quedará desatado en los cielos." },
  { reference: "Mt 22:37-40", title: "El mandamiento más grande", content: "'Amarás al Señor tu Dios con todo tu corazón, con toda tu alma y con toda tu mente.' Este es el mandamiento más grande y el primero. El segundo es semejante a este: 'Amarás a tu prójimo como a ti mismo.' De estos dos mandamientos dependen toda la Ley y los Profetas." },
  { reference: "Mt 26:26-28", title: "Institución de la Eucaristía", content: "Mientras comían, Jesús tomó pan, pronunció la bendición, lo partió y lo dio a sus discípulos, diciendo: 'Tomen y coman, esto es mi Cuerpo.' Tomó luego una copa, dio gracias y se la dio diciendo: 'Beban todos de ella, porque esta es mi Sangre de la Alianza, que es derramada por muchos para el perdón de los pecados.'" },
  { reference: "Mt 28:18-20", title: "La Gran Comisión", content: "Jesús se acercó y les dijo: 'Se me ha dado todo poder en el cielo y en la tierra. Vayan, pues, y hagan discípulos de todas las naciones, bautizándolos en el nombre del Padre y del Hijo y del Espíritu Santo, enseñándoles a guardar todo lo que les he mandado. Y sepan que yo estoy con ustedes todos los días, hasta el fin del mundo.'" },
  { reference: "Jn 1:1-5", title: "El Verbo se hizo carne", content: "En el principio existía el Verbo, y el Verbo estaba junto a Dios, y el Verbo era Dios. Él estaba en el principio junto a Dios. Todo fue hecho por él, y sin él no se hizo nada de cuanto existe. En él estaba la vida, y la vida era la luz de los hombres. La luz brilla en las tinieblas, y las tinieblas no la recibieron." },
  { reference: "Jn 1:14", title: "La Encarnación", content: "Y el Verbo se hizo carne y habitó entre nosotros, y hemos contemplado su gloria, gloria que recibe del Padre como Unigénito, lleno de gracia y de verdad." },
  { reference: "Jn 3:16-17", title: "El amor de Dios", content: "Porque tanto amó Dios al mundo, que dio a su Unigénito Hijo, para que todo el que cree en él no perezca, sino que tenga vida eterna. Porque Dios no envió a su Hijo al mundo para condenar al mundo, sino para que el mundo se salve por él." },
  { reference: "Jn 6:51-56", title: "Pan de vida", content: "Yo soy el pan vivo bajado del cielo; el que coma de este pan vivirá para siempre. Y el pan que yo daré es mi carne para la vida del mundo. Mi carne es verdadera comida, y mi sangre es verdadera bebida. El que come mi carne y bebe mi sangre permanece en mí y yo en él." },
  { reference: "Jn 14:6", title: "Jesús, camino verdad y vida", content: "Jesús le dijo: 'Yo soy el camino, y la verdad, y la vida. Nadie viene al Padre sino por mí.'" },
  { reference: "Jn 20:21-23", title: "El poder de perdonar pecados", content: "Jesús les dijo otra vez: 'La paz esté con ustedes. Como el Padre me envió, así también los envío yo.' Dicho esto, sopló sobre ellos y les dijo: 'Reciban el Espíritu Santo. A quienes les perdonen los pecados, les quedan perdonados; a quienes se los retengan, les quedan retenidos.'" },
  { reference: "Lc 1:28", title: "Anunciación", content: "El ángel, entrando donde ella estaba, le dijo: '¡Alégrate, llena de gracia, el Señor está contigo!'" },
  { reference: "Lc 1:46-55", title: "El Magníficat", content: "María dijo: 'Proclama mi alma la grandeza del Señor, se alegra mi espíritu en Dios, mi salvador; porque ha mirado la humillación de su esclava. Desde ahora me felicitarán todas las generaciones, porque el Poderoso ha hecho obras grandes por mí: su nombre es santo.'" },
  { reference: "Lc 22:19-20", title: "Haced esto en memoria mía", content: "Tomó pan, dio gracias, lo partió y se lo dio diciendo: 'Esto es mi cuerpo, que se entrega por ustedes; hagan esto en memoria mía.' Después de cenar, hizo lo mismo con la copa, diciendo: 'Esta copa es la nueva alianza sellada con mi sangre, que se derrama por ustedes.'" },
  // HECHOS
  { reference: "Hch 2:42", title: "La primera comunidad", content: "Acudían asiduamente a la enseñanza de los apóstoles, a la comunión, a la fracción del pan y a las oraciones." },
  // ROMANOS
  { reference: "Rm 3:23-24", title: "Justificación por la fe", content: "Todos pecaron y están privados de la gloria de Dios, y son justificados gratuitamente por su gracia, mediante la redención realizada en Cristo Jesús." },
  { reference: "Rm 8:28", title: "Todo coopera para el bien", content: "Sabemos que a los que aman a Dios, todas las cosas cooperan para el bien, a los que conforme a su propósito son llamados." },
  // 1 CORINTIOS
  { reference: "1 Co 11:23-26", title: "Tradición eucarística", content: "Porque yo recibí del Señor lo que les he transmitido: que el Señor Jesús, la noche en que fue entregado, tomó pan, y habiendo dado gracias, lo partió y dijo: 'Esto es mi cuerpo que se da por ustedes; hagan esto en memoria mía.' Cada vez que coman este pan y beban esta copa, proclaman la muerte del Señor hasta que él venga." },
  { reference: "1 Co 13:4-7", title: "Himno al amor", content: "El amor es paciente, es bondadoso. El amor no es envidioso ni jactancioso ni orgulloso. No se comporta con rudeza, no es egoísta, no se enoja fácilmente, no guarda rencor. El amor no se deleita en la maldad sino que se regocija con la verdad. Todo lo disculpa, todo lo cree, todo lo espera, todo lo soporta." },
  // EFESIOS
  { reference: "Ef 2:8-9", title: "Salvación por gracia", content: "Porque por gracia ustedes han sido salvados mediante la fe; esto no procede de ustedes, sino que es el regalo de Dios, no por obras, para que nadie se gloríe." },
  // SANTIAGO
  { reference: "St 2:24-26", title: "Fe y obras", content: "Ya ven ustedes que el hombre es justificado por las obras y no solamente por la fe. Porque así como el cuerpo sin espíritu está muerto, así también la fe sin obras está muerta." },
  // APOCALIPSIS
  { reference: "Ap 12:1", title: "La Mujer vestida de sol", content: "Una gran señal apareció en el cielo: una mujer vestida del sol, con la luna bajo sus pies y una corona de doce estrellas sobre su cabeza." },
  { reference: "Ap 21:1-4", title: "Cielo nuevo y tierra nueva", content: "Vi un cielo nuevo y una tierra nueva, porque el primer cielo y la primera tierra habían pasado. Vi la ciudad santa, la nueva Jerusalén, que bajaba del cielo. Y oí una voz que decía: 'Ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor, porque las primeras cosas pasaron.'" },
];

// --- DOCTRINA CLAVE ---
const doctrineChunks = [
  { reference: "Lumen Gentium 8", title: "La Iglesia de Cristo subsiste en la Iglesia Católica", content: "Esta Iglesia, constituida y ordenada en este mundo como una sociedad, subsiste en la Iglesia católica, gobernada por el sucesor de Pedro y por los Obispos en comunión con él, si bien fuera de su estructura se encuentran muchos elementos de santificación y de verdad que, como bienes propios de la Iglesia de Cristo, impelen hacia la unidad católica." },
  { reference: "Dei Verbum 9", title: "Tradición y Escritura", content: "La Sagrada Tradición y la Sagrada Escritura constituyen un solo depósito sagrado de la Palabra de Dios, confiado a la Iglesia. Ambas deben ser aceptadas y veneradas con el mismo espíritu de devoción y reverencia." },
  { reference: "Sacrosanctum Concilium 7", title: "Presencia de Cristo en la Liturgia", content: "Cristo está siempre presente en su Iglesia, sobre todo en la acción litúrgica. Está presente en el sacrificio de la Misa, tanto en la persona del ministro, como sobre todo bajo las especies eucarísticas. Está presente con su fuerza en los sacramentos. Está presente en su palabra. Está presente cuando la Iglesia suplica y canta." },
  { reference: "Gaudium et Spes 22", title: "Cristo revela el hombre al hombre", content: "En realidad, el misterio del hombre sólo se esclarece en el misterio del Verbo encarnado. Cristo, el nuevo Adán, en la misma revelación del misterio del Padre y de su amor, manifiesta plenamente el hombre al propio hombre y le descubre la sublimidad de su vocación." },
  { reference: "Humanae Vitae 14", title: "Anticoncepción", content: "La Iglesia enseña que cualquier acto matrimonial debe quedar abierto a la transmisión de la vida. Esta doctrina, muchas veces expuesta por el Magisterio, está fundada sobre la inseparable conexión que Dios ha querido y que el hombre no puede romper por propia iniciativa, entre los dos significados del acto conyugal: el significado unitivo y el significado procreador." },
  { reference: "Evangelii Gaudium 24", title: "Iglesia en salida", content: "La Iglesia 'en salida' es la comunidad de discípulos misioneros que primerean, que se involucran, que acompañan, que fructifican y festejan. La comunidad evangelizadora experimenta que el Señor tomó la iniciativa, la ha primereado en el amor." },
  { reference: "Laudato Si' 1", title: "Cuidado de la casa común", content: "'Laudato si', mi' Signore' – 'Alabado seas, mi Señor', cantaba san Francisco de Asís. En este hermoso cántico nos recordaba que nuestra casa común es también como una hermana, con la cual compartimos la existencia, y como una madre bella que nos acoge entre sus brazos." },
];

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding error: ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== Deno.env.get("ADMIN_API_KEY")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check existing count
    const { count } = await supabase
      .from("knowledge_chunks")
      .select("*", { count: "exact", head: true });

    if ((count || 0) > 50) {
      return new Response(
        JSON.stringify({ message: "Knowledge base already seeded", existing_chunks: count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allChunks = [
      ...catechismChunks.map(c => ({ ...c, source: "catecismo" })),
      ...bibleChunks.map(c => ({ ...c, source: "biblia" })),
      ...doctrineChunks.map(c => ({ ...c, source: "doctrina" })),
    ];

    const results = [];
    const batchSize = 5;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);

      const embeddings = await Promise.all(
        batch.map(chunk =>
          generateEmbedding(`${chunk.reference}: ${chunk.content}`, OPENAI_API_KEY)
        )
      );

      const rows = batch.map((chunk, idx) => ({
        source: chunk.source,
        reference: chunk.reference,
        title: chunk.title,
        content: chunk.content,
        embedding: JSON.stringify(embeddings[idx]),
        metadata: {},
      }));

      const { data, error } = await supabase
        .from("knowledge_chunks")
        .insert(rows)
        .select("id");

      if (error) {
        console.error(`Batch ${i / batchSize} error:`, error);
        results.push({ batch: i / batchSize, error: error.message });
      } else {
        results.push({ batch: i / batchSize, inserted: data?.length || 0 });
        console.log(`Batch ${i / batchSize}: inserted ${data?.length} chunks`);
      }
    }

    const totalInserted = results.reduce(
      (sum, r) => sum + ((r as any).inserted || 0),
      0
    );

    return new Response(
      JSON.stringify({
        success: true,
        total_chunks: allChunks.length,
        total_inserted: totalInserted,
        results,
        breakdown: {
          catecismo: catechismChunks.length,
          biblia: bibleChunks.length,
          doctrina: doctrineChunks.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("seed-knowledge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
