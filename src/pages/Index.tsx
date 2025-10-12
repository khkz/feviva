import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, Target, Users, Heart, Brain, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="w-16 h-16 text-secondary" />
          <h1 className="font-heading text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FeViva
          </h1>
        </div>
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-6">
          Entrena Tu Fe con Verdad y Amor
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Aprende a responder objeciones con evidencia sólida, razonamiento claro y un corazón compasivo.
          Únete a una comunidad que crece en apologética y vida cristiana.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg">
            Comenzar Ahora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
            Iniciar Sesión
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="font-heading text-3xl font-bold text-center text-primary mb-12">
          ¿Qué Ofrece FeViva?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-secondary" />
              </div>
              <CardTitle>Coach de Debate IA</CardTitle>
              <CardDescription>
                Practica conversaciones con personajes escépticos configurables. Recibe evaluación en Fe, Razón y Amor con retroalimentación personalizada.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <CardTitle>Tarjetas de Argumento</CardTitle>
              <CardDescription>
                Respuestas estructuradas en 30s, 2min y 5min para cada objeción. Incluye premisas, evidencia, citas bíblicas y puentes empáticos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-secondary" />
              </div>
              <CardTitle>Biblioteca de Fe</CardTitle>
              <CardDescription>
                Lecciones sobre la existencia de Dios, la Biblia, Jesús histórico, ciencia y fe, y más. Con videos y desafíos prácticos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <CardTitle>Hábitos de Luz</CardTitle>
              <CardDescription>
                Mantén rachas de oración, gratitud, servicio, lectura bíblica y descanso. Forma rutinas que florezcan en familia, iglesia y sociedad.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-secondary" />
              </div>
              <CardTitle>Misión & Evangelización</CardTitle>
              <CardDescription>
                Guías prácticas por perfil de interlocutor. Aprende a conectar, escuchar, responder y acompañar con sabiduría y amor.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <CardTitle>Comunidad</CardTitle>
              <CardDescription>
                Comparte testimonios y peticiones de oración. Únete a grupos e iglesias para series de 6-8 semanas con contenido adaptado.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary to-primary-hover text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-heading text-white">
              "Estén siempre preparados para responder"
            </CardTitle>
            <CardDescription className="text-lg text-white/90">
              1 Pedro 3:15 - Pero háganlo con gentileza y respeto
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-lg font-semibold"
            >
              Únete a FeViva
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-secondary" />
            <span className="font-heading text-xl font-bold">FeViva</span>
          </div>
          <p className="text-white/70">
            Entrenando cristianos para responder con verdad, razón y amor
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
