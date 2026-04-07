

## Auditoría de Contenido IA + Plan de Humanización por Fases

### Diagnóstico: 10 fuentes de contenido analizadas

He revisado todas las Edge Functions generadoras, el contenido ya almacenado en la base de datos, y los textos estáticos de la plataforma. Aquí el veredicto:

---

### FASE 1: Contenido con ALTO riesgo de detección IA (prioridad inmediata)

**1A. `enrich-lesson/index.ts` — Lecciones de la Biblioteca**
- **Problema**: Prompt genérico sin persona editorial. Pide "cálido y pastoral" pero sin anti-patrones ni voz propia. Estructura rígida de 7 secciones numeradas que cualquier detector marca como IA
- **Evidencia en DB**: El contenido enriquecido usa "Queridos hermanos", "nos adentramos en el Sancta Sanctorum" — lenguaje formalmente perfecto, sin imperfecciones humanas
- **Fix**: Reescribir prompt con persona del Padre Miguel (ya existe en `generate-daily-content`), romper la estructura de 7 bloques, pedir variación

**1B. `generate-saint-history/index.ts` — Biografías de 420+ santos**
- **Problema**: Prompt básico sin personalidad. "Escribe biografías precisas, inspiradoras y accesibles" es exactamente lo que genera texto IA genérico
- **Evidencia en DB**: Las biografías cortas suenan a Wikipedia resumida ("fue un fraile franciscano conventual polaco que murió voluntariamente...")
- **Fix**: Inyectar voz narrativa, pedir que cuente como historia no como ficha, incluir detalles sensoriales/humanos

**1C. `generate-saint-prayer/index.ts` — Oraciones de santos**
- **Problema**: Prompt pide estructura litúrgica estándar (invocación, mención, petición, amén). Genera oraciones genéricas e intercambiables
- **Fix**: Pedir que cada oración tenga un "gancho" único del santo, variación en estructura, algunas más cortas y directas

**1D. `generate-sleep-stories/index.ts` — Historias para dormir**
- **Problema**: Aunque tiene buen sistema prompt con detalles sensoriales, la estructura es siempre idéntica: "Cierra tus ojos... respira... historia... bendición". Todas las 29 historias siguen el mismo patrón
- **Evidencia en DB**: "Bienvenido a este espacio de calma y refugio... un lugar sagrado creado solo para ti..."
- **Fix**: Crear 5-6 aperturas distintas, variar estructura narrativa, algunos que empiecen in medias res

---

### FASE 2: Contenido con riesgo MEDIO (ya parcialmente humanizado)

**2A. `generate-daily-content/index.ts` — Contenido diario**
- **Estado**: Ya tiene persona "Padre Miguel" con anti-patrones. Parcialmente humanizado
- **Problema residual**: El contenido en DB aún suena académico: "Este pasaje, situado en el inicio de nuestro caminar cuaresmal..." — no suena a párroco colombiano
- **Fix**: Reforzar anti-patrones, añadir más ejemplos concretos de tono, subir temperature a 0.9

**2B. `generate-daily-capsule/index.ts` — Cápsulas virales**
- **Estado**: Ya tiene guías de estilo por categoría
- **Problema residual**: Las cápsulas en DB son correctas pero predecibles. "Aún con toda la IA del mundo, nadie ha replicado algo tan simple como la risa de un niño" — suena a frase de LinkedIn
- **Fix**: Añadir más variación, pedir datos más específicos/oscuros, evitar frases motivacionales

**2C. `generate-gratitude-reflection/index.ts` — Reflexiones de gratitud**
- **Estado**: Prompt decente pero sin persona editorial
- **Fix**: Añadir voz del Padre Miguel, anti-patrones

---

### FASE 3: Contenido con riesgo BAJO (textos estáticos)

**3A. `debate-coach/index.ts` — Coach de debate**
- **Estado**: Bien diseñado con personas distintas (ateo, agnóstico, herido). Conversacional por naturaleza
- **Fix menor**: Añadir más variación en respuestas, evitar frases recurrentes

**3B. `apostle-path-ai/index.ts` — Ruta del apóstol**
- **Estado**: Prompts funcionales, contenido interactivo
- **Fix menor**: Personalizar más las respuestas con datos del usuario

**3C. Landing page y componentes estáticos**
- **Estado**: Ya mejorado en la iteración anterior (stats reales, testimonios marcados como ejemplos, E-E-A-T)
- **Problema residual**: `UserNeedsSection.tsx` tiene "testimonials" inventados inline ("Ahora oro cada mañana sin falta", "Duermo mejor que nunca")
- **Fix**: Eliminar o marcar como aspiracionales

---

### Plan de implementación

**Fase 1 (esta sesión)**: Reescribir los 4 prompts de alto riesgo
| Archivo | Cambio principal |
|---|---|
| `supabase/functions/enrich-lesson/index.ts` | Persona "Padre Miguel", romper estructura rígida de 7 bloques, anti-patrones |
| `supabase/functions/generate-saint-history/index.ts` | Voz narrativa, contar como historia, detalles humanos |
| `supabase/functions/generate-saint-prayer/index.ts` | Variación estructural, ganchos únicos por santo |
| `supabase/functions/generate-sleep-stories/index.ts` | 6 aperturas distintas rotativas, variación de estructura |

**Fase 2 (siguiente sesión)**: Refinar los 3 prompts de riesgo medio
| Archivo | Cambio principal |
|---|---|
| `supabase/functions/generate-daily-content/index.ts` | Reforzar anti-patrones, subir temperature |
| `supabase/functions/generate-daily-capsule/index.ts` | Datos más oscuros/específicos, menos LinkedIn |
| `supabase/functions/generate-gratitude-reflection/index.ts` | Persona editorial, anti-patrones |

**Fase 3 (posterior)**: Textos estáticos + regeneración
| Acción | Detalle |
|---|---|
| `src/components/landing/UserNeedsSection.tsx` | Eliminar testimonios ficticios inline |
| Regenerar contenido existente | Re-ejecutar generadores con nuevos prompts para las biografías y lecciones ya almacenadas |

### Resultado esperado
- 10/10 fuentes de contenido con prompts humanizados
- Contenido nuevo generado indistinguible de escritor humano
- Variación estilística que evita patrones detectables
- Base para regenerar el contenido existente con los nuevos prompts

