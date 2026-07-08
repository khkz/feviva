import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyAdmin } from "../_shared/verifyAdmin.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Temas temáticos para generación por categoría
const STORY_THEMES: Record<string, { nombre: string; descripcion: string; prompts: { titulo: string; tema: string }[] }> = {
  amor: {
    nombre: "Amor",
    descripcion: "El amor que vence a la muerte, amor eterno",
    prompts: [
      { titulo: "El Hilo Invisible", tema: "Una meditación para el duelo. El dolor de la pérdida como prueba del amor eterno." },
      { titulo: "El Cantar del Amado", tema: "Meditación sobre el amor divino a través del Cantar de los Cantares." },
      { titulo: "Rut y Noemí", tema: "El amor fiel que trasciende la sangre y la cultura." },
      { titulo: "El Amor de Jacob por Raquel", tema: "Siete años que parecieron días, el amor paciente que espera." },
      { titulo: "María a los Pies de Jesús", tema: "El amor contemplativo que elige la mejor parte." }
    ]
  },
  esperanza: {
    nombre: "Esperanza",
    descripcion: "Luz en la oscuridad, promesas cumplidas",
    prompts: [
      { titulo: "El Arcoíris de la Promesa", tema: "Después de la tormenta, la alianza de Dios con la humanidad." },
      { titulo: "Las Estrellas de Abraham", tema: "Cuando todo parecía imposible, Dios cumplió su promesa." },
      { titulo: "La Vigilia de Simeón", tema: "Esperar toda una vida por la salvación prometida." },
      { titulo: "Ana y la Oración Cumplida", tema: "La esperanza de una madre que no dejó de creer." },
      { titulo: "El Amanecer de la Resurrección", tema: "La piedra rodada, la tumba vacía, la esperanza cumplida." }
    ]
  },
  sanacion: {
    nombre: "Sanación y Duelo",
    descripcion: "Consuelo en el dolor, el amor más allá de la muerte",
    prompts: [
      { titulo: "El Duelo de David", tema: "El llanto por Absalón y la aceptación del dolor sagrado." },
      { titulo: "Lázaro Duerme", tema: "Jesús llora con nosotros. El amor que despierta de la muerte." },
      { titulo: "Las Lágrimas de Raquel", tema: "El duelo sagrado y la promesa del reencuentro." },
      { titulo: "Job en la Noche Oscura", tema: "Cuando todo se pierde, la fe que permanece." },
      { titulo: "El Padre Misericordioso", tema: "El abrazo que sana todas las heridas del pasado." }
    ]
  },
  paz: {
    nombre: "Paz Interior",
    descripcion: "Quietud del alma, descanso en Dios",
    prompts: [
      { titulo: "El Susurro de Elías", tema: "Dios no está en el terremoto ni en el fuego, sino en la brisa suave." },
      { titulo: "Junto a Aguas Tranquilas", tema: "El Salmo veintitrés vivido como experiencia de paz profunda." },
      { titulo: "La Paz que el Mundo No Da", tema: "La última cena y las palabras de paz de Jesús." },
      { titulo: "El Jardín de la Mañana", tema: "María Magdalena encuentra la paz en el jardín del Resucitado." },
      { titulo: "La Calma Después de la Tempestad", tema: "Jesús duerme en la barca mientras la tormenta se aquieta." }
    ]
  },
  gratitud: {
    nombre: "Gratitud",
    descripcion: "Agradecer las bendiciones, encontrar lo bueno",
    prompts: [
      { titulo: "Los Diez Leprosos", tema: "El que volvió a dar gracias. La gratitud como sanación." },
      { titulo: "El Maná del Desierto", tema: "Pan del cielo cada mañana. Agradecer lo cotidiano." },
      { titulo: "Magnificat de María", tema: "El canto de gratitud de María por las maravillas de Dios." },
      { titulo: "El Vino de Caná", tema: "Lo ordinario transformado en extraordinario. La gratitud por los pequeños milagros." },
      { titulo: "Los Cinco Panes y Dos Peces", tema: "La bendición de lo poco que se multiplica con gratitud." }
    ]
  },
  perdon: {
    nombre: "Perdón",
    descripcion: "Liberación del resentimiento, reconciliación",
    prompts: [
      { titulo: "El Hijo que Volvió", tema: "El padre que espera. El abrazo del perdón incondicional." },
      { titulo: "Setenta Veces Siete", tema: "Perdonar como liberación del alma." },
      { titulo: "La Mujer del Perfume", tema: "Mucho se le perdona porque mucho ha amado." },
      { titulo: "Pedro y el Fuego en la Playa", tema: "Tres veces negó, tres veces fue restaurado. El perdón que reconstruye." },
      { titulo: "José y Sus Hermanos", tema: "Lo que pensaron para mal, Dios lo usó para bien. El perdón que sana familias." }
    ]
  }
};

