
-- ========================================
-- FASE 1: Historias Completas para 20 Patronos Latinoamericanos
-- ========================================

-- 1. México - Virgen de Guadalupe
UPDATE calendar_saints SET description = 'El 9 de diciembre de 1531, en el cerro del Tepeyac, al norte de la Ciudad de México, la Virgen María se apareció al indígena Juan Diego Cuauhtlatoatzin. Se presentó hablando en náhuatl como "la perfecta siempre Virgen Santa María, Madre del verdadero Dios por quien se vive". Durante cuatro apariciones consecutivas, le pidió que fuera ante el obispo Juan de Zumárraga para solicitar la construcción de un templo en ese lugar.

Como prueba del milagro ante el obispo incrédulo, la Virgen hizo brotar rosas de Castilla en pleno invierno y dejó su imagen milagrosamente impresa en la tilma de maguey de Juan Diego. Esta imagen, que científicamente no debería haber durado más de 20 años, se conserva intacta después de casi 500 años en la Basílica de Guadalupe.

La tilma muestra a una mujer mestiza, embarazada, vestida con símbolos que los indígenas reconocieron inmediatamente: el manto azul-verdoso del color de la realeza, las estrellas representando el cielo, y el sol detrás de ella. A sus pies, la luna y un ángel. Esta imagen provocó la conversión de millones de indígenas al cristianismo.

Guadalupe es considerada "Emperatriz de las Américas" y su festividad el 12 de diciembre congrega a más de 10 millones de peregrinos, siendo el santuario mariano más visitado del mundo. Juan Diego fue canonizado por San Juan Pablo II en 2002.'
WHERE country_code = 'MX' AND category = 'patron_country';

-- 2. Argentina - Nuestra Señora de Luján
UPDATE calendar_saints SET description = 'En mayo de 1630, un hacendado portugués llamado Antonio Farías de Sáa solicitó desde Brasil una imagen de la Virgen para su capilla en Sumampa, Santiago del Estero. Cuando la carreta que transportaba dos imágenes de la Virgen llegó a las orillas del río Luján, los bueyes se negaron a continuar. 

Los arrieros descargaron una de las imágenes y los animales pudieron moverse, pero al cargarla nuevamente se detuvieron. Interpretaron esto como señal divina de que la Virgen quería quedarse en ese lugar. La imagen, una pequeña estatua de terracota de apenas 38 centímetros, fue alojada inicialmente en la estancia de Rosendo de Oramas.

Durante décadas, la devoción creció. En 1671, la imagen fue trasladada a una capilla propia y en 1763 se construyó el primer santuario formal. La actual Basílica de Luján, de estilo neogótico, fue consagrada en 1930 tras 40 años de construcción.

Nuestra Señora de Luján fue declarada Patrona de Argentina en 1930, y también es venerada como Patrona de Uruguay y Paraguay. Cada año, millones de peregrinos caminan hasta 60 kilómetros en la tradicional peregrinación juvenil desde Buenos Aires. La imagen original permanece en un camarín detrás del altar mayor, vestida con su característico manto celeste y blanco.'
WHERE country_code = 'AR' AND category = 'patron_country';

-- 3. Brasil - Nuestra Señora Aparecida
UPDATE calendar_saints SET description = 'En octubre de 1717, tres pescadores humildes del río Paraíba do Sul en Brasil - Domingos García, João Alves y Felipe Pedroso - fueron enviados a pescar para un banquete del gobernador. Después de horas sin éxito, lanzaron sus redes una vez más cerca del Puerto de Itaguaçu y sacaron una pequeña imagen de terracota ennegrecida de la Virgen María, sin cabeza.

En el siguiente lance, recuperaron la cabeza de la imagen. A partir de ese momento, la pesca fue tan abundante que casi hundieron la canoa. La imagen, de apenas 36 centímetros, había permanecido sumergida aproximadamente 15 años. Los pescadores la llevaron a casa y comenzaron a rezar ante ella, experimentando numerosos milagros.

La devoción creció rápidamente. Se construyeron capillas cada vez más grandes, hasta que en 1980 fue consagrada la actual Basílica de Nuestra Señora Aparecida, la segunda iglesia católica más grande del mundo después de San Pedro en el Vaticano, con capacidad para 45,000 personas.

Nuestra Señora Aparecida fue declarada Patrona de Brasil por el Papa Pío XI en 1929, y canonizada su santuario como Basílica Menor. El 12 de octubre, día de su festividad, es feriado nacional en Brasil y millones de peregrinos visitan el santuario anualmente, convirtiéndolo en el mayor centro de peregrinación mariana de América.'
WHERE country_code = 'BR' AND category = 'patron_country';

-- 4. Colombia - Nuestra Señora del Rosario de Chiquinquirá
UPDATE calendar_saints SET description = 'La historia de la Virgen de Chiquinquirá comienza con un lienzo deteriorado. En 1562, el pintor español Alonso de Narváez creó una imagen de la Virgen del Rosario para la capilla de Suta, Colombia. Con el tiempo, el lienzo se deterioró gravemente por la humedad y el abandono, quedando casi irreconocible.

En 1586, María Ramos, una mujer piadosa de Chiquinquirá, rescató el cuadro maltratado y lo colocó en su humilde oratorio. El 26 de diciembre de ese año, mientras oraba con una indígena llamada Isabel y un niño, el lienzo comenzó a brillar y la imagen se renovó milagrosamente ante sus ojos, restaurándose los colores y recuperando su esplendor original.

Este milagro de la renovación atrajo multitudes de peregrinos. La imagen muestra a la Virgen con el Niño Jesús, flanqueada por San Antonio de Padua y San Andrés Apóstol. El lienzo original, que científicamente debería haberse desintegrado hace siglos, permanece en perfecto estado.

La Virgen de Chiquinquirá fue coronada canónicamente en 1919 y declarada Patrona de Colombia. Su santuario en Chiquinquirá, departamento de Boyacá, recibe millones de devotos cada año. La festividad principal se celebra el 9 de julio, aunque cada domingo miles de fieles peregrinan al santuario.'
WHERE country_code = 'CO' AND category = 'patron_country';

-- 5. Perú - Señor de los Milagros
UPDATE calendar_saints SET description = 'En el siglo XVII, en el barrio de Pachacamilla de Lima, un esclavo angoleño pintó en una pared de adobe la imagen de Cristo crucificado. El 13 de noviembre de 1655, un devastador terremoto destruyó Lima, pero el muro con la imagen permaneció intacto mientras todo a su alrededor se derrumbaba.

