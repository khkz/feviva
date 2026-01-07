import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FinalCTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Más de 5,000 usuarios activos</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Tu camino hacia{" "}
            <span className="text-gradient-gold">Dios</span>
            <br />
            comienza hoy
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Únete a miles de cristianos que están fortaleciendo su fe cada día. 
            Tu primera oración te está esperando.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
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
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Acceso inmediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Comunidad de apoyo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
