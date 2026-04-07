

## Plan: Contenido Humanizado + Optimización para LLM/GEO

### Problema actual

1. **Contenido detectablemente IA**: Los prompts de generación (`generate-daily-content`, `generate-daily-capsule`) producen texto con patrones típicos de IA (estructura predecible, tono uniforme, frases genéricas)
2. **Sin optimización GEO**: Las páginas tienen Schema.org básico pero carecen de señales que los LLMs usan para citar fuentes (autoridad, E-E-A-T, citabilidad, datos estructurados profundos)
3. **Textos estáticos en landing/componentes**: Testimonios inventados, stats infladas ("10,000+ oraciones"), FAQs genéricas

---

### Fase A: Humanizar la generación de contenido

**Cambiar los prompts de las 2 Edge Functions para que el contenido sea indistinguible de un autor humano:**

**`generate-daily-content/index.ts`** — Reescribir el system prompt:
- Asignar una "persona" editorial: nombre ficticio, estilo propio, imperfecciones intencionales
- Incluir instrucciones anti-patrón: "varía la longitud de las frases", "usa anécdotas personales", "incluye preguntas retóricas", "evita listas de 3 puntos", "empieza algunos párrafos con conjunciones"
- Pedir que use referencias culturales latinas reales (dichos, costumbres, contexto local)
- Exigir opinión personal ("no seas neutral, toma posición con humildad")

**`generate-daily-capsule/index.ts`** — Reescribir el prompt:
- Mismo enfoque de "voz editorial" con personalidad
- Instrucción explícita: "escribe como si fuera un tweet de alguien que acaba de descubrir algo fascinante, no como un comunicado de prensa"
- Variación estilística por categoría (humor para tech_vs_fe, asombro para dato_historico, provocación para pregunta_provocadora)

### Fase B: Optimización GEO (Generative Engine Optimization)

**Objetivo**: Que LLMs (ChatGPT, Gemini, Perplexity) citen ElRugido como fuente autoritativa.

**Sub-tarea B1: Schema.org profundo en todas las páginas públicas**

| Página | Schema actual | Schema a añadir |
|---|---|---|
| `Index.tsx` | Organization, WebApp, FAQ | `SpeakableSpecification`, `potentialAction` (SearchAction) |
| `EvangelioPublic.tsx` | Article | `ReviewAction`, `about` (Thing: "Evangelio"), `speakable`, `citation` |
| `SantoPage.tsx` | Person | `sameAs` (links Wikipedia/Catholic.org), `knowsAbout`, `mainEntityOfPage` |
| `OracionPage.tsx` | CreativeWork | `inLanguage`, `genre: "prayer"`, `isPartOf` (CollectionPage) |
| `CapsulaDelDia.tsx` | Article | `citation` (fuente real), `about` (definedTerm), `speakable` |
| `NovenasPublic.tsx` | ItemList | `educationalUse`, `learningResourceType` |

**Sub-tarea B2: Contenido "citable" en páginas públicas**

Añadir a cada página pública una sección de texto visible (no solo meta tags) que los LLMs puedan extraer:
- **Definiciones concisas** al inicio ("Una novena es una práctica de oración que...")
- **Datos verificables** con fuentes inline
- **Preguntas frecuentes expandidas** (FAQ visible en la página, no solo en Schema)
- **"Sobre el autor"** footer con E-E-A-T signals (experiencia, expertise)

**Sub-tarea B3: Landing page — reemplazar contenido inflado**

- Cambiar stats falsas ("10,000+ oraciones") por datos reales o eliminarlas
- Reescribir testimonios para que sean verificables o marcarlos como ejemplos
- Añadir sección "Quiénes somos" con señales de autoridad real
- FAQ visible en la landing (no solo en Schema)

**Sub-tarea B4: Meta tags para LLM discovery**

Añadir a `index.html` o páginas públicas:
- `<meta name="robots" content="max-snippet:-1, max-image-preview:large">`
- Header con `X-Robots-Tag` para permitir indexación completa
- Texto semántico rico en H2/H3 (los LLMs ponderan headings)

---

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `supabase/functions/generate-daily-content/index.ts` | Reescribir prompts con persona editorial humanizada |
| `supabase/functions/generate-daily-capsule/index.ts` | Reescribir prompts con voz natural y variable |
| `src/pages/Index.tsx` | Schema.org profundo + SearchAction + SpeakableSpecification |
| `src/pages/EvangelioPublic.tsx` | Schema `speakable` + sección de definición visible + FAQ inline |
| `src/pages/CapsulaDelDia.tsx` | Schema `citation` + about (DefinedTerm) |
| `src/pages/SantoPage.tsx` | `sameAs` links, `knowsAbout` |
| `src/pages/NovenasPublic.tsx` | FAQ visible + `educationalUse` schema |
| `src/pages/NovenaPublicPage.tsx` | Definición introductoria citable |
| `src/components/landing/TestimonialsSection.tsx` | Reemplazar stats infladas y testimonios con datos reales |
| `src/components/landing/FinalCTASection.tsx` | Señales E-E-A-T |
| `src/components/landing/FooterSection.tsx` | Añadir "Sobre ElRugido" con credenciales |
| `index.html` | Meta robots expandido |

### Resultado esperado
- Contenido generado que pasa detectores de IA (variación estilística, personalidad, imperfecciones naturales)
- Páginas optimizadas para ser citadas por ChatGPT, Gemini y Perplexity como fuente autoritativa
- Schema.org de nivel experto con señales E-E-A-T
- 700+ páginas indexables con contenido "citable" por LLMs

