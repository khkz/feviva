import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FinalCTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">100% Gratis para comenzar</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Tu camino hacia{" "}
            <span className="text-gradient-gold">Dios</span>
            <br />
            comienza ahora
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            No esperes más. Miles de personas ya están transformando su vida espiritual. 
            <strong className="text-foreground"> Tu primera oración te espera.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl shadow-primary/25"
            >
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/5"
            >
              Ya tengo cuenta
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Acceso inmediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Menos de 1 min para empezar</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
