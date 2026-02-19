

# Plan Maestro: Fases 2-5 de ElRugido

## Estado Actual (Ya Resuelto)

Antes de planificar, es importante reconocer lo que YA se implemento en iteraciones anteriores:

| Item | Estado |
|------|--------|
| Bug "Dia de la Marmota" (useDailyContent.tsx) | RESUELTO - Hook con visibilitychange + focus + invalidacion de cache |
| Code Splitting (React.lazy) | RESUELTO - 50+ paginas con lazy loading, LoadingScreen como fallback |
| Seguridad Edge Functions (JWT + Admin Key) | RESUELTO - 35 funciones protegidas |
| Limites de uso IA (usage_quotas) | RESUELTO - 3 debates/dia con error 429 y UI amigable |
| Limite de consultas Supabase (1000 rows) | RESUELTO - .limit(3000) en santos y oraciones |

---

## Lo Que Falta Implementar (Ordenado por Impacto)

### BLOQUE A: PWA + Push Notifications (FASE 2 - Retencion)

**Prioridad: CRITICA**

1. Instalar `vite-plugin-pwa` y configurar en `vite.config.ts`
2. Crear `manifest.json` con iconos, nombre "ElRugido", colores de marca
3. Configurar Service Worker con Workbox para:
   - Precache de assets estaticos (JS, CSS, imagenes)
   - Runtime cache de API calls al santo del dia y contenido diario
   - `navigateFallbackDenylist: [/^\/~oauth/]` para no interferir con OAuth
4. Implementar Web Push Notifications:
   - Crear edge function `push-subscribe` para guardar suscripciones push en tabla `push_subscriptions`
   - Crear edge function `send-push` para enviar notificaciones via Web Push API
   - Reemplazar el sistema actual de `Notification` del navegador (que solo funciona con la app abierta) por push real
   - Mensajes: "Tu racha de X dias esta en peligro", "Tu historia para dormir te espera"
5. Crear pagina `/install` con instrucciones para instalar la app

**Archivos a crear/modificar:**
- `vite.config.ts` (agregar VitePWA plugin)
- `public/manifest.json`
- `supabase/functions/push-subscribe/index.ts`
- `supabase/functions/send-push/index.ts`
- Migracion SQL para tabla `push_subscriptions`
- `src/hooks/useNotifications.tsx` (reemplazar Notification API por Push)
- `src/pages/Install.tsx`

---

### BLOQUE B: Social Login - Google y Apple (FASE 3 - Friccion Cero)

**Prioridad: ALTA**

1. Usar el conector de Lovable Cloud para configurar Google OAuth (gestionado automaticamente)
2. Usar el conector de Lovable Cloud para configurar Apple Sign In
3. Agregar botones "Continuar con Google" y "Continuar con Apple" en `Auth.tsx`
4. Usar `lovable.auth.signInWithOAuth()` (NO el SDK de Supabase directo)

**Archivos a modificar:**
- `src/pages/Auth.tsx` (agregar botones sociales)
- Generar modulo `src/integrations/lovable/` via herramienta de configuracion

---

### BLOQUE C: Migrar Contenido Hardcodeado a Base de Datos (FASE 3 - Liberacion)

**Prioridad: ALTA**

El archivo `src/lib/rosarioData.ts` tiene 223 lineas de texto religioso (20 misterios + 5 oraciones) hardcodeado en React. Esto impide que un teologo corrija textos sin un despliegue de codigo.

1. Crear tabla `rosario_misterios` con columnas: `tipo` (gozosos/dolorosos/gloriosos/luminosos), `numero`, `titulo`, `fruto`, `meditacion`, `nombre_grupo`, `dia`
2. Crear tabla `rosario_oraciones` con columnas: `clave` (padreNuestro, aveMaria, etc.), `nombre`, `texto`
3. Migrar los datos actuales via SQL INSERT
4. Crear hook `useRosarioData` que consulte estas tablas (con cache agresivo de 24h)
5. Mantener `rosarioData.ts` como fallback offline
6. Agregar seccion en Admin para editar misterios y oraciones

**Archivos a crear/modificar:**
- Migracion SQL (crear tablas + insertar datos)
- `src/hooks/useRosarioData.tsx` (nuevo)
- `src/pages/Rosario.tsx` (usar hook en vez de import directo)
- `src/contexts/RosarioContext.tsx` (actualizar fuente de datos)
- `src/pages/admin/AdminRosario.tsx` (nuevo, panel de edicion)

---

### BLOQUE D: Modo Offline Basico (FASE 2 - Retencion)

**Prioridad: MEDIA**

Depende del Bloque A (PWA). Una vez que el Service Worker este activo:

1. Configurar Workbox runtime caching strategies:
   - Santo del Dia: `StaleWhileRevalidate` (mostrar cache, actualizar en fondo)
   - Rosario (textos): `CacheFirst` con expiracion de 7 dias
   - Imagenes de santos: `CacheFirst` con limite de 50 entradas
2. Agregar indicador visual "Sin conexion" en la UI cuando `navigator.onLine === false`
3. Para el diario de gratitud y rituales: queue de escrituras pendientes con Background Sync API

**Nota:** IndexedDB completo para toda la app es un proyecto grande. Este bloque cubre lo esencial (lectura offline de contenido estatico).

---

### BLOQUE E: Stripe Freemium (FASE 5 - Sostenibilidad)

**Prioridad: MEDIA-ALTA**

1. Habilitar integracion Stripe via herramienta de Lovable
2. Definir productos:
   - **Gratis**: Evangelio, Santo del Dia, Rosario, Oraciones, 3 debates IA/dia
   - **ElRugido+ ($4.99/mes)**: Coach ilimitado, Historias para dormir TTS HD, Reflexiones personalizadas, Descarga offline
3. Crear pagina de suscripcion `/premium`
4. Modificar el guard de `usage_quotas` en `debate-coach` para permitir ilimitado a premium
5. Agregar verificacion de suscripcion activa en hooks que usan features premium

**Archivos a crear/modificar:**
- Edge function para webhook de Stripe
- `src/pages/Premium.tsx`
- `supabase/functions/debate-coach/index.ts` (bypass quota para premium)
- Tabla `user_subscriptions` o usar metadata de Stripe

---

### BLOQUE F: RAG con pgvector (FASE 4 - IA Infalible)

**Prioridad: MEDIA (alto impacto pero complejo)**

1. Habilitar extension `pgvector` en la base de datos
2. Crear tabla `document_embeddings` con columna `embedding vector(1536)`
3. Crear edge function `index-documents` para:
   - Procesar Catecismo de la Iglesia Catolica (chunking por parrafos)
   - Generar embeddings via modelo de Lovable AI
   - Almacenar en pgvector
4. Modificar `debate-coach` para:
   - Antes de responder, hacer busqueda semantica en pgvector
   - Inyectar los fragmentos relevantes como contexto en el prompt
   - Forzar citacion de fuentes (CIC #numero, versiculo biblico)
5. Crear funcion SQL `match_documents` para busqueda por similitud

**Archivos a crear/modificar:**
- Migracion SQL (pgvector + tabla + funcion de busqueda)
- `supabase/functions/index-documents/index.ts`
- `supabase/functions/debate-coach/index.ts` (agregar paso RAG)

---

### BLOQUE G: Internacionalizacion i18n (FASE 3 - Expansion)

**Prioridad: BAJA (depende de Bloque C)**

Una vez que el contenido religioso este en base de datos (Bloque C):

1. Agregar columna `language` a tablas de contenido (`rosario_misterios`, `rosario_oraciones`, etc.)
2. Instalar `react-i18next` para strings de UI
3. Crear archivos de traduccion `es.json`, `en.json`, `pt.json`
4. Detectar idioma del navegador y permitir cambio manual en perfil

Este bloque es grande y se recomienda para una fase posterior.

---

## Orden de Ejecucion Recomendado

```text
Semana 1-2:  Bloque B (Social Login) - rapido, alto impacto en conversion
Semana 2-3:  Bloque A (PWA + Push) - critico para retencion
Semana 3-4:  Bloque C (Migrar contenido a DB) - desbloquea edicion sin codigo
Semana 4-5:  Bloque E (Stripe) - genera ingresos
Semana 5-6:  Bloque D (Offline basico) - mejora UX en campo
Semana 7+:   Bloque F (RAG) y G (i18n) - diferenciacion a largo plazo
```

## Seccion Tecnica

### Dependencias nuevas necesarias:
- `vite-plugin-pwa` - para Service Worker y manifest
- `web-push` (en edge functions) - para Push Notifications
- `react-i18next` + `i18next` (solo si se hace Bloque G)

### Tablas nuevas de base de datos:
- `push_subscriptions` (user_id, endpoint, keys, created_at) con RLS
- `rosario_misterios` (tipo, numero, titulo, fruto, meditacion, nombre_grupo, dia)
- `rosario_oraciones` (clave, nombre, texto)
- `document_embeddings` (id, content, source, embedding vector) - solo Bloque F

### Edge Functions nuevas:
- `push-subscribe` - registrar suscripcion push
- `send-push` - enviar notificacion push
- `index-documents` - indexar documentos para RAG (Bloque F)

