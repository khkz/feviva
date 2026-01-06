-- Create novenas table
CREATE TABLE public.novenas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  intencion TEXT NOT NULL,
  dias JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of 9 days with prayers
  imagen_url TEXT,
  categoria TEXT NOT NULL DEFAULT 'general',
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user novena progress table
CREATE TABLE public.user_novena_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  novena_id UUID NOT NULL REFERENCES public.novenas(id) ON DELETE CASCADE,
  dia_actual INTEGER NOT NULL DEFAULT 1,
  dias_completados JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of completed day numbers
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, novena_id)
);

-- Enable RLS
ALTER TABLE public.novenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_novena_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for novenas (public read)
CREATE POLICY "Anyone can view novenas" 
ON public.novenas 
FOR SELECT 
USING (true);

-- RLS policies for user_novena_progress
CREATE POLICY "Users can view their novena progress" 
ON public.user_novena_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their novena progress" 
ON public.user_novena_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their novena progress" 
ON public.user_novena_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert sample novenas
INSERT INTO novenas (titulo, descripcion, intencion, categoria, orden, dias) VALUES
('Novena a la Virgen María', 'Nueve días de oración a Nuestra Señora para obtener su intercesión', 'Por todas las intenciones que llevamos en el corazón', 'mariana', 1,
'[
  {"dia": 1, "titulo": "Primer Día - La Anunciación", "oracion": "Oh María, Virgen llena de gracia, que recibiste con humildad el anuncio del ángel Gabriel. Enséñanos a decir sí a la voluntad de Dios en nuestras vidas. Te pedimos que intercedas por nosotros ante tu Hijo Jesús. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Meditemos sobre la humildad de María al aceptar ser la Madre del Salvador."},
  {"dia": 2, "titulo": "Segundo Día - La Visitación", "oracion": "Madre querida, que llevaste a Jesús en tu vientre para visitar a tu prima Isabel. Ayúdanos a llevar a Cristo a todos los que encontremos en nuestro camino. Que como tú, seamos portadores de alegría y esperanza. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Reflexionemos sobre el servicio y la caridad de María hacia los demás."},
  {"dia": 3, "titulo": "Tercer Día - El Nacimiento de Jesús", "oracion": "Virgen Santa, que diste a luz al Salvador del mundo en la pobreza de Belén. Enséñanos a valorar la sencillez y a encontrar a Dios en las cosas pequeñas. Que nuestro corazón sea un pesebre donde Jesús pueda nacer cada día. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Contemplemos la alegría del nacimiento de Jesús y la fe de María."},
  {"dia": 4, "titulo": "Cuarto Día - La Presentación", "oracion": "María, Madre fiel, que presentaste a Jesús en el templo y escuchaste la profecía de Simeón. Danos fortaleza para aceptar los dolores que la vida nos presente, confiando siempre en el plan de Dios. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Meditemos sobre la obediencia de María a la ley de Dios."},
  {"dia": 5, "titulo": "Quinto Día - El Niño Perdido", "oracion": "Madre angustiada, que buscaste a Jesús con dolor cuando se quedó en el templo. Cuando nos sintamos perdidos o confundidos, ayúdanos a buscarlo con la misma perseverancia. Que siempre lo encontremos en la oración y los sacramentos. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Reflexionemos sobre nuestra búsqueda de Dios en momentos de dificultad."},
  {"dia": 6, "titulo": "Sexto Día - Las Bodas de Caná", "oracion": "María intercesora, que en Caná presentaste las necesidades de los novios a tu Hijo. Presenta también nuestras necesidades ante Él. Confíamos en que tu intercesión es poderosa y que Jesús escucha siempre a su Madre. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Contemplemos el poder de la intercesión de María."},
  {"dia": 7, "titulo": "Séptimo Día - Al Pie de la Cruz", "oracion": "Madre dolorosa, que permaneciste firme al pie de la cruz mientras tu Hijo moría. Danos esa misma fortaleza en nuestros sufrimientos. Que unamos nuestros dolores a los de Cristo para la salvación del mundo. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Meditemos sobre el sufrimiento redentor y la fortaleza de María."},
  {"dia": 8, "titulo": "Octavo Día - Pentecostés", "oracion": "María, Madre de la Iglesia, que estuviste presente cuando el Espíritu Santo descendió sobre los apóstoles. Ruega por nosotros para que seamos llenos del mismo Espíritu. Que tengamos el valor de anunciar el Evangelio al mundo. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Reflexionemos sobre la acción del Espíritu Santo en la Iglesia y en nosotros."},
  {"dia": 9, "titulo": "Noveno Día - La Asunción", "oracion": "Reina del Cielo, que fuiste asunta en cuerpo y alma a la gloria celestial. Recuérdanos que nuestro destino final es el cielo. Ayúdanos a vivir cada día preparándonos para ese encuentro definitivo con Dios. Ave María llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.", "reflexion": "Contemplemos la gloria de María y nuestra esperanza en la vida eterna."}
]'::jsonb),

