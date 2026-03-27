

# Diagnostico Arquitectonico Completo: ElRugido

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

## 2. Mapa de Paginas (37 rutas + 16 admin)

```text
PUBLICAS (sin auth):
  /              Landing (sync)
  /auth          Login/Signup (sync)
  /santos        Santos publicos (SEO)
  /santo/:slug   Santo individual (SEO)
  /oraciones     Oraciones publicas (SEO)
  /oracion/:slug Oracion individual (SEO)
  /install       Instrucciones PWA

PROTEGIDAS (requieren sesion):
  /dashboard     Panel principal
  /coach         Coach IA (debate-coach, JWT)
  /cards         Tarjetas de argumentos
  /habits        Habitos espirituales
  /community     Comunidad (posts/comentarios)
  /library       Biblioteca de lecciones
  /profile       Perfil del usuario
  /profile/reminders  Recordatorios
  /debate-history     Historial de debates
  /gamification       Logros y niveles
  /morning            Ritual matutino
  /evening            Ritual nocturno
  /prayer             Diario de oracion
  /mission            Mision de evangelizacion
  /oraciones/app      Oraciones (auth)
  /rosario            Rosario interactivo
  /sleep-stories      Historias para dormir
  /sleep              Alias de sleep-stories
  /novenas            Novenas
  /bible-plan         Plan biblico
  /santos/app         Santos (auth)
  /apostle-path       Ruta del Apostol
  /apologetics-intro  Intro apologetica
  /gratitude          Gratitud
  /evangelio          Evangelio diario
  /evangelio/:fecha   Evangelio por fecha
  /search             Busqueda semantica (RAG)
  /frontera-final     Fe y Cosmos
  /frontera-final/:articleId  Articulo individual
  /onboarding         Flujo de bienvenida

ADMIN (requieren rol admin/moderator):
  /admin              Dashboard admin
  /admin/users        Gestion usuarios
  /admin/community    Moderacion comunidad
  /admin/santos       Santos y santoral
  /admin/content      Contenido general
  /admin/daily-content  Contenido diario
  /admin/oraciones    Audios oraciones
  /admin/gratitude    Gratitud
  /admin/invitations  Invitaciones
  /admin/courses      Cursos
  /admin/movies       Peliculas
  /admin/live         Sesiones en vivo
  /admin/media        Media library
  /admin/feedback     Feedback
  /admin/processing   Cola de procesamiento
  /admin/analytics    Analiticas
  /admin/bible-plan   Plan biblico admin
```

---

## 3. Base de Datos (40 tablas)