Este prodigio atrajo la devoción popular. En 1687, otro terremoto asoló Lima y nuevamente el muro resistió. Fue entonces cuando se le dio el título de "Señor de los Milagros". La imagen original, pintada con técnica simple sobre adobe, muestra a Cristo en la cruz con colores ocre y morado característicos.

En 1746, después de otro terremoto devastador, se organizó la primera procesión oficial. Hoy, la procesión del Señor de los Milagros en octubre es la manifestación religiosa más grande de América y una de las mayores del mundo, con más de un millón de devotos vistiendo el característico hábito morado.

El Señor de los Milagros es Patrono de Lima y del Perú. Su festividad se celebra el 18 y 19 de octubre, y durante todo el mes de octubre ("mes morado") Lima se viste de devoción. La imagen original permanece en el Santuario de Las Nazarenas, donde fue trasladada en 1771.'
WHERE country_code = 'PE' AND category = 'patron_country';

-- 6. Chile - Virgen del Carmen
UPDATE calendar_saints SET description = 'La devoción a la Virgen del Carmen llegó a Chile con los conquistadores españoles en el siglo XVI. Sin embargo, su vínculo especial con la nación chilena se consolidó durante la Guerra de Independencia. El 5 de enero de 1817, el Libertador Bernardo OHiggins prometió en Mendoza construir un templo en honor a la Virgen del Carmen si el ejército patriota triunfaba.

Tras la victoria en la Batalla de Chacabuco el 12 de febrero de 1817, OHiggins cumplió su promesa. El 14 de marzo de 1818, antes de la decisiva Batalla de Maipú, el ejército patriota fue consagrado a la Virgen del Carmen. La victoria del 5 de abril selló la independencia y la Virgen fue proclamada Patrona y Generala del Ejército de Chile.

En 1923, el Papa Pío XI la declaró oficialmente Patrona de Chile. Su imagen es venerada especialmente en el Templo Votivo de Maipú, construido para cumplir la promesa de OHiggins. La festividad del 16 de julio es celebrada en todo el país con procesiones y actos religiosos.

La Virgen del Carmen es también patrona de los pescadores, de la Armada de Chile y de los Carabineros. Miles de chilenos llevan el escapulario del Carmen como signo de su devoción y protección maternal.'
WHERE country_code = 'CL' AND category = 'patron_country';

-- 7. Venezuela - Virgen de Coromoto
UPDATE calendar_saints SET description = 'La aparición de la Virgen de Coromoto ocurrió en 1651 en el territorio de los indígenas Cospes, en el actual estado Portuguesa de Venezuela. El cacique Coromoto y su esposa vieron a una hermosa señora que les habló en su idioma, pidiéndoles que fueran a la casa de los blancos para recibir el agua en la cabeza (el bautismo).

Inicialmente, Coromoto se convirtió, pero después intentó huir a la selva rechazando la fe. El 8 de septiembre de 1652, la Virgen se le apareció nuevamente en su choza. Cuando Coromoto intentó agarrarla con ira, la Señora desapareció dejando en su mano una pequeña imagen de aproximadamente 2.5 centímetros, milagrosamente impresa.

Esta diminuta reliquia, única en el mundo por haber sido entregada directamente por la Virgen María, se conserva en el Santuario Nacional de Nuestra Señora de Coromoto en Guanare. Es una de las imágenes marianas más pequeñas veneradas en el mundo.

La Virgen de Coromoto fue declarada Patrona de Venezuela por el Papa Pío XII en 1942. El santuario actual, consagrado en 1996 por San Juan Pablo II durante su visita a Venezuela, es un moderno templo que recibe millones de peregrinos. El 8 de septiembre se celebra su fiesta con gran fervor en todo el país.'
WHERE country_code = 'VE' AND category = 'patron_country';

-- 8. Ecuador - Virgen del Quinche
UPDATE calendar_saints SET description = 'La historia de la Virgen del Quinche comienza en 1586, cuando el escultor Diego de Robles talló una imagen de la Virgen María para los indígenas de Lumbisí, Ecuador. Sin embargo, los Oyacachis, un pueblo de la Amazonía ecuatoriana, quedaron tan impresionados con la imagen que la adquirieron para su comunidad.

En Oyacachi, la imagen comenzó a obrar prodigios: protegía a la comunidad de los osos que atacaban sus cultivos y ganado. Los indígenas la llamaban "Nuestra Señora de Oyacachi" y después "del Quinche" cuando fue trasladada a este pueblo en 1604 debido a que el clima frío de Oyacachi deterioraba la madera.

La talla representa a la Virgen con el Niño Jesús, coronada y vestida con elaborados mantos. Mide aproximadamente 62 centímetros y está tallada en madera de cedro. Su rostro mestizo la hace especialmente cercana al pueblo ecuatoriano.

La Virgen del Quinche fue coronada canónicamente en 1943 y declarada Patrona del Ecuador. Su santuario, ubicado a 50 kilómetros de Quito, recibe millones de peregrinos especialmente en noviembre. La romería del 21 de noviembre es una de las más grandes de Sudamérica, con peregrinos caminando durante días desde todas las provincias.'
WHERE country_code = 'EC' AND category = 'patron_country';

-- 9. Bolivia - Virgen de Copacabana
UPDATE calendar_saints SET description = 'La Virgen de Copacabana tiene su origen en 1583, cuando Francisco Tito Yupanqui, un indígena descendiente de los incas, talló una imagen de la Virgen María para su pueblo a orillas del Lago Titicaca. Inicialmente rechazada por considerarla tosca, Yupanqui viajó a Potosí para perfeccionar su técnica.

El 2 de febrero de 1583, la imagen finalmente fue entronizada en Copacabana. Casi inmediatamente comenzaron los milagros: sanaciones, conversiones y prodigios que atrajeron peregrinos de todo el virreinato. La imagen, de aproximadamente un metro de altura, representa a la Virgen de la Candelaria sosteniendo al Niño Jesús y una vela.

El santuario de Copacabana se convirtió en el centro de peregrinación más importante de los Andes. La devoción se extendió hasta Brasil, donde el famoso barrio de Copacabana en Río de Janeiro lleva su nombre por una capilla erigida en su honor en el siglo XVII.

La Virgen de Copacabana fue declarada Patrona de Bolivia y es también venerada como Reina de la Nación. Su festividad principal se celebra el 2 de febrero (Candelaria) y el 5 de agosto (fiesta de la Virgen de las Nieves). El santuario, declarado Basílica Menor, recibe cientos de miles de peregrinos anualmente.'
WHERE country_code = 'BO' AND category = 'patron_country';

