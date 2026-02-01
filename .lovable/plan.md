
# Plan: Sistema Unificado de Audio Estilo Spotify

## Objetivo
Crear un sistema de audio integrado que:
1. Mantenga un reproductor minimizado persistente en todas las páginas (como Spotify)
2. Permita añadir oraciones a una "Lista de reproducción diaria"
3. Unifique todos los tipos de audio bajo un mismo sistema
4. Persista la lista de reproducción entre sesiones

---

## Fase 1: Base de Datos - Playlist Persistente

### Nueva tabla: `user_playlists`
```sql
CREATE TABLE user_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  nombre TEXT NOT NULL DEFAULT 'Mi Rutina Diaria',
  tipo TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'custom'
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Estructura de `items`:**
```json
[
  { 
    "id": "uuid-oracion", 
    "type": "oracion", 
    "title": "Padre Nuestro",
    "orden": 1 
  },
  { 
    "id": "uuid-story", 
    "type": "sleep_story", 
    "title": "El Hilo Invisible",
    "orden": 2 
  }
]
```

---

## Fase 2: Extender AudioPlayerContext

### Nuevas funcionalidades:
```typescript
interface AudioPlayerContextType {
  // ... existentes ...
  
  // Playlist diaria persistente
  dailyPlaylist: PlaylistItem[];
  isDailyPlaylistLoading: boolean;
  
  // Acciones de playlist
  addToDailyPlaylist: (item: AudioQueueItem) => Promise<void>;
  removeFromDailyPlaylist: (itemId: string) => Promise<void>;
  reorderDailyPlaylist: (items: PlaylistItem[]) => Promise<void>;
  playDailyPlaylist: (startIndex?: number) => void;
  clearDailyPlaylist: () => Promise<void>;
  
