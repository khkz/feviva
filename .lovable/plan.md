

# Estrategia de Monetización: Freemium → Premium

## Tu Inventario de Contenido Actual

| Contenido | Cantidad | Con Audio | Estado Actual |
|-----------|----------|-----------|---------------|
| Santos | 420 | — | Público parcial (24 gratis, resto requiere registro) |
| Oraciones | 146 | 145 | Público parcial |
| Lecciones | 13 | 13 | Solo autenticados |
| Sleep Stories | 29 | 26 | Solo autenticados |
| Novenas | 9 | — | Solo autenticados |
| Evangelio diario | Ilimitado | — | Solo autenticados |

**Usuarios actuales:** 5 perfiles en base de datos

---

## Estrategia: "Probar → Enamorarse → Pagar"

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        EMBUDO DE CONVERSIÓN                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   VISITANTE ──────────────────────────────────────────────► USUARIO      │
│      │                                                          │        │
│      │   Contenido SEO público:                                 │        │
│      │   • 420 santos (páginas indexables)                      │        │
│      │   • 146 oraciones (texto completo)                       │        │
│      │   • Evangelio del día                                    │        │
│      │   • Blog de fe/apologética                               │        │
│      │                                                          │        │
│      └─── "Registrarse para escuchar audio" ──────────────────┘         │
│                                                                          │
│   USUARIO GRATIS ────────────────────────────────────────► PREMIUM       │
│      │                                                          │        │
│      │   Gratis (con registro):                                 │        │
│      │   • Audio de 3 oraciones/día                             │        │
│      │   • 1 lección/semana                                     │        │
│      │   • 1 historia para dormir/mes                           │        │
│      │   • Rosario básico (una década)                          │        │
│      │   • Novenas sin guía                                     │        │
│      │                                                          │        │
│      └─── "Desbloquea todo por $X/mes" ───────────────────────┘         │
│                                                                          │
│   USUARIO PREMIUM ──────────────────────────────────────────────────────│
│      │                                                                   │
│      │   • Audio ilimitado (145+ oraciones)                             │
│      │   • Todas las lecciones con audio                                │
│      │   • Historias para dormir ilimitadas                             │
│      │   • Rosario completo guiado                                      │
│      │   • Novenas con audio y recordatorios                            │
│      │   • Coach de apologética ilimitado                               │
│      │   • Sin anuncios (futuro)                                        │
│      │   • Contenido exclusivo mensual                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Maximizar SEO y Audiencia (Ahora)

### 1.1 Contenido Público para SEO

**Crear páginas públicas adicionales:**

| Nueva Página | URL | Propósito SEO |
|--------------|-----|---------------|
| Evangelio del día | `/evangelio-del-dia` | Búsquedas diarias recurrentes |
| Novenas públicas | `/novena/:slug` | Alto volumen de búsquedas |
| Blog de apologética | `/blog` | Keywords long-tail |
| Cómo rezar el rosario | `/guia/como-rezar-rosario` | Búsqueda muy popular |
| Categorías de santos | `/santos/martires`, `/santos/patronos` | Páginas pilar |

### 1.2 Ganchos de Registro

En cada página pública, añadir CTAs estratégicos:

```text
┌──────────────────────────────────────────┐
│  📖 Oración a San Miguel Arcángel        │
│                                          │
│  [Texto completo de la oración...]       │
│                                          │
│  ────────────────────────────────────    │
│                                          │
│  🎧 ¿Quieres escuchar esta oración       │
│     con música y guía de voz?            │
│                                          │
│  [▶️ Escuchar Audio - Gratis]            │
│                                          │
│  → Requiere cuenta gratuita              │
│                                          │
└──────────────────────────────────────────┘
```

---

## Fase 2: Sistema de Suscripción (Futuro)

### 2.1 Tabla de Base de Datos

```sql
-- Tabla de suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium', 'family'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de límites de uso diario para plan gratuito
CREATE TABLE daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  oraciones_escuchadas INTEGER DEFAULT 0,
  lecciones_vistas INTEGER DEFAULT 0,
  debates_realizados INTEGER DEFAULT 0,
  UNIQUE(user_id, fecha)
);
```

### 2.2 Límites del Plan Gratuito

| Característica | Gratis | Premium |
|----------------|--------|---------|
| Audio de oraciones | 3/día | Ilimitado |
| Lecciones | 1/semana | Ilimitado |
| Sleep stories | 1/mes | Ilimitado |
| Rosario | 1 década | Completo |
| Coach apologética | 3 debates/mes | Ilimitado |
| Novenas guiadas | — | ✓ |
| Contenido exclusivo | — | ✓ |
| Sin anuncios | — | ✓ |

### 2.3 Precios Sugeridos

| Plan | Precio | Descripción |
|------|--------|-------------|
| Gratuito | $0 | Acceso limitado, ideal para probar |
| Premium Mensual | $4.99/mes | Acceso completo |
| Premium Anual | $39.99/año | 2 meses gratis |
| Familia | $7.99/mes | Hasta 6 cuentas |