('Novena al Sagrado Corazón de Jesús', 'Nueve días de oración al Corazón misericordioso de Jesús', 'Por la conversión de los pecadores y la paz del mundo', 'cristologica', 2,
'[
  {"dia": 1, "titulo": "Primer Día - El Amor Infinito", "oracion": "Sagrado Corazón de Jesús, en ti confío. Tu amor infinito nos llama a acercarnos sin temor. Abre mi corazón para recibir tu gracia y tu misericordia. Que pueda amarte cada día más y hacer conocer tu amor a todos. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Meditemos sobre el amor incondicional del Corazón de Jesús por cada uno de nosotros."},
  {"dia": 2, "titulo": "Segundo Día - La Misericordia", "oracion": "Corazón misericordioso de Jesús, que no rechazas a ningún pecador que se acerca arrepentido. Dame la gracia del arrepentimiento sincero y la confianza en tu perdón. Que tu misericordia transforme mi vida. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Reflexionemos sobre la inmensa misericordia de Dios que nos perdona siempre."},
  {"dia": 3, "titulo": "Tercer Día - La Humildad", "oracion": "Jesús manso y humilde de corazón, enséñame la verdadera humildad. Que reconozca mis limitaciones y confíe totalmente en ti. Líbrame del orgullo que me aleja de ti y de los demás. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Contemplemos la humildad de Jesús como modelo para nuestra vida."},
  {"dia": 4, "titulo": "Cuarto Día - La Paciencia", "oracion": "Corazón paciente de Jesús, que soportaste tantas ofensas por amor a nosotros. Dame la gracia de la paciencia en las pruebas y dificultades. Que sepa esperar con confianza en tu providencia. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Meditemos sobre la paciencia infinita de Dios con cada uno de nosotros."},
  {"dia": 5, "titulo": "Quinto Día - La Generosidad", "oracion": "Corazón generoso de Jesús, que te diste totalmente por nosotros. Hazme generoso en el servicio a los demás. Que no me reserve nada, sino que me entregue completamente a tu voluntad. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Reflexionemos sobre cómo podemos ser más generosos siguiendo el ejemplo de Jesús."},
  {"dia": 6, "titulo": "Sexto Día - La Confianza", "oracion": "Sagrado Corazón de Jesús, en ti confío. Aumenta mi fe y mi confianza en tu amor. Cuando las dudas y temores me asalten, que recuerde que tú nunca me abandonas. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Contemplemos la invitación de Jesús a confiar plenamente en Él."},
  {"dia": 7, "titulo": "Séptimo Día - La Reparación", "oracion": "Corazón de Jesús, tantas veces ofendido por nuestros pecados. Te ofrezco mis oraciones y sacrificios en reparación por las ofensas cometidas contra tu amor. Que mi vida sea una ofrenda agradable a ti. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Meditemos sobre cómo podemos reparar las ofensas hechas al Corazón de Jesús."},
  {"dia": 8, "titulo": "Octavo Día - La Consagración", "oracion": "Sagrado Corazón de Jesús, me consagro enteramente a ti. Toma posesión de mi corazón, de mi mente, de toda mi vida. Que viva solo para amarte y servirte. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Reflexionemos sobre el significado de consagrar nuestra vida al Corazón de Jesús."},
  {"dia": 9, "titulo": "Noveno Día - La Promesa", "oracion": "Corazón de Jesús, fuente de toda gracia y bendición. Confío en tus promesas de amor y misericordia. Que persevere hasta el final en tu amor y alcance la vida eterna contigo. Corazón de Jesús, manso y humilde, haz mi corazón semejante al tuyo. Amén.", "reflexion": "Contemplemos las promesas del Sagrado Corazón y renovemos nuestra confianza."}
]'::jsonb),

