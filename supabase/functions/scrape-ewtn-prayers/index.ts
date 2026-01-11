import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URLs conocidas de EWTN para santos específicos (estructura: nombre del santo -> slug de EWTN)
const EWTN_KNOWN_URLS: Record<string, string> = {
  // Arcángeles
  "San Miguel Arcángel": "san-miguel-arcangel-15214",
  "San Gabriel Arcángel": "san-gabriel-arcangel-15260",
  "San Rafael Arcángel": "san-rafael-arcangel-15175",
  
  // Virgen María - Advocaciones
  "Nuestra Señora de Guadalupe": "virgen-de-guadalupe-15170",
  "Nuestra Señora de Fátima": "nuestra-senora-de-fatima-15168",
  "Nuestra Señora de Lourdes": "nuestra-senora-de-lourdes-15169",
  "Nuestra Señora del Carmen": "virgen-del-carmen-15244",
  "Inmaculado Corazón de María": "inmaculado-corazon-de-maria-15163",
  "Nuestra Señora del Rosario": "virgen-del-rosario-15245",
  
  // Santos muy populares
  "San José": "san-jose-esposo-de-maria-15189",
  "San Antonio de Padua": "san-antonio-de-padua-15212",
  "San Judas Tadeo": "san-judas-tadeo-15216",
  "San Martín de Porres": "san-martin-de-porres-15217",
  "Santa Rosa de Lima": "santa-rosa-de-lima-15228",
  "San Francisco de Asís": "san-francisco-de-asis-15258",
  "Santo Tomás de Aquino": "santo-tomas-de-aquino-15234",
  "Santa Teresa de Jesús": "santa-teresa-de-jesus-15231",
  "San Juan de la Cruz": "san-juan-de-la-cruz-15257",
  "San Ignacio de Loyola": "san-ignacio-de-loyola-15210",
  "San Pedro": "san-pedro-apostol-15220",
  "San Pablo": "san-pablo-apostol-15218",
  "San Juan Bautista": "san-juan-bautista-15259",
  "Santa Teresita del Niño Jesús": "santa-teresita-del-nino-jesus-15232",
  "San Pío de Pietrelcina": "san-pio-de-pietrelcina-15222",
  "San Juan Pablo II": "san-juan-pablo-ii-papa-15186",
  "Santa Teresa de Calcuta": "santa-teresa-de-calcuta-15230",
  "San Maximiliano Kolbe": "san-maximiliano-kolbe-15197",
  "Santa Faustina Kowalska": "santa-faustina-kowalska-15256",
  "San Benito": "san-benito-abad-15156",
  "Santo Domingo de Guzmán": "santo-domingo-de-guzman-15200",
  "San Felipe Neri": "san-felipe-neri-15262",
  "San Juan Bosco": "san-juan-bosco-15253",
  "San Alfonso María de Ligorio": "san-alfonso-maria-de-ligorio-15148",
  "San Luis María Grignion de Montfort": "san-luis-maria-grignion-de-montfort-15195",
  "San Patricio": "san-patricio-15192",
  "San Jorge": "san-jorge-15261",
  "San Sebastián": "san-sebastian-15229",
  "Santa Lucía": "santa-lucia-15224",
  "Santa Inés": "santa-ines-15223",
  "Santa Cecilia": "santa-cecilia-15252",
  "Santa Catalina de Siena": "santa-catalina-de-siena-15159",
  "Santa Clara de Asís": "santa-clara-de-asis-15251",
  "Santa Mónica": "santa-monica-15226",
  "San Agustín": "san-agustin-de-hipona-15147",
  
  // Apóstoles
  "San Andrés": "san-andres-apostol-15153",
  "Santiago el Mayor": "santiago-el-mayor-apostol-15182",
  "San Juan Apóstol": "san-juan-apostol-evangelista-15164",
  "Santo Tomás Apóstol": "santo-tomas-apostol-15235",
  "San Felipe Apóstol": "san-felipe-apostol-15158",
  "San Bartolomé": "san-bartolome-apostol-15157",
  "San Mateo": "san-mateo-apostol-evangelista-15198",
  "Santiago el Menor": "santiago-el-menor-apostol-15171",
  "San Simón": "san-simon-y-san-judas-apostoles-15184",
  "San Matías": "san-matias-apostol-15199",
  
  // Doctores de la Iglesia
  "San Jerónimo": "san-jeronimo-15211",
  "San Ambrosio": "san-ambrosio-15151",
  "San Gregorio Magno": "san-gregorio-magno-15160",
  "San Atanasio": "san-atanasio-15155",
  "San Basilio Magno": "san-basilio-magno-15250",
  "San Gregorio Nacianceno": "san-gregorio-nacianceno-15161",
  "San Juan Crisóstomo": "san-juan-crisostomo-15165",
  "San Cirilo de Alejandría": "san-cirilo-de-alejandria-15249",
  "San Cirilo de Jerusalén": "san-cirilo-de-jerusalen-15248",
  "San Hilario de Poitiers": "san-hilario-de-poitiers-15162",
  "San Pedro Crisólogo": "san-pedro-crisologo-15219",
  "San León Magno": "san-leon-magno-15193",
  "San Isidoro de Sevilla": "san-isidoro-de-sevilla-15209",
  "San Beda el Venerable": "san-beda-el-venerable-15246",
  "San Pedro Damián": "san-pedro-damian-15221",
  "San Bernardo de Claraval": "san-bernardo-de-claraval-15247",
  "San Alberto Magno": "san-alberto-magno-15149",
  "San Buenaventura": "san-buenaventura-15254",
  "San Roberto Belarmino": "san-roberto-belarmino-15227",
  "San Pedro Canisio": "san-pedro-canisio-15263",
  "San Francisco de Sales": "san-francisco-de-sales-15206",
  
  // Santos patronos latinoamericanos
  "Nuestra Señora de la Altagracia": "nuestra-senora-de-la-altagracia-15167",
  "Nuestra Señora de Coromoto": "nuestra-senora-de-coromoto-15166",
  "Virgen de la Caridad del Cobre": "virgen-de-la-caridad-del-cobre-15243",
  
  // Más santos importantes
  "San Vicente de Paúl": "san-vicente-de-paul-15241",
  "San Francisco Javier": "san-francisco-javier-15259",
  "Santa Brígida de Suecia": "santa-brigida-de-suecia-15255",
  "San Lorenzo": "san-lorenzo-15194",
  "San Esteban": "san-esteban-protomartir-15201",
  "San Nicolás de Bari": "san-nicolas-de-bari-15215",
  "San Valentín": "san-valentin-15240",
};

