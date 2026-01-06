-- Create oraciones (traditional prayers) table
CREATE TABLE public.oraciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  texto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  historia TEXT,
  audio_url TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oraciones ENABLE ROW LEVEL SECURITY;

-- Public read access for prayers
CREATE POLICY "Anyone can view prayers" 
ON public.oraciones 
FOR SELECT 
USING (true);

-- Create user_oraciones_favoritas (user favorite prayers)
CREATE TABLE public.user_oraciones_favoritas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  oracion_id UUID NOT NULL REFERENCES public.oraciones(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, oracion_id)
);

-- Enable RLS
ALTER TABLE public.user_oraciones_favoritas ENABLE ROW LEVEL SECURITY;

-- Users can manage their own favorites
CREATE POLICY "Users can view their favorites" 
ON public.user_oraciones_favoritas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
ON public.user_oraciones_favoritas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
ON public.user_oraciones_favoritas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user_rosario_progress (rosary session tracking)
CREATE TABLE public.user_rosario_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  misterio_tipo TEXT NOT NULL,
  completado BOOLEAN DEFAULT false,
  decenas_completadas INTEGER DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  duracion_minutos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_rosario_progress ENABLE ROW LEVEL SECURITY;

-- Users can manage their own rosary progress
CREATE POLICY "Users can view their rosary progress" 
ON public.user_rosario_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert rosary progress" 
ON public.user_rosario_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update rosary progress" 
ON public.user_rosario_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert traditional prayers
INSERT INTO public.oraciones (nombre, texto, categoria, subcategoria, historia, orden) VALUES
-- Oraciones Básicas
('Padre Nuestro', 'Padre nuestro, que estás en el cielo,
santificado sea tu Nombre;
venga a nosotros tu reino;
hágase tu voluntad en la tierra como en el cielo.
Danos hoy nuestro pan de cada día;
perdona nuestras ofensas,
como también nosotros perdonamos a los que nos ofenden;
no nos dejes caer en la tentación,
y líbranos del mal. Amén.', 'Básicas', 'Fundamentales', 'La oración que Jesús enseñó a sus discípulos (Mateo 6:9-13). Es considerada la oración perfecta porque viene directamente del Señor.', 1),

('Ave María', 'Dios te salve, María, llena eres de gracia;
el Señor es contigo.
Bendita tú eres entre todas las mujeres,
y bendito es el fruto de tu vientre, Jesús.
Santa María, Madre de Dios,
ruega por nosotros, pecadores,
ahora y en la hora de nuestra muerte. Amén.', 'Básicas', 'Fundamentales', 'Combinación del saludo del ángel Gabriel (Lucas 1:28) y de Isabel (Lucas 1:42), con una súplica añadida por la Iglesia.', 2),

('Gloria', 'Gloria al Padre, y al Hijo, y al Espíritu Santo.
Como era en el principio, ahora y siempre,
por los siglos de los siglos. Amén.', 'Básicas', 'Fundamentales', 'Doxología menor que alaba a la Santísima Trinidad. Se usa al final de cada salmo y en muchas oraciones.', 3),

('Credo de los Apóstoles', 'Creo en Dios, Padre todopoderoso,
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
y la vida eterna. Amén.', 'Básicas', 'Fundamentales', 'Resumen de la fe cristiana, atribuido tradicionalmente a los doce apóstoles. Cada uno habría contribuido una línea.', 4),

-- Oraciones Marianas
('Salve Regina', 'Dios te salve, Reina y Madre de misericordia,
vida, dulzura y esperanza nuestra; Dios te salve.
A ti llamamos los desterrados hijos de Eva;
a ti suspiramos, gimiendo y llorando
en este valle de lágrimas.
Ea, pues, Señora, abogada nuestra,
vuelve a nosotros esos tus ojos misericordiosos;
y después de este destierro,
muéstranos a Jesús, fruto bendito de tu vientre.
¡Oh, clementísima, oh piadosa, oh dulce Virgen María! Amén.', 'Marianas', 'Antífonas', 'Una de las cuatro antífonas marianas. Se reza especialmente al final del Rosario y en la liturgia de las horas.', 5),

('Memorare', 'Acordaos, oh piadosísima Virgen María,
que jamás se ha oído decir
que ninguno de los que han acudido a vuestra protección,
implorando vuestro auxilio, reclamando vuestro socorro,
haya sido desamparado.
Animado por esta confianza, a vos también acudo,
oh Madre, Virgen de las vírgenes,
y gimiendo bajo el peso de mis pecados,
me atrevo a comparecer ante vuestra presencia soberana.
Oh Madre de Dios, no desechéis mis súplicas,
antes bien, escuchadlas y acogedlas benignamente. Amén.', 'Marianas', 'Súplicas', 'Atribuida a San Bernardo de Claraval. Es una oración de profunda confianza en la intercesión de María.', 6),

('Magnificat', 'Proclama mi alma la grandeza del Señor,
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
por los siglos de los siglos. Amén.', 'Marianas', 'Cánticos', 'El cántico de María al visitar a Isabel (Lucas 1:46-55). Se reza diariamente en las Vísperas.', 7),

-- Oraciones de Santos
('Oración de San Francisco', 'Señor, hazme un instrumento de tu paz.
Donde haya odio, siembre yo amor;
donde haya injuria, perdón;
donde haya duda, fe;
donde haya desesperación, esperanza;
donde haya tinieblas, luz;
donde haya tristeza, alegría.

Oh, Divino Maestro,
concédeme que no busque ser consolado, sino consolar;
ser comprendido, sino comprender;
ser amado, sino amar.
Porque dando es como recibimos;
perdonando es como somos perdonados;
y muriendo es como nacemos a la vida eterna. Amén.', 'Santos', 'San Francisco', 'Aunque popularmente atribuida a San Francisco de Asís, esta oración apareció por primera vez en 1912. Refleja perfectamente el espíritu franciscano.', 8),

('Oración de San Ignacio (Suscipe)', 'Tomad, Señor, y recibid
toda mi libertad, mi memoria,
mi entendimiento y toda mi voluntad,
todo mi haber y mi poseer.
Vos me lo disteis, a Vos, Señor, lo torno.
Todo es vuestro: disponed de ello
según vuestra voluntad.
Dadme vuestro amor y gracia,
que esto me basta. Amén.', 'Santos', 'San Ignacio', 'Oración de entrega total de los Ejercicios Espirituales de San Ignacio de Loyola. Representa la culminación del proceso de discernimiento ignaciano.', 9),

('Oración a San Miguel Arcángel', 'San Miguel Arcángel, defiéndenos en la batalla.
Sé nuestro amparo contra la perversidad
y asechanzas del demonio.
Reprímale Dios, pedimos suplicantes,
y tú, Príncipe de la Milicia Celestial,
arroja al infierno con el divino poder
a Satanás y a los otros espíritus malignos
que andan dispersos por el mundo
para la perdición de las almas. Amén.', 'Santos', 'Ángeles', 'Compuesta por el Papa León XIII en 1886 después de una visión mística. Se rezaba al final de cada Misa hasta 1964.', 10),

-- Oraciones por Momento
('Oración de la Mañana', 'Te adoro, Dios mío, y te amo con todo mi corazón.
Te doy gracias por haberme creado,
hecho cristiano y conservado en esta noche.
Te ofrezco las acciones del día de hoy:
haz que todas sean según tu santa voluntad
y para tu mayor gloria.
Presérvame del pecado y de todo mal.
Tu gracia esté siempre conmigo
y con todos mis seres queridos. Amén.', 'Por Momento', 'Mañana', 'Oración tradicional para comenzar el día ofreciendo todas las acciones a Dios.', 11),

('Oración de la Noche', 'Te doy gracias, Dios mío,
por todos los beneficios que me has concedido hoy.
Perdona las faltas que he cometido
y protégeme durante esta noche.
Te encomiendo mi descanso y mi sueño,
para que mañana pueda servirte mejor.
Bajo tu amparo me acojo,
Santa Madre de Dios.
No desprecies las súplicas
que te dirigimos en nuestras necesidades,
antes bien, líbranos siempre de todos los peligros,
Virgen gloriosa y bendita. Amén.', 'Por Momento', 'Noche', 'Oración de examen y acción de gracias para cerrar el día en paz con Dios.', 12),

('Bendición de los Alimentos', 'Bendícenos, Señor, y bendice estos alimentos
que por tu bondad vamos a tomar.
Por Jesucristo Nuestro Señor.
Da, Señor, pan a los que tienen hambre
y hambre de ti a los que tienen pan. Amén.', 'Por Momento', 'Comidas', 'Oración tradicional antes de las comidas, reconociendo que todo bien viene de Dios.', 13),

('Acción de Gracias después de Comer', 'Te damos gracias, Señor, por todos tus beneficios.
Tú que vives y reinas por los siglos de los siglos.
El Señor nos dé su paz
y la vida eterna. Amén.', 'Por Momento', 'Comidas', 'Breve oración de agradecimiento después de recibir el alimento.', 14),

-- Oraciones por Intención
('Por los Enfermos', 'Señor Jesús, que durante tu vida terrena
mostraste tu amor sanando a los enfermos,
te pido por todos los que sufren enfermedad.
Dales paciencia en su dolor,
fortaleza en su debilidad,
esperanza en su angustia
y resignación cristiana en su sufrimiento.
Concede a los médicos y enfermeros
sabiduría y caridad
para atenderlos con diligencia y amor.
Y si es tu voluntad, devuélveles la salud
del cuerpo y del alma. Amén.', 'Por Intención', 'Enfermos', 'Oración de intercesión por quienes padecen enfermedad, pidiendo sanación y fortaleza.', 15),

('Por los Difuntos', 'Dales, Señor, el descanso eterno,
y brille para ellos la luz perpetua.
Descansen en paz.
Y a nosotros, pecadores,
concédenos tu misericordia y perdón,
para que un día podamos reunirnos
en tu Reino con todos nuestros seres queridos
que nos han precedido en la fe.
Por Jesucristo, Nuestro Señor. Amén.', 'Por Intención', 'Difuntos', 'Oración tradicional por el eterno descanso de las almas de los fieles difuntos.', 16),

('Por la Familia', 'Sagrada Familia de Nazaret,
concede a nuestras familias
las gracias de la unidad y el amor.
Que nuestros hogares sean como el vuestro:
lugares de oración, de trabajo
y de mutua comprensión.
San José, protector del hogar,
cuida de nuestras familias.
Virgen María, madre amorosa,
intercede por nuestros hijos.
Niño Jesús, fuente de alegría,
bendice nuestras casas. Amén.', 'Por Intención', 'Familia', 'Oración encomendando la familia a la protección de la Sagrada Familia de Nazaret.', 17),

('Por Vocaciones', 'Señor de la mies,
que llamaste a los apóstoles
y los enviaste a predicar el Evangelio,
suscita en tu Iglesia vocaciones
al sacerdocio, a la vida consagrada
y al matrimonio cristiano.
Da a los jóvenes generosidad
para responder a tu llamada,
y a los que ya has elegido,
perseverancia y santidad. Amén.', 'Por Intención', 'Vocaciones', 'Oración pidiendo por nuevas vocaciones para la Iglesia y por los que ya sirven.', 18),

-- Oraciones Eucarísticas
('Visita al Santísimo', 'Jesús Sacramentado, creo que estás aquí presente.
Te adoro con profunda reverencia.
Perdona mis pecados,
dame la gracia de amarte cada día más
y de recibirte dignamente en la Comunión.
Bendice a mi familia, a mis amigos
y a toda la Iglesia.
Quédate conmigo, Señor,
porque sin ti nada puedo. Amén.', 'Eucarísticas', 'Adoración', 'Oración para realizar una visita al Santísimo Sacramento en el sagrario.', 19),

('Alma de Cristo', 'Alma de Cristo, santifícame.
Cuerpo de Cristo, sálvame.
Sangre de Cristo, embriágame.
Agua del costado de Cristo, lávame.
Pasión de Cristo, confórtame.
Oh, buen Jesús, óyeme.
Dentro de tus llagas, escóndeme.
No permitas que me aparte de ti.
Del maligno enemigo, defiéndeme.
En la hora de mi muerte, llámame.
Y mándame ir a ti,
para que con tus santos te alabe,
por los siglos de los siglos. Amén.', 'Eucarísticas', 'Comunión', 'Oración medieval atribuida a varios santos. San Ignacio la recomendaba después de la Comunión.', 20);