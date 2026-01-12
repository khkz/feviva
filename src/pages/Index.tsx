import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Star, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import heroBackground from "@/assets/hero-background.jpg";
import logoElRugido from "@/assets/logo-elrugido.svg";

// Lazy load below-the-fold sections for performance
const WhatsNewSection = lazy(() => import("@/components/landing/WhatsNewSection").then(m => ({ default: m.WhatsNewSection })));
const UserNeedsSection = lazy(() => import("@/components/landing/UserNeedsSection").then(m => ({ default: m.UserNeedsSection })));
const DailyJourneySection = lazy(() => import("@/components/landing/DailyJourneySection").then(m => ({ default: m.DailyJourneySection })));
const FeatureShowcase = lazy(() => import("@/components/landing/FeatureShowcase").then(m => ({ default: m.FeatureShowcase })));
const ImpactStatsSection = lazy(() => import("@/components/landing/ImpactStatsSection").then(m => ({ default: m.ImpactStatsSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const SaintOfDayLanding = lazy(() => import("@/components/landing/SaintOfDayLanding").then(m => ({ default: m.SaintOfDayLanding })));
const SaintsPreviewSection = lazy(() => import("@/components/landing/SaintsPreviewSection").then(m => ({ default: m.SaintsPreviewSection })));
const FinalCTASection = lazy(() => import("@/components/landing/FinalCTASection").then(m => ({ default: m.FinalCTASection })));
const FooterSection = lazy(() => import("@/components/landing/FooterSection").then(m => ({ default: m.FooterSection })));

// Simple loading placeholder
const SectionLoader = () => (
  <div className="py-20 flex justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>ElRugido - Ruge tu fe. Defiende tu esperanza.</title>
        <meta name="description" content="Fortalece tu fe católica con rituales de oración, estudio bíblico, coach de apologética, sleep stories y más. Únete a miles de cristianos." />
        <meta property="og:title" content="ElRugido - Tu compañero de fe digital" />
        <meta property="og:description" content="Rituales de oración, estudio bíblico, apologética y más para fortalecer tu vida espiritual." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://elrugido.com" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section - Critical, not lazy loaded */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
          
          {/* Simplified animated background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
          </div>

          {/* Main Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
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
                  alt="ElRugido - Tu compañero de fe digital" 
                  className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 mb-3"
                  loading="eager"
                  decoding="async"
                />
                <span className="text-sm md:text-base font-medium text-primary tracking-wider">elrugido.com</span>
              </motion.div>

              {/* Frontera Final Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <button 
                  onClick={() => navigate("/frontera-final")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border border-primary/40 hover:border-primary/60 hover:bg-primary/10 transition-all shadow-lg shadow-primary/10"
                >
                  <Rocket className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">✨ NUEVO: Frontera Final — Fe y Cosmos</span>
                </button>
              </motion.div>
              
              <h1 className="text-xl md:text-2xl text-muted-foreground font-medium mb-3">
                Ruge tu fe. Defiende tu esperanza.
              </h1>
              
              {/* Emotional question */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8"
              >
                ¿Sientes que tu fe necesita más? ¿Buscas paz interior? ¿Quieres respuestas?
                <br />
                <span className="text-primary font-medium">Estás en el lugar correcto.</span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
              >
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/25 group"
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={scrollToContent}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/5"
                >
                  Descubrir más
                </Button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span><strong className="text-foreground">5,000+</strong> usuarios activos</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                  <span className="ml-2"><strong className="text-foreground">4.9</strong> valoración</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={scrollToContent}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <span className="text-xs uppercase tracking-wider">Descubre más</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </section>

        {/* Lazy loaded sections with Suspense */}
        <Suspense fallback={<SectionLoader />}>
          <WhatsNewSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <UserNeedsSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <DailyJourneySection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FeatureShowcase />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <ImpactStatsSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <SaintOfDayLanding />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <SaintsPreviewSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FinalCTASection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FooterSection />
        </Suspense>
      </div>
    </>
  );
};

export default Index;
