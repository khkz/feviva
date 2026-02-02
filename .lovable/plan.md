

# Plan: Mejorar la Función TTS para Español Natural

## El Problema
El audio de "El Mito de las Mariposas" suena mal porque la función `cleanTextForSpanishTTS` elimina la estructura del contenido sin añadir las pausas y la puntuación necesarias para una narración natural.

**Problemas específicos:**
1. Los títulos de sección (`## Parte 1:`) se eliminan sin pausa
2. Múltiples líneas se comprimen en texto corrido
3. Las citas (`>`) pierden su entonación especial
4. Las listas fluyen sin pausas entre elementos
5. El texto en negrita pierde énfasis

---

## Solución: Mejorar `cleanTextForSpanishTTS`

### Transformaciones necesarias:

| Elemento Original | Transformación | Razón |
|-------------------|----------------|-------|
| `## Título` | `... Título ...` (pausas) | Marca cambio de sección |
| `# Título Principal` | `... Título Principal ...` | Pausa dramática |
| `**texto**` | `texto` + instrucción de énfasis | Mantiene significado |
| `> "Cita..."` | `Cita...` (con pausa antes/después) | Entonación de cita |
| `- Elemento lista` | `Elemento lista.` | Pausa entre elementos |
| `\n\n` | Pausa natural (2 segundos) | Separación de párrafos |

---

## Archivos a Modificar

### 1. `supabase/functions/lesson-tts/index.ts`
### 2. `supabase/functions/text-to-speech/index.ts`

Ambas funciones usan `cleanTextForSpanishTTS`, así que mejoraré la función en ambas.

---

## Nueva Implementación de `cleanTextForSpanishTTS`

```typescript
function cleanTextForSpanishTTS(text: string): string {
  let cleaned = text;
  
  // 1. Reemplazos de términos problemáticos (existente)
  const replacements: Record<string, string> = {
    'et al.': 'y otros',
    'vs.': 'versus',
    'etc.': 'etcétera',
    // ... resto igual ...
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    cleaned = cleaned.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), value);
  }
  
  // 2. NUEVO: Manejar títulos/encabezados con pausas
  // ## Título -> "... Título ..." para crear pausa dramática
  cleaned = cleaned.replace(/^#{1,3}\s*(.+)$/gm, '\n\n$1.\n\n');
  
  // 3. NUEVO: Manejar citas blockquote con entonación
  // > "Cita aquí" -> Como dijo alguien: "Cita aquí"
  cleaned = cleaned.replace(/^>\s*"(.+)"$/gm, 'Y cito: "$1"');
  cleaned = cleaned.replace(/^>\s*(.+)$/gm, 'Cito: $1');
  
  // 4. NUEVO: Manejar listas con pausas
  // - Elemento -> Elemento. (punto para pausa)
  cleaned = cleaned.replace(/^[-*]\s+(.+)$/gm, '$1.');
  
  // 5. NUEVO: Manejar texto en negrita con pequeñas pausas
  // **texto** -> , texto, (comas para énfasis sutil)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, ', $1,');
  
  // 6. Limpiar asteriscos sueltos
  cleaned = cleaned.replace(/\*/g, '');
  
  // 7. NUEVO: Preservar pausas de párrafo
  // Convertir doble salto de línea en punto y pausa
  cleaned = cleaned.replace(/\n\n+/g, '.\n\n');
  
  // 8. Convertir saltos simples en espacios
  cleaned = cleaned.replace(/\n/g, ' ');
  
  // 9. Limpiar puntuación duplicada
  cleaned = cleaned.replace(/\.{2,}/g, '.');
  cleaned = cleaned.replace(/,{2,}/g, ',');
  cleaned = cleaned.replace(/\.\s*,/g, '.');
  cleaned = cleaned.replace(/,\s*\./g, '.');
  
  // 10. Limpiar espacios múltiples
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // 11. Limpiar puntos al inicio de oraciones
  cleaned = cleaned.replace(/^\.\s*/g, '');
  cleaned = cleaned.replace(/\s+\.\s*\./g, '.');
  
  return cleaned.trim();
}
```

---

## Ejemplo de Transformación

**Antes (raw markdown):**
```markdown
## Parte 1: Las Mariposas Mueren

Todos conocemos la sensación: el corazón acelerado...

Aquí está la verdad que nadie te dice: **las mariposas mueren**.

> "El amor joven dice: Te amo porque te necesito."
```

**Después (optimizado para TTS):**
```text
Parte 1: Las Mariposas Mueren.

Todos conocemos la sensación: el corazón acelerado...

Aquí está la verdad que nadie te dice:, las mariposas mueren,.

Y cito: "El amor joven dice: Te amo porque te necesito."
```

---

## Paso Adicional: Regenerar el Audio

Después de actualizar la función, necesitarás regenerar el audio de "El Mito de las Mariposas" para que use la nueva lógica de limpieza.

---

## Orden de Implementación

1. **Actualizar `lesson-tts/index.ts`** - Mejorar la función de limpieza
2. **Actualizar `text-to-speech/index.ts`** - Sincronizar la misma mejora
3. **Desplegar las funciones**
4. **Regenerar audio** - Borrar el audio actual y generar uno nuevo desde la biblioteca

---

## Resultado Esperado

El audio de las lecciones:
- Tendrá pausas naturales entre secciones
- Las citas se escucharán con entonación apropiada
- Los elementos importantes tendrán énfasis sutil
- Las listas se escucharán claramente separadas
- Sonará como una narración profesional, no texto corrido