-- 10. Paraguay - Virgen de Caacupé
UPDATE calendar_saints SET description = 'La leyenda de la Virgen de Caacupé narra que en el siglo XVI, un indígena guaraní llamado José fue perseguido por enemigos mbayáes. Escondiéndose detrás de un árbol, prometió a la Virgen que si lo salvaba, tallaría su imagen en esa madera. Milagrosamente, los enemigos no lo vieron y pasaron de largo.

Fiel a su promesa, José talló dos imágenes: una más grande para la iglesia de Tobatí y una pequeña para su devoción personal. Esta pequeña imagen, de apenas 50 centímetros, es la que hoy se venera como la Virgen de Caacupé. Cuando el Lago Ypacaraí se desbordó en una gran inundación, la imagen pequeña apareció flotando intacta sobre las aguas.

La Virgen de Caacupé representa a la Inmaculada Concepción, vestida de azul y blanco, los colores de la bandera paraguaya. Su santuario en la ciudad de Caacupé es el centro espiritual del Paraguay.

Fue declarada Patrona del Paraguay y cada 8 de diciembre, día de la Inmaculada Concepción, más de dos millones de personas peregrinan a Caacupé, muchos caminando cientos de kilómetros. Es la manifestación religiosa más grande del Paraguay y una de las mayores de Sudamérica.'
WHERE country_code = 'PY' AND category = 'patron_country';

-- 11. Uruguay - Virgen de los Treinta y Tres
UPDATE calendar_saints SET description = 'La Virgen de los Treinta y Tres debe su nombre a los 33 Orientales, los patriotas uruguayos que el 19 de abril de 1825 iniciaron la cruzada libertadora para independizar la Banda Oriental del dominio brasileño. Antes de partir desde Buenos Aires, estos valientes juraron ante una imagen de la Virgen de la Asunción.

La imagen original era custodiada por las monjas del Convento de San José de Buenos Aires. Durante la campaña libertadora, el general Juan Antonio Lavalleja llevaba consigo una pequeña réplica de esta imagen como estandarte de su ejército. La devoción se consolidó con el triunfo de la independencia uruguaya.

En 1857, la imagen fue trasladada a la Catedral de Florida, donde permanece hasta hoy. Es una talla de madera policromada de aproximadamente 36 centímetros que representa a la Virgen María con el Niño Jesús en brazos, coronada y vestida con manto celeste.

La Virgen de los Treinta y Tres fue declarada Patrona del Uruguay por el Papa Juan XXIII en 1962. Su festividad se celebra el segundo domingo de noviembre con una gran peregrinación nacional a Florida. La imagen es símbolo de la fe y la patria uruguaya, uniendo la identidad católica con la historia de la independencia nacional.'
WHERE country_code = 'UY' AND category = 'patron_country';

-- 12. Costa Rica - Virgen de los Ángeles
UPDATE calendar_saints SET description = 'El 2 de agosto de 1635, una joven mestiza llamada Juana Pereira encontró una pequeña estatua de piedra de la Virgen con el Niño sobre una roca en el bosque de Cartago, Costa Rica. La llevó a su casa, pero misteriosamente la imagen regresaba siempre al mismo lugar sobre la piedra.

Este fenómeno se repitió varias veces, incluso cuando el párroco la guardó bajo llave en la iglesia. Interpretando esto como señal divina de que la Virgen quería ser venerada en ese lugar, se construyó una ermita que eventualmente se convirtió en la actual Basílica de los Ángeles.

La imagen, conocida cariñosamente como "La Negrita" por su color oscuro, mide apenas 20 centímetros. Está tallada en una piedra de origen volcánico y representa a la Virgen María sosteniendo al Niño Jesús. Según estudios, la piedra es una mezcla de grafito, jade y roca volcánica única en la región.

La Virgen de los Ángeles fue declarada Patrona de Costa Rica en 1824. Cada 2 de agosto, más de dos millones de "romeros" peregrinan a Cartago, muchos caminando de rodillas el último tramo hasta la basílica. Es la manifestación de fe más grande de Centroamérica.'
WHERE country_code = 'CR' AND category = 'patron_country';

-- 13. Guatemala - Cristo Negro de Esquipulas
UPDATE calendar_saints SET description = 'En 1594, el escultor portugués Quirio Cataño talló una imagen de Cristo crucificado para la iglesia de Esquipulas, Guatemala. Utilizó madera de naranjo amargo y bálsamo oscuro, lo que le dio a la imagen su característico color negro. Con el tiempo, el humo de las velas de los devotos oscureció aún más la figura.

La devoción al Cristo Negro creció rápidamente cuando comenzaron a reportarse milagros de sanación. En 1737, el arzobispo Pedro Pardo de Figueroa, gravemente enfermo, viajó a Esquipulas y sanó milagrosamente. En agradecimiento, mandó construir la actual basílica, consagrada en 1759.

La imagen mide aproximadamente 1.5 metros y representa a Cristo en la cruz con expresión serena. La madera oscura ha sido interpretada teológicamente como símbolo de que Cristo vino por todos los pueblos, especialmente los marginados. La basílica de Esquipulas es llamada "la Roma de Centroamérica".

El Cristo Negro de Esquipulas es venerado en toda Centroamérica y el sur de México. Su fiesta principal es el 15 de enero, cuando cientos de miles de peregrinos llegan caminando desde países vecinos. Es el centro de peregrinación más importante de Centroamérica y uno de los más visitados de América Latina.'
WHERE country_code = 'GT' AND category = 'patron_country';

-- 14. Honduras - Virgen de Suyapa
UPDATE calendar_saints SET description = 'Según la tradición, en febrero de 1747, el campesino Alejandro Colindres y su ayudante Lorenzo Martínez regresaban de trabajar en el campo cerca de Tegucigalpa. Al caer la noche, decidieron dormir al lado del camino. Lorenzo sintió algo que le molestaba en la espalda y encontró una pequeña imagen de la Virgen María.

La estatuilla, de apenas 6.5 centímetros de alto, estaba tallada en madera de cedro. Alejandro la llevó a su casa y la colocó en un altar improvisado. Pronto comenzaron a reportarse milagros y sanaciones, y la devoción se extendió rápidamente por todo Honduras.

La imagen representa a la Inmaculada Concepción: la Virgen María de pie sobre una luna creciente, con las manos juntas en oración. A pesar de su diminuto tamaño, muestra un detalle artístico extraordinario. Es una de las imágenes marianas más pequeñas veneradas en el mundo.