('Novena al Espíritu Santo', 'Nueve días de oración pidiendo los dones del Espíritu Santo', 'Por una nueva efusión del Espíritu en nuestras vidas', 'espiritu_santo', 3,
'[
  {"dia": 1, "titulo": "Primer Día - Ven Espíritu Santo", "oracion": "Ven Espíritu Santo, llena los corazones de tus fieles y enciende en ellos el fuego de tu amor. Envía tu Espíritu y todo será creado, y renovarás la faz de la tierra. Oh Dios, que has iluminado los corazones de tus fieles con la luz del Espíritu Santo, concédenos que guiados por el mismo Espíritu, sintamos con rectitud y gocemos siempre de tu consuelo. Por Jesucristo nuestro Señor. Amén.", "reflexion": "Abramos nuestro corazón a la acción del Espíritu Santo."},
  {"dia": 2, "titulo": "Segundo Día - El Don de Sabiduría", "oracion": "Espíritu Santo, concédeme el don de la Sabiduría para que pueda comprender las cosas de Dios y gustar de ellas. Que vea todo con los ojos de la fe y ordene mi vida según tu voluntad. Ven Espíritu Santo, llena los corazones de tus fieles. Amén.", "reflexion": "Pidamos la sabiduría para discernir lo que Dios quiere de nosotros."},
  {"dia": 3, "titulo": "Tercer Día - El Don de Entendimiento", "oracion": "Espíritu Santo, dame el don del Entendimiento para penetrar en las verdades de la fe. Que comprenda mejor el misterio de Dios y su plan de salvación. Ilumina mi mente para conocerte más. Ven Espíritu Santo, llena los corazones de tus fieles. Amén.", "reflexion": "Pidamos la gracia de entender más profundamente nuestra fe."},
  {"dia": 4, "titulo": "Cuarto Día - El Don de Consejo", "oracion": "Espíritu Santo, concédeme el don del Consejo para que sepa discernir lo que debo hacer en cada momento. Guíame en las decisiones de mi vida y ayúdame a aconsejar a otros con prudencia. Ven Espíritu Santo, llena los corazones de tus fieles. Amén.", "reflexion": "Pidamos ser guiados por el Espíritu en nuestras decisiones."},
  {"dia": 5, "titulo": "Quinto Día - El Don de Fortaleza", "oracion": "Espíritu Santo, dame el don de la Fortaleza para superar los obstáculos y tentaciones. Que tenga valor para defender la fe y perseverar en el camino del bien. Sé mi fuerza en la debilidad. Ven Espíritu Santo, llena los corazones de tus fieles. Amén.", "reflexion": "Pidamos fortaleza para enfrentar las dificultades con fe."},
  {"dia": 6, "titulo": "Sexto Día - El Don de Ciencia", "oracion": "Espíritu Santo, concédeme el don de la Ciencia para conocer las cosas creadas en relación con Dios. Que vea tu huella en toda la creación y use los bienes de este mundo para alcanzar los eternos. Ven Espíritu Santo, llena los corazones de tus fieles. Amén.", "reflexion": "Pidamos ver la presencia de Dios en todas las cosas."},
  {"dia": 7, "titulo": "Séptimo Día - El Don de Piedad", "oracion": "Espíritu Santo, dame el don de la Piedad para que ame a Dios como Padre y a todos los hombres como hermanos. Que mi relación con Dios sea filial y confiada, llena de ternura y amor. Ven Espíritu Santo, llena los corazones de tus fieles. Amén.", "reflexion": "Pidamos un corazón filial que ame a Dios como Padre."},
  {"dia": 8, "titulo": "Octavo Día - El Don de Temor de Dios", "oracion": "Espíritu Santo, concédeme el don del santo Temor de Dios. No el miedo que paraliza, sino el respeto reverente que me impulsa a evitar el pecado por amor. Que nunca quiera ofender a quien tanto me ama. Ven Espíritu Santo, llena los corazones de tus fieles. Amén.", "reflexion": "Pidamos el santo temor que nos aleja del pecado por amor a Dios."},
  {"dia": 9, "titulo": "Noveno Día - Los Frutos del Espíritu", "oracion": "Espíritu Santo, derrama sobre mí tus frutos: amor, alegría, paz, paciencia, amabilidad, bondad, fidelidad, mansedumbre y dominio propio. Que mi vida sea testimonio de tu presencia. Renuévame completamente y hazme instrumento de tu gracia. Ven Espíritu Santo, llena los corazones de tus fieles. Amén.", "reflexion": "Pidamos que los frutos del Espíritu se manifiesten en nuestra vida."}
]'::jsonb);