// Base URL de EWTN
const EWTN_BASE_URL = "https://www.ewtn.com/es/catolicismo/santos/";

// Función para buscar información de un santo en EWTN
async function searchEWTNForSaint(saintName: string): Promise<{ texto: string; fuente: string; fuente_url: string } | null> {
  // Normalizar nombre para buscar en el mapa
  const normalizedName = saintName.trim();
  
  // Buscar coincidencia exacta primero
  let slug = EWTN_KNOWN_URLS[normalizedName];
  
  // Si no hay coincidencia exacta, buscar parcial
  if (!slug) {
    for (const [name, ewtnSlug] of Object.entries(EWTN_KNOWN_URLS)) {
      if (normalizedName.toLowerCase().includes(name.toLowerCase()) || 
          name.toLowerCase().includes(normalizedName.toLowerCase())) {
        slug = ewtnSlug;
        break;
      }
    }
  }
  
  if (!slug) {
    console.log(`No se encontró URL de EWTN para: ${saintName}`);
    return null;
  }
  
  const url = `${EWTN_BASE_URL}${slug}`;
  console.log(`Buscando en EWTN: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CatholicAppBot/1.0; +https://elrugido.app)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    
    if (!response.ok) {
      console.log(`Error HTTP ${response.status} para ${url}`);
      return null;
    }
    
    const html = await response.text();
    
    // Extraer contenido de oración del HTML
    // EWTN suele tener oraciones en secciones específicas
    const prayerContent = extractPrayerFromHTML(html, saintName);
    
    if (prayerContent) {
      return {
        texto: prayerContent,
        fuente: "EWTN - Biblioteca de Santos",
        fuente_url: url
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching EWTN for ${saintName}:`, error);
    return null;
  }
}

