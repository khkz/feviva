

## Plan: Humanizar y actualizar los artículos de "El Continente Digital"

### Problema actual

Los 8 artículos en la tabla `frontera_articulos` tienen **dos problemas**:

1. **Contenido obsoleto**: Siguen siendo sobre "Religión y Espacio" (cosmos, extraterrestres, Marte) cuando la sección ya pivotó a "Supervivencia y Fe en la Era de la IA"
2. **Tono académico/enciclopédico**: Párrafos densos, estilo de artículo de Wikipedia, sin voz personal ni calidez

### Solución

Ejecutar una migración SQL que haga `UPDATE` de los 8 artículos existentes con contenido completamente nuevo, alineado con la temática IA y escrito en un tono conversacional, cálido y natural — como si un amigo te explicara las cosas tomando un café.

### Los 8 artículos nuevos

| ID | Título nuevo | Tema |
|---|---|---|
| `libro-naturaleza` → | **"No eres un algoritmo"** | Tu identidad no se mide en métricas |
| `ajuste-fino` → | **"La mentira del scroll infinito"** | Cómo el diseño adictivo roba tu paz |
| `punto-omega` → | **"Tu atención es sagrada"** | Por qué lo que miras te transforma |
| `bautizar-extraterrestre` → | **"¿Quién te dijo que no eres suficiente?"** | La comparación tóxica en redes |
| `padre-big-bang` → | **"El silencio como superpoder"** | Recuperar el espacio interior |
| `observatorio-vaticano` → | **"Noticias que no necesitas"** | El doomscrolling y la ansiedad fabricada |
| `colonizar-conquistar` → | **"Criar hijos en la era del algoritmo"** | Guía práctica para padres |
| `ia-alma` → | **"Lo que la IA nunca podrá hacer por ti"** | Amar, sufrir, rezar, morir |

### Estilo de escritura

- **Primera/segunda persona**: "¿Te ha pasado que…?", "Mira, esto es importante…"
- **Párrafos cortos**, máximo 3-4 líneas
- **Preguntas directas** al lector para generar reflexión
- **Ejemplos cotidianos**: "Cuando abres Instagram a las 6am antes de siquiera saludar a tu familia…"
- **Citas de fe integradas** naturalmente, no como bloques académicos
- **Sin jerga teológica pesada**: explicar conceptos con sencillez
- **Categorías actualizadas**: "Identidad Digital", "Paz Interior", "Familia y Tecnología"

### Cambios técnicos

1. **Migración SQL**: Un solo `UPDATE` por artículo con nuevo `titulo`, `subtitulo`, `icon_name`, `categoria`, `categoria_grupo`, `quotes`, `sections`, `reflection`, `related_articles`
2. **Actualizar `CATEGORY_META`** en `FronteraFinal.tsx` para reflejar las nuevas categorías
3. **Actualizar `iconMap`** si se usan nuevos iconos (ej: `Smartphone`, `Eye`, `Shield`, `Users`)

### Generación del contenido

Usaré el script de Lovable AI para generar los 8 artículos con un prompt específico que enforce el tono conversacional, humanizado y anclado en fuentes católicas verificables. Después lo reviso y ejecuto la migración.

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| Nueva migración SQL | UPDATE de los 8 artículos |
| `src/pages/FronteraFinal.tsx` | Actualizar `CATEGORY_META` e `iconMap` |

