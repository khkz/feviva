

# Plan: Regenerar Audio Individual en Admin Content

## El Problema
Actualmente el diálogo "Regenerar Premium" solo permite procesar audios **en lote** (cantidad X). No hay forma de seleccionar un audio específico para regenerar (como "El Mito de las Mariposas").

## Solución
Añadir un botón de "Regenerar" en cada fila de la tabla que abra un diálogo para regenerar ese audio específico.

---

## Cambios en la UI

### 1. Nueva columna "Acciones" en la tabla

Añadir una columna con un botón de regenerar para cada item que ya tenga audio:

```
| Título              | Estado | Premium     | Fecha      | Acciones      |
|---------------------|--------|-------------|------------|---------------|
| El Mito de las...   | ✓ Listo| ⭐ sage     | 01/02/2026 | 🔄 Regenerar  |
| Jesús Histórico     | ✓ Listo| —           | 01/02/2026 | 🔄 Regenerar  |
```

### 2. Nuevo diálogo "Regenerar Audio Individual"

Al hacer clic en "Regenerar", se abre un diálogo con:
- Título del contenido seleccionado
- Selector de voz (las 11 voces disponibles)
- Botón "Regenerar Este Audio"

---

## Archivo a Modificar

**`src/pages/admin/AdminContent.tsx`**

### Nuevos estados:
```typescript
const [singleRegenDialog, setSingleRegenDialog] = useState<{
  open: boolean;
  item: ContentItem | null;
  type: 'sleep' | 'lesson';
}>({ open: false, item: null, type: 'lesson' });
const [singleRegenVoice, setSingleRegenVoice] = useState('sage');
```

### Nueva función `regenerateSingleAudio`:
```typescript
const regenerateSingleAudio = async () => {
  if (!singleRegenDialog.item) return;
  
  const { item, type } = singleRegenDialog;
  const jobType = type === 'sleep' ? 'sleep_tts_premium' : 'lesson_tts_premium';
  const tableName = type === 'sleep' ? 'sleep_stories' : 'library_lessons';
  
  // Encolar un solo job con la voz seleccionada
  await queueJobs(jobType, [{
    id: item.id,
    title: item.titulo,
    table: tableName,
    metadata: { voice: singleRegenVoice, premium: true, forceRegenerate: true }
  }]);
  
  setSingleRegenDialog({ open: false, item: null, type: 'lesson' });
  
  toast({
    title: "Audio en cola",
    description: `"${item.titulo}" será regenerado con voz ${singleRegenVoice}`,
  });
};
```

### Modificar `renderContentTable`:
Añadir columna de acciones con botón de regenerar:

```typescript
<TableHead>Acciones</TableHead>
...
<TableCell>
  {hasAudio && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setSingleRegenVoice(premiumInfo?.voice || (contentType === 'sleep' ? 'shimmer' : 'sage'));
        setSingleRegenDialog({ open: true, item, type: contentType! });
      }}
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  )}
</TableCell>
```

### Nuevo diálogo:
```tsx
<Dialog open={singleRegenDialog.open} onOpenChange={...}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        <RefreshCw className="h-5 w-5 mr-2" />
        Regenerar Audio
      </DialogTitle>
      <DialogDescription>
        Regenerar audio de "{singleRegenDialog.item?.titulo}"
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <Label>Seleccionar Voz</Label>
      <Select value={singleRegenVoice} onValueChange={setSingleRegenVoice}>
        {/* Voces */}
      </Select>
    </div>
    
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button onClick={regenerateSingleAudio}>
        Regenerar Este Audio
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Flujo del Usuario

```
┌─────────────────────────────────────────────────────────────┐
│ Admin ve tabla de lecciones                                  │
│                                                              │
│ | El Mito de las Mariposas | ✓ Listo | sage | 🔄            │
│                                                              │
│ → Clic en 🔄                                                 │
│                                                              │
│ ┌──────────────────────────────────────┐                    │
│ │ Regenerar Audio                       │                    │
│ │                                       │                    │
│ │ "El Mito de las Mariposas"            │                    │
│ │                                       │                    │
│ │ Voz: [sage ▼]                         │                    │
│ │   • shimmer - Cálida, suave           │                    │
│ │   • nova - Clara, expresiva           │                    │
│ │   • sage - Contemplativa (actual)     │                    │
│ │                                       │                    │
│ │ [Cancelar]  [Regenerar Este Audio]    │                    │
│ └──────────────────────────────────────┘                    │
│                                                              │
│ → Clic en "Regenerar Este Audio"                            │
│                                                              │
│ Toast: "El Mito de las Mariposas será regenerado con sage"  │
│                                                              │
│ → Se añade a la cola de procesamiento                       │
│ → El nuevo audio usará la función TTS mejorada              │
└─────────────────────────────────────────────────────────────┘
```

---

## Resultado Esperado

- Cada fila con audio tiene un botón 🔄 para regenerar
- Al hacer clic, se abre un diálogo para elegir la voz
- La voz por defecto es la actual (si existe) o sage/shimmer según el tipo
- Se encola un solo job para regenerar ese audio específico
- El nuevo audio usará la función `cleanTextForSpanishTTS` mejorada

