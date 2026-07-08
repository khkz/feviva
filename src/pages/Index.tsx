import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import heroBackground from "@/assets/hero-background.jpg";
import logoElRugido from "@/assets/logo-elrugido.png";

// Eager imports so el HTML de la landing esté disponible en el primer render
// (mejor SEO: Googlebot lo ve sin esperar chunks lazy)
import { CoachDebateSection } from "@/components/landing/CoachDebateSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesGridSection } from "@/components/landing/FeaturesGridSection";
import { LandingTestimonialsSection } from "@/components/landing/LandingTestimonialsSection";
import { FAQAccordionSection } from "@/components/landing/FAQAccordionSection";
import { LandingFinalCTA } from "@/components/landing/LandingFinalCTA";
import { FooterSection } from "@/components/landing/FooterSection";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>ElRugido — Coach de IA para apologética católica</title>
        <meta
          name="description"
          content="Entrena tu fe con un coach de IA que debate contigo como un ateo real. 10 minutos al día para dar razón de tu esperanza. Gratis."
        />
        <meta property="og:title" content="ElRugido — Ruge tu fe. Defiende tu esperanza." />
        <meta
          property="og:description"
          content="Coach de IA para apologética católica, oraciones, evangelio del día y más. Todo gratis."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elrugido.com/" />
        <link rel="canonical" href="https://elrugido.com/" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDuration: "8s" }}
            />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center mb-6"
              >
                <img
                  src={logoElRugido}
                  alt="ElRugido - Coach de fe católica con IA"
                  className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 mb-3"
                  loading="eager"
                  decoding="async"
                />
                <span className="text-sm md:text-base font-medium text-primary tracking-wider">
                  elrugido.com
                </span>
              </motion.div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 leading-tight">
                Ruge tu fe.{" "}
                <span className="text-gradient-gold">Defiende tu esperanza.</span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base md:text-lg lg:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed"
              >
                Entrena con un Coach de IA que debate contigo como lo haría un ateo real,
                y gana la confianza para <span className="text-primary font-semibold">dar razón de tu esperanza</span>.
                <br className="hidden sm:block" /> 10 minutos al día.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-2 mb-8"
              >
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="text-base md:text-lg px-10 py-7 bg-secondary hover:bg-secondary/90 text-primary font-bold shadow-xl shadow-secondary/30 group"
                >
                  Comenzar gratis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Sin tarjeta. Empiezas en 30 segundos.
                </p>
              </motion.div>

              {/* Social message (sin números en cero) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Users className="w-4 h-4 text-primary" />
                <span>Súmate a la comunidad que entrena su fe.</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={scrollToContent}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            aria-label="Descubrir más"
          >
            <span className="text-xs uppercase tracking-wider">Descubre más</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </section>

        <CoachDebateSection />
        <HowItWorksSection />
        <FeaturesGridSection />
        <LandingTestimonialsSection />
        <FAQAccordionSection />
        <LandingFinalCTA />
        <FooterSection />
      </div>
    </>
  );
};

export default Index;