La Virgen de Suyapa fue declarada Patrona de Honduras por el Papa Pío XI en 1925. Su santuario, una moderna basílica inaugurada en 2005, es el centro de la fe hondureña. La fiesta del 3 de febrero congrega a más de un millón de devotos, convirtiéndose en la mayor celebración religiosa del país.'
WHERE country_code = 'HN' AND category = 'patron_country';

-- 15. El Salvador - Virgen de la Paz
UPDATE calendar_saints SET description = 'La Virgen de la Paz tiene su origen en 1682, cuando comerciantes que viajaban de Guatemala a San Salvador llevaban una imagen de la Virgen María destinada a Perú. Al pasar por el pueblo de San Miguel, la caja que contenía la imagen se volvió inexplicablemente pesada y fue imposible moverla.

Los viajeros interpretaron esto como señal de que la Virgen quería quedarse en San Miguel. La imagen fue entronizada en la iglesia parroquial y pronto comenzaron los milagros. Durante las epidemias y terremotos que azotaron la región, los habitantes invocaron su protección y fueron librados de mayores desgracias.

La imagen representa a la Virgen María con el Niño Jesús, vestida con elaborados mantos bordados en oro. Tiene aproximadamente 80 centímetros de altura y muestra rasgos europeos con una expresión de profunda ternura y paz.

La Virgen de la Paz fue declarada Patrona de El Salvador por el Papa Pablo VI en 1966. Su festividad el 21 de noviembre es feriado nacional y la procesión en San Miguel es una de las más grandes del país. Durante la guerra civil salvadoreña (1979-1992), su intercesión fue invocada constantemente, y muchos atribuyen el fin del conflicto a su maternal protección.'
WHERE country_code = 'SV' AND category = 'patron_country';

-- 16. Nicaragua - Virgen de la Inmaculada Concepción de El Viejo
UPDATE calendar_saints SET description = 'La imagen de la Virgen de El Viejo llegó a Nicaragua en el siglo XVI, traída según la tradición por el hermano del conquistador Pedrarias Dávila. Es una de las imágenes marianas más antiguas de América continental, tallada en madera policromada con rasgos renacentistas españoles.

La imagen representa a la Inmaculada Concepción: la Virgen María de pie sobre una luna creciente, coronada con doce estrellas, pisando la serpiente del pecado. Mide aproximadamente 47 centímetros y está vestida con ricos mantos bordados que se cambian según las festividades litúrgicas.

El santuario en la ciudad de El Viejo, departamento de Chinandega, se convirtió en centro de peregrinación para toda Nicaragua y países vecinos. La basílica actual, de estilo colonial, conserva la imagen en un camarín especial detrás del altar mayor.

La Virgen de El Viejo fue declarada Patrona de Nicaragua y su festividad del 6 al 8 de diciembre atrae a cientos de miles de peregrinos. Las celebraciones incluyen el tradicional "lavado de la plata", donde los devotos limpian las joyas y exvotos de la Virgen en una ceremonia que simboliza la purificación espiritual.'
WHERE country_code = 'NI' AND category = 'patron_country';

-- 17. Panamá - Santa María la Antigua
UPDATE calendar_saints SET description = 'Santa María la Antigua es una advocación mariana que tiene su origen en la Catedral de Sevilla, España, donde se venera una imagen gótica del siglo XIV. Esta devoción llegó a América con los conquistadores españoles, quienes en 1510 fundaron la primera ciudad europea en tierra firme americana con el nombre de Santa María la Antigua del Darién.

La advocación se refiere a la "Antigua" catedral de Sevilla, donde los marineros sevillanos rezaban antes de partir hacia el Nuevo Mundo. La imagen original muestra a la Virgen María sosteniendo al Niño Jesús y una rosa, con una expresión de dulce maternidad.

Cuando Vasco Núñez de Balboa descubrió el Océano Pacífico en 1513, lo hizo bajo la protección de Santa María la Antigua. La devoción se extendió por todo el istmo panameño, convirtiéndose en símbolo de la fe de los primeros cristianos en América.

Santa María la Antigua fue declarada Patrona de Panamá por el Papa Pío XII en 1952. Su festividad se celebra el 9 de septiembre. La Catedral Metropolitana de Panamá conserva una imagen de esta advocación, y el nombre completo del país en su primera constitución era "República de Panamá bajo la protección de Santa María la Antigua".'
WHERE country_code = 'PA' AND category = 'patron_country';

-- 18. Cuba - Virgen de la Caridad del Cobre
UPDATE calendar_saints SET description = 'A principios del siglo XVII, dos indígenas y un niño negro llamado Juan Moreno navegaban en la Bahía de Nipe buscando sal cuando encontraron una imagen de la Virgen María flotando sobre las aguas en una tablilla que decía "Yo soy la Virgen de la Caridad". La imagen estaba completamente seca a pesar de flotar en el mar.

La imagen fue llevada al pueblo de El Cobre, cerca de Santiago de Cuba, donde comenzó a obrar prodigios. Durante los siglos de esclavitud, la Virgen de la Caridad fue venerada especialmente por los esclavos africanos, quienes la asociaron con Ochún, la deidad yoruba del amor y la fertilidad, creando un sincretismo religioso único.

La imagen mide aproximadamente 60 centímetros y representa a la Virgen coronada sosteniendo al Niño Jesús y una cruz de oro. A sus pies se representa la escena de su hallazgo: los tres Juanes en su pequeña embarcación sobre las aguas turbulentas.

La Virgen de la Caridad fue declarada Patrona de Cuba por el Papa Benedicto XV en 1916, a petición de los veteranos de la Guerra de Independencia. Su santuario en El Cobre es el más importante de Cuba. El 8 de septiembre, cubanos en la isla y en el exilio celebran unidos su festividad.'
WHERE country_code = 'CU' AND category = 'patron_country';

-- 19. República Dominicana - Virgen de la Altagracia
UPDATE calendar_saints SET description = 'La Virgen de la Altagracia llegó a la isla de La Española (hoy República Dominicana y Haití) en 1502 con los hermanos Antonio y Alonso Trejo, comerciantes españoles. La imagen fue un regalo para su hija, pero ella la donó a la iglesia de Higüey en la región oriental de la isla.

La pintura, de autor desconocido, representa una escena de la Natividad. Muestra a la Virgen María con manto azul estrellado contemplando al Niño Jesús en el pesebre, mientras San José observa desde las sombras. Una gran estrella de doce puntas brilla sobre la escena, simbolizando la guía divina.