  // Estado del mini-player
  showMiniPlayer: boolean; // Visible cuando hay algo reproduciéndose o en pausa
}
```

### Persistencia:
- Al iniciar la app, cargar la playlist del usuario desde la base de datos
- Al añadir/quitar items, guardar automáticamente
- Sincronizar con la cola actual al reproducir

---

## Fase 3: Componentes UI

### 3.1 Nuevo: `UnifiedMiniPlayer`
Reemplaza `MiniPlayer` con un componente unificado que:

**Características:**
- **Posición fija:** Siempre visible sobre el bottom navigation
- **Adaptativo:** Cambia colores según tipo de contenido
- **Controles completos:** Play/Pause, Previous/Next, barra de progreso
- **Acceso rápido:** Tap para expandir, botón de cola

**Diseño:**
```
┌────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░ (barra progreso)              │
├────────────────────────────────────────────────────┤
│ 🖼️ │ Padre Nuestro          │ ⏮️ ▶️ ⏭️ │ 📋 ✖️   │
│    │ Oración • 2:34/4:15    │              │        │
└────────────────────────────────────────────────────┘
```

**Posicionamiento responsivo:**
- Mobile: `bottom-16` (sobre BottomNavigation)
- Desktop: `bottom-4 left-64` (al lado del sidebar)

### 3.2 Nuevo: `PlaylistDrawer`
Panel deslizable para gestionar la playlist:

**Secciones:**
1. **Cola actual** - Items en reproducción
2. **Mi Rutina Diaria** - Playlist persistente guardada
3. **Añadir oraciones** - Lista rápida de oraciones favoritas

**Acciones:**
- Drag & drop para reordenar
- Swipe para eliminar
- Botón "Reproducir rutina"

### 3.3 Nuevo: `AddToPlaylistButton`
Botón contextual para añadir a la playlist:

**Ubicaciones:**
- Cards de oraciones (`OracionCard`)
- Detalle de oración (`OracionDetail`)
- Sleep story cards

**Estados:**
- Vacío: Icono de "+" 
- Ya añadido: Icono de check con color primario
- Animación al añadir

---

## Fase 4: Integración en Páginas

### 4.1 Oraciones.tsx
- Añadir `AddToPlaylistButton` en cada `OracionCard`
- Nuevo botón "Crear Rutina de Oración" que abre el `PlaylistDrawer`
- Indicador visual de oraciones ya en la playlist

### 4.2 OracionDetail.tsx
- Botón prominente "Añadir a Mi Rutina"
- Si ya está en la rutina: "En tu rutina ✓"

### 4.3 Dashboard.tsx
- Nueva card "Mi Rutina de Oración" si hay items
- Muestra primeras 3-4 oraciones con duración total
- Botón para reproducir toda la rutina

### 4.4 App.tsx
- Reemplazar `<MiniPlayer />` con `<UnifiedMiniPlayer />`
- Asegurar que esté fuera de las rutas para persistir

---

## Fase 5: Hook Personalizado

### `usePlaylistManager`
```typescript
export function usePlaylistManager() {
  // Cargar playlist del usuario
  // CRUD operations
  // Sincronización con AudioPlayerContext
  
  return {
    dailyPlaylist,
    isLoading,
    addItem,
    removeItem,
    reorder,
    playAll,
    isInPlaylist,
    totalDuration,
  };
}
```

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| **Migración SQL** | CREAR | Tabla `user_playlists` |
| `src/contexts/AudioPlayerContext.tsx` | MODIFICAR | Añadir funcionalidades de playlist |
| `src/hooks/usePlaylistManager.tsx` | CREAR | Hook para gestión de playlist |
| `src/components/audio/UnifiedMiniPlayer.tsx` | CREAR | Nuevo mini-player unificado |
| `src/components/audio/PlaylistDrawer.tsx` | CREAR | Panel de gestión de playlist |
| `src/components/audio/AddToPlaylistButton.tsx` | CREAR | Botón para añadir a playlist |
| `src/components/oraciones/OracionCard.tsx` | MODIFICAR | Integrar AddToPlaylistButton |
| `src/components/oraciones/OracionDetail.tsx` | MODIFICAR | Añadir botón de rutina |
| `src/components/dashboard/DailyRoutineCard.tsx` | CREAR | Card de rutina en dashboard |
| `src/pages/Dashboard.tsx` | MODIFICAR | Integrar DailyRoutineCard |
| `src/App.tsx` | MODIFICAR | Usar UnifiedMiniPlayer |

---

## Flujo de Usuario

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO EN ORACIONES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Ve lista de oraciones                                    │
│     - Cada card tiene botón [+] para añadir a rutina        │
│                                                              │
│  2. Toca [+] en "Padre Nuestro"                             │
│     → Toast: "Añadido a tu rutina diaria"                   │
│     → Botón cambia a [✓]                                    │
│                                                              │
│  3. Repite con "Ave María" y "Gloria"                       │
│                                                              │
│  4. Toca botón "📋 Mi Rutina"                                │
│     → Se abre PlaylistDrawer                                │
│     → Ve sus 3 oraciones ordenadas                          │
│     → Puede reordenar con drag & drop                       │
│                                                              │
│  5. Toca "Reproducir Rutina"                                 │
│     → PlaylistDrawer se cierra                              │
│     → Comienza reproducción                                 │
│     → UnifiedMiniPlayer aparece                             │
│                                                              │
│  6. Usuario navega a Dashboard                               │
│     → MiniPlayer PERMANECE visible                          │
│     → Puede pausar/reanudar desde cualquier página          │
│                                                              │
│  7. Al día siguiente                                         │
│     → Su rutina sigue guardada                              │
│     → Card "Mi Rutina" en Dashboard                         │
│     → Un toque para reproducir                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Consideraciones Técnicas

### Posicionamiento del MiniPlayer
```css
/* Mobile: encima del BottomNav (h-16 = 4rem) */
.mini-player-mobile {
  bottom: calc(4rem + env(safe-area-inset-bottom));
}

/* Desktop: normal positioning, al lado del sidebar */
.mini-player-desktop {
  bottom: 1rem;
  left: 16rem; /* 64 en tailwind = 16rem */
}
```

### Gestión de Z-Index
```
z-50: BottomNavigation
z-40: UnifiedMiniPlayer (debajo del nav pero visible)
z-30: PlaylistDrawer
```

### Sincronización de Estado
1. AudioPlayerContext mantiene la cola de reproducción actual
2. usePlaylistManager mantiene la playlist guardada en DB
3. Al reproducir la playlist, se copia a la cola
4. Cambios en la playlist se guardan con debounce (500ms)

---

## Orden de Implementación

1. **Migración SQL** - Tabla de playlists
2. **usePlaylistManager** - Hook con lógica de negocio
3. **AudioPlayerContext** - Extender con playlist features
4. **UnifiedMiniPlayer** - Componente visual principal
5. **AddToPlaylistButton** - Botón de añadir
6. **PlaylistDrawer** - Panel de gestión
7. **Integración Oraciones** - OracionCard, OracionDetail
8. **DailyRoutineCard** - Card para Dashboard
9. **Integración Dashboard** - Mostrar rutina

---

## Resultado Final

Un sistema de audio tipo Spotify donde:
- El reproductor siempre está visible mientras hay audio
- Los usuarios pueden crear su "rutina de oración" personalizada
- La rutina persiste entre sesiones
- Un toque para reproducir toda la rutina
- Navegación fluida sin interrumpir la reproducción
- Experiencia premium de audio en toda la app