```text
USUARIOS Y AUTH:
  profiles              Datos de perfil (nombre, email, pais, doctrinal)
  user_roles            Roles: user/moderator/revisor_teologico/admin/lider_iglesia
  user_stats            Nivel, puntos, rachas, debates completados
  user_notification_preferences  Preferencias de push

CONTENIDO DIARIO:
  daily_content         Versiculo, reflexion, tip, oraciones (por fecha)
  daily_gospel          Evangelio YouTube (por fecha)
  daily_share_images    Imagenes para compartir

ORACION Y DEVOCION:
  oraciones             150+ oraciones (texto, audio, slug, categorias)
  rosario_misterios     20 misterios (DB, fallback a rosarioData.ts)
  rosario_oraciones     5 oraciones del rosario (DB con fallback)
  novenas               Novenas con dias JSON
  prayer_journal        Diario personal de oracion
  user_rituals          Rituales matutinos/nocturnos completados
  user_rosario_progress Progreso del rosario
  user_novena_progress  Progreso de novenas
  user_oraciones_favoritas  Oraciones favoritas
  gratitude_entries     Entradas de gratitud
  gratitude_sessions    Sesiones guiadas
  user_gratitude_progress  Progreso de gratitud

SANTOS:
  calendar_saints       Santoral (nombre, feast_day/month, slug, imagen, bio)

APOLOGETICA:
  argument_cards        Tarjetas de argumentos
  debates               Historial de debates IA
  usage_quotas          Limites diarios de IA (3/dia)
  knowledge_chunks      Chunks RAG con embeddings pgvector

FORMACION:
  library_lessons       Lecciones (texto, audio, enriquecido)
  courses / course_modules / course_lessons  Sistema de cursos
  user_lesson_progress  Progreso por leccion
  user_course_progress  Progreso por curso

COMUNIDAD:
  posts                 Testimonios, peticiones, reflexiones
  post_comments         Comentarios moderados
  evangelization_logs   Registro de evangelizacion

GAMIFICACION:
  achievements          Logros disponibles
  user_achievements     Logros desbloqueados
  habits / habit_logs   Habitos y registros
  apostle_path_progress / activities  Ruta del Apostol
  user_referral_codes / referrals  Sistema de referidos

MEDIA Y CONTENIDO:
  media_library         Archivos multimedia
  movies / user_movie_history  Peliculas catolicas
  live_sessions / registrations  Sesiones en vivo
  sleep_stories / user_sleep_history  Historias para dormir
  bible_reading_plan / notes / text_cache / user_bible_progress  Plan biblico
  frontera_articulos    Articulos Fe y Cosmos

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
PROTEGIDAS (verify_jwt = true):
  debate-coach          Coach IA con limites (usage_quotas)
  apostle-path-ai       IA para ruta del apostol

NO PROTEGIDAS (verify_jwt = false, admin_key o publicas):
  GENERACION CONTENIDO:
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
    push-subscribe, send-push, send-auth-email, send-gift-invitation
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
  useDailyContent     Contenido diario con deteccion de cambio de dia
  useDailyGospel      Evangelio del dia (YouTube)
  useDailyVerse       Versiculo diario
  useSaintOfDay       Santo del dia
  useNovenas          Novenas y progreso
  useOraciones        Listado de oraciones
  useSantos           Listado de santos
  useSleepStories     Historias para dormir
  useBiblePlan        Plan de lectura biblica
  useRosarioData      Misterios/oraciones (DB con fallback)
  useFronteraArticulos  Articulos Frontera Final

IA:
  useSemanticSearch   Busqueda RAG
  useLessonEnrichment Enriquecer lecciones con IA

AUDIO:
  useOracionAudio     Reproducir oraciones
  useRosarioTTS       TTS para el rosario
  useRosarioExperience  Experiencia completa rosario
  useAudioCache       Cache de audio
  usePlaylistManager  Listas de reproduccion

USUARIO:
  useUserStats        Nivel, puntos, rachas
  useAdminAuth        Verificacion admin/moderator
  usePracticeStreaks   Rachas de practica
  useContentFeedback  Feedback de contenido
  useGratitudeJournal Diario de gratitud
  useGratitudeExperience  Experiencia de gratitud
  useApostlePath      Progreso ruta apostol
  useFronteraProgress Progreso Frontera Final
  useReferrals        Sistema de referidos

NOTIFICACIONES:
  useNotifications    Notificaciones browser
  usePushNotifications  Web Push

ADMIN:
  useAdminStats       Estadisticas admin
  useCommentModeration  Moderacion comentarios
  useDailyShareImages  Imagenes diarias
  useProcessingJobs   Cola de procesamiento
  useImageCache       Cache de imagenes
```

---

## 7. Flujo de Autenticacion

```text
Landing (/)
  |-- Si hay sesion activa -> redirect /dashboard
  |-- onAuthStateChange SIGNED_IN -> redirect /dashboard
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
Dashboard (/dashboard)
  |-- checkAuth: si no hay sesion -> redirect /auth
  |-- Carga perfil, stats, novenas, etc.

Admin (/admin)
  |-- useAdminAuth: verifica rol admin/moderator en user_roles
  |-- Si no es moderator -> redirect /dashboard
```

---

## 8. PWA y Offline

