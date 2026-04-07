

## Plan: Fase 2A — SEO Público (Páginas Indexables + Sitemap Dinámico)

### Objetivo
Llevar las páginas de contenido de ~530 URLs actuales a **700+** páginas indexables, creando rutas públicas para Evangelio del día y Novenas, añadiendo Schema.org a la landing, y expandiendo el sitemap.

### Estado actual
- **Ya público**: `/santos` (420+ santos), `/oraciones` (150+ oraciones), `/santo/:slug`, `/oracion/:slug` — con Schema.org
- **Protegido (requiere auth)**: `/evangelio`, `/novenas`, `/frontera-final`
- **Sitemap**: Edge function dinámica ya existe con santos + oraciones (~530 URLs)
- **Landing**: Sin Schema.org (FAQPage, Organization)

---

### Sub-tarea 1: Evangelio del Día público (`/evangelio-del-dia`)

Crear nueva página pública `src/pages/EvangelioPublic.tsx`:
- Reutiliza `useDailyGospel` para obtener el contenido
- Muestra texto del evangelio, reflexión y santo del día (sin audio — audio requiere auth)
- CTA: "Escucha la reflexión en audio" → redirige a `/auth`
- Schema.org `Article` + `BreadcrumbList`
- Meta tags OG dinámicos con fecha
- Ruta: `/evangelio-del-dia` (pública, sin ProtectedRoute)
- Ruta existente `/evangelio` sigue protegida (versión completa con audio)

### Sub-tarea 2: Novenas públicas (`/novenas-publicas`, `/novena/:id`)

Crear `src/pages/NovenasPublic.tsx`:
- Lista de novenas con imagen, título, descripción
- Schema.org `ItemList`
- CTA: "Empieza esta novena" → `/auth`

Crear `src/pages/NovenaPublicPage.tsx`:
- Muestra descripción + Día 1 del texto (como preview)
- Schema.org `Article` + `HowTo` (9 pasos)
- CTA: "Continúa los 9 días" → `/auth`

### Sub-tarea 3: Schema.org en Landing

Añadir a `Index.tsx`:
- `Organization` schema (nombre, logo, URL)
- `FAQPage` schema con 5 preguntas frecuentes sobre la app
- `WebApplication` schema

### Sub-tarea 4: Expandir Sitemap

Actualizar `generate-sitemap/index.ts`:
- Añadir `/evangelio-del-dia` (changefreq: daily, priority: 0.9)
- Añadir `/novenas-publicas` + cada `/novena/:id`
- Añadir artículos de `frontera_articulos` como URLs públicas
- Meta: 700+ URLs indexables

### Sub-tarea 5: Rutas en App.tsx

- Añadir rutas públicas: `/evangelio-del-dia`, `/novenas-publicas`, `/novena/:id`
- Sin `ProtectedRoute`

---

### Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `src/pages/EvangelioPublic.tsx` | Crear — página pública del evangelio |
| `src/pages/NovenasPublic.tsx` | Crear — listado público de novenas |
| `src/pages/NovenaPublicPage.tsx` | Crear — detalle público de novena |
| `src/pages/Index.tsx` | Añadir Schema.org (Organization, FAQ, WebApp) |
| `src/App.tsx` | Añadir 3 rutas públicas |
| `supabase/functions/generate-sitemap/index.ts` | Expandir con evangelio + novenas |

### Resultado esperado
- De ~530 a 700+ URLs indexables
- Todas con Schema.org estructurado
- Embudo: contenido gratis (texto) → registro (audio/interacción)
- Posicionamiento en Google para "evangelio de hoy", "novena a [santo]", "oración católica"

