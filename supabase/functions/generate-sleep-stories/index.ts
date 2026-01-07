import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const NEW_STORIES = [
  // Historias originales
  { titulo: "Moisés y el Mar Rojo", tema: "La liberación del pueblo de Israel cruzando el Mar Rojo" },
  { titulo: "Abraham y las Estrellas", tema: "La promesa de Dios a Abraham bajo el cielo estrellado" },
  { titulo: "Ruth y la Cosecha", tema: "La fidelidad de Ruth recogiendo espigas en los campos de Booz" },
  { titulo: "Salmo 23: El Buen Pastor", tema: "Un viaje meditativo por el Salmo 23, verdes praderas y aguas tranquilas" },
  { titulo: "Salmo 91: Bajo Sus Alas", tema: "Refugio y protección divina, descanso bajo las alas del Altísimo" },
  { titulo: "Elías en el Monte Horeb", tema: "Elías encuentra a Dios en el suave susurro del viento" },
  { titulo: "José y el Manto de Colores", tema: "Los sueños de José y su camino hacia el destino divino" },
  { titulo: "El Jardín de Getsemaní", tema: "Una noche de oración y paz en el huerto de olivos" },
  // Nuevas historias añadidas
  { titulo: "Noé y el Arcoíris", tema: "La paz después del diluvio, el arcoíris de promesa y el nuevo comienzo" },
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
    const { action, limit = 1 } = await req.json();
    
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
      
      const existingTitles = new Set(existingStories?.map(s => s.titulo) || []);
      
      // Filter new stories that don't exist yet
      const storiesToCreate = NEW_STORIES.filter(s => !existingTitles.has(s.titulo));
      
      console.log(`Found ${storiesToCreate.length} new stories to create`);
      
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
    }
    
    return new Response(JSON.stringify({ error: "Invalid action. Use 'create_new' or 'expand_existing'" }), {
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