El primer milagro documentado ocurrió cuando una niña enferma sanó al tocar la imagen. Desde entonces, miles de curaciones y prodigios han sido atribuidos a la Virgen de la Altagracia. La Basílica de Higüey, moderna estructura inaugurada en 1971, fue diseñada para albergar hasta 12,000 peregrinos.

La Virgen de la Altagracia fue declarada Patrona de la República Dominicana en 1922 por el Papa Pío XI. El 21 de enero, Día de la Altagracia, es feriado nacional. La peregrinación anual a Higüey es la expresión religiosa más importante del país, con millones de devotos que acuden al santuario.'
WHERE country_code = 'DO' AND category = 'patron_country';

-- 20. Puerto Rico - Virgen de la Divina Providencia
UPDATE calendar_saints SET description = 'La devoción a la Virgen de la Divina Providencia llegó a Puerto Rico en el siglo XIX con los misioneros catalanes. Esta advocación mariana tiene su origen en Italia en el siglo XIII, cuando la Orden de los Siervos de María comenzó a venerar a la Virgen bajo el título de "Madre de la Divina Providencia".

La imagen representa a la Virgen María con el Niño Jesús dormido en su regazo, en una escena de íntima ternura maternal. El Niño descansa confiado en los brazos de su Madre, simbolizando la providencia divina que cuida de todos sus hijos. Es una de las representaciones más tiernas de la maternidad de María.

El primer obispo puertorriqueño, Monseñor Juan Alejo de Arizmendi, promovió esta devoción como símbolo de la identidad católica puertorriqueña. La imagen fue entronizada en la Catedral de San Juan y su devoción se extendió por toda la isla.

La Virgen de la Divina Providencia fue declarada Patrona Principal de Puerto Rico por el Papa Pablo VI en 1969. El 19 de noviembre es día de celebración especial, aunque no feriado oficial. Miles de puertorriqueños, tanto en la isla como en la diáspora, invocan su protección maternal.'
WHERE country_code = 'PR' AND category = 'patron_country';

-- ========================================
-- FASE 2: Crear 20 Oraciones Específicas
-- ========================================

INSERT INTO oraciones (nombre, texto, categoria, historia, es_fundamental, orden, tags)
VALUES 
-- 1. México
('Oración a la Virgen de Guadalupe', 
'Virgen Santísima de Guadalupe, Madre de Dios y Madre nuestra, que te apareciste en el Tepeyac para ofrecer tu amor, compasión, auxilio y defensa a todos los habitantes de esta tierra.

Tú que prometiste escuchar nuestro llanto y remediar todas nuestras miserias, penas y dolores, te suplicamos nos alcances de tu Santísimo Hijo la gracia de conservar la fe, la esperanza y la caridad.

Danos salud y bienestar, pero sobre todo danos la paz interior que solo tu Hijo puede dar. Protege nuestras familias, nuestros hogares y nuestra patria.

Madre de misericordia, haz que vivamos siempre cerca de ti y de tu Hijo Jesús. Que al final de nuestra vida terrenal podamos gozar de la vida eterna en el cielo.

Virgen Morena del Tepeyac, bendice a tus hijos y mantennos bajo tu manto protector. Amén.',
'Patronos',
'Esta oración recoge las promesas que la Virgen de Guadalupe hizo a San Juan Diego en sus apariciones de 1531. Refleja la espiritualidad mexicana y latinoamericana que ve en Guadalupe a la madre cercana y compasiva.',
false, 201, ARRAY['patrona', 'méxico', 'guadalupe', 'tepeyac']),

-- 2. Argentina
('Oración a Nuestra Señora de Luján',
'Virgen de Luján, Madre del pueblo argentino, que elegiste quedarte en estas tierras para acompañarnos con tu amor maternal.

Tú que detuviste la carreta para mostrar tu deseo de permanecer junto a nosotros, enséñanos a detenernos en el camino de la vida para escuchar la voz de Dios.

Protege a nuestra patria, a nuestras familias y a todos los que sufren. Acompaña a los que caminan buscando tu ayuda y consuela a los que lloran.

Madre de la esperanza, fortalece nuestra fe y ayúdanos a vivir como verdaderos cristianos, siguiendo el ejemplo de tu Hijo Jesús.

Virgen de Luján, ruega por nosotros y condúcenos al cielo. Amén.',
'Patronos',
'La devoción a Nuestra Señora de Luján se remonta a 1630 cuando la imagen se detuvo milagrosamente en las pampas argentinas. Esta oración evoca el prodigio fundacional y pide su protección maternal.',
false, 202, ARRAY['patrona', 'argentina', 'luján', 'peregrinación']),

-- 3. Brasil
('Oração a Nossa Senhora Aparecida',
'Ó Maria Santíssima, que sob o título de Nossa Senhora Aparecida fostes proclamada Padroeira do Brasil, eu vos agradeço pelas bênçãos que, por vossa intercessão, tenho recebido de Deus.

Vós que fostes encontrada nas águas do rio Paraíba, socorrei-me nas tempestades da vida. Vós que reunistes os pescadores na fé, mantende unidos os filhos desta nação.

Ó Mãe bendita, dai-me a graça de viver sempre na presença de Deus e de seguir os passos de vosso Filho Jesus. Protegei minha família, meu trabalho e minha pátria.

Fazei com que, ao término desta vida, eu possa convosco louvar a Deus eternamente no céu.

Nossa Senhora Aparecida, rogai por nós! Amém.',
'Patronos',
'Esta oración en portugués honra a la Patrona de Brasil, encontrada milagrosamente en las aguas del río Paraíba en 1717. Es rezada por millones de brasileños especialmente el 12 de octubre.',
false, 203, ARRAY['patrona', 'brasil', 'aparecida', 'pescadores']),

-- 4. Colombia
('Oración a Nuestra Señora de Chiquinquirá',
'Virgen Santísima de Chiquinquirá, que renovaste milagrosamente tu imagen para renovar también nuestra fe, te suplicamos renueves nuestros corazones.

Tú que quisiste aparecer entre San Antonio y San Andrés, enséñanos a amar la humildad y el celo por las almas. Renueva en nosotros la esperanza cuando todo parezca perdido.

Madre del pueblo colombiano, protege nuestra nación de la violencia y el odio. Danos la paz que solo tu Hijo puede dar y enséñanos a ser artesanos de reconciliación.

Virgen de la Renovación, ayúdanos a renovar nuestra vida espiritual cada día. Que podamos experimentar en nuestras almas el milagro de tu amor transformador.

Nuestra Señora de Chiquinquirá, ruega por nosotros. Amén.',
'Patronos',
'La Virgen de Chiquinquirá es conocida por el milagro de la renovación de su imagen en 1586. Esta oración pide la renovación espiritual y la paz para Colombia.',
false, 204, ARRAY['patrona', 'colombia', 'chiquinquirá', 'renovación']),