// Función para extraer oración del HTML de EWTN
function extractPrayerFromHTML(html: string, saintName: string): string | null {
  // Buscar patrones comunes de oración en el HTML
  // EWTN suele tener la oración después de "Oración" o "Prayer"
  
  // Patrón 1: Buscar sección "Oración"
  const oracionMatch = html.match(/<h[23][^>]*>(?:Oración|Oraci[oó]n al? Santo?|Prayer)[^<]*<\/h[23]>([\s\S]*?)(?:<h[23]|<\/article|<\/div class="article)/i);
  
  if (oracionMatch && oracionMatch[1]) {
    const cleanText = cleanHTMLContent(oracionMatch[1]);
    if (cleanText && cleanText.length > 50) {
      return cleanText;
    }
  }
  
  // Patrón 2: Buscar párrafos que contengan "Oh Glorioso" o patrones de oración
  const prayerPatterns = [
    /(?:Oh|¡Oh|Glorioso|Bienaventurado)[^<]*(?:San|Santa|Virgen|María|Señor)[^<]*(?:<[^>]+>|\s)*(?:[^<]+<[^>]+>)*[^<]*/gi,
    /<p[^>]*>(?:[^<]*(?:rogad|ruega|intercede|concédenos|te pedimos|te suplicamos)[^<]*)<\/p>/gi
  ];
  
  for (const pattern of prayerPatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      const combinedText = matches.map(m => cleanHTMLContent(m)).join('\n\n');
      if (combinedText.length > 100) {
        return combinedText;
      }
    }
  }
  
  // Patrón 3: Generar una oración básica si tenemos información del santo
  // (solo como fallback)
  
  return null;
}

// Función para limpiar HTML y obtener texto plano
function cleanHTMLContent(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Función para crear oración tradicional cuando solo tenemos URL
async function createTraditionalPrayer(
  supabase: any,
  saint: { id: string; name: string },
  prayerData: { texto: string; fuente: string; fuente_url: string }
): Promise<{ success: boolean; created: boolean; prayerId?: string; error?: string }> {
  try {
    // Verificar si ya existe una oración con este nombre
    const { data: existing } = await supabase
      .from('oraciones')
      .select('id')
      .ilike('nombre', `%${saint.name}%`)
      .limit(1);
    
    if (existing && existing.length > 0) {
      // Actualizar el santo para enlazar con la oración existente
      await supabase
        .from('calendar_saints')
        .update({ prayer_id: existing[0].id })
        .eq('id', saint.id);
      
      return { success: true, created: false, prayerId: existing[0].id };
    }
    
    // Crear nueva oración
    const oracionNombre = `Oración a ${saint.name}`;
    
    const { data: newOracion, error: createError } = await supabase
      .from('oraciones')
      .insert({
        nombre: oracionNombre,
        texto: prayerData.texto,
        categoria: 'Santos',
        es_tradicional: true,
        fuente: prayerData.fuente,
        fuente_url: prayerData.fuente_url,
        tagline: `Oración tradicional a ${saint.name}`,
        tags: [saint.name.replace(/^(San|Santa|Santo)\s+/i, ''), 'EWTN', 'tradicional'],
      })
      .select('id')
      .single();
    
    if (createError) {
      return { success: false, created: false, error: createError.message };
    }
    
    // Enlazar santo con la nueva oración
    await supabase
      .from('calendar_saints')
      .update({ prayer_id: newOracion.id })
      .eq('id', saint.id);
    
    return { success: true, created: true, prayerId: newOracion.id };
  } catch (error) {
    return { success: false, created: false, error: String(error) };
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { saintId, saintName, batchMode, limit = 20 } = await req.json();

    // Modo individual: buscar un santo específico
    if (saintId || saintName) {
      let saint: { id: string; name: string } | null = null;
      
      if (saintId) {
        const { data } = await supabase
          .from('calendar_saints')
          .select('id, name')
          .eq('id', saintId)
          .single();
        saint = data;
      } else if (saintName) {
        const { data } = await supabase
          .from('calendar_saints')
          .select('id, name')
          .ilike('name', `%${saintName}%`)
          .limit(1)
          .single();
        saint = data;
      }
      
      if (!saint) {
        return new Response(
          JSON.stringify({ error: 'Santo no encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const prayerData = await searchEWTNForSaint(saint.name);
      
      if (!prayerData) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `No se encontró oración en EWTN para ${saint.name}`,
            availableSaints: Object.keys(EWTN_KNOWN_URLS).length 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const result = await createTraditionalPrayer(supabase, saint, prayerData);
      
      return new Response(
        JSON.stringify({ 
          success: result.success, 
          saint: saint.name,
          created: result.created,
          prayerId: result.prayerId,
          source: prayerData.fuente_url
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Modo batch: procesar múltiples santos sin oración
    if (batchMode) {
      // Obtener santos sin oración que tienen URL conocida en EWTN
      const { data: saintsWithoutPrayer } = await supabase
        .from('calendar_saints')
        .select('id, name')
        .is('prayer_id', null)
        .order('feast_month')
        .order('feast_day');
      
      if (!saintsWithoutPrayer || saintsWithoutPrayer.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Todos los santos ya tienen oración',
            processed: 0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Filtrar solo los que tienen URL conocida en EWTN
      const saintsWithEWTN = saintsWithoutPrayer.filter(saint => {
        const normalizedName = saint.name.trim();
        
        // Buscar coincidencia exacta o parcial
        if (EWTN_KNOWN_URLS[normalizedName]) return true;
        
        for (const name of Object.keys(EWTN_KNOWN_URLS)) {
          if (normalizedName.toLowerCase().includes(name.toLowerCase()) || 
              name.toLowerCase().includes(normalizedName.toLowerCase())) {
            return true;
          }
        }
        return false;
      }).slice(0, limit);
      
      console.log(`Procesando ${saintsWithEWTN.length} santos con URL conocida de EWTN`);
      
      const results: { name: string; success: boolean; created: boolean; error?: string }[] = [];
      
      for (const saint of saintsWithEWTN) {
        const prayerData = await searchEWTNForSaint(saint.name);
        
        if (prayerData) {
          const result = await createTraditionalPrayer(supabase, saint, prayerData);
          results.push({
            name: saint.name,
            success: result.success,
            created: result.created,
            error: result.error
          });
        } else {
          results.push({
            name: saint.name,
            success: false,
            created: false,
            error: 'No se pudo extraer oración del HTML'
          });
        }
        
        // Pequeña pausa entre requests para no saturar EWTN
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const summary = {
        processed: results.length,
        created: results.filter(r => r.created).length,
        linked: results.filter(r => r.success && !r.created).length,
        failed: results.filter(r => !r.success).length,
        totalAvailable: Object.keys(EWTN_KNOWN_URLS).length,
        saintsWithoutPrayer: saintsWithoutPrayer.length
      };
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          summary,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Si no se especifica modo, devolver información sobre santos disponibles
    const { data: saintsWithoutPrayer } = await supabase
      .from('calendar_saints')
      .select('id, name')
      .is('prayer_id', null);
    
    // Contar cuántos tienen URL conocida
    const availableCount = (saintsWithoutPrayer || []).filter(saint => {
      const normalizedName = saint.name.trim();
      if (EWTN_KNOWN_URLS[normalizedName]) return true;
      for (const name of Object.keys(EWTN_KNOWN_URLS)) {
        if (normalizedName.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(normalizedName.toLowerCase())) {
          return true;
        }
      }
      return false;
    }).length;
    
    return new Response(
      JSON.stringify({ 
        availableInEWTN: Object.keys(EWTN_KNOWN_URLS).length,
        saintsWithoutPrayer: saintsWithoutPrayer?.length || 0,
        canImportFromEWTN: availableCount,
        message: 'Usa batchMode: true para importar oraciones de EWTN'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in scrape-ewtn-prayers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