// Temas ya cubiertos por historias existentes (para evitar duplicados temáticos)
const EXISTING_THEMES = [
  { keywords: ["buen", "pastor", "salmo"], existing: "El Buen Pastor" },
  { keywords: ["noé", "arca", "diluvio"], existing: "Noé y el Arca" },
  { keywords: ["creación", "mundo", "génesis"], existing: "La Creación del Mundo" },
];

const NEW_STORIES = [
  // Historias originales (sin duplicados)
  { titulo: "Moisés y el Mar Rojo", tema: "La liberación del pueblo de Israel cruzando el Mar Rojo" },
  { titulo: "Abraham y las Estrellas", tema: "La promesa de Dios a Abraham bajo el cielo estrellado" },
  { titulo: "Ruth y la Cosecha", tema: "La fidelidad de Ruth recogiendo espigas en los campos de Booz" },
  { titulo: "Salmo 91: Bajo Sus Alas", tema: "Refugio y protección divina, descanso bajo las alas del Altísimo" },
  { titulo: "Elías en el Monte Horeb", tema: "Elías encuentra a Dios en el suave susurro del viento" },
  { titulo: "José y el Manto de Colores", tema: "Los sueños de José y su camino hacia el destino divino" },
  { titulo: "El Jardín de Getsemaní", tema: "Una noche de oración y paz en el huerto de olivos" },
  { titulo: "Jacob y la Escalera al Cielo", tema: "El sueño de Jacob con ángeles subiendo y bajando en la noche estrellada" },
  { titulo: "La Pesca Milagrosa", tema: "Pedro y los discípulos en el lago al amanecer, la bruma sobre las aguas" },
  { titulo: "El Huerto del Cantar de los Cantares", tema: "Imágenes poéticas del amor divino, jardines fragantes y fuentes selladas" },
  { titulo: "Isaías y la Paz del Reino", tema: "El lobo con el cordero, la paz mesiánica del reino venidero" },
  { titulo: "María en Nazaret", tema: "La visitación del ángel Gabriel y el sí silencioso de María" },
  { titulo: "Los Pastores de Belén", tema: "La noche estrellada del nacimiento, el canto de los ángeles" },
  { titulo: "El Camino a Emaús", tema: "Caminando con el Resucitado al atardecer por caminos polvorientos" },
  { titulo: "Apocalipsis: El Río de Vida", tema: "La nueva Jerusalén, el río cristalino y el árbol de la vida" },
  { titulo: "Eclesiastés: Todo Tiene su Tiempo", tema: "Meditación serena sobre las estaciones de la vida" },
];

// Detecta si una historia nueva es temáticamente similar a una existente
function isSimilarToExisting(titulo: string, existingTitles: string[]): boolean {
  const tituloLower = titulo.toLowerCase();
  const tituloWords = tituloLower.split(/\s+/);
  
  // Verificar contra temas conocidos
  for (const theme of EXISTING_THEMES) {
    const matchingKeywords = theme.keywords.filter(k => tituloLower.includes(k));
    if (matchingKeywords.length >= 2) {
      console.log(`"${titulo}" es similar a tema existente: ${theme.existing}`);
      return true;
    }
  }
  
  // Verificar similitud por palabras comunes con títulos existentes
  for (const existing of existingTitles) {
    const existingWords = existing.toLowerCase().split(/\s+/);
    const commonWords = tituloWords.filter(w => 
      existingWords.includes(w) && w.length > 3
    );
    if (commonWords.length >= 2) {
      console.log(`"${titulo}" comparte palabras con "${existing}": [${commonWords.join(', ')}]`);
      return true;
    }
  }
  
  return false;
}

