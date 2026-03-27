# Diagnóstico Arquitectónico Completo: ElRugido

## 1. Vista General del Stack

```text
+------------------+     +------------------+     +------------------+
|   FRONTEND       |     |   BACKEND        |     |   SERVICIOS      |
|                  |     |   (Lovable Cloud) |     |                  |
|  React 18        |     |                  |     |  Lovable AI      |
|  TypeScript 5.8  |     |  45 Edge Funcs   |     |  (gpt/gemini)    |
|  Vite 5 + PWA    |     |  PostgreSQL      |     |                  |
|  Tailwind CSS 3  |     |  pgvector        |     |  VAPID Push      |
|  shadcn/ui       |     |  Storage (6 bkts)|     |  Resend Email    |
|  TanStack Query  |     |  Auth (email+    |     |  YouTube API     |
|  Framer Motion   |     |   Google+Apple)  |     |                  |
|  React Router 6  |     |  RLS Policies    |     |                  |
+------------------+     +------------------+     +------------------+
```

---

## 2. Mapa de Páginas (37 rutas + 16 admin)

```text
PÚBLICAS (sin auth):
  /              Landing (sync)
  /auth          Login/Signup (sync)
  /santos        Santos públicos (SEO)
  /santo/:slug   Santo individual (SEO)
  /oraciones     Oraciones públicas (SEO)
  /oracion/:slug Oración individual (SEO)
  /install       Instrucciones PWA

PROTEGIDAS (requieren sesión):
  /dashboard     Panel principal
  /coach         Coach IA (debate-coach, JWT)
  /cards         Tarjetas de argumentos
  /habits        Hábitos espirituales
  /community     Comunidad (posts/comentarios)
  /library       Biblioteca de lecciones
  /profile       Perfil del usuario
  /profile/reminders  Recordatorios
  /debate-history     Historial de debates
  /gamification       Logros y niveles
  /morning            Ritual matutino
  /evening            Ritual nocturno
  /prayer             Diario de oración
  /mission            Misión de evangelización
  /oraciones/app      Oraciones (auth)
  /rosario            Rosario interactivo
  /sleep-stories      Historias para dormir
  /sleep              Alias de sleep-stories
  /novenas            Novenas
  /bible-plan         Plan bíblico
  /santos/app         Santos (auth)
  /apostle-path       Ruta del Apóstol
  /apologetics-intro  Intro apologética
  /gratitude          Gratitud
  /evangelio          Evangelio diario
  /evangelio/:fecha   Evangelio por fecha
  /search             Búsqueda semántica (RAG)
  /frontera-final     Fe y Cosmos
  /frontera-final/:articleId  Artículo individual
  /onboarding         Flujo de bienvenida

ADMIN (requieren rol admin/moderator):
  /admin              Dashboard admin
  /admin/users        Gestión usuarios
  /admin/community    Moderación comunidad
  /admin/santos       Santos y santoral
  /admin/content      Contenido general
  /admin/daily-content  Contenido diario
  /admin/oraciones    Audios oraciones
  /admin/gratitude    Gratitud
  /admin/invitations  Invitaciones
  /admin/courses      Cursos
  /admin/movies       Películas
  /admin/live         Sesiones en vivo
  /admin/media        Media library
  /admin/feedback     Feedback
  /admin/processing   Cola de procesamiento
  /admin/analytics    Analíticas
  /admin/bible-plan   Plan bíblico admin
```

---

## 3. Base de Datos (40 tablas)

