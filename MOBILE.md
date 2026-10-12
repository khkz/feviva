# App móvil (iOS y Android) con Capacitor

El Rugido se publica en App Store y Google Play envolviendo esta misma app web con
[Capacitor 8](https://capacitorjs.com/docs). Lovable sigue editando la interfaz en `src/`;
las carpetas `ios/` y `android/` son los proyectos nativos.

## Requisitos

- Node 22.
- iOS: Mac con **Xcode 26 o superior** (mínimo de Capacitor 8, y App Store exige compilar con el
  SDK de iOS 26 desde el 28 de abril de 2026). La app pide **iOS 18 o superior**, porque el
  reproductor nativo (`capacitor-plugin-playlist`) lo exige.
- Android: **Android Studio 2025.2.1 o superior** (trae el JDK 21). La app pide Android 7.0 (API 24) o superior.

```bash
npm install
npm run cap:android   # parchea el reproductor, compila la web, sincroniza y abre Android Studio
npm run cap:ios       # en Mac: lo mismo y abre Xcode
```

Cada vez que Lovable cambie la interfaz: `git pull` y `npm run cap:sync`.

**Sincroniza siempre con `npm run cap:sync`** (no con `npx cap sync` directo), y vuelve a hacerlo
después de cada `npm install` o `npm ci` antes de compilar: antes de sincronizar aplica
`scripts/patch-native-audio.mjs` a los reproductores nativos del plugin, que viven en `node_modules`.
El parche:

1. iOS: usa la sesión de audio `.playback`. El plugin trae `.playAndRecord`, que pide el micrófono
   (y sin `NSMicrophoneUsageDescription` iOS cierra la app).
2. iOS: guarda la velocidad en `AVPlayer.defaultRate`: se mantiene al pausar y reanudar (también
   desde la pantalla de bloqueo) y al cambiar de pista, y cambiarla en pausa ya no inicia la reproducción.
3. iOS: muestra en la pantalla de bloqueo la velocidad real (y 0 en pausa) en vez de 1x fijo.
4. iOS y Android: una oración que se dejó a medias (al saltar desde la app o la pantalla de bloqueo)
   empieza desde el inicio cuando la cola vuelve a ella.

El script está escrito para `capacitor-plugin-playlist` 8.0.0 (versión fijada en `package.json`) y
falla si el plugin cambia, para revisarlo al actualizarlo.

Otros ajustes que el plugin necesita y ya están hechos:

- `capacitor.config.ts` → `experimental.ios.spm.swiftToolsVersion: "6.0"`, porque `.iOS(.v18)` en
  `ios/App/CapApp-SPM/Package.swift` requiere Swift tools 6.0 (la CLI escribe 5.9 por defecto).
- `android/variables.gradle` → `kotlin_version`, que el `build.gradle` del plugin lee del proyecto raíz.
  El plugin trae su propio classpath de Gradle (AGP y Kotlin): confirmar la primera sincronización en
  Android Studio.

## Cómo funciona el audio

Todo el audio con voz pasa por **un solo reproductor global** (`src/contexts/AudioPlayerContext.tsx`).
Eso incluye oraciones, historias para dormir, lecciones, rosario, laudes, completas, versículo,
reflexión y tip del día. El reproductor delega la reproducción a un **motor** (`src/features/audio/engine/`):

| Dónde corre | Motor | Qué hace |
| --- | --- | --- |
| Navegador (elrugido.com) | `WebAudioEngine`: un único `<audio>` | La cola avanza en JavaScript cambiando la fuente del mismo elemento. La pantalla de bloqueo la maneja `MediaSessionBridge` |
| App iOS / Android | `NativeAudioEngine` sobre [`capacitor-plugin-playlist`](https://github.com/phiamo/capacitor-plugin-playlist) | La cola completa pasa al sistema: AVQueuePlayer en iOS y Media3 ExoPlayer con MediaSessionService en Android. Sigue avanzando con la pantalla bloqueada aunque iOS suspenda el JavaScript. Controles, título y carátula en pantalla de bloqueo, notificación y audífonos |

Si el plugin nativo no arranca (por ejemplo, porque no se ejecutó `cap sync`), la app usa el motor web
para que el audio siga funcionando en primer plano.

**Ajustes por tipo de audio** (`src/features/audio/playerSettings.ts`): oraciones, historias y
lecciones comparten velocidad (0.9x por defecto), volumen y repetición. Los audios del día tienen su
propia velocidad y silencio (1x por defecto). El rosario suena siempre una vez, a 1x y con volumen
completo. Un temporizador de sueño se cancela al empezar otro tipo de audio.

**Rosario con voz:** arma la secuencia que falta (Padre Nuestro, 10 Ave Marías y Gloria por
misterio, hasta 60 oraciones) como una sola cola. La pantalla del rosario sigue la oración en curso.
Los audios se leen de Storage (`teachings-audio/rosario/`, acceso en `src/data/rosario/`) y se prefiere
MP3; el reproductor nativo de iOS no usa Opus.

> **Antes de publicar la app de iOS:** al momento de este cambio, en Storage solo estaba
> `padreNuestro.mp3`; el Ave María y el Gloria estaban solo en Opus. Un **admin** debe abrir una vez el rosario con voz (en la web o la app) para
> generar los MP3 que faltan. Hasta entonces, en iOS el rosario con voz muestra "Audio aún no
> disponible" y se puede rezar con el texto.

## Qué probar en un celular

1. Primera reproducción en iOS: **no debe aparecer el permiso de micrófono** ni el punto naranja.
2. Reproducir una oración, bloquear la pantalla y usar play/pausa, anterior/siguiente y la barra de
   progreso desde la pantalla de bloqueo y la notificación (los ±15 s son solo de la web).
3. Velocidad 0.9x: pausar y reanudar desde la pantalla de bloqueo; debe seguir a 0.9x.
4. "Reproducir todas" en Oraciones: con la pantalla bloqueada debe pasar sola a la siguiente.
5. Rosario con voz (Frontera Final → Rosario): bloquear la pantalla en el primer Ave María. Debe seguir
   hasta el Gloria y al volver la pantalla debe mostrar la oración correcta.
6. Rosario: "anterior" mientras suena (en la app y en la pantalla de bloqueo) y dejar que avance solo;
   cada oración debe empezar desde el inicio.
7. Historia para dormir con temporizador de 15 min (ver limitaciones en iOS).
8. Laudes del día: debe seguir con la pantalla bloqueada y aparecer en el mini reproductor.
9. Llamada entrante o alarma durante el audio: debe pausar y poder reanudar.
10. Audífonos Bluetooth: botones de play/pausa y siguiente.
11. Modo avión con una cola: debe saltar una vez y luego detenerse con un aviso, sin recorrer toda la cola.

## Limitaciones conocidas

- **Temporizador de sueño en iOS:** se mide con la hora real y se aplica apenas el JavaScript vuelve a
  correr. Si iOS suspende la app con la pantalla bloqueada, puede detener el audio recién al desbloquear.
  Con una sola historia, esta termina sola de todas formas. En Android el JavaScript sigue corriendo.
  Un temporizador 100 % nativo queda pendiente.
- **Repetir una pista** (modo "una") en una cola, con la app suspendida en iOS: avanza a la siguiente.
  Al volver, la app no salta hacia atrás tarde; sigue donde está el reproductor.
- **Sonidos ambientales del rosario** (Web Audio del WebView): falta probar cómo conviven con el
  reproductor nativo.
- Las notificaciones de reproducción no requieren el permiso `POST_NOTIFICATIONS` (las de sesiones
  multimedia están exentas en Android 13+). Queda declarado para las notificaciones push futuras.

## Pendiente (fase F1 del plan)

1. **Login dentro de la app.** Google y Apple OAuth necesitan deep links
   (`com.elrugido.app://`) y abrir el navegador del sistema.
2. **Push nativo** (APNs/FCM) en vez de Web Push, **descargas offline** de audios (el plugin acepta
   archivos locales con `replaceItem`) y **compra in-app** con RevenueCat (Apple exige IAP para
   suscripciones en Chile/LatAm).
3. **Íconos y splash** desde `public/pwa-512x512.png` con `@capacitor/assets`.

## Pruebas

```bash
npm test   # Vitest: motor nativo con plugin simulado (iOS y Android), temporizador y cola del rosario
```

## Nota sobre lockfiles

Las dependencias se instalaron con npm (`package-lock.json`). `bun.lock` apunta a un registro privado
de Lovable y no se pudo actualizar fuera de Lovable (ya le faltaban los paquetes de Capacitor). Si
Lovable instala con el lockfile congelado, habrá que regenerarlo allí.
