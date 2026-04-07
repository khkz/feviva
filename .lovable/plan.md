## Plan: Panel Admin Pro — Editor de Contenido Fidedigno

### Diagnóstico del Panel Actual

**Lo que funciona bien:**
- Dashboard con métricas generales ✅
- Santos: gestión completa (historias, oraciones, imágenes) ✅
- Contenido: gestión de audio y procesamiento ✅
- Feedback: analytics y alertas ✅
- Usuarios: roles y actividad ✅

**Lo que falta (crítico):**
1. ❌ No hay editor/visor de texto para revisar contenido de lecciones
2. ❌ No hay indicador de "texto verificado por humano" vs "generado por IA"
3. ❌ No hay forma de editar biografías de santos inline
4. ❌ No hay indicador de desincronización audio-texto (audio viejo + texto nuevo)
5. ❌ No hay workflow de verificación doctrinal
6. ❌ No hay visor del contenido diario (reflexiones, tips, oraciones)

### Sobre los textos regenerados (respuesta honesta)

Los textos de lecciones regenerados:
- **Citas bíblicas**: REALES (Mt 5,1-12, Jn 3,16, etc.) — verificables
- **Referencias al Catecismo**: REALES (CIC 1234, etc.)
- **Anécdotas de "Padre Miguel", "Hermana Lucía"**: 100% INVENTADAS por IA
- **Marco narrativo y opiniones**: INVENTADO por IA
- **Dichos populares**: Algunos reales, otros fabricados

**Conclusión**: Los textos son ~60% fidedignos (citas) y ~40% ficción narrativa. Necesitamos un sistema para que un revisor humano pueda verificar y corregir.

### Implementación por Fases

#### Fase A: Editor de Contenido con Vista Previa (Lecciones)
- Panel "Lecciones" con vista previa del texto enriquecido (HTML renderizado)
- Editor inline para corregir textos directamente
- Badge de estado: `sin_verificar` | `verificado` | `desincronizado_audio`
- Indicador de que el audio NO corresponde al texto actual
- Botón para marcar como "Verificado por humano"

#### Fase B: Editor de Biografías de Santos
- Vista previa de la biografía actual
- Editor de texto con guardado directo
- Badge: `wikipedia` | `ia_generada` | `verificada_humano`
- Filtro rápido: "solo sin verificar"

#### Fase C: Visor de Contenido Diario
- Expandir la vista del contenido diario para ver textos completos
- Reflexiones, tips, oraciones de laudes/completas
- Editor inline para corregir antes de publicar

#### Fase D: Sistema de Verificación Doctrinal
- Nueva columna `verificado_por` y `verificado_at` en tablas clave
- Workflow: IA genera → Admin revisa → Marca como verificado
- Dashboard de "contenido pendiente de revisión"

### Archivos a crear/modificar

| Archivo | Cambio |
|---|---|
| `src/pages/admin/AdminContent.tsx` | Agregar tab "Editor de Texto" con preview HTML y editor inline |
| `src/pages/admin/AdminSantos.tsx` | Mejorar visor/editor de biografías |
| `src/pages/admin/AdminDailyContent.tsx` | Expandir con visor de textos completos |
| Migración DB | Agregar `verificado_por`, `estado_verificacion` a `library_lessons` y `calendar_saints` |

### Lo que NO haremos (por ahora)
- No regeneramos audios de lecciones (ya están creados con texto viejo)
- No creamos un sistema de IA para verificar IA (sería circular)
- El trabajo de verificación es HUMANO, el admin solo facilita la herramienta

### Resultado esperado
- Admin puede ver, editar y verificar TODOS los textos de la plataforma
- Indicador claro de qué contenido es fidedigno vs pendiente de revisión
- Alerta visual cuando audio y texto están desincronizados