-- 5. Perú
('Oración al Señor de los Milagros',
'Señor de los Milagros, Cristo de Pachacamilla, ante tu sagrada imagen vengo a postrarme con fe y devoción.

Tú que permaneciste en pie cuando todo se derrumbaba, sostén mi vida cuando las pruebas me agobien. Tú que has obrado tantos prodigios a través de los siglos, escucha mis súplicas.

Señor de la esperanza de los pobres, mira con bondad a los que sufren, a los enfermos, a los que no tienen trabajo, a los que han perdido la fe.

Por tu pasión y muerte en la cruz, concédeme las gracias que necesito para mi salvación y la de mi familia. Que tu sangre redentora purifique mi alma y me dé fuerzas para seguirte hasta el final.

Señor de los Milagros, en ti confío. Amén.',
'Patronos',
'El Señor de los Milagros es la imagen pintada por un esclavo angoleño que sobrevivió al terremoto de 1655. Esta oración refleja la profunda devoción peruana que llena las calles de morado cada octubre.',
false, 205, ARRAY['patrono', 'perú', 'milagros', 'pachacamilla', 'octubre morado']),

-- 6. Chile
('Oración a la Virgen del Carmen',
'Virgen Santísima del Monte Carmelo, Patrona y Generala de Chile, a ti acudimos con filial confianza.

Tú que protegiste al ejército libertador y escuchaste la promesa de nuestros padres de la patria, sigue protegiendo esta nación que te fue consagrada.

Madre del Carmelo, viste con el santo escapulario nuestras almas y líbranos de los peligros del cuerpo y del espíritu. Que tu escapulario sea prenda de salvación y señal de tu protección.

Enséñanos a vivir la fe de nuestros mayores y a transmitirla a las nuevas generaciones. Que Chile sea siempre una nación que honre a Dios y te venere como su celestial Patrona.

Virgen del Carmen, ruega por Chile y por todos sus hijos. Amén.',
'Patronos',
'La Virgen del Carmen fue proclamada Patrona de Chile después de las victorias de Chacabuco y Maipú. Esta oración recuerda el voto de OHiggins y pide la protección continua para la nación.',
false, 206, ARRAY['patrona', 'chile', 'carmen', 'carmelo', 'escapulario']),

-- 7. Venezuela
('Oración a la Virgen de Coromoto',
'Dulcísima Virgen de Coromoto, Madre de Dios y Madre nuestra, que te apareciste al cacique Coromoto para traer la fe a Venezuela.

Tú que dejaste tu santa imagen como prenda de tu amor, míranos con bondad y escucha nuestras súplicas. Protege nuestra patria en estos tiempos difíciles y danos la paz.

Madre de Venezuela, intercede ante tu Hijo por los que sufren, por los enfermos, por los que han tenido que dejar su tierra, por los que buscan trabajo y esperanza.

Ayúdanos a ser fieles al mensaje del Evangelio y a vivir como verdaderos cristianos. Que la pequeña imagen que dejaste en las manos de Coromoto sea siempre signo de tu presencia entre nosotros.

Virgen de Coromoto, ruega por Venezuela. Amén.',
'Patronos',
'La Virgen de Coromoto se apareció en 1651 al cacique Coromoto, dejándole una pequeña imagen que aún se conserva. Esta oración pide su intercesión por Venezuela y su pueblo.',
false, 207, ARRAY['patrona', 'venezuela', 'coromoto', 'guanare']),

-- 8. Ecuador
('Oración a la Virgen del Quinche',
'Virgen Santísima del Quinche, Madre del Ecuador, que desde tu santuario velas por todos tus hijos.

Tú que protegías a los indígenas de Oyacachi y que elegiste quedarte en el Quinche, protege también a nuestra nación de todo mal y peligro.

Madre de los ecuatorianos, acoge nuestras súplicas y preséntalas ante tu Hijo Jesús. Danos la gracia de vivir en paz, de trabajar con honestidad y de amar a nuestros hermanos.

Virgen del Quinche, acompaña a los romeros que caminan hacia tu santuario y a todos los que te invocan desde cualquier lugar del mundo.

Que tu maternal protección nos cubra siempre y que algún día podamos contemplarte en la gloria del cielo. Amén.',
'Patronos',
'La Virgen del Quinche, tallada por Diego de Robles en 1586, es la Patrona del Ecuador. Esta oración acompaña a los millones de peregrinos que cada año caminan hacia su santuario.',
false, 208, ARRAY['patrona', 'ecuador', 'quinche', 'romería']),

-- 9. Bolivia
('Oración a la Virgen de Copacabana',
'Reina de Bolivia, Virgen Morena de Copacabana, desde el Lago Titicaca extiendes tu manto protector sobre todos nosotros.

Tú que inspiraste a Francisco Tito Yupanqui para tallarte y que has obrado innumerables prodigios, escucha nuestras oraciones.

Madre de la Candelaria, ilumina nuestro camino con la luz de tu Hijo. Protege a Bolivia, a sus familias, a sus trabajadores, a sus gobernantes. Danos la paz y la unidad que tanto necesitamos.

Virgen del Lago Sagrado, que tu imagen tallada con manos indígenas nos recuerde que Cristo vino para todos los pueblos. Que sigamos tu ejemplo de fe y perseverancia.

Nuestra Señora de Copacabana, ruega por Bolivia. Amén.',
'Patronos',
'La Virgen de Copacabana fue tallada por el inca Francisco Tito Yupanqui en 1583. Es venerada como Reina de Bolivia y su santuario junto al Lago Titicaca es el más importante de los Andes.',
false, 209, ARRAY['patrona', 'bolivia', 'copacabana', 'titicaca', 'candelaria']),

