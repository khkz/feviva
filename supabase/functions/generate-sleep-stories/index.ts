import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
  const systemPrompt = `Eres un narrador experto en crear historias bíblicas para dormir. 
Tu estilo es:
- Muy calmado, pausado y contemplativo
- Usa descripciones sensoriales detalladas (sonidos suaves, aromas, texturas, temperaturas)
- Incluye pausas naturales con "..." para respiración
- Repite frases suaves ocasionalmente para inducir calma
- La narrativa debe fluir lentamente, sin prisas
- Usa lenguaje poético pero sencillo
- Incluye reflexiones espirituales suaves entrelazadas con la historia
- El ritmo debe ir decreciendo gradualmente hacia el final
- Termina con una bendición o palabras de paz

REGLAS CRÍTICAS PARA AUDIO TTS:
- NUNCA uses abreviaciones de libros bíblicos (escribe "Génesis" NO "Gn.", "Juan" NO "Jn.", "Mateo" NO "Mt.")
- Escribe las referencias bíblicas de forma legible para voz: "el Salmo veintitrés" en lugar de "Salmo 23"
- Cuando cites capítulos y versículos, usa formato hablado: "el capítulo tres del Evangelio de Juan, versículo dieciséis" en lugar de "Juan 3:16"
- Escribe los números como palabras: "tres" en lugar de "3", "cuarenta" en lugar de "40"
- Evita símbolos como ":", ";", "&" - usa palabras completas
- Los números romanos deben escribirse: "segundo" en lugar de "II", "tercero" en lugar de "III"`;

  const userPrompt = `Genera una historia para dormir de aproximadamente 2500-3000 palabras (para 12-15 minutos de narración lenta) basada en:

Título: ${titulo}
Tema: ${tema}

Requisitos específicos:
1. Comienza con una invitación a relajarse y respirar profundamente
2. Desarrolla la historia bíblica con muchos detalles sensoriales
3. Incluye descripciones extensas del ambiente (naturaleza, clima, sonidos)
4. Añade reflexiones espirituales que inviten a la paz interior
5. El ritmo narrativo debe ser muy lento y contemplativo
6. Incluye momentos de silencio descritos ("...el silencio envolvía todo...")
7. Termina con palabras de paz y bendición para el sueño

IMPORTANTE PARA AUDIO:
- Todas las referencias bíblicas deben ser legibles en voz alta
- Nunca uses abreviaciones (Gn., Ex., Jn., Mt., etc.)
- Escribe números como palabras (veintitrés, no 23)
- Si mencionas capítulos/versículos, usa formato hablado natural

Escribe SOLO el contenido de la historia, sin título ni metadatos.`;

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
  const systemPrompt = `Eres un narrador experto en crear historias bíblicas para dormir.
Tu tarea es expandir y enriquecer una historia existente para que dure 12-15 minutos de narración.

REGLAS CRÍTICAS PARA AUDIO TTS:
- NUNCA uses abreviaciones de libros bíblicos (escribe "Génesis" NO "Gn.", "Juan" NO "Jn.")
- Escribe las referencias bíblicas de forma legible: "el Salmo veintitrés" en lugar de "Salmo 23"
- Formato hablado para citas: "el capítulo tres del Evangelio de Juan" en lugar de "Juan 3:16"
- Escribe números como palabras: "tres" en lugar de "3"
- Los números romanos deben escribirse: "segundo" en lugar de "II"`;

  const userPrompt = `Expande esta historia para dormir a aproximadamente 2500-3000 palabras:

Título: ${titulo}
Historia actual:
${contenidoActual}

Mantén la esencia de la historia pero:
1. Añade muchas más descripciones sensoriales detalladas
2. Incluye pausas y momentos de silencio ("...el silencio envolvía todo...")
3. Desarrolla más el ambiente y la atmósfera
4. Añade reflexiones espirituales suaves
5. Expande los diálogos y pensamientos de los personajes
6. El ritmo debe ser muy lento y contemplativo
7. Comienza con invitación a relajarse
8. Termina con bendición para el sueño

IMPORTANTE PARA AUDIO:
- Corrige cualquier abreviación bíblica existente (Gn., Jn., Mt., etc.)
- Convierte números a palabras donde sea natural
- Las referencias bíblicas deben ser legibles en voz alta

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
