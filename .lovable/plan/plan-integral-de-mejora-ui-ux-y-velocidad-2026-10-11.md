# Plan integral de mejora UI/UX y velocidad

## Objetivo

Mejorar primero la experiencia diaria del usuario —dashboard, navegación, oración, audio y Coach— mediante un **pulido coherente**, conservando la identidad oscura y dorada, Montserrat/Nunito y el enfoque de tecnología calmada. El trabajo se ejecutará por fases medibles para evitar un rediseño riesgoso o cambios masivos sin evidencia.

## Estado verificado

- La navegación móvil ofrece 5 destinos, mientras la navegación de escritorio expone muchos más; varias funciones importantes dependen de caminos indirectos en móvil.
- El dashboard puede reunir cinco bloques y numerosas tarjetas para usuarios avanzados, aumentando el desplazamiento y la carga cognitiva.
- Hay 112 usos de botones de icono y muy poca cobertura explícita de nombres accesibles; los reproductores son un frente prioritario.
- Los estados de carga, vacío y error no siguen todavía un único patrón en toda la app.
- La app ya divide muchas páginas con carga diferida y tiene caché PWA, pero monta reproductores y contextos también en páginas públicas que no los necesitan.
- El dashboard inicia varios pedidos de datos independientes y la caché global no tiene una política común.
- Las imágenes JPG no tienen un pipeline moderno uniforme, hay poco uso de carga diferida y el fondo principal no está priorizado como imagen clave.
- Existen archivos muy superiores al máximo acordado de 400 líneas y las consultas están repartidas entre pantallas, componentes y hooks; no existe aún una capa `data/` única.

## Fase 0 — Medición y mapa de experiencia

1. Registrar una línea base en móvil y escritorio para `/`, `/dashboard`, `/coach`, `/oraciones/app`, `/rosario` y `/library`:
   - LCP, CLS, INP, TBT, peso transferido y cantidad de solicitudes.
   - Tiempo hasta contenido útil y hasta reproducción de audio.
   - Tamaño real de cada bloque de JavaScript y recursos precargados por la PWA.
2. Documentar los recorridos principales: entrar, completar la acción del día, orar, escuchar audio, entrenar en Coach y volver al inicio.
3. Crear una lista visual de inconsistencias verificadas: espaciado, jerarquía, iconos, áreas táctiles, foco, loaders, vacíos y errores.
4. Definir presupuestos de rendimiento y criterios de aceptación antes de cambiar código; cada fase se comparará con esta línea base.

## Fase 1 — Sistema visual y accesibilidad del uso diario

1. Consolidar reglas reutilizables para:
   - Escala de espaciado y anchuras de lectura.
   - Jerarquía de títulos, textos auxiliares y cifras.
   - Botones, chips, tarjetas, divisores y estados seleccionados.
   - Áreas táctiles mínimas de 44 px, foco visible y contraste AA.
2. Auditar todos los controles de icono, comenzando por reproductores, navegación y acciones sociales:
   - Nombre accesible y tooltip cuando sea necesario.
   - Estados reproducir/pausar/cargando/deshabilitado comprensibles.
   - Uso del componente compartido de botón en lugar de controles sueltos.
3. Unificar los patrones de carga, vacío, error y reintento:
   - Skeleton estable que conserve dimensiones y evite saltos.
   - Mensajes breves, tranquilos y accionables.
   - Aparición suave respetando `prefers-reduced-motion`.
4. Corregir pantallas claramente fuera del sistema, incluida la página 404 en inglés, sin tocar contenido doctrinal.

## Fase 2 — Dashboard más enfocado

1. Mantener “Acción del día” como prioridad y reducir competencia visual del resto.
2. Reorganizar “Hoy”, “Formación”, “Oración” y “Progreso” con:
   - Una acción principal clara por bloque.
   - Menos tarjetas simultáneas y agrupaciones más escaneables.
   - Cierre natural, sin scroll infinito ni mecanismos de ansiedad.
3. Revisar la progresión del dashboard para usuarios nuevos, recurrentes y avanzados; evitar que el nivel avanzado se convierta en una lista excesiva.
4. Mover la finalización del primer uso desde una señal solo local a una señal persistente de la cuenta, para que no reaparezca al cambiar de dispositivo.
5. Incorporar recuperación no bloqueante cuando fallen perfil o contenidos diarios, con opción de reintento.

## Fase 3 — Navegación móvil y continuidad del audio

