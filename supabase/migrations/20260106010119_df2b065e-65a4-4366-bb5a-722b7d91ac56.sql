-- Create sleep_stories table
CREATE TABLE public.sleep_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  contenido TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'biblico',
  duracion_estimada INTEGER NOT NULL DEFAULT 15,
  audio_url TEXT,
  imagen_url TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sleep_stories ENABLE ROW LEVEL SECURITY;

-- Everyone can read stories (public content)
CREATE POLICY "Anyone can read sleep stories"
ON public.sleep_stories
FOR SELECT
USING (true);

-- Create user sleep history table
CREATE TABLE public.user_sleep_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.sleep_stories(id) ON DELETE CASCADE,
  duracion_escuchada INTEGER DEFAULT 0,
  completado BOOLEAN DEFAULT false,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sleep_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own history
CREATE POLICY "Users can view their own sleep history"
ON public.user_sleep_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep history"
ON public.user_sleep_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep history"
ON public.user_sleep_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Insert biblical sleep stories
INSERT INTO public.sleep_stories (titulo, descripcion, contenido, categoria, duracion_estimada, orden) VALUES
('La Creación del Mundo', 'El relato de cómo Dios creó los cielos y la tierra en siete días', 
'En el principio, Dios creó los cielos y la tierra. La tierra estaba desordenada y vacía, las tinieblas cubrían la faz del abismo, y el Espíritu de Dios se movía sobre la superficie de las aguas.

Y dijo Dios: "Que exista la luz." Y la luz existió. Dios vio que la luz era buena, y separó la luz de las tinieblas. A la luz la llamó día, y a las tinieblas las llamó noche. Y fue la tarde y fue la mañana: el primer día.

Luego dijo Dios: "Que haya un firmamento en medio de las aguas, que separe unas aguas de otras." E hizo Dios el firmamento, y separó las aguas que estaban debajo del firmamento de las que estaban arriba. Y así fue. Al firmamento Dios lo llamó cielo. Y fue la tarde y fue la mañana: el segundo día.

Y dijo Dios: "Que las aguas debajo del cielo se reúnan en un solo lugar, y que aparezca lo seco." Y así fue. A lo seco Dios lo llamó tierra, y al conjunto de aguas lo llamó mares. Y vio Dios que esto era bueno.

Después dijo Dios: "Que la tierra produzca vegetación: plantas que den semilla y árboles que den fruto con semilla, según su especie." Y así fue. La tierra produjo vegetación. Y vio Dios que esto era bueno. Y fue la tarde y fue la mañana: el tercer día.

Y dijo Dios: "Que haya lumbreras en el firmamento del cielo para separar el día de la noche, y para señalar las estaciones, los días y los años." E hizo Dios las dos grandes lumbreras: la lumbrera mayor para gobernar el día, y la lumbrera menor para gobernar la noche. También hizo las estrellas. Y vio Dios que esto era bueno. Y fue la tarde y fue la mañana: el cuarto día.

Dios contempló su obra y descansó, bendiciendo el séptimo día y declarándolo sagrado, porque en él descansó de toda la obra que había hecho en la creación.', 
'biblico', 15, 1),

('El Buen Pastor', 'El salmo 23, la promesa de protección y cuidado divino',
'El Señor es mi pastor, nada me faltará.

En verdes praderas me hace descansar, junto a aguas tranquilas me conduce. Él restaura mi alma y me guía por senderos de justicia, por amor a su nombre.

Aunque camine por el valle de sombra de muerte, no temeré mal alguno, porque tú estás conmigo. Tu vara y tu cayado me infunden aliento.

Preparas ante mí una mesa, en presencia de mis adversarios. Unges mi cabeza con aceite, y mi copa rebosa.

Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa del Señor moraré por largos días.

El pastor cuida de cada oveja con ternura infinita. Conoce a cada una por su nombre. Las protege del frío, del hambre, de los peligros del camino.

Cuando una oveja se pierde, el pastor no descansa hasta encontrarla. La busca entre los montes, en los valles, junto a los precipicios. Y cuando la encuentra, la carga sobre sus hombros con alegría y la trae de vuelta al rebaño.

Así es el amor de Dios por cada uno de nosotros. Un amor que no se cansa, que no se rinde, que siempre perdona y siempre acoge.

Descansa ahora en los brazos del Buen Pastor. Él vela tu sueño. Él guarda tu corazón. Nada tienes que temer.',
'biblico', 15, 2),

