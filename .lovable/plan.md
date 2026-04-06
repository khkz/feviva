

## Plan Maestro de Mejoras a Largo Plazo — ElRugido

### Diagnóstico Actual

**Estado real del producto (datos duros):**
- 6 usuarios registrados, ~17 visitantes/semana, 93% bounce rate
- 1.47 páginas por visita, 2 seg de sesión promedio
- Tráfico: 90% directo, 0 orgánico real, 0 social
- Contenido: 150 oraciones, 420 santos, 29 sleep stories, 9 novenas, 13 lecciones, 0 cursos, 45 días de contenido diario
- Páginas indexables: solo `/santos`, `/oraciones` y landing
- No hay Stripe/monetización, no hay i18n, no hay cápsulas ni guías construidas

**Problema raíz**: Producto enorme y sofisticado técnicamente, pero sin motor de adquisición, sin retención medible y sin embudo de conversión. Es como un castillo medieval sin caminos que lleven a él.

---

### Visión de Fases

```text
FASE 1: FUNDAMENTOS (Semanas 1-3)
  "Que la gente llegue y se quede"

FASE 2: MOTOR DE CRECIMIENTO (Semanas 4-7)
  "Que la gente venga sola"

FASE 3: MONETIZACIÓN (Semanas 8-10)
  "Que el proyecto sea sostenible"

FASE 4: ESCALA (Semanas 11-16)
  "Que el producto crezca solo"
```

---

### FASE 1: FUNDAMENTOS — "Que lleguen y se queden"

**1A. Optimizar el embudo de conversión (Landing → Registro)**

- Rediseñar el Hero de la landing: quitar el badge "Frontera Final" que distrae, poner un video de 30 seg o GIF animado mostrando la app en acción
- Simplificar a UN solo CTA: "Empieza tu primer día" (no dos botones)
- Añadir contador social real: "6 peregrinos ya caminan contigo" (dinámico desde DB, no hardcodeado "5,000+")
- Reducir secciones de landing de 8 a 4: Hero → Problema/Solución → Testimonios reales → CTA final
- Eliminar `WhatsNewSection`, `ImpactStatsSection`, `SaintsPreviewSection` de la landing (ruido)

**1B. Reducir fricción de registro**

- Activar auto-confirm de email (actualmente el usuario debe verificar email — mata conversión en cold traffic)
- Simplificar signup: solo nombre + email + contraseña (quitar perfil doctrinal y edad del registro, moverlo a onboarding)
- Onboarding más corto: 2 pasos max (¿qué buscas? → ¿con qué empezamos?)
- Al terminar onboarding, llevar directamente a la primera experiencia (no al dashboard vacío)

**1C. Primera experiencia mágica (FTUE)**

- Crear flujo "Tu Primer Día": una secuencia guiada de 5 minutos que combine versículo + reflexión breve + oración de 1 min
- Al completar, celebración visual + primer logro desbloqueado + push para mañana
- Eliminar la sobrecarga del Dashboard actual: mostrar solo 3 cards al usuario nuevo (Rutina del día, Santo del día, Siguiente paso)
- Revelar progresivamente más cards conforme el usuario completa días

---

### FASE 2: MOTOR DE CRECIMIENTO — "Que la gente venga sola"

**2A. SEO Público (páginas indexables)**

- Crear `/evangelio-del-dia` como ruta pública con Schema.org `Article` (actualmente requiere auth)
- Crear `/novenas/:slug` como páginas públicas con el texto (audio requiere auth = embudo)
- Crear `/guias/:slug` — artículos largos de la estrategia de authority ya diseñada
- Añadir `FAQPage` schema a la landing
- Implementar `generate-sitemap` dinámico que incluya santos + oraciones + evangelio + guías
- Meta: 500+ páginas indexables en 4 semanas

**2B. Cápsulas Virales (compartir en WhatsApp/IG)**

- Implementar sistema de cápsulas (tabla + edge function + componente Canvas)
- Widget "Cápsula del día" en Dashboard con botón de compartir nativo
- Cada cápsula genera imagen con marca ElRugido + dato + reflexión
- Tracking de compartidos para medir viralidad real

