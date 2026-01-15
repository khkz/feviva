import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Music, Headphones, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { MusicVideoCard } from "@/components/music/MusicVideoCard";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Button } from "@/components/ui/button";

const graceForTheWorld = [
  {
    id: "grace-1",
    videoId: "ZT_Yz4gUQbg",
    title: "Grace for the World - Parte 1",
    description: "Una experiencia musical católica que eleva el espíritu y conecta con lo divino a través de melodías inspiradoras.",
    duration: "45:32"
  },
  {
    id: "grace-2",
    videoId: "DdErGPjSJ1A",
    title: "Grace for the World - Parte 2",
    description: "Continúa tu viaje espiritual con la segunda parte de esta hermosa colección de música sacra.",
    duration: "48:15"
  }
];

export default function Musica() {
  return (
    <>
      <Helmet>
        <title>Música Católica - Grace for the World | El Rugido</title>
        <meta 
          name="description" 
          content="Escucha música católica inspiradora. Grace for the World - una experiencia musical que eleva el espíritu." 
        />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        <DesktopSidebar />
        
        <main className="flex-1 lg:ml-72 pb-20 lg:pb-8">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-primary/10 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent" />
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-20 right-10 text-amber-400/30"
            >
              <Music className="w-24 h-24" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-10 left-10 text-primary/20"
            >
              <Headphones className="w-20 h-20" />
            </motion.div>

            {/* Content */}
            <div className="relative px-4 py-12 md:py-20">
              <div className="max-w-4xl mx-auto text-center">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                </Link>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Música para el Alma
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                >
                  <span className="bg-gradient-to-r from-amber-500 via-primary to-amber-600 bg-clip-text text-transparent">
                    Grace for the World
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                  Una experiencia musical católica que trasciende fronteras. 
                  Déjate envolver por melodías que elevan el espíritu y conectan con lo sagrado.
                </motion.p>
              </div>
            </div>
          </section>

          {/* Videos Section */}
          <section className="px-4 py-8 md:py-12">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-6 md:grid-cols-2">
                {graceForTheWorld.map((video, index) => (
                  <MusicVideoCard
                    key={video.id}
                    videoId={video.videoId}
                    title={video.title}
                    description={video.description}
                    duration={video.duration}
                    index={index}
                  />
                ))}
              </div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Headphones className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Sobre esta Colección</h3>
                    <p className="mt-2 text-muted-foreground">
                      "Grace for the World" es una serie de composiciones musicales católicas 
                      diseñadas para acompañar momentos de oración, meditación y reflexión. 
                      Perfecta para crear un ambiente de paz y conexión espiritual en tu hogar.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <BottomNavigation />
      </div>
    </>
  );
}
