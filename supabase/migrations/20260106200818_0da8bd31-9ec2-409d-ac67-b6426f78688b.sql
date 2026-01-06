
-- Create table for Bible reading plan (365 days)
CREATE TABLE public.bible_reading_plan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dia INTEGER NOT NULL UNIQUE CHECK (dia >= 1 AND dia <= 365),
  titulo TEXT NOT NULL,
  pasaje_referencia TEXT NOT NULL,
  pasaje_texto TEXT NOT NULL,
  reflexion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user Bible reading progress
CREATE TABLE public.user_bible_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dia_actual INTEGER NOT NULL DEFAULT 1,
  dias_completados JSONB NOT NULL DEFAULT '[]'::jsonb,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  racha_actual INTEGER NOT NULL DEFAULT 0,
  ultima_lectura DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.bible_reading_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bible_progress ENABLE ROW LEVEL SECURITY;

-- RLS for bible_reading_plan (public read)
CREATE POLICY "Anyone can read bible plan" 
ON public.bible_reading_plan 
FOR SELECT 
USING (true);

-- RLS for user_bible_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_bible_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_bible_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_bible_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert sample reading plan (first 10 days as example)
INSERT INTO public.bible_reading_plan (dia, titulo, pasaje_referencia, pasaje_texto, reflexion) VALUES
(1, 'En el Principio', 'Génesis 1:1-31', 'En el principio creó Dios los cielos y la tierra. La tierra estaba desordenada y vacía, las tinieblas estaban sobre la faz del abismo y el espíritu de Dios se movía sobre la faz de las aguas. Dijo Dios: "Sea la luz". Y fue la luz. Vio Dios que la luz era buena, y separó Dios la luz de las tinieblas. Llamó Dios a la luz "día", y a las tinieblas llamó "noche". Y fue la tarde y la mañana del primer día.', 'Dios creó todo con un propósito. Cada día de la creación nos muestra Su poder y amor. ¿Cómo puedes agradecer hoy por la creación?'),
(2, 'La Creación del Hombre', 'Génesis 2:1-25', 'Formó, pues, Jehová Dios al hombre del polvo de la tierra, sopló en su nariz aliento de vida y fue el hombre un ser viviente. Jehová Dios plantó un huerto en Edén, al oriente, y puso allí al hombre que había formado. Jehová Dios hizo nacer de la tierra todo árbol delicioso a la vista y bueno para comer.', 'Fuimos creados con el aliento de Dios. Llevamos Su imagen y propósito. Reflexiona sobre el valor que tienes ante los ojos de Dios.'),
(3, 'La Caída', 'Génesis 3:1-24', 'La serpiente era más astuta que todos los animales del campo que Jehová Dios había hecho. Esta dijo a la mujer: "¿Conque Dios os ha dicho: No comáis de ningún árbol del huerto?" La mujer respondió a la serpiente: "Del fruto de los árboles del huerto podemos comer, pero del fruto del árbol que está en medio del huerto dijo Dios: No comeréis de él, ni lo tocaréis, para que no muráis."', 'El pecado entró al mundo, pero Dios ya tenía un plan de redención. Su amor es más grande que nuestra caída.'),
(4, 'Caín y Abel', 'Génesis 4:1-26', 'Conoció Adán a Eva, su mujer, la cual concibió y dio a luz a Caín. Después dio a luz a su hermano Abel. Abel fue pastor de ovejas y Caín fue labrador de la tierra. Aconteció que Caín presentó del fruto de la tierra una ofrenda a Jehová. También Abel presentó de los primogénitos de sus ovejas.', 'La envidia destruye, pero Dios siempre ofrece una oportunidad de arrepentimiento. ¿Hay algo en tu corazón que necesites entregar a Dios?'),
(5, 'Noé y el Arca', 'Génesis 6:1-22', 'Vio Jehová que la maldad de los hombres era mucha en la tierra, y que todo designio de los pensamientos de su corazón solo era de continuo el mal. Pero Noé halló gracia ante los ojos de Jehová. Noé era un hombre justo y perfecto entre los hombres de su tiempo; caminó Noé con Dios.', 'Noé encontró gracia en medio de una generación corrupta. Dios siempre preserva a los suyos. ¿Estás caminando con Él?'),
(6, 'El Diluvio', 'Génesis 7:1-24', 'Dijo luego Jehová a Noé: "Entra tú y toda tu casa en el arca, porque a ti he visto justo delante de mí en esta generación." Entró Noé en el arca junto con sus hijos, su mujer y las mujeres de sus hijos, por causa de las aguas del diluvio.', 'Dios protege a los que confían en Él. El arca representa la salvación que encontramos en Cristo.'),
(7, 'El Pacto del Arcoíris', 'Génesis 9:1-17', 'Dijo Dios: "Esta es la señal del pacto que yo establezco entre mí y vosotros, y todo ser viviente que está con vosotros, por siglos perpetuos: mi arco he puesto en las nubes, el cual será por señal del pacto entre mí y la tierra."', 'El arcoíris nos recuerda la fidelidad de Dios. Él siempre cumple Sus promesas.'),
(8, 'La Torre de Babel', 'Génesis 11:1-9', 'Tenía entonces toda la tierra una sola lengua y unas mismas palabras. Dijeron: "Vamos, edifiquémonos una ciudad y una torre cuya cúspide llegue al cielo. Hagámonos un nombre, por si fuéramos esparcidos sobre la faz de toda la tierra."', 'El orgullo nos aleja de Dios. La humildad nos acerca a Su propósito para nuestras vidas.'),
(9, 'El Llamado de Abraham', 'Génesis 12:1-9', 'Jehová dijo a Abram: "Vete de tu tierra, de tu parentela y de la casa de tu padre, a la tierra que te mostraré. Haré de ti una nación grande, te bendeciré, engrandeceré tu nombre y serás bendición."', 'Dios llama a cada uno de nosotros a un propósito mayor. ¿Estás dispuesto a seguir Su voz?'),
(10, 'La Promesa a Abraham', 'Génesis 15:1-21', 'Vino palabra de Jehová a Abram en visión, diciendo: "No temas, Abram, yo soy tu escudo, y tu recompensa será muy grande." Respondió Abram: "Señor Jehová, ¿qué me darás, si ando sin hijo?" Y creyó a Jehová, y le fue contado por justicia.', 'La fe de Abraham fue contada como justicia. Nuestra fe en las promesas de Dios define nuestra relación con Él.');
