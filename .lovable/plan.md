## Alcance

Rediseño de **solo la landing pública** (`/` para visitantes no logueados). No se toca autenticación, redirect a `/dashboard` de usuarios logueados, ni el resto de la app. Se mantiene la estética actual (montañas doradas, logo león, paleta dorado #C8A217 + azul oscuro `--primary`).

## Cambios en `src/pages/Index.tsx`

1. **Hero** (mantiene fondo de montañas y logo):
   - Título `H1`: se mantiene "Ruge tu fe. Defiende tu esperanza."
   - Nuevo subtítulo: *"Entrena con un Coach de IA que debate contigo como lo haría un ateo real, y gana la confianza para dar razón de tu esperanza. 10 minutos al día."*
   - CTA primario: `Comenzar gratis` → `/auth`
   - Microcopy debajo del CTA: *"Sin tarjeta. Empiezas en 30 segundos."*
   - Eliminar contador `userCount`/`peregrinos` y su fetch a `profiles`. Reemplazar por texto estático *"Sumate a la comunidad que entrena su fe."*
2. **Nuevo orden de secciones** (todas eager, no lazy, para que Googlebot vea el HTML en el primer render y SEO se beneficie):
   - `HeroSection` (inline)
   - `CoachDebateSection`
   - `HowItWorksSection`
   - `FeaturesGridSection`
   - `LandingTestimonialsSection`
   - `FAQAccordionSection`
   - `LandingFinalCTA`
   - `FooterSection` (actualizado)
3. **Helmet**: mantener meta actuales; añadir JSON-LD `FAQPage` construido desde los mismos textos del acordeón (sirve para rich snippets).

## Componentes nuevos en `src/components/landing/`

- **`CoachDebateSection.tsx`** — Título "Practica la conversación difícil antes de tenerla.", párrafo con opciones (Ateo Científico/Agnóstico/Escéptico, temas, niveles), mock chat de 3 turnos (ateo → usuario → coach evaluando) en un card azul-oscuro con burbujas doradas, chips: *Escucha primero, Argumento cosmológico, Argumento del diseño, Argumento moral*.
- **`HowItWorksSection.tsx`** — 3 pasos con iconos, número dorado y línea conectora en desktop: *Elige tu reto → Entrena con la IA → Sube de nivel*.
- **`FeaturesGridSection.tsx`** — Título "Una sola app para formarte, orar y crecer." + rejilla responsive (1/2/3 col) con 7 features linkables: Ruta del Apóstol, Biblioteca de audio, Rosario y Novenas, Biblia en 365 días, Evangelio del día, Historias para dormir, Frontera Final.
- **`LandingTestimonialsSection.tsx`** — 3 tarjetas de testimonio placeholder (etiquetadas como testimonio de usuario, sin inventar nombres reales) + franja *"Contenido fiel al Magisterio, revisado por nuestro asesor teológico."*
- **`FAQAccordionSection.tsx`** — Acordeón shadcn con las 5 preguntas pedidas + inyecta JSON-LD `FAQPage`.
- **`LandingFinalCTA.tsx`** — CTA final full-width con fondo `--primary` y botón dorado "Comenzar gratis" → `/auth`.

## Cambios en `src/components/landing/FooterSection.tsx`

Se conserva estructura actual (santos populares, oraciones, patronos) y **se añade una columna extra** con:
- Redes: Instagram `@elrugido` (link externo, `nofollow` + `noopener`).
- Contacto: `mailto:hola@elrugido.com`.
- Aviso legal: enlace a `/sobre-nosotros` (ancla a política editorial ya existente) y línea "Uso responsable del contenido".

Es compatible con el uso actual del footer en `OracionPage`, `SantosPublic`, etc. — solo suma una columna.

## Prerenderizable para SEO

Este proyecto es SPA Vite sin SSR, así que "prerender puro" no es posible sin cambiar stack. Las prácticas aplicables aquí:

- Todas las secciones se importan de forma **eager** (no `React.lazy`) para que estén en el bundle inicial y Googlebot las vea en el primer render JS.
- HTML semántico: `<section>`, un solo `<h1>`, `<h2>` por sección, `<blockquote>`, `<button>`, `alt` en imágenes.
- JSON-LD `FAQPage` inyectado desde el propio DOM del acordeón (misma fuente de verdad).
- Meta `<Helmet>` de la landing con canonical `https://elrugido.com/` y og:url auto-referencial.
- Links internos con `<Link to="…">` para que el crawler siga la ruta.

Si el usuario quiere prerender real (HTML estático servido antes del JS), después podemos añadir `vite-plugin-prerender-spa` o migrar a un stack SSR — es tema aparte, no bloqueante para este rediseño.

## No se toca

- `src/pages/Auth.tsx`, `ProtectedRoute`, `App.tsx` (routing), redirect `if (session) navigate("/dashboard")`.
- Componentes existentes: `UserNeedsSection`, `TestimonialsSection`, `FinalCTASection` quedan en el repo (por si se usan en otro lado, aunque la landing dejará de importarlos). No los elimino para no romper referencias inesperadas.
- Todo el resto de la app.

## Verificación

Tras aplicar los cambios, capturaré la landing con Playwright en viewport mobile (390×844) y desktop (1280×1800) para validar layout, tipografía, contraste y CTAs visibles.