1. Alinear navegación móvil y escritorio con el modelo mental ya usado en el dashboard: Inicio, Formación, Oración, Santos y Perfil/Más.
2. Dar acceso claro al Coach sin sobrecargar la barra inferior; decidir su posición usando analítica real y pruebas de recorrido.
3. Revisar qué destinos secundarios deben vivir en “Más” y preservar el hábito de los usuarios actuales.
4. Mantener el reproductor persistente como única experiencia de audio:
   - Sin controles duplicados ni cambios de posición entre pantallas.
   - Continuidad al navegar, estados claros y controles accesibles.
   - Espacio reservado para que nunca cubra la navegación o el contenido.
5. Conservar separadas las páginas públicas indexables y las vistas internas; cualquier redirección se definirá sin perjudicar SEO.

## Fase 4 — Velocidad percibida y real

1. Imágenes:
   - Incorporar `vite-imagetools` y generar AVIF/WebP con fallback cuando corresponda.
   - Añadir tamaños adaptables, dimensiones estables, `decoding="async"` y carga diferida fuera del primer viewport.
   - Priorizar solo la imagen LCP real de cada entrada importante.
   - Excluir del precache recursos grandes no utilizados, incluido el SVG pesado del logo si la medición confirma que no se usa.
2. Fuentes:
   - Reducir familias y pesos a los realmente usados o alojarlos localmente.
   - Mantener Montserrat/Nunito como identidad y evitar bloqueo innecesario del primer render.
3. JavaScript:
   - Mantener la carga diferida por rutas y medir antes de crear bloques manuales.
   - Cargar contextos y reproductores solo en el área interna que los necesita, conservando la persistencia allí.
   - Revisar animaciones simples para usar CSS cuando no requieran el motor completo.
4. Datos:
   - Definir políticas globales de frescura y reintento para evitar solicitudes repetidas.
   - Prefetch solo de la siguiente acción probable.
   - Medir los pedidos del dashboard y consolidarlos o paralelizarlos si la traza confirma cascadas.
5. PWA:
   - Medir el comportamiento offline y en red lenta.
   - Ajustar la estrategia de navegación solo si el timeout actual demuestra retrasos perceptibles.

## Fase 5 — Arquitectura necesaria para sostener las mejoras

Esta fase se aplicará por dominio y junto a las pantallas tocadas; no será una reescritura global.

1. Crear carpetas de negocio con puerta pública `index.ts`; ningún dominio importará archivos internos de otro.
2. Crear una sola capa `data/`, organizada por dominio, y mover allí las consultas hoy presentes en hooks, componentes y páginas.
3. Mantener React Query como patrón único de consumo y caché; los hooks gestionarán estado de interfaz, no consultas directas.
4. Antes de modificar cualquier archivo mayor a 400 líneas, dividirlo en piezas enfocadas. Prioridad:
   - Coach.
   - Dashboard y flujos diarios.
   - Reproductores y acciones de compartir.
   - Pantallas administrativas solo cuando una fase las toque.
5. Añadir reglas automáticas para impedir regresiones de tamaño, accesibilidad básica y acceso directo a datos fuera de `data/`.

## Orden de entrega

1. **Entrega A:** medición, tokens/patrones UI, accesibilidad y estados comunes.
2. **Entrega B:** dashboard enfocado y persistencia correcta del primer uso.
3. **Entrega C:** navegación móvil y continuidad de audio.
4. **Entrega D:** imágenes, fuentes, carga de código, caché y PWA.
5. **Entrega E:** migración progresiva a dominios y capa de datos, limitada a las áreas intervenidas.

Cada entrega será publicable y reversible por separado. No se mezclará una mejora visual con cambios doctrinales, de pagos o de permisos.

## Verificación de cada entrega

- Comparar las métricas con la línea base, sin afirmar mejoras sin medición.
- Probar recorridos reales con sesión activa en móvil y escritorio.
- Revisar visualmente 390×844 y 1280×1800, incluyendo contenido largo y estados vacíos/error.
- Navegar solo con teclado y validar controles con lector de pantalla en los flujos principales.
- Confirmar contraste, foco, 44 px táctiles, ausencia de solapes y respeto a movimiento reducido.
- Ejecutar las pruebas existentes y agregar pruebas pequeñas para reglas persistentes de navegación o estado.
- Revisar que ningún archivo modificado supere 400 líneas y que ninguna consulta nueva viva fuera de `data/`.

## Fuera de alcance

- Cambios doctrinales, de contenido editorial, precios, pagos, permisos o seguridad.
- Rediseño total de marca o sustitución de la identidad oscura/dorada.
- Rehacer toda la arquitectura en una sola entrega.
- Afirmar mejoras de Core Web Vitals antes de obtener y comparar mediciones reales.