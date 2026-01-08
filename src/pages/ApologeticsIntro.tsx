import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Heart, Lightbulb, MessageCircle, Shield, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

const ApologeticsIntro = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: Lightbulb,
      title: 'Razón',
      description: 'Argumentos lógicos y evidencias que apoyan la fe cristiana.',
      color: 'from-yellow-500 to-amber-600'
    },
    {
      icon: BookOpen,
      title: 'Escritura',
      description: 'La Biblia como fundamento y autoridad de nuestras creencias.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Heart,
      title: 'Amor',
      description: 'Defender la fe con mansedumbre, respeto y caridad genuina.',
      color: 'from-rose-500 to-pink-600'
    },
    {
      icon: MessageCircle,
      title: 'Diálogo',
      description: 'Escuchar y entender antes de responder, buscando la verdad juntos.',
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  const principles = [
    {
      number: '01',
      title: 'Conoce tu fe',
      description: 'Antes de defender, necesitas entender profundamente lo que crees y por qué lo crees.'
    },
    {
      number: '02',
      title: 'Escucha primero',
      description: 'Entiende las objeciones y preguntas genuinas antes de ofrecer respuestas.'
    },
    {
      number: '03',
      title: 'Usa la razón',
      description: 'La fe cristiana es razonable. Presenta argumentos lógicos y evidencias.'
    },
    {
      number: '04',
      title: 'Actúa con amor',
      description: 'Tu objetivo no es ganar debates, sino ganar corazones para Cristo.'
    },
    {
      number: '05',
      title: 'Confía en el Espíritu',
      description: 'La conversión es obra de Dios. Tú plantas semillas, Él da el crecimiento.'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <DesktopSidebar />
      
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-16 px-4 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzk2QjQiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Fundamentos de la Fe</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                ¿Qué es la{' '}
                <span className="text-primary">Apologética</span>?
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                El arte de defender la fe cristiana con razón, amor y respeto
              </p>
            </motion.div>
          </div>
        </section>

        {/* Scripture Quote */}
        <section className="py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden relative">
              <div className="absolute top-4 left-4 text-6xl text-primary/20 font-serif">"</div>
              <CardContent className="p-8 md:p-12 text-center relative z-10">
                <p className="text-xl md:text-2xl font-medium text-foreground mb-4 italic leading-relaxed">
                  "Estad siempre preparados para presentar defensa con mansedumbre y reverencia 
                  ante todo el que os demande razón de la esperanza que hay en vosotros."
                </p>
                <p className="text-primary font-semibold text-lg">
                  — 1 Pedro 3:15
                </p>
              </CardContent>
              <div className="absolute bottom-4 right-4 text-6xl text-primary/20 font-serif rotate-180">"</div>
            </Card>
          </motion.div>
        </section>

        {/* What is Apologetics */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                La Defensa Razonada de la Fe
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                La palabra "apologética" viene del griego <em>apología</em>, que significa "defensa". 
                No se trata de pedir disculpas, sino de dar razones de nuestra fe.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">¿Qué busca la apologética?</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Responder objeciones a la fe cristiana
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Presentar evidencias de la verdad del cristianismo
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Ayudar a creyentes a fortalecer su fe
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Remover obstáculos intelectuales para la fe
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">¿Qué NO es la apologética?</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        Ganar argumentos o humillar al otro
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        Imponer nuestras creencias por la fuerza
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        Demostrar que somos más inteligentes
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        Reemplazar la obra del Espíritu Santo
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Four Pillars */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Los Cuatro Pilares
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Una apologética efectiva se fundamenta en estos cuatro elementos esenciales
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar, index) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <pillar.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{pillar.title}</h3>
                      <p className="text-muted-foreground text-sm">{pillar.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Guide for Beginners */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Guía para Principiantes</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                5 Principios para Empezar
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Antes de profundizar en argumentos específicos, interioriza estos principios fundamentales
              </p>
            </motion.div>

            <div className="space-y-4">
              {principles.map((principle, index) => (
                <motion.div
                  key={principle.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{principle.number}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{principle.title}</h3>
                        <p className="text-muted-foreground">{principle.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-primary-foreground overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTJIMjR2MmgxMnpNMzYgMjR2LTJIMjR2MmgxMnpNMzYgMTR2LTJIMjR2MmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
              <CardContent className="p-8 md:p-12 relative z-10">
                <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  ¿Listo para comenzar tu formación?
                </h2>
                <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                  La Ruta del Apóstol te guiará paso a paso desde los fundamentos 
                  hasta convertirte en un defensor preparado de la fe.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="gap-2"
                    onClick={() => navigate('/apostle-path')}
                  >
                    Comenzar la Ruta
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => navigate('/library')}
                  >
                    Explorar Lecciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ApologeticsIntro;