async function generateStory(titulo: string, tema: string): Promise<string> {
  // 6 aperturas distintas para evitar el patrón "Cierra tus ojos... respira..."
  const aperturas = [
    "Empieza directamente con una escena: un sonido, un aroma, un paisaje. El oyente ya está ahí, sin preámbulos de relajación.",
    "Arranca con una pregunta suave: '¿Has sentido alguna vez...?' y luego transiciona a la escena bíblica.",
    "Comienza con un detalle minúsculo — el crujir de una rama, el calor de una piedra al sol — y expande desde ahí.",
    "Empieza con un recuerdo inventado del narrador: 'Mi abuela solía contarme que...' y conecta con la historia bíblica.",
    "Arranca in medias res, en mitad de la acción de la historia bíblica, y luego retrocede para dar contexto.",
    "Comienza con el sonido del silencio: describe la ausencia de ruido antes de que la historia empiece a desplegarse lentamente.",
  ];
  const apertura = aperturas[Math.floor(Math.random() * aperturas.length)];

  const systemPrompt = `Eres un narrador de historias para dormir. Cada historia tuya suena diferente a la anterior.

ESTILO:
- Contemplativo y sensorial: sonidos, aromas, texturas, temperaturas
- Pausas naturales con "..." pero NO en cada párrafo — varía el ritmo
- El ritmo decrece gradualmente hacia el final
- Poético pero sencillo

REGLAS ANTI-PATRÓN (críticas):
- NUNCA empieces con "Bienvenido a este espacio de calma" ni "Cierra tus ojos" ni "Respira profundamente"
- NO uses la estructura: relajación → historia → reflexión → bendición. Varía
- Algunas historias pueden terminar con silencio, no con bendición
- Varía la longitud de los párrafos: algunos de una línea, otros largos y envolventes
- NO repitas frases como "un lugar sagrado creado solo para ti"
- Incluye algún detalle inesperado que sorprenda suavemente (un sabor, un color inusual, un pensamiento del personaje)

REGLAS TTS:
- NUNCA abreviaciones bíblicas (escribe "Génesis" NO "Gn.", "Juan" NO "Jn.")
- Referencias bíblicas legibles: "el Salmo veintitrés" en lugar de "Salmo 23"
- Números como palabras: "tres" no "3", "cuarenta" no "40"
- Sin símbolos: ":", ";", "&" — usa palabras`;

  const userPrompt = `Historia para dormir (~2500-3000 palabras, 12-15 min narración lenta):

Título: ${titulo}
Tema: ${tema}

APERTURA OBLIGATORIA: ${apertura}

Desarrolla la historia bíblica con libertad creativa. No sigas una fórmula. Deja que la narración respire, que haya momentos de pura descripción sensorial y momentos de diálogo interno del personaje. El final debe llegar como un susurro, no como un cierre formal.

Escribe SOLO el contenido, sin título ni metadatos.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function expandExistingStory(titulo: string, contenidoActual: string): Promise<string> {
  const systemPrompt = `Eres un narrador de historias para dormir. Reescribes y expandes historias existentes dándoles vida propia.

REGLAS:
- Si la historia original empieza con "Bienvenido a este espacio" o "Cierra tus ojos", ELIMINA eso y empieza de otra forma
- Añade detalles sensoriales ricos pero variados — no solo visuales, incluye olores, sabores, texturas
- Varía el ritmo: párrafos cortos y largos intercalados
- Incluye algún pensamiento interno del personaje bíblico
- El final no tiene que ser una bendición formal — puede ser silencio, una imagen, una sensación

REGLAS TTS:
- NUNCA abreviaciones bíblicas (escribe "Génesis" NO "Gn.", "Juan" NO "Jn.")
- Referencias legibles: "el Salmo veintitrés" en lugar de "Salmo 23"
- Números como palabras: "tres" no "3"
- Sin símbolos especiales`;

  const userPrompt = `Reescribe y expande esta historia para dormir a ~2500-3000 palabras:

Título: ${titulo}
Historia actual:
${contenidoActual}

Mantén la esencia pero dale una voz nueva. No copies la estructura original si es formulaica. Sorprende con la apertura. Desarrolla momentos que la original solo menciona. Deja que la narración respire.

Escribe SOLO el contenido expandido, sin título ni metadatos.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await verifyAdmin(req, corsHeaders);
  if (!auth.ok) return auth.response;

  try {
    const { action, limit = 1, themeId } = await req.json();
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: any[] = [];

    if (action === "create_new") {
      // Get existing story titles to avoid duplicates
      const { data: existingStories } = await supabase
        .from('sleep_stories')
        .select('titulo');
      
      const existingTitlesArray = existingStories?.map(s => s.titulo) || [];
      const existingTitlesSet = new Set(existingTitlesArray);
      
      // Filter new stories that don't exist yet AND aren't similar to existing ones
      const storiesToCreate = NEW_STORIES.filter(s => {
        // Check exact match
        if (existingTitlesSet.has(s.titulo)) {
          console.log(`Skipping "${s.titulo}" - exact title exists`);
          return false;
        }
        // Check thematic similarity
        if (isSimilarToExisting(s.titulo, existingTitlesArray)) {
          console.log(`Skipping "${s.titulo}" - similar theme exists`);
          return false;
        }
        return true;
      });
      
      console.log(`Found ${storiesToCreate.length} new unique stories to create`);
      
      // Process limited number
      const batch = storiesToCreate.slice(0, limit);
      
      for (const story of batch) {
        try {
          console.log(`Generating story: ${story.titulo}`);
          const contenido = await generateStory(story.titulo, story.tema);
          
          // Calculate duration based on content length (approx 150 words/min for slow narration)
          const wordCount = contenido.split(/\s+/).length;
          const duracionEstimada = Math.round(wordCount / 150);
          
          const { error: insertError } = await supabase
            .from('sleep_stories')
            .insert({
              titulo: story.titulo,
              descripcion: story.tema,
              contenido: contenido,
              duracion_estimada: duracionEstimada,
              categoria: 'biblicas',
              orden: 100 + results.length
            });
          
          if (insertError) {
            console.error(`Error inserting ${story.titulo}:`, insertError);
            results.push({ titulo: story.titulo, status: 'error', error: insertError.message });
          } else {
            console.log(`Created story: ${story.titulo} (${duracionEstimada} min)`);
            results.push({ titulo: story.titulo, status: 'success', duration: duracionEstimada });
          }
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          console.error(`Error generating ${story.titulo}:`, e);
          results.push({ titulo: story.titulo, status: 'error', error: errorMsg });
        }
      }
      
      return new Response(JSON.stringify({
        action: "create_new",
        processed: results.length,
        remaining: storiesToCreate.length - results.length,
        hasMore: storiesToCreate.length > results.length,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === "expand_existing") {
      // Get short stories (less than 1500 chars = ~2 min)
      const { data: shortStories, error: fetchError } = await supabase
        .from('sleep_stories')
        .select('id, titulo, contenido, duracion_estimada')
        .lt('duracion_estimada', 5)
        .order('orden')
        .limit(limit);
      
      if (fetchError) throw fetchError;
      
      console.log(`Found ${shortStories?.length || 0} short stories to expand`);
      
      for (const story of shortStories || []) {
        try {
          console.log(`Expanding story: ${story.titulo}`);
          const expandedContent = await expandExistingStory(story.titulo, story.contenido);
          
          const wordCount = expandedContent.split(/\s+/).length;
          const duracionEstimada = Math.round(wordCount / 150);
          
          const { error: updateError } = await supabase
            .from('sleep_stories')
            .update({
              contenido: expandedContent,
              duracion_estimada: duracionEstimada
            })
            .eq('id', story.id);
          
          if (updateError) {
            console.error(`Error updating ${story.titulo}:`, updateError);
            results.push({ titulo: story.titulo, status: 'error', error: updateError.message });
          } else {
            console.log(`Expanded story: ${story.titulo} (${duracionEstimada} min)`);
            results.push({ titulo: story.titulo, status: 'success', duration: duracionEstimada });
          }
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          console.error(`Error expanding ${story.titulo}:`, e);
          results.push({ titulo: story.titulo, status: 'error', error: errorMsg });
        }
      }
      
      // Check remaining
      const { count: remainingCount } = await supabase
        .from('sleep_stories')
        .select('id', { count: 'exact', head: true })
        .lt('duracion_estimada', 5);
      
      return new Response(JSON.stringify({
        action: "expand_existing",
        processed: results.length,
        remaining: (remainingCount || 0) - results.length,
        hasMore: (remainingCount || 0) > results.length,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === "create_by_theme") {
      // Generate story by specific theme
      if (!themeId || !STORY_THEMES[themeId]) {
        return new Response(JSON.stringify({ 
          error: "Invalid theme. Available themes: " + Object.keys(STORY_THEMES).join(", ") 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const theme = STORY_THEMES[themeId];
      
      // Get existing story titles to avoid duplicates
      const { data: existingStories } = await supabase
        .from('sleep_stories')
        .select('titulo');
      
      const existingTitlesSet = new Set(existingStories?.map(s => s.titulo.toLowerCase()) || []);
      
      // Filter prompts that don't exist yet
      const availablePrompts = theme.prompts.filter(p => 
        !existingTitlesSet.has(p.titulo.toLowerCase())
      );
      
      if (availablePrompts.length === 0) {
        return new Response(JSON.stringify({
          action: "create_by_theme",
          themeName: theme.nombre,
          message: `Ya existen todas las historias de ${theme.nombre}`,
          processed: 0,
          results: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Pick a random available prompt
      const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
      
      try {
        console.log(`Generating themed story: ${randomPrompt.titulo} (${theme.nombre})`);
        const contenido = await generateStory(randomPrompt.titulo, randomPrompt.tema);
        
        const wordCount = contenido.split(/\s+/).length;
        const duracionEstimada = Math.round(wordCount / 150);
        
        const { error: insertError } = await supabase
          .from('sleep_stories')
          .insert({
            titulo: randomPrompt.titulo,
            descripcion: randomPrompt.tema,
            contenido: contenido,
            duracion_estimada: duracionEstimada,
            categoria: themeId,
            orden: 100 + Date.now() % 1000
          });
        
        if (insertError) {
          throw insertError;
        }
        
        console.log(`Created themed story: ${randomPrompt.titulo} (${duracionEstimada} min)`);
        
        return new Response(JSON.stringify({
          action: "create_by_theme",
          themeName: theme.nombre,
          processed: 1,
          remaining: availablePrompts.length - 1,
          results: [{ titulo: randomPrompt.titulo, status: 'success', duration: duracionEstimada }]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.error(`Error generating themed story:`, e);
        return new Response(JSON.stringify({
          action: "create_by_theme",
          themeName: theme.nombre,
          processed: 0,
          error: errorMsg,
          results: [{ titulo: randomPrompt.titulo, status: 'error', error: errorMsg }]
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (action === "get_themes") {
      // Return available themes for UI
      const themes = Object.entries(STORY_THEMES).map(([id, theme]) => ({
        id,
        nombre: theme.nombre,
        descripcion: theme.descripcion,
        storiesCount: theme.prompts.length
      }));
      
      return new Response(JSON.stringify({ themes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: "Invalid action. Use 'create_new', 'expand_existing', 'create_by_theme', or 'get_themes'" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error in generate-sleep-stories:', error);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