---

## Fase 3: Funciones para Aumentar Retención

### 3.1 Sistema de Puntos Mejorado

Ya tienes el sistema de referidos. Añadir:

```text
┌──────────────────────────────────────────┐
│  🏆 Tus Logros                           │
│                                          │
│  • 7 días de racha: +50 puntos           │
│  • Completar novena: +100 puntos         │
│  • Invitar amigo: +100 puntos            │
│  • Primer rosario: +75 puntos            │
│                                          │
│  ────────────────────────────────────    │
│  500 puntos = 1 mes gratis Premium       │
│  ────────────────────────────────────    │
│                                          │
└──────────────────────────────────────────┘
```

### 3.2 Notificaciones y Recordatorios

Usar los recordatorios que ya tienes para re-engagement:

- "¿Rezaste hoy? Tu racha de 7 días está en riesgo"
- "Nuevo santo del día: San Francisco de Asís"
- "Tu amigo Juan se unió gracias a ti"

### 3.3 Contenido Exclusivo Mensual

Para premium:
- 4 lecciones nuevas/mes
- 2 sleep stories nuevas/mes
- 1 novena nueva/mes
- Reflexiones del Evangelio en audio

---

## Implementación Técnica

### Archivos Nuevos Necesarios

| Archivo | Propósito |
|---------|-----------|
| `src/hooks/useSubscription.tsx` | Verificar plan del usuario |
| `src/components/premium/PaywallModal.tsx` | Modal de upgrade |
| `src/components/premium/UsageLimitBanner.tsx` | "Te quedan 2 audios hoy" |
| `src/pages/Pricing.tsx` | Página pública de precios |
| `src/pages/EvangelioPublic.tsx` | Evangelio del día público |
| `supabase/functions/create-checkout/index.ts` | Stripe checkout |
| `supabase/functions/webhook-stripe/index.ts` | Webhooks de Stripe |

### Hook de Suscripción

```typescript
// src/hooks/useSubscription.tsx
export function useSubscription() {
  const [plan, setPlan] = useState<'free' | 'premium'>('free');
  const [usage, setUsage] = useState({ oraciones: 0, lecciones: 0 });
  
  const isPremium = plan === 'premium';
  
  const canPlay = (type: 'oracion' | 'lesson') => {
    if (isPremium) return true;
    if (type === 'oracion') return usage.oraciones < 3;
    if (type === 'lesson') return usage.lecciones < 1;
    return false;
  };
  
  const trackUsage = async (type: 'oracion' | 'lesson') => {
    // Incrementar contador en daily_usage
  };
  
  return { plan, isPremium, usage, canPlay, trackUsage };
}
```

### Paywall Modal

```typescript
// src/components/premium/PaywallModal.tsx
// Se muestra cuando el usuario intenta acceder a contenido premium
// Opciones: "Ver planes" o "Invitar amigos para ganar acceso"
```

---

## Orden de Implementación Sugerido

### Ahora (Fase 1 - Crecer Audiencia)
1. **Crear páginas públicas adicionales** (Evangelio, Novenas)
2. **Añadir CTAs de registro** en contenido público
3. **Mejorar SEO** con schema.org y meta tags
4. **Potenciar sistema de referidos** ya existente

### Próximo Mes (Fase 2 - Preparar Monetización)
5. **Crear tabla de suscripciones** y daily_usage
6. **Implementar límites** en plan gratuito
7. **Crear página de precios** pública
8. **Diseñar paywall modal** atractivo

### Cuando tengas 500+ usuarios (Fase 3 - Activar Pagos)
9. **Integrar Stripe** (Lovable tiene integración nativa)
10. **Configurar webhooks** para gestionar suscripciones
11. **Añadir sistema de puntos** canjeables por premium
12. **Crear contenido exclusivo** mensual

---

## Métricas Clave a Seguir

| Métrica | Objetivo |
|---------|----------|
| Visitantes únicos/mes | Crecer 20%/mes |
| Tasa de registro | >5% de visitantes |
| Usuarios activos diarios | >10% de registrados |
| Conversión a premium | >3% de usuarios gratuitos |
| Retención mensual | >40% |
| NPS (encuesta) | >50 |

---

## Resumen Ejecutivo

```text
AHORA:
• Abrir más contenido al público para SEO
• Usar audio como "gancho" para registro
• Potenciar referidos

PRONTO:
• Limitar uso gratuito (3 audios/día)
• Crear paywall elegante
• Página de precios atractiva

DESPUÉS:
• Stripe para pagos
• Plan Premium $4.99/mes
• Contenido exclusivo mensual
```

**La clave:** No limites ahora. Primero construye audiencia con contenido gratuito de calidad. Cuando tengas 500+ usuarios activos, entonces introduces los límites y la monetización.