**2C. Notificaciones inteligentes de retención**

- Implementar secuencia de emails post-registro (Resend ya configurado): Día 1, 3, 7
- Push notifications con contenido personalizado según última actividad
- "Tu santo de hoy tiene algo que decirte" vs "Llevas 3 días sin orar" (positivo, no culposo)

**2D. Open Graph dinámico**

- Generar OG images dinámicas para cada santo, oración y guía
- Cuando alguien comparte un enlace, que se vea profesional en WhatsApp/Twitter

---

### FASE 3: MONETIZACIÓN — "Que sea sostenible"

**3A. Modelo Freemium con Stripe**

- Integrar Stripe (Bloque E pendiente del plan maestro)
- Tier gratuito: rutina diaria, santo del día, evangelio, 3 oraciones, 1 sleep story
- Tier Premium (~$4.99/mes): todo desbloqueado + sin límites de coach IA + audio completo
- Tabla `subscriptions` + webhook de Stripe + lógica de feature gating

**3B. Feature gating inteligente**

- No bloquear con paywall agresivo: mostrar contenido parcial + "Desbloquea con Premium"
- Sleep Stories: 3 gratuitas, resto premium
- Coach IA: 3 debates/día gratis (ya existe), ilimitado premium
- Oraciones con audio: fundamentales gratis, catálogo completo premium

**3C. Trial de 7 días**

- Al registrarse, 7 días de acceso total
- Email día 5: "Tu prueba termina en 2 días"
- Conversión suave: no cortar de golpe, reducir gradualmente

---

### FASE 4: ESCALA — "Que crezca solo"

**4A. Internacionalización (i18n)**

- Implementar sistema de traducciones (react-i18next)
- Prioridad: Portugués (Brasil = mercado católico enorme)
- Traducción de UI + contenido generado con IA por idioma

**4B. API pública y widgets embebibles**

- Santo del día como widget embebible para blogs católicos
- Versículo del día como API pública con atribución
- Cada embed trae tráfico de vuelta

**4C. Programa de embajadores**

- Evolucionar sistema de referidos actual (ya existe `user_referral_codes`)
- Dashboard de embajador: ver cuántos invitados, puntos, recompensas
- Incentivo: meses premium gratis por referidos activos

**4D. Contenido generado por usuarios (UGC)**

- Permitir que usuarios suban testimonios en audio/texto
- Sistema de moderación (ya existe base) + curación
- Los mejores testimonios se vuelven contenido público/SEO

---

### Prioridad de implementación inmediata

| # | Sub-fase | Impacto | Esfuerzo | Prioridad |
|---|----------|---------|----------|-----------|
| 1 | 1A — Landing simplificada | Alto | Bajo | AHORA |
| 2 | 1B — Registro sin fricción | Alto | Bajo | AHORA |
| 3 | 1C — Primera experiencia guiada | Muy Alto | Medio | AHORA |
| 4 | 2A — SEO público | Muy Alto | Medio | Semana 2 |
| 5 | 2B — Cápsulas virales | Alto | Medio | Semana 3 |
| 6 | 2C — Emails de retención | Alto | Bajo | Semana 3 |
| 7 | 2D — OG dinámico | Medio | Bajo | Semana 4 |
| 8 | 3A — Stripe | Alto | Alto | Semana 5 |

### Archivos principales afectados por fase

**Fase 1**: `Index.tsx`, `Auth.tsx`, `Onboarding.tsx`, `Dashboard.tsx`, nuevos componentes FTUE
**Fase 2**: Migraciones SQL (cápsulas, guías), nuevas rutas públicas, edge functions, `generate-sitemap`
**Fase 3**: Integración Stripe, tabla `subscriptions`, componente PayWall, middleware de gating
**Fase 4**: Sistema i18n, API pública, dashboard embajador

### Métricas de éxito por fase

- **Fase 1**: Bounce rate < 60%, registro > 20% de visitantes, retención día 1 > 50%
- **Fase 2**: 100+ visitantes/semana orgánicos, 10+ compartidos/semana
- **Fase 3**: 5% conversión a premium, MRR > $0
- **Fase 4**: 3+ idiomas, 1000+ usuarios, embajadores activos

