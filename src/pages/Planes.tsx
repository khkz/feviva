import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FooterSection } from "@/components/landing/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useIsAuthed } from "@/hooks/useIsAuthed";
import logoElRugido from "@/assets/logo-elrugido.png";

type Billing = "mensual" | "anual";
type PlanKey = "apostol_mensual" | "apostol_anual" | "mecenas_mensual";

const Planes = () => {
  const [billing, setBilling] = useState<Billing>("anual");
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async (plan: PlanKey) => {
    setLoadingPlan(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Necesitas iniciar sesión", description: "Te llevamos al registro para continuar." });
        navigate("/auth");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, origin: window.location.origin },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se pudo crear la sesión de pago");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      toast({ title: "No pudimos abrir el pago", description: msg, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };


  const peregrinoFeatures = [
    "Evangelio y Santo del día",
    "1 oración al día",
    "Primeras lecciones",
    "Coach en modo Tutorial",
  ];

  const apostolFeatures = [
    "Coach de Debate ilimitado",
    "Todos los niveles y oponentes",
    "Biblioteca completa",
    "Ruta del Apóstol completa",
    "Novenas y Rosario completos",
    "Historias para dormir",
    "Frontera Final completa",
  ];

  const mecenasFeatures = [
    "Todo lo de Apóstol",
    "Insignia de Mecenas",
    "Acceso anticipado a nuevas funciones",
  ];

  const apostolPrice = billing === "mensual" ? "CLP $3.990" : "CLP $29.990";
  const apostolCadence = billing === "mensual" ? "al mes" : "al año";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Planes ElRugido — Elige tu camino de formación</title>
        <meta
          name="description"
          content="Planes de ElRugido: Peregrino (gratis), Apóstol y Mecenas. Coach de Debate ilimitado, biblioteca completa y más. Precios en pesos chilenos."
        />
        <link rel="canonical" href="https://elrugido.com/planes" />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoElRugido} alt="ElRugido - App de fe y apologética católica" className="w-9 h-9" />
            <span className="font-display font-bold text-lg">ElRugido</span>
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-12 pb-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
        >
          Elige tu camino de formación
        </motion.h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
          Empieza gratis. Crece cuando quieras. Sin ataduras.
        </p>

        {/* Toggle */}
        <div className="mt-8 inline-flex items-center gap-2 bg-muted/40 border border-border/50 rounded-full p-1">
          <button
            type="button"
            onClick={() => setBilling("mensual")}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              billing === "mensual" ? "bg-background text-foreground shadow" : "text-muted-foreground"
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBilling("anual")}
            className={`px-4 py-2 text-sm rounded-full transition-colors inline-flex items-center gap-2 ${
              billing === "anual" ? "bg-background text-foreground shadow" : "text-muted-foreground"
            }`}
          >
            Anual
            <span className="text-[10px] font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              2 meses gratis
            </span>
          </button>
        </div>
      </section>

      {/* Pricing grid */}
      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Peregrino */}
          <PlanCard
            icon={<Sparkles className="w-5 h-5" />}
            name="Peregrino"
            tagline="Para empezar tu camino"
            price="Gratis"
            cadence=""
            features={peregrinoFeatures}
            ctaLabel="Comenzar gratis"
            ctaHref="/auth"
          />

          {/* Apóstol (destacado) */}
          <PlanCard
            featured
            icon={<Crown className="w-5 h-5" />}
            name="Apóstol"
            tagline="Formación completa"
            price={apostolPrice}
            cadence={apostolCadence}
            features={apostolFeatures}
            featuresIntro="Todo lo de Peregrino, y además:"
            ctaLabel="Empezar 7 días gratis"
            onCta={() => handleCheckout(billing === "mensual" ? "apostol_mensual" : "apostol_anual")}
            loading={loadingPlan === "apostol_mensual" || loadingPlan === "apostol_anual"}
            badge="MÁS POPULAR"
          />

          {/* Mecenas */}
          <PlanCard
            icon={<Heart className="w-5 h-5" />}
            name="Mecenas"
            tagline="Sostienes la evangelización digital"
            price="CLP $9.990"
            cadence="al mes"
            features={mecenasFeatures}
            ctaLabel="Empezar 7 días gratis"
            onCta={() => handleCheckout("mecenas_mensual")}
            loading={loadingPlan === "mecenas_mensual"}
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 max-w-xl mx-auto">
          Precios en pesos chilenos (CLP). Los planes de pago incluyen 7 días de prueba gratis; cancela cuando quieras.
        </p>

      </section>

      <FooterSection />
    </div>
  );
};

interface PlanCardProps {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  features: string[];
  featuresIntro?: string;
  ctaLabel: string;
  ctaHref?: string;
  onCta?: () => void;
  loading?: boolean;
  featured?: boolean;
  badge?: string;
}

const PlanCard = ({
  icon,
  name,
  tagline,
  price,
  cadence,
  features,
  featuresIntro,
  ctaLabel,
  ctaHref,
  onCta,
  loading,
  featured,
  badge,
}: PlanCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`relative rounded-2xl border p-6 flex flex-col ${
      featured
        ? "border-primary/60 bg-gradient-to-b from-primary/10 to-transparent shadow-lg shadow-primary/10 md:-translate-y-2"
        : "border-border/60 bg-card/40"
    }`}
  >
    {badge && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">
        {badge}
      </span>
    )}
    <div className={`inline-flex items-center gap-2 mb-2 ${featured ? "text-primary" : "text-muted-foreground"}`}>
      {icon}
      <span className="text-sm font-semibold uppercase tracking-wider">{name}</span>
    </div>
    <p className="text-sm text-muted-foreground mb-4">{tagline}</p>
    <div className="mb-6">
      <span className="text-3xl sm:text-4xl font-bold font-display">{price}</span>
      {cadence && <span className="text-sm text-muted-foreground ml-2">{cadence}</span>}
    </div>

    {featuresIntro && (
      <p className="text-sm font-medium mb-2">{featuresIntro}</p>
    )}
    <ul className="space-y-2 mb-6 flex-1">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm">
          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${featured ? "text-primary" : "text-primary/70"}`} />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    {onCta ? (
      <Button
        onClick={onCta}
        disabled={loading}
        variant={featured ? "default" : "outline"}
        className="w-full"
        size="lg"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : ctaLabel}
      </Button>
    ) : (
      <Button
        asChild
        variant={featured ? "default" : "outline"}
        className="w-full"
        size="lg"
      >
        <Link to={ctaHref ?? "/auth"}>{ctaLabel}</Link>
      </Button>
    )}
  </motion.div>
);

export default Planes;