('Noé y el Arca', 'La historia de fe y obediencia de Noé construyendo el arca',
'Había un hombre llamado Noé, justo e íntegro entre su generación. Noé caminaba con Dios.

Un día, Dios habló a Noé y le dijo: "Construye un arca de madera de ciprés. Hazla con compartimentos, y cúbrela con brea por dentro y por fuera."

Noé obedeció. Durante años trabajó en silencio, construyendo el arca según las instrucciones de Dios. La gente se burlaba de él, pero Noé persistía en su labor, confiando en la promesa divina.

Cuando el arca estuvo terminada, Dios dijo a Noé: "Entra en el arca con tu familia. De todo animal limpio, lleva siete parejas; de los animales no limpios, una pareja."

Y así lo hizo Noé. Los animales vinieron de todas partes: aves de brillantes plumas, bestias de suave pelaje, criaturas grandes y pequeñas. Todos entraron en el arca, en paz unos con otros.

Entonces comenzó a llover. Llovió durante cuarenta días y cuarenta noches. Las aguas cubrieron la tierra, pero el arca flotaba segura sobre las olas.

Dentro del arca, Noé y su familia descansaban. El sonido de la lluvia sobre la madera era suave y constante. Los animales dormían tranquilos, mecidos por el vaivén de las aguas.

Finalmente, la lluvia cesó. Las aguas comenzaron a bajar. El arca descansó sobre las montañas de Ararat.

Noé abrió la ventana y soltó una paloma. La paloma volvió con una rama de olivo en el pico. Era la señal de que la tierra reverdecía, de que la vida renacía.

Dios puso un arcoíris en el cielo como promesa de paz eterna.',
'biblico', 20, 3),

('El Nacimiento de Jesús', 'La noche santa en Belén cuando nació el Salvador',
'En aquellos días, María y José viajaron a Belén. El camino era largo y María estaba cansada, pues pronto daría a luz.

Llegaron a Belén al atardecer. Las estrellas comenzaban a aparecer en el cielo. Buscaron un lugar donde descansar, pero todas las posadas estaban llenas.

Finalmente, un posadero les ofreció su establo. Era un lugar humilde, pero limpio y cálido, donde los animales descansaban.

Esa noche, bajo el cielo estrellado de Belén, nació Jesús. María lo envolvió en pañales y lo acostó en un pesebre, sobre heno suave y fragante.

Los animales del establo velaban en silencio: el buey con su aliento cálido, el asno con su presencia tranquila. Todo estaba en paz.

En las colinas cercanas, unos pastores cuidaban sus rebaños bajo las estrellas. De pronto, una luz brillante iluminó la noche, y un ángel apareció ante ellos.

"No temáis", dijo el ángel. "Os traigo buenas noticias de gran alegría para todo el pueblo. Hoy, en la ciudad de David, os ha nacido un Salvador."

Los pastores fueron a Belén y encontraron al niño acostado en el pesebre. Se arrodillaron en adoración silenciosa.

En el oriente, una estrella brillaba más que todas las demás. Sabios de tierras lejanas la vieron y emprendieron un largo viaje siguiendo su luz.

Llevaban regalos para el niño rey: oro, incienso y mirra. Viajaron por desiertos y montañas, guiados siempre por la estrella.

Cuando llegaron a Belén, la estrella se detuvo sobre el lugar donde estaba el niño. Entraron, y al ver a Jesús, se postraron y lo adoraron.

La noche de Belén permanece en el corazón de la humanidad como símbolo de esperanza, paz y amor infinito.',
'biblico', 20, 4),