```text
USUARIOS Y AUTH:
  profiles              Datos de perfil (nombre, email, país, doctrinal)
  user_roles            Roles: user/moderator/revisor_teologico/admin/lider_iglesia
  user_stats            Nivel, puntos, rachas, debates completados
  user_notification_preferences  Preferencias de push

CONTENIDO DIARIO:
  daily_content         Versículo, reflexión, tip, oraciones (por fecha)
  daily_gospel          Evangelio YouTube (por fecha)
  daily_share_images    Imágenes para compartir

ORACIÓN Y DEVOCIÓN:
  oraciones             150+ oraciones (texto, audio, slug, categorías)
  rosario_misterios     20 misterios (DB, fallback a rosarioData.ts)
  rosario_oraciones     5 oraciones del rosario (DB con fallback)
  novenas               Novenas con días JSON
  prayer_journal        Diario personal de oración
  user_rituals          Rituales matutinos/nocturnos completados
  user_rosario_progress Progreso del rosario
  user_novena_progress  Progreso de novenas
  user_oraciones_favoritas  Oraciones favoritas
  gratitude_entries     Entradas de gratitud
  gratitude_sessions    Sesiones guiadas
  user_gratitude_progress  Progreso de gratitud

SANTOS:
  calendar_saints       Santoral (nombre, feast_day/month, slug, imagen, bio)

APOLOGÉTICA:
  argument_cards        Tarjetas de argumentos
  debates               Historial de debates IA
  usage_quotas          Límites diarios de IA (3/día)
  knowledge_chunks      Chunks RAG con embeddings pgvector

FORMACIÓN:
  library_lessons       Lecciones (texto, audio, enriquecido)
  courses / course_modules / course_lessons  Sistema de cursos
  user_lesson_progress  Progreso por lección
  user_course_progress  Progreso por curso

COMUNIDAD:
  posts                 Testimonios, peticiones, reflexiones
  post_comments         Comentarios moderados
  evangelization_logs   Registro de evangelización

GAMIFICACIÓN:
  achievements          Logros disponibles
  user_achievements     Logros desbloqueados
  habits / habit_logs   Hábitos y registros
  apostle_path_progress / activities  Ruta del Apóstol
  user_referral_codes / referrals  Sistema de referidos

MEDIA Y CONTENIDO:
  media_library         Archivos multimedia
  movies / user_movie_history  Películas católicas
  live_sessions / registrations  Sesiones en vivo
  sleep_stories / user_sleep_history  Historias para dormir
  bible_reading_plan / notes / text_cache / user_bible_progress  Plan bíblico
  frontera_articulos    Artículos Fe y Cosmos

INFRAESTRUCTURA:
  push_subscriptions    Suscripciones Web Push
  processing_jobs / logs  Cola de procesamiento batch
  content_feedback      Feedback de usuarios
  feedback_alerts / history  Alertas de feedback negativo
  gift_invitations      Invitaciones regalo
  admin_activity_logs   Logs de admin
```

---

## 4. Edge Functions (45 funciones)

```text
PROTEGIDAS (verify_jwt = true en código via getClaims):
  debate-coach          Coach IA con límites (usage_quotas)
  apostle-path-ai       IA para ruta del apóstol
  push-subscribe        Registro de suscripciones push

NO PROTEGIDAS (verify_jwt = false, admin_key o públicas):
  GENERACIÓN CONTENIDO:
    generate-daily-content, generate-daily-images
    generate-sleep-stories, generate-sleep-image
    generate-saint-history, generate-saint-prayer, generate-saint-image
    generate-saint-share-image, generate-novena-image
    generate-gratitude-reflection, generate-rosario-audio, generate-sitemap

  BATCH PROCESSING:
    batch-enrich-lessons, batch-lesson-tts, batch-sleep-tts
    batch-gratitude-tts, batch-generate-saint-content
    batch-generate-saint-images, batch-fetch-saint-bios
    batch-fetch-saint-images, process-jobs

  TTS Y AUDIO:
    text-to-speech, lesson-tts
    regenerate-daily-audio, regenerate-gratitude-content
    regenerate-oracion-audio

  SCRAPING Y DATOS:
    fetch-saint-wikipedia-bio, fetch-saint-wikipedia-image
    fetch-youtube-videos, fetch-gospel-videos
    scrape-ewtn-prayers, import-traditional-prayers
    fix-fundamental-prayers, populate-bible-plan, get-bible-text
    enrich-lesson

  RAG / CONOCIMIENTO:
    ingest-knowledge, seed-knowledge, semantic-search

  NOTIFICACIONES:
    send-push, send-auth-email, send-gift-invitation
```

---

## 5. Contextos Globales (wrapping toda la app)

```text
QueryClientProvider (TanStack Query)
  ThemeProvider (next-themes, system default)
    AudioPlayerProvider (reproductor global: sleep stories, oraciones, lecciones)
      RosarioProvider (estado completo del rosario interactivo)
        TooltipProvider
          BrowserRouter
            Suspense (LoadingScreen)
              Routes...
              OracionPlayer (floating)
              UnifiedMiniPlayer (floating)
              RosarioMiniPlayer (floating)
              RosarioInterstellar (floating)
```

---

## 6. Hooks Personalizados (37 hooks)

