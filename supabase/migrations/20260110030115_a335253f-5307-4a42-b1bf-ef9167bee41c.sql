
-- Add patron saints from all countries worldwide
-- This adds ~55 patron saints from Europe, North America, Africa, Asia, and Oceania

INSERT INTO calendar_saints (name, description, feast_day, feast_month, category, country_code, tags)
VALUES
-- EUROPA
('Santiago Apóstol', 'Santiago el Mayor, uno de los doce apóstoles de Jesús, es el santo patrono de España. Según la tradición, predicó el Evangelio en la Península Ibérica antes de regresar a Jerusalén, donde fue martirizado por orden de Herodes Agripa I en el año 44 d.C. Sus restos fueron trasladados a Galicia, donde se erigió la Catedral de Santiago de Compostela, uno de los centros de peregrinación más importantes del mundo cristiano.', 25, 7, 'patron_country', 'ES', ARRAY['apóstol', 'peregrino', 'europa', 'mártir']),
('San Francisco de Asís', 'Giovanni di Pietro di Bernardone, conocido como San Francisco de Asís, es el santo patrono de Italia. Fundador de la Orden Franciscana, renunció a su riqueza para vivir en pobreza absoluta. Es conocido por su amor a la naturaleza y los animales, y por recibir los estigmas de Cristo.', 4, 10, 'patron_country', 'IT', ARRAY['fundador', 'pobreza', 'europa', 'estigmas']),
('Santa Juana de Arco', 'Juana de Arco, la Doncella de Orleans, es patrona de Francia. A los 17 años, guiada por visiones celestiales, lideró al ejército francés a varias victorias durante la Guerra de los Cien Años. Murió quemada en la hoguera en 1431 con apenas 19 años.', 30, 5, 'patron_country', 'FR', ARRAY['mártir', 'virgen', 'europa', 'guerrera']),
('Inmaculada Concepción de Portugal', 'La Inmaculada Concepción de María es la patrona de Portugal desde 1646, cuando el rey Juan IV consagró el país a la Virgen. La corona real portuguesa quedó reservada para la imagen de la Virgen como verdadera Reina de Portugal.', 8, 12, 'patron_country', 'PT', ARRAY['virgen maría', 'dogma', 'europa', 'fátima']),
('San Patricio', 'San Patricio es el santo patrono de Irlanda y uno de los misioneros más célebres de la historia. Usó el trébol para explicar la Santísima Trinidad. Su fiesta, el 17 de marzo, se celebra mundialmente con desfiles.', 17, 3, 'patron_country', 'IE', ARRAY['misionero', 'europa', 'obispo', 'trébol']),
('Virgen de Częstochowa', 'La Virgen Negra de Częstochowa es la patrona de Polonia. El icono muestra a María con cicatrices en el rostro. El rey Juan II Casimiro proclamó a María como Reina de Polonia.', 26, 8, 'patron_country', 'PL', ARRAY['virgen maría', 'icono', 'europa', 'reina']),
('San Bonifacio', 'San Bonifacio, el Apóstol de los Germanos, es patrono de Alemania. Famoso por talar el Roble de Thor, fue martirizado en Frisia en el 754.', 5, 6, 'patron_country', 'DE', ARRAY['misionero', 'europa', 'obispo', 'mártir']),
('San José de Austria', 'San José, esposo de la Virgen María y padre adoptivo de Jesús, es el patrono de Austria. Su devoción creció especialmente durante el Imperio Habsburgo.', 19, 3, 'patron_country', 'AT', ARRAY['padre', 'trabajador', 'europa', 'carpintero']),
('San Esteban de Hungría', 'San Esteban I fue el primer rey de Hungría y es su santo patrono. Unificó las tribus magiares y estableció el Reino de Hungría en el año 1000.', 20, 8, 'patron_country', 'HU', ARRAY['rey', 'europa', 'fundador', 'corona']),
('San Venceslao', 'San Venceslao, duque de Bohemia, es el patrono de la República Checa. Fue asesinado por su hermano Boleslao en el año 935.', 28, 9, 'patron_country', 'CZ', ARRAY['mártir', 'europa', 'duque']),
('Virgen de los Dolores de Eslovaquia', 'La Virgen de los Dolores es la patrona de Eslovaquia. El santuario de Šaštín es el centro de esta devoción.', 15, 9, 'patron_country', 'SK', ARRAY['virgen maría', 'dolor', 'europa']),
('San Andrés de Grecia', 'San Andrés Apóstol es el patrono de Grecia. Fue crucificado en Patras en una cruz en forma de X.', 30, 11, 'patron_country', 'GR', ARRAY['apóstol', 'europa', 'mártir', 'cruz']),
('San Miguel de Ucrania', 'San Miguel Arcángel es el patrono de Ucrania y especialmente de Kiev. Es venerado como protector contra el mal.', 29, 9, 'patron_country', 'UA', ARRAY['arcángel', 'europa', 'protector', 'kiev']),
('San Nicolás de Flüe', 'San Nicolás de Flüe, conocido como Bruder Klaus, es el patrono de Suiza. Su consejo evitó una guerra civil en 1481.', 25, 9, 'patron_country', 'CH', ARRAY['ermitaño', 'europa', 'pacificador']),
('San Willibrord', 'San Willibrord es el apóstol de los Países Bajos. Fundó la diócesis de Utrecht y evangelizó a los frisones.', 7, 11, 'patron_country', 'NL', ARRAY['misionero', 'europa', 'obispo']),
('San Enrique de Upsala', 'San Enrique, obispo de Upsala, es el patrono de Finlandia. Fue martirizado en el siglo XII.', 19, 1, 'patron_country', 'FI', ARRAY['mártir', 'europa', 'obispo']),
('Santa Brígida de Suecia', 'Santa Brígida es la patrona de Suecia y copatrona de Europa. Mística y fundadora de la Orden del Santísimo Salvador.', 23, 7, 'patron_country', 'SE', ARRAY['mística', 'europa', 'fundadora']),
('San Olaf', 'San Olaf II fue rey de Noruega y es su santo patrono. Murió en la batalla de Stiklestad en 1030.', 29, 7, 'patron_country', 'NO', ARRAY['rey', 'europa', 'mártir', 'vikingo']),
('San Canuto IV', 'San Canuto IV fue rey de Dinamarca y es su santo patrono. Murió asesinado en la iglesia de San Albano en 1086.', 19, 1, 'patron_country', 'DK', ARRAY['rey', 'europa', 'mártir']),
('San Casimiro', 'San Casimiro, príncipe de Polonia y Lituania, es el patrono de Lituania. Murió de tuberculosis a los 25 años.', 4, 3, 'patron_country', 'LT', ARRAY['príncipe', 'europa', 'joven']),
('San Pablo de Malta', 'San Pablo es el patrono de Malta, donde naufragó durante su viaje a Roma. Una víbora le mordió pero no le hizo daño.', 10, 2, 'patron_country', 'MT', ARRAY['apóstol', 'europa', 'naufragio']),
('San Andrés de Escocia', 'San Andrés Apóstol es el patrono de Escocia. La Cruz de San Andrés forma la bandera escocesa.', 30, 11, 'patron_country', 'GB-SCT', ARRAY['apóstol', 'europa', 'bandera']),
('San David de Gales', 'San David, conocido en galés como Dewi Sant, es el patrono de Gales. Su fiesta el 1 de marzo es el día nacional.', 1, 3, 'patron_country', 'GB-WLS', ARRAY['obispo', 'europa', 'misionero']),
('San Jorge de Inglaterra', 'San Jorge es el patrono de Inglaterra. Soldado romano famoso por la leyenda de su lucha contra el dragón.', 23, 4, 'patron_country', 'GB-ENG', ARRAY['mártir', 'europa', 'soldado', 'dragón']),
-- NORTEAMÉRICA
('Inmaculada Concepción de Estados Unidos', 'La Inmaculada Concepción es la patrona de Estados Unidos desde 1846. La Basílica en Washington D.C. es la iglesia católica más grande de Norteamérica.', 8, 12, 'patron_country', 'US', ARRAY['virgen maría', 'dogma', 'norteamérica']),
('San José de Canadá', 'San José es el patrono de Canadá, declarado así por el Papa Pío X en 1908. El Oratorio de San José en Montreal es el santuario más grande del mundo dedicado a él.', 19, 3, 'patron_country', 'CA', ARRAY['padre', 'trabajador', 'norteamérica']),
-- ÁFRICA
('San Marcos Evangelista', 'San Marcos Evangelista es el patrono de Egipto y fundador de la Iglesia de Alejandría. Fue martirizado arrastrado por las calles.', 25, 4, 'patron_country', 'EG', ARRAY['evangelista', 'áfrica', 'mártir']),
('San Jorge de Etiopía', 'San Jorge es profundamente venerado en Etiopía como patrono nacional. Las iglesias de Lalibela incluyen Bet Giyorgis.', 23, 4, 'patron_country', 'ET', ARRAY['mártir', 'áfrica', 'soldado', 'dragón']),
('Virgen de la Asunción de Sudáfrica', 'La Virgen de la Asunción es la patrona de Sudáfrica. La catedral de la Asunción en Ciudad del Cabo es la iglesia madre.', 15, 8, 'patron_country', 'ZA', ARRAY['virgen maría', 'áfrica', 'asunción']),
('Virgen Reina de Nigeria', 'La Virgen María como Reina de Nigeria es la patrona de este país africano. El santuario de Elele es un importante centro de peregrinación.', 1, 10, 'patron_country', 'NG', ARRAY['virgen maría', 'áfrica', 'reina']),
('Inmaculado Corazón de María de Angola', 'El Inmaculado Corazón de María es la advocación patrona de Angola. La devoción está ligada a las apariciones de Fátima.', 22, 8, 'patron_country', 'AO', ARRAY['virgen maría', 'áfrica', 'corazón']),
-- ASIA
('Inmaculada Concepción de Filipinas', 'La Inmaculada Concepción es la patrona principal de Filipinas, el único país de mayoría católica en Asia.', 8, 12, 'patron_country', 'PH', ARRAY['virgen maría', 'asia', 'dogma']),
('Santo Tomás Apóstol de India', 'Santo Tomás Apóstol es el patrono de India. Según la tradición, llegó a Kerala en el año 52 d.C.', 3, 7, 'patron_country', 'IN', ARRAY['apóstol', 'asia', 'mártir']),
('San Francisco Javier de Japón', 'San Francisco Javier es el patrono de Japón, donde llevó el cristianismo en 1549. Cofundador de la Compañía de Jesús.', 3, 12, 'patron_country', 'JP', ARRAY['misionero', 'asia', 'jesuita']),
('San Andrés Kim Taegon', 'San Andrés Kim Taegon es el patrono de Corea. Fue el primer sacerdote coreano, decapitado en 1846 a los 25 años.', 20, 9, 'patron_country', 'KR', ARRAY['mártir', 'asia', 'sacerdote']),
('Virgen de La Vang', 'La Virgen de La Vang es la patrona de Vietnam. Se apareció a católicos perseguidos en 1798 prometiéndoles protección.', 15, 8, 'patron_country', 'VN', ARRAY['virgen maría', 'asia', 'aparición']),
('Virgen de Sheshan', 'La Virgen de Sheshan es venerada como patrona de China. El santuario cerca de Shanghái es el más importante centro católico.', 24, 5, 'patron_country', 'CN', ARRAY['virgen maría', 'asia', 'santuario']),
('Virgen del Líbano', 'Nuestra Señora del Líbano, también conocida como Virgen de Harissa, es la patrona del Líbano. Su santuario es símbolo de unidad.', 1, 5, 'patron_country', 'LB', ARRAY['virgen maría', 'asia', 'santuario']),
-- OCEANÍA
('María Auxiliadora de Australia', 'María Auxiliadora es la patrona de Australia. El santuario en Melbourne es un importante centro de devoción.', 24, 5, 'patron_country', 'AU', ARRAY['virgen maría', 'oceanía', 'auxiliadora']),
('Virgen de la Asunción de Nueva Zelanda', 'La Virgen de la Asunción es la patrona de Nueva Zelanda. La Iglesia Católica llegó con los misioneros maristas.', 15, 8, 'patron_country', 'NZ', ARRAY['virgen maría', 'oceanía', 'asunción']),
('San Miguel de Papúa Nueva Guinea', 'San Miguel Arcángel es el patrono de Papúa Nueva Guinea. El arcángel guerrero es venerado como protector.', 29, 9, 'patron_country', 'PG', ARRAY['arcángel', 'oceanía', 'protector']),
-- CARIBE
('Virgen del Perpetuo Socorro de Haití', 'La Virgen del Perpetuo Socorro es la patrona de Haití. La devoción fue llevada por los misioneros redentoristas.', 27, 6, 'patron_country', 'HT', ARRAY['virgen maría', 'caribe', 'icono']),
('Virgen de La Divina Pastora', 'La Virgen de La Divina Pastora es patrona de Trinidad y Tobago. Su procesión anual es muy popular.', 24, 4, 'patron_country', 'TT', ARRAY['virgen maría', 'caribe', 'pastora']);