('Daniel en el Foso de los Leones', 'La historia de fe inquebrantable de Daniel',
'Daniel era un hombre de fe profunda. Tres veces al día, abría las ventanas de su habitación que daban hacia Jerusalén, se arrodillaba y oraba a Dios.

El rey Darío estimaba mucho a Daniel por su sabiduría y honestidad. Pero otros funcionarios del reino, envidiosos, tramaron un plan para destruirlo.

Convencieron al rey de firmar un decreto: durante treinta días, nadie podría orar a ningún dios o persona, excepto al rey. Quien desobedeciera sería arrojado al foso de los leones.

Daniel supo del decreto, pero no dejó de orar. Cada día, como siempre, se arrodillaba ante su ventana y hablaba con Dios.

Sus enemigos lo vieron y lo denunciaron ante el rey. Darío, muy afligido, intentó salvarlo, pero la ley no podía ser cambiada.

Al caer la noche, Daniel fue llevado al foso de los leones. El rey le dijo: "Que tu Dios, a quien sirves con constancia, te libre."

Una piedra fue colocada sobre la entrada del foso. El rey regresó a su palacio, pero no pudo dormir. Pasó la noche en ayuno, sin música ni entretenimiento.

En el foso, Daniel se encontró rodeado de leones. Eran bestias enormes, con melenas doradas y ojos brillantes. Pero Daniel no tuvo miedo.

Se sentó entre los leones con la paz de quien confía completamente en Dios. Y los leones se echaron a su alrededor, mansos como corderos.

Un ángel del Señor había cerrado la boca de los leones. Daniel pasó la noche en silencio, orando, mientras los grandes felinos dormían a su lado.

Al amanecer, el rey corrió al foso. "¡Daniel, siervo del Dios viviente! ¿Te ha podido librar tu Dios de los leones?"

Y Daniel respondió: "¡Oh rey, vive para siempre! Mi Dios envió su ángel, el cual cerró la boca de los leones."

Daniel fue sacado del foso sin un solo rasguño. Su fe había sido su escudo, y Dios, su protector.',
'biblico', 20, 5),

('El Jardín del Edén', 'La paz perfecta del primer jardín creado por Dios',
'En el principio, Dios plantó un jardín en el Edén, en el oriente. Era un lugar de belleza indescriptible, donde todo era perfecto y bueno.

Un río nacía en el Edén para regar el jardín, y de allí se dividía en cuatro brazos que fluían hacia los confines de la tierra.

En el jardín crecían árboles de toda especie, hermosos a la vista y buenos para comer. Sus frutos eran dulces y abundantes. Las flores perfumaban el aire con mil fragancias.

Dios creó al hombre del polvo de la tierra y sopló en su nariz aliento de vida. Lo puso en el jardín para que lo cultivara y lo cuidara.

El hombre caminaba por senderos bordeados de flores. Descansaba bajo la sombra de grandes árboles. Bebía de arroyos cristalinos. Todo era paz.

Los animales vivían en armonía. El león descansaba junto al cordero. Las aves cantaban melodías celestiales. Las mariposas danzaban entre las flores.

Dios caminaba por el jardín en el fresco de la tarde. El viento susurraba entre las hojas. La luz dorada del atardecer bañaba todo con su resplandor.

No había dolor, ni tristeza, ni temor. Solo paz, abundancia y la presencia amorosa del Creador.

Cierra los ojos e imagina ese jardín. Siente la brisa suave sobre tu piel. Escucha el murmullo del agua. Respira el perfume de las flores.

En la presencia de Dios, hay paz perfecta. En su amor, hay descanso eterno. Déjate llevar por esa paz mientras el sueño te envuelve suavemente.',
'biblico', 15, 6);
