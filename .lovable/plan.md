
# Plan: Integrar Lecciones al Sistema de Audio Unificado

## El Problema
El reproductor de las lecciones de la biblioteca (incluyendo "Jesús Histórico") usa un sistema de audio **independiente** (`useLessonAudio`) que no se conecta con el `AudioPlayerContext`. Por eso el mini-player no aparece cuando escuchas lecciones.

## Solución
Modificar el `LessonDetailModal` y `useLessonAudio` para que usen el `AudioPlayerContext` global, de forma que las lecciones también muestren el mini-player persistente.

---

## Fase 1: Actualizar el Tipo de Audio

### Archivo: `src/contexts/AudioPlayerContext.tsx`
**Cambio:** Añadir `'lesson'` como tipo de audio soportado

```typescript
export interface AudioQueueItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  audioUrl: string | null;
  type: 'oracion' | 'sleep_story' | 'lesson'; // AÑADIR
  originalData?: unknown;
}
```

---

## Fase 2: Actualizar UnifiedMiniPlayer

### Archivo: `src/components/audio/UnifiedMiniPlayer.tsx`
**Cambio:** Añadir tema visual para lecciones

```typescript
const theme = 
  currentItem.type === 'oracion'
    ? { /* tema oración - dorado/morado */ }
    : currentItem.type === 'lesson'
    ? { 
        bg: "from-blue-950/95 via-indigo-950/95 to-slate-950/95",
        progressBg: "from-blue-400 to-indigo-400",
        text: "text-white",
        textMuted: "text-blue-200/60",
        icon: BookOpen, // Nuevo ícono
        subtitle: "Lección"
      }
    : { /* tema sleep story */ };
```

---

## Fase 3: Modificar LessonDetailModal

### Archivo: `src/components/library/LessonDetailModal.tsx`
**Cambios principales:**

1. **Importar el contexto de audio:**
```typescript
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
```

2. **Usar el reproductor global en lugar del local:**
```typescript
const { play, isPlaying, togglePlay, currentItem, minimize } = useAudioPlayer();

const handlePlayAudio = async () => {
  if (audioUrl) {
    play({
      id: lesson.id,
      title: lesson.titulo,
      subtitle: lesson.categoria,
      audioUrl: audioUrl,
      type: 'lesson',
      originalData: lesson
    });
  }
};
```

3. **Detectar si la lección actual está reproduciéndose:**
```typescript
const isCurrentlyPlaying = currentItem?.id === lesson.id && isPlaying;
```

4. **Manejar el cierre del modal:**
Al cerrar el modal, minimizar el reproductor (no detenerlo):
```typescript
const handleClose = () => {
  if (currentItem?.id === lesson.id) {
    minimize(); // Minimiza en lugar de cerrar
  }
  onClose();
};
```

---

## Fase 4: Simplificar useLessonAudio

### Archivo: `src/hooks/useLessonEnrichment.tsx`
**Cambios:**
- Mantener solo la lógica de **generación** de audio
- Eliminar la lógica de **reproducción** (play/pause/seek)
- La reproducción ahora la maneja el contexto global

```typescript
export function useLessonAudio({ lessonId, titulo, existingAudioUrl }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const generateAudio = useCallback(async (text: string) => {
    // Mantener lógica de generación TTS
    // ...
    return generatedUrl;
  }, [...]);

  return {
    audioUrl,
    isGeneratingAudio,
    generateAudio,
    hasAudio: !!audioUrl,
  };
}
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/contexts/AudioPlayerContext.tsx` | Añadir tipo `'lesson'` |
| `src/components/audio/UnifiedMiniPlayer.tsx` | Añadir tema visual para lecciones con ícono `BookOpen` |
| `src/components/library/LessonDetailModal.tsx` | Usar `useAudioPlayer` para reproducir, permitir minimizar al cerrar |
| `src/hooks/useLessonEnrichment.tsx` | Simplificar: mantener solo generación, quitar reproducción |

---

## Flujo Resultante

```text
Usuario en /library
     │
     ▼
Abre "Jesús Histórico"
     │
     ▼
Presiona ▶️ Play
     │
     ▼
LessonDetailModal llama a:
  audioPlayer.play({
    id: "lesson-123",
    title: "Jesús Histórico",
    type: "lesson"
  })
     │
     ▼
AudioPlayerContext actualiza:
  currentItem = lesson
  isMinimized = false
     │
     ▼
Usuario cierra el modal
     │
     ▼
Se llama a minimize()
  isMinimized = true
     │
     ▼
UnifiedMiniPlayer aparece con:
  - Tema azul (lecciones)
  - Ícono de libro
  - Título "Jesús Histórico"
  - Controles play/pause
     │
     ▼
Usuario navega a /dashboard
     │
     ▼
Mini-player PERSISTE ✓
Audio sigue reproduciéndose ✓
```

---

## Resultado Esperado

Cuando escuches "Jesús Histórico" u otra lección:
- El mini-player aparecerá al cerrar el modal
- Podrás navegar por toda la app sin interrumpir el audio
- El reproductor mostrará un tema azul con ícono de libro
- Los controles de reproducción funcionarán desde cualquier página
