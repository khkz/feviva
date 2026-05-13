import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import heroBackground from "@/assets/hero-background.jpg";
import logoElRugido from "@/assets/logo-elrugido.png";

// Lazy load below-the-fold sections
const UserNeedsSection = lazy(() => import("@/components/landing/UserNeedsSection").then(m => ({ default: m.UserNeedsSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const FinalCTASection = lazy(() => import("@/components/landing/FinalCTASection").then(m => ({ default: m.FinalCTASection })));
const FooterSection = lazy(() => import("@/components/landing/FooterSection").then(m => ({ default: m.FooterSection })));

const SectionLoader = () => (
  <div className="py-20 flex justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  // Fetch real user count
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (count !== null) setUserCount(count);
      });
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>ElRugido — Oración, santos y apologética católica</title>
        <meta name="description" content="Plataforma católica con 150+ oraciones, 420+ santos, evangelio del día, novenas guiadas, coach IA de apologética y plan bíblico de 365 días. Gratis." />
        <meta property="og:title" content="ElRugido — Tu compañero de fe digital" />
        <meta property="og:description" content="Oraciones católicas, evangelio del día, santos, novenas guiadas y coach de apologética. Todo gratis." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://elrugido.com" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ElRugido",
          "url": "https://elrugido.com",
          "logo": "https://elrugido.com/logo-elrugido.png",
          "foundingDate": "2025",
          "description": "Plataforma católica digital con oraciones, santos, novenas, evangelio del día y formación en apologética. Fundada por un equipo de católicos, teólogos y desarrolladores.",
          "sameAs": [],
          "knowsAbout": ["Catolicismo", "Oración católica", "Santos católicos", "Apologética cristiana", "Novenas", "Evangelio", "Sagrada Escritura"],
          "areaServed": { "@type": "Place", "name": "América Latina y España" }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "ElRugido",
          "url": "https://elrugido.com",
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "description": "App católica con oración diaria, 420+ santos, 150+ oraciones, novenas guiadas, evangelio del día con video y coach IA de apologética.",
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".hero-description"]
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://elrugido.com/santos?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "¿Qué es ElRugido?", "acceptedAnswer": { "@type": "Answer", "text": "ElRugido es una plataforma católica digital creada en 2025 que ofrece oración diaria, evangelio del día con video y reflexión, un catálogo de más de 420 santos con biografías verificadas, 150+ oraciones católicas, novenas guiadas de 9 días, un coach IA de apologética y un plan de lectura bíblica de 365 días. Está basada en el Catecismo de la Iglesia Católica y la Sagrada Escritura." }},
            { "@type": "Question", "name": "¿ElRugido es gratis?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. ElRugido ofrece acceso gratuito a oraciones con texto completo, calendario de santos, evangelio del día y novenas. El registro gratuito desbloquea audio guiado, seguimiento de hábitos espirituales y el coach de apologética." }},
            { "@type": "Question", "name": "¿Qué novenas puedo rezar en ElRugido?", "acceptedAnswer": { "@type": "Answer", "text": "ElRugido ofrece novenas guiadas a la Virgen María, Sagrado Corazón de Jesús, Espíritu Santo, San José, Santa Rita y más. Cada novena incluye 9 días de oración con reflexión diaria. Las novenas son una práctica católica de oración perseverante con origen en Hechos 1:14." }},
            { "@type": "Question", "name": "¿Cómo funciona el evangelio del día?", "acceptedAnswer": { "@type": "Answer", "text": "Cada día publicamos el evangelio del día con video explicativo, reflexión escrita, versículo destacado y oración. El contenido se actualiza según el calendario litúrgico de la Iglesia Católica." }},
            { "@type": "Question", "name": "¿Puedo usar ElRugido sin conexión?", "acceptedAnswer": { "@type": "Answer", "text": "Sí. ElRugido es una Progressive Web App (PWA) que se puede instalar en el celular y usar offline con el contenido descargado previamente." }}
          ]
        })}</script>
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
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
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
                  alt="ElRugido - Tu compañero de fe digital" 
                  className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 mb-3"
                  loading="eager"
                  decoding="async"
                />
                <span className="text-sm md:text-base font-medium text-primary tracking-wider">elrugido.com</span>
              </motion.div>
              
              <h1 className="text-xl md:text-2xl text-muted-foreground font-medium mb-3">
                Ruge tu fe. Defiende tu esperanza.
              </h1>
              
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

              {/* Single CTA */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mb-10"
              >
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/25 group"
                >
                  Empieza tu primer día
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              {/* Dynamic Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Users className="w-5 h-5 text-primary" />
                {userCount !== null ? (
                  <span>
                    <strong className="text-foreground">{userCount}</strong> {userCount === 1 ? 'peregrino ya camina contigo' : 'peregrinos ya caminan contigo'}
                  </span>
                ) : (
                  <span>Únete a la comunidad</span>
                )}
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

        {/* Simplified funnel: Problem/Solution → Testimonials → CTA → Footer */}
        <Suspense fallback={<SectionLoader />}>
          <UserNeedsSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
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
