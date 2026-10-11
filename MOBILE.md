# App móvil (iOS y Android) con Capacitor

El Rugido se publica en App Store y Google Play envolviendo esta misma app web con
[Capacitor 8](https://capacitorjs.com/docs). Lovable sigue editando la interfaz en `src/`;
las carpetas `ios/` y `android/` son los proyectos nativos.

## Qué hay en esta rama

| Cambio | Archivo | Para qué |
| --- | --- | --- |
| Controles en pantalla de bloqueo | `src/components/audio/MediaSessionBridge.tsx` (montado en `App.tsx`) | Título, carátula, play/pausa, ±15 s, anterior/siguiente y barra de progreso en la pantalla de bloqueo, audífonos y Bluetooth. Funciona ya en la web (Android/Chrome, Safari) |
| Capacitor | `capacitor.config.ts`, `ios/`, `android/` | Proyectos nativos generados; `appId` = `com.elrugido.app` |
| Audio en segundo plano iOS | `ios/App/App/Info.plist` (`UIBackgroundModes: audio`) | Requisito de Apple para seguir sonando con la pantalla bloqueada |
| Sin service worker en la app | `src/pwa/registerServiceWorker.ts` | En la app los archivos vienen en el binario; el SW solo serviría versiones viejas |
| Scripts | `package.json` → `cap:sync`, `cap:ios`, `cap:android` | Compilar y copiar la web a los proyectos nativos |

## Cómo compilar

Requisitos: Node 22, Xcode 16+ (Mac) para iOS, Android Studio para Android.

```bash
npm install
npm run cap:android   # compila la web, sincroniza y abre Android Studio
npm run cap:ios       # en Mac: compila, sincroniza y abre Xcode
```

Cada vez que Lovable cambie la interfaz: `git pull` y `npm run cap:sync`.

## Pendiente (fase F1 del plan)

1. **Reproductor nativo.** Hoy el audio es un `<audio>` dentro del WebView. Con la pantalla
   bloqueada iOS puede suspenderlo y no avanzar a la siguiente pista. Hay que implementar
   la misma interfaz de `AudioPlayerContext` sobre un plugin nativo (Capawesome Audio Player
   o `@capgo/capacitor-native-audio`) y en Android declarar el foreground service
   `mediaPlayback`.
2. **Unificar los reproductores.** Además del reproductor global hay audio propio en
   `useRosarioTTS`, `OracionCard`, `rituals/AudioPlayer` y `AmbientSoundMixer`. Para que todo
   suene con la pantalla bloqueada, todo debe pasar por un único reproductor.
3. **Login dentro de la app.** Google y Apple OAuth necesitan deep links
   (`com.elrugido.app://`) y abrir el navegador del sistema.
4. **Push nativo** (APNs/FCM) en vez de Web Push, **descargas offline** de audios y
   **compra in-app** con RevenueCat (Apple exige IAP para suscripciones en Chile/LatAm).
5. **Íconos y splash** desde `public/pwa-512x512.png` con `@capacitor/assets`.

## Nota sobre lockfiles

Las dependencias se instalaron con npm (`package-lock.json`). `bun.lock` apunta a un
registro privado de Lovable y no se pudo actualizar fuera de Lovable; Lovable lo
regenera al instalar.
