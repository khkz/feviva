import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const LandingFinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/95" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-3xl relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6"
        >
          Da razón de tu esperanza.{" "}
          <span className="text-gradient-gold">Empieza hoy.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-white/70 text-base md:text-lg mb-8 max-w-xl mx-auto"
        >
          10 minutos al día. Sin tarjeta. Empiezas en 30 segundos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="text-base md:text-lg px-10 py-7 bg-secondary hover:bg-secondary/90 text-primary font-bold shadow-2xl shadow-secondary/30 group"
          >
            Comenzar gratis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
