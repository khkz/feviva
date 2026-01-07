import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, BookOpen, Target, Users, Heart, Brain, ArrowRight, 
  Shield, Star, Play, ChevronDown, Cross, Church
} from "lucide-react";
import { motion } from "framer-motion";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroBackground} 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,hsl(var(--primary))_100%)]" />
        </div>

        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-secondary/20 blur-2xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-secondary/15 blur-3xl"
          animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-white/90 text-sm font-medium">Entrenamiento de Fe + Apologética</span>
            </div>
          </motion.div>

          <motion.h1 
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-secondary">Fe</span>Viva
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Entrena Tu Fe con Verdad y Amor
          </motion.p>

          <motion.p 
            className="text-lg text-white/60 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Aprende a responder objeciones con evidencia sólida, razonamiento claro 
            y un corazón compasivo. Únete a miles de cristianos creciendo en apologética.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="text-lg px-8 py-6 bg-secondary hover:bg-secondary-hover text-primary font-bold shadow-lg shadow-secondary/30 transition-all hover:scale-105"
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Play className="mr-2 w-5 h-5" />
              Ver Demo
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center gap-2 text-white/60">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary-hover border-2 border-primary" />
                ))}
              </div>
              <span className="text-sm">+2,000 usuarios activos</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Star className="w-5 h-5 text-secondary fill-secondary" />
              <span className="text-sm">4.9 valoración promedio</span>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-white/40" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-accent/50 to-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-secondary font-semibold mb-4">
              <Cross className="w-4 h-4" />
              CARACTERÍSTICAS
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-4">
              Todo lo que necesitas para defender tu fe
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas diseñadas por apologistas y tecnólogos para equiparte en tu camino espiritual.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Sparkles className="w-7 h-7" />,
                title: "Coach de Debate IA",
                description: "Practica con personajes escépticos. Recibe evaluación en Fe, Razón y Amor.",
                color: "secondary"
              },
              {
                icon: <BookOpen className="w-7 h-7" />,
                title: "Tarjetas de Argumento",
                description: "Respuestas en 30s, 2min y 5min. Premisas, evidencia y citas bíblicas.",
                color: "primary"
              },
              {
                icon: <Brain className="w-7 h-7" />,
                title: "Biblioteca de Fe",
                description: "Lecciones sobre Dios, Biblia, Jesús, ciencia y fe. Videos y desafíos.",
                color: "secondary"
              },
              {
                icon: <Target className="w-7 h-7" />,
                title: "Hábitos de Luz",
                description: "Rachas de oración, gratitud, servicio y lectura bíblica diaria.",
                color: "primary"
              },
              {
                icon: <Heart className="w-7 h-7" />,
                title: "Misión & Evangelización",
                description: "Guías por perfil de interlocutor. Conecta, escucha y acompaña.",
                color: "secondary"
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: "Comunidad",
                description: "Comparte testimonios y peticiones de oración. Únete a grupos.",
                color: "primary"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
              >
                <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                      feature.color === 'secondary' 
                        ? 'bg-secondary/20 text-secondary' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { number: "2,000+", label: "Usuarios Activos" },
              { number: "150+", label: "Lecciones" },
              { number: "50+", label: "Tarjetas de Argumento" },
              { number: "4.9★", label: "Valoración" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-heading font-bold text-secondary mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial / Quote Section */}
      <section className="py-24 bg-gradient-to-b from-background to-accent/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-8">
              <Church className="w-8 h-8 text-secondary" />
            </div>
            <blockquote className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6 leading-relaxed">
              "Estén siempre preparados para responder a todo el que les pida razón 
              de la esperanza que hay en ustedes"
            </blockquote>
            <cite className="text-lg text-muted-foreground not-italic">
              — 1 Pedro 3:15
            </cite>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary-hover" />
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Comienza tu entrenamiento hoy
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Únete a la comunidad de creyentes que están fortaleciendo su fe 
              y aprendiendo a defenderla con sabiduría y amor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-10 py-6 bg-secondary hover:bg-secondary-hover text-primary font-bold shadow-lg shadow-secondary/30 transition-all hover:scale-105"
              >
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10"
              >
                Ya tengo cuenta
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>Acceso inmediato</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-secondary" />
              <span className="font-heading text-2xl font-bold">
                <span className="text-secondary">Fe</span>Viva
              </span>
            </div>
            <p className="text-white/60 text-center md:text-right">
              Entrenando cristianos para responder con verdad, razón y amor.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © 2026 FeViva. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