-- 10. Paraguay
('Oración a la Virgen de Caacupé',
'Virgen Serrana de Caacupé, Madre del pueblo paraguayo, que desde tu santuario acompañas nuestra historia.

Tú que protegiste al indio José de sus perseguidores y que apareciste flotando sobre las aguas, protégenos de todo mal y peligro.

Madre de los guaraníes y de todos los paraguayos, bendice nuestras familias, nuestro trabajo, nuestra tierra. Que tu azul manto nos cubra y tu maternal amor nos consuele.

Virgen de Caacupé, acompaña a los romeros que cada diciembre caminan hacia tu casa. Recibe nuestras ofrendas y nuestras penas, y preséntalas ante tu Hijo.

Patrona del Paraguay, llévanos siempre hacia Jesús. Amén.',
'Patronos',
'La Virgen de Caacupé es la Patrona del Paraguay, cuya leyenda se remonta al siglo XVI. Cada 8 de diciembre, millones de paraguayos peregrinan a su santuario en la mayor manifestación de fe del país.',
false, 210, ARRAY['patrona', 'paraguay', 'caacupé', 'serrana']),

-- 11. Uruguay
('Oración a la Virgen de los Treinta y Tres',
'Virgen de los Treinta y Tres, Patrona del Uruguay, que acompañaste a los libertadores en su gesta heroica.

Tú que fuiste estandarte de fe para quienes lucharon por la libertad, sigue siendo guía para todos los uruguayos en la construcción de una patria justa y solidaria.

Madre de la Independencia, protege nuestra nación y bendice a todos sus habitantes. Que sepamos valorar la libertad conquistada y usarla para el bien común.

Virgen de Florida, enséñanos a unir fe y patria, oración y compromiso, amor a Dios y amor al prójimo. Que siguiendo tu ejemplo, sepamos servir con generosidad.

Nuestra Señora de los Treinta y Tres, ruega por Uruguay. Amén.',
'Patronos',
'La Virgen de los Treinta y Tres acompañó la cruzada libertadora de 1825. Esta oración une la fe católica con la identidad nacional uruguaya, invocando su protección sobre la patria.',
false, 211, ARRAY['patrona', 'uruguay', 'treinta y tres', 'florida']),

-- 12. Costa Rica
('Oración a la Virgen de los Ángeles',
'Negrita linda, Virgen de los Ángeles, Patrona de Costa Rica, a ti venimos con amor filial.

Tú que quisiste quedarte en la piedra donde te encontró Juana Pereira, quédate también en nuestros corazones. Nunca te alejes de nosotros.

Madre de los costarricenses, protege nuestra tierra de paz, nuestras familias, nuestros niños, nuestros ancianos. Acompaña a los romeros que cada agosto caminan hacia Cartago.

Virgencita de los Ángeles, tú que haces milagros grandes y pequeños, escucha nuestras súplicas. Sana a los enfermos, consuela a los afligidos, da esperanza a los que la han perdido.

Nuestra Señora de los Ángeles, ruega por Costa Rica y por todos tus hijos. Amén.',
'Patronos',
'La Negrita, como cariñosamente se le llama, apareció en 1635 en Cartago. Esta oración refleja el amor tierno que los costarricenses profesan a su pequeña Patrona.',
false, 212, ARRAY['patrona', 'costa rica', 'ángeles', 'negrita', 'cartago']),

-- 13. Guatemala
('Oración al Cristo Negro de Esquipulas',
'Cristo Negro de Esquipulas, Señor de los Milagros de Guatemala y Centroamérica, ante tu imagen venerable me postro con fe.

Tú que desde tu cruz oscura irradias luz y esperanza, ilumina mi camino. Tú que has sanado a tantos enfermos a través de los siglos, sana también mis dolencias del cuerpo y del alma.

Señor de Esquipulas, mira con bondad a los pobres, a los indígenas, a los migrantes, a todos los que sufren en nuestra tierra centroamericana.

Por tu pasión y muerte, dame fuerzas para cargar mi propia cruz. Por tu resurrección, dame esperanza en la vida eterna.

Cristo de Esquipulas, en ti confío. Sé mi refugio y mi salvación. Amén.',
'Patronos',
'El Cristo Negro de Esquipulas, tallado en 1594, es el centro de peregrinación más importante de Centroamérica. Esta oración recoge la profunda devoción de los pueblos mesoamericanos.',
false, 213, ARRAY['patrono', 'guatemala', 'esquipulas', 'cristo negro']),

-- 14. Honduras
('Oración a la Virgen de Suyapa',
'Virgencita de Suyapa, pequeña en tamaño pero grande en milagros, Patrona de Honduras, a ti vengo con fe.

Tú que fuiste encontrada por campesinos humildes y que desde entonces has derramado bendiciones sobre nuestro pueblo, escucha mi oración.

Madre de los hondureños, protege nuestra patria, danos trabajo, paz y esperanza. Cuida a nuestras familias, especialmente a los niños y a los que sufren.

Virgen de Suyapa, que tu pequeña imagen nos recuerde que para Dios no hay nada pequeño ni insignificante. Enséñanos a confiar en la providencia divina.

Nuestra Señora de Suyapa, llévanos a Jesús. Amén.',
'Patronos',
'La Virgen de Suyapa, de apenas 6.5 centímetros, fue encontrada en 1747 y es la Patrona de Honduras. Esta oración honra su humilde grandeza y pide su protección maternal.',
false, 214, ARRAY['patrona', 'honduras', 'suyapa', 'tegucigalpa']),

-- 15. El Salvador
('Oración a la Virgen de la Paz',
'Reina de la Paz, Patrona de El Salvador, a ti acudimos en busca de la paz que el mundo no puede dar.

Tú que quisiste quedarte en San Miguel cuando te llevaban a otras tierras, quédate siempre en nuestros corazones y en nuestra patria.

Madre de la Paz, que tantos milagros has obrado, intercede por El Salvador. Sana las heridas de la guerra, reconcilia a los hermanos divididos, da esperanza a los que sufren.

Virgen de la Paz, enséñanos a ser constructores de paz en nuestras familias, en nuestras comunidades, en nuestra nación. Que la paz de Cristo reine en nuestros corazones.

Nuestra Señora de la Paz, ruega por El Salvador. Amén.',
'Patronos',
'La Virgen de la Paz llegó milagrosamente a San Miguel en 1682. Durante la guerra civil salvadoreña, su intercesión fue invocada constantemente. Esta oración pide paz para El Salvador.',
false, 215, ARRAY['patrona', 'el salvador', 'paz', 'san miguel']),

