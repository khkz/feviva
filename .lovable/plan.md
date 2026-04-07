## Plan: Fase 2B — Cápsulas Virales

### Concepto
Micro-contenido visual diario con datos impactantes (IA/tech vs fe humana) diseñado para compartir en WhatsApp e Instagram. Cada cápsula es una "tarjeta" visualmente atractiva con un dato + reflexión breve + CTA sutil a ElRugido.

### Arquitectura

#### 1. Tabla `daily_capsules` (migración)
- `id`, `fecha` (unique), `dato_impactante` (texto corto del dato), `reflexion` (1-2 frases), `fuente` (URL/referencia), `categoria` (tech_vs_fe, dato_historico, pregunta_provocadora), `emoji_icon`, `color_accent`, `share_count` (tracking), `created_at`
- RLS: lectura pública (sin auth), escritura solo admin

#### 2. Página pública `/capsula-del-dia`
- Ruta pública indexable (SEO)
- Muestra la cápsula de hoy con diseño visual impactante
- Botones de compartir: WhatsApp, Instagram (copiar), Twitter/X
- Schema.org `Article` + meta OG dinámicos
- Preview de cápsulas anteriores (últimas 7)
- CTA: "Recibe una cápsula cada día" → `/auth`

#### 3. Componente `CapsuleCard.tsx`
- Tarjeta visual con gradiente, dato grande, reflexión, logo ElRugido
- Optimizada para captura de pantalla (aspecto IG Story 9:16 y Post 1:1)
- Animación sutil con framer-motion

#### 4. Widget en Dashboard
- Mini-card de la cápsula del día en el dashboard de usuarios registrados
- Botón "Compartir" integrado con Web Share API

#### 5. Generación automática (Edge Function)
- Edge function `generate-daily-capsule` que usa IA para generar cápsulas
- Se puede llamar desde admin o programar con cron
- Genera dato + reflexión + categoría automáticamente

#### 6. Seed inicial
- 7 cápsulas iniciales insertadas vía SQL para tener contenido desde el día 1

### Archivos

| Archivo | Acción |
|---|---|
| Migración SQL | Crear tabla `daily_capsules` con RLS pública |
| `src/pages/CapsulaDelDia.tsx` | Página pública con SEO |
| `src/components/capsules/CapsuleCard.tsx` | Tarjeta visual compartible |
| `src/components/capsules/CapsuleShareButtons.tsx` | Botones de compartir |
| `src/hooks/useDailyCapsule.tsx` | Hook para obtener cápsula del día |
| `src/pages/Dashboard.tsx` | Añadir widget de cápsula |
| `src/App.tsx` | Ruta `/capsula-del-dia` |
| `supabase/functions/generate-sitemap/index.ts` | Añadir `/capsula-del-dia` |
| `supabase/functions/generate-daily-capsule/index.ts` | Generación con IA |

### Resultado esperado
- 1 pieza de micro-contenido viral diaria
- Optimizada para captura de pantalla en WhatsApp/IG
- Tracking de compartidos
- SEO indexable con Schema.org
- Embudo: cápsula viral → visita web → registro