```text
Configuracion: vite-plugin-pwa con Workbox
  - Service Worker: autoUpdate
  - Precache: JS, CSS, HTML, imagenes, SVG, fonts
  - navigateFallback: /index.html
  - navigateFallbackDenylist: /~oauth, /api

Runtime Caching:
  daily_content      StaleWhileRevalidate (12h)
  calendar_saints    StaleWhileRevalidate (24h)
  rosario_misterios  CacheFirst (7 dias)
  rosario_oraciones  CacheFirst (7 dias)
  frontera_articulos StaleWhileRevalidate (24h)
  oraciones          StaleWhileRevalidate (24h)
  novenas            StaleWhileRevalidate (24h)
  library_lessons    StaleWhileRevalidate (24h)
  storage (imagenes) CacheFirst (7 dias)
  Google Fonts       CacheFirst (1 ano)

OfflineIndicator: componente global que muestra banner sin conexion
```

---

## 9. Storage Buckets (6)

```text
teachings-audio    Publico  Audios de lecciones
novena-images      Publico  Imagenes de novenas
ambient-audio      Publico  Sonidos ambientales
sleep-images       Publico  Imagenes sleep stories
saint-images       Publico  Imagenes de santos
daily-share-images Publico  Imagenes para compartir
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

## 11. Observaciones y Potenciales Riesgos

### Seguridad
- **Roles bien implementados**: tabla `user_roles` separada con funcion `has_role()` SECURITY DEFINER
- **33 de 45 edge functions NO verifican JWT** -- las de batch/generacion usan ADMIN_API_KEY internamente, lo cual es correcto para funciones administrativas
- **2 funciones SI verifican JWT**: `debate-coach` y `apostle-path-ai` (las unicas que llama el usuario directamente)
- **push-subscribe NO verifica JWT** -- cualquiera podria registrar un endpoint push

### Rendimiento
- **Code splitting implementado**: 50+ paginas con React.lazy
- **Dashboard tambien usa lazy loading** para componentes pesados internos
- **Landing page lazy-loads** 10 secciones below-the-fold
- **TanStack Query cache** bien configurado con staleTime variado

### Datos
- **Rosario data**: doble fuente (DB + fallback estatico en rosarioData.ts) -- correcto
- **Frontera articulos**: migrados a DB (frontera_articulos)
- **Limite 1000 rows**: ya parcheado con .limit(3000) en santos y oraciones
- **Deteccion cambio de dia**: implementada con visibilitychange + focus

### Arquitectura Frontend
- **4 reproductores flotantes globales** (OracionPlayer, UnifiedMiniPlayer, RosarioMiniPlayer, RosarioInterstellar) -- potencial conflicto de z-index/audio
- **AudioPlayerContext** maneja cola, repeat, timer -- robusto
- **RosarioContext** con TTS, ambient sounds (Web Audio API), auto-advance -- complejo pero funcional
- **No hay proteccion de rutas centralizada** -- cada pagina protegida hace su propio checkAuth manualmente en useEffect

### Lo que FALTA (del Plan Maestro)
- **Stripe (Bloque E)**: no implementado, sin tabla de suscripciones, sin logica freemium
- **i18n (Bloque G)**: no implementado
- **Admin Rosario**: no existe pagina admin para editar misterios/oraciones

### Posibles Problemas Latentes
1. **Auth race condition**: Index.tsx y Auth.tsx ambos escuchan `onAuthStateChange` -- si el usuario aterriza en `/auth` despues de OAuth, ambos podrian competir por el navigate
2. **RosarioContext siempre activo**: el provider wrappea toda la app, creando listeners de audio incluso cuando el usuario nunca abre el rosario
3. **Admin sin bible-plan en index.tsx**: `AdminBiblePlan` se importa directamente (`import("./pages/admin/AdminBiblePlan")`), no del barrel export
4. **Migraciones**: 67 archivos de migracion -- la DB ha evolucionado significativamente

---

Este es el estado completo del proyecto. No se modifico ningun archivo.