-- 16. Nicaragua
('Oración a la Virgen de El Viejo',
'Virgen Santísima de la Inmaculada Concepción de El Viejo, Patrona de Nicaragua, desde los primeros días de la conquista has cuidado de esta tierra.

Tú que llegaste con los conquistadores pero te quedaste con los conquistados, intercede por todos los nicaragüenses, especialmente por los más pobres y necesitados.

Madre Inmaculada, que tu pureza ilumine nuestras vidas. Que tu ejemplo de fidelidad a Dios nos inspire a vivir como verdaderos cristianos.

Virgen de El Viejo, protege a Nicaragua en estos tiempos difíciles. Danos la paz, la reconciliación y la justicia que tanto necesitamos.

Nuestra Señora de El Viejo, ruega por Nicaragua. Amén.',
'Patronos',
'La Virgen de El Viejo es una de las imágenes marianas más antiguas de América. Esta oración pide su protección sobre Nicaragua y refleja la devoción del pueblo nicaragüense.',
false, 216, ARRAY['patrona', 'nicaragua', 'el viejo', 'inmaculada']),

-- 17. Panamá
('Oración a Santa María la Antigua',
'Santa María la Antigua, Patrona de Panamá, primera advocación mariana de Tierra Firme, te honramos con filial devoción.

Tú que guiaste a los navegantes hacia estas tierras y que acompañaste a Vasco Núñez de Balboa al descubrir el Mar del Sur, sigue guiando nuestros pasos.

Madre Antigua y siempre nueva, protege a Panamá, puente del mundo y corazón del universo. Bendice a nuestras familias y a todos los que cruzan por nuestra tierra.

Virgen de los conquistadores y de los conquistados, une a todos los panameños bajo tu manto protector. Que seamos fieles a la fe que nos trajeron nuestros mayores.

Santa María la Antigua, ruega por Panamá. Amén.',
'Patronos',
'Santa María la Antigua fue la advocación bajo la cual se fundó la primera ciudad en tierra firme americana en 1510. Esta oración honra la herencia histórica de la fe panameña.',
false, 217, ARRAY['patrona', 'panamá', 'antigua', 'darién']),

-- 18. Cuba
('Oración a la Virgen de la Caridad del Cobre',
'Virgen de la Caridad del Cobre, Madre de los cubanos, que apareciste sobre las aguas para traer esperanza a nuestro pueblo.

Tú que eres Madre de todos sin distinción, une a tus hijos dispersos por el mundo. Que los cubanos de la isla y los del exilio seamos uno solo bajo tu manto.

Cachita querida, protege a Cuba. Consuela a los que sufren, fortalece a los débiles, da esperanza a los que la han perdido.

Madre de la Caridad, enséñanos a amarnos como hermanos. Que tu caridad sea nuestro ejemplo y que la caridad de Cristo reine en Cuba.

Virgen Mambisa, Patrona de Cuba, ruega por nosotros. Amén.',
'Patronos',
'La Virgen de la Caridad del Cobre apareció flotando en las aguas en 1612. Es la Patrona de Cuba y esta oración refleja el anhelo de unidad del pueblo cubano.',
false, 218, ARRAY['patrona', 'cuba', 'caridad', 'cobre', 'cachita']),

-- 19. República Dominicana
('Oración a la Virgen de la Altagracia',
'Virgen de la Altagracia, Madre de los dominicanos, que desde tu santuario de Higüey velas por todos nosotros.

Tú que contemplas al Niño Jesús en el pesebre, enséñanos a contemplar a Cristo en nuestra vida diaria. Tú que eres estrella que guía, ilumina nuestro camino.

Madre de la Altagracia, protege a la República Dominicana. Bendice nuestras familias, nuestro trabajo, nuestra tierra. Cuida especialmente a los más pobres y necesitados.

Virgen de la Estrella, que tu luz disipe las tinieblas de nuestro país. Que brille en nosotros la gracia de tu Hijo y que demos testimonio de su amor.

Nuestra Señora de la Altagracia, ruega por nosotros. Amén.',
'Patronos',
'La Virgen de la Altagracia llegó a la isla en 1502 y es la Patrona de la República Dominicana. Su fiesta el 21 de enero es la celebración religiosa más importante del país.',
false, 219, ARRAY['patrona', 'república dominicana', 'altagracia', 'higüey']),

-- 20. Puerto Rico
('Oración a la Virgen de la Divina Providencia',
'Virgen de la Divina Providencia, Madre de Puerto Rico, en ti confiamos porque tú nos llevas a tu Hijo que todo lo provee.

Tú que sostienes al Niño dormido en tu regazo, sostén también a tus hijos boricuas en los momentos de prueba. Que descansemos confiados en la providencia de Dios.

Madre Providente, cuida de Puerto Rico, de sus familias, de sus jóvenes, de todos los que han tenido que emigrar. Que nunca perdamos la fe de nuestros abuelos.

Virgen de la Providencia, enséñanos a confiar en Dios en todo momento. Que sepamos que Él provee para nuestras necesidades según su infinito amor.

Nuestra Señora de la Divina Providencia, ruega por Puerto Rico. Amén.',
'Patronos',
'La Virgen de la Divina Providencia fue declarada Patrona de Puerto Rico en 1969. Esta oración refleja la confianza del pueblo boricua en la providencia divina a través de María.',
false, 220, ARRAY['patrona', 'puerto rico', 'providencia', 'boricua']);

-- ========================================
-- FASE 3: Vincular Oraciones a Santos
-- ========================================

UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de Guadalupe') WHERE country_code = 'MX' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a Nuestra Señora de Luján') WHERE country_code = 'AR' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oração a Nossa Senhora Aparecida') WHERE country_code = 'BR' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a Nuestra Señora de Chiquinquirá') WHERE country_code = 'CO' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración al Señor de los Milagros') WHERE country_code = 'PE' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen del Carmen') WHERE country_code = 'CL' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de Coromoto') WHERE country_code = 'VE' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen del Quinche') WHERE country_code = 'EC' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de Copacabana') WHERE country_code = 'BO' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de Caacupé') WHERE country_code = 'PY' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de los Treinta y Tres') WHERE country_code = 'UY' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de los Ángeles') WHERE country_code = 'CR' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración al Cristo Negro de Esquipulas') WHERE country_code = 'GT' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de Suyapa') WHERE country_code = 'HN' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de la Paz') WHERE country_code = 'SV' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de El Viejo') WHERE country_code = 'NI' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a Santa María la Antigua') WHERE country_code = 'PA' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de la Caridad del Cobre') WHERE country_code = 'CU' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de la Altagracia') WHERE country_code = 'DO' AND category = 'patron_country';
UPDATE calendar_saints SET prayer_id = (SELECT id FROM oraciones WHERE nombre = 'Oración a la Virgen de la Divina Providencia') WHERE country_code = 'PR' AND category = 'patron_country';