```text
DATOS:
  useDailyContent     Contenido diario con detección de cambio de día
  useDailyGospel      Evangelio del día (YouTube)
  useDailyVerse       Versículo diario
  useSaintOfDay       Santo del día
  useNovenas          Novenas y progreso
  useOraciones        Listado de oraciones
  useSantos           Listado de santos
  useSleepStories     Historias para dormir
  useBiblePlan        Plan de lectura bíblica
  useRosarioData      Misterios/oraciones (DB con fallback)
  useFronteraArticulos  Artículos Frontera Final

IA:
  useSemanticSearch   Búsqueda RAG
  useLessonEnrichment Enriquecer lecciones con IA

AUDIO:
  useOracionAudio     Reproducir oraciones
  useRosarioTTS       TTS para el rosario
  useRosarioExperience  Experiencia completa rosario
  useAudioCache       Cache de audio
  usePlaylistManager  Listas de reproducción

USUARIO:
  useUserStats        Nivel, puntos, rachas
  useAdminAuth        Verificación admin/moderator
  usePracticeStreaks   Rachas de práctica
  useContentFeedback  Feedback de contenido
  useGratitudeJournal Diario de gratitud
  useGratitudeExperience  Experiencia de gratitud
  useApostlePath      Progreso ruta apóstol
  useFronteraProgress Progreso Frontera Final
  useReferrals        Sistema de referidos

NOTIFICACIONES:
  useNotifications    Notificaciones browser
  usePushNotifications  Web Push

ADMIN:
  useAdminStats       Estadísticas admin
  useCommentModeration  Moderación comentarios
  useDailyShareImages  Imágenes diarias
  useProcessingJobs   Cola de procesamiento
  useImageCache       Cache de imágenes
```

---

## 7. Flujo de Autenticación

```text
Landing (/)
  |-- Si hay sesión activa -> redirect /dashboard
  |-- ProtectedRoute guard global
  |
  v
Auth (/auth)
  |-- Email/Password login -> navigate /dashboard
  |-- Email/Password signup -> navigate /onboarding
  |-- Google OAuth (lovable.auth.signInWithOAuth)
  |-- Apple OAuth (lovable.auth.signInWithOAuth)
  |-- Password reset flow
  |-- Invite code handling (gift_invitations)
  |
  v
ProtectedRoute (AuthGuard centralizado)
  |-- onAuthStateChange + getSession
  |-- Si no hay sesión -> redirect /auth
  |-- Si hay sesión -> renderizar children
  |
  v
Dashboard (/dashboard)
  |-- Carga perfil, stats, novenas, etc.

Admin (/admin)
  |-- useAdminAuth: verifica rol admin/moderator en user_roles
  |-- Si no es moderator -> redirect /dashboard
```

---

## 8. PWA y Offline

```text
Configuración: vite-plugin-pwa con Workbox
  - Service Worker: autoUpdate
  - Precache: JS, CSS, HTML, imágenes, SVG, fonts
  - navigateFallback: /index.html
  - navigateFallbackDenylist: /~oauth, /api

Runtime Caching:
  daily_content      StaleWhileRevalidate (12h)
  calendar_saints    StaleWhileRevalidate (24h)
  rosario_misterios  CacheFirst (7 días)
  rosario_oraciones  CacheFirst (7 días)
  frontera_articulos StaleWhileRevalidate (24h)
  oraciones          StaleWhileRevalidate (24h)
  novenas            StaleWhileRevalidate (24h)
  library_lessons    StaleWhileRevalidate (24h)
  storage (imágenes) CacheFirst (7 días)
  Google Fonts       CacheFirst (1 año)

OfflineIndicator: componente global que muestra banner sin conexión
```

---

## 9. Storage Buckets (6)

```text
teachings-audio    Público  Audios de lecciones
novena-images      Público  Imágenes de novenas
ambient-audio      Público  Sonidos ambientales
sleep-images       Público  Imágenes sleep stories
saint-images       Público  Imágenes de santos
daily-share-images Público  Imágenes para compartir
```

---

## 10. Secrets Configurados (12)

```text
RESEND_API_KEY, ADMIN_API_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
SUPABASE_ANON_KEY, SUPABASE_DB_URL, SUPABASE_PUBLISHABLE_KEY,
OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
LOVABLE_API_KEY, YOUTUBE_API_KEY
```

---

## 11. Observaciones y Estado

### Seguridad
- **Roles bien implementados**: tabla `user_roles` separada con función `has_role()` SECURITY DEFINER
- **Edge functions protegidas en código**: Las que requieren auth validan JWT via `getClaims()` manualmente
- **Funciones admin**: Protegidas con `ADMIN_API_KEY` header
- **ProtectedRoute centralizado**: Guard global para todas las rutas protegidas (implementado)

### Rendimiento
- **Code splitting**: 50+ páginas con React.lazy
- **Dashboard lazy loading**: Componentes pesados internos
- **Landing page**: 10 secciones below-the-fold lazy-loaded
- **TanStack Query cache**: staleTime variado por tipo de contenido

### Lo que FALTA (del Plan Maestro)
- **Stripe (Bloque E)**: No implementado, sin tabla de suscripciones
- **i18n (Bloque G)**: No implementado
- **Admin Rosario**: No existe página admin para editar misterios/oraciones

---

*Última actualización: Marzo 2026*
