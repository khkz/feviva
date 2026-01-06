import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import heroBackground from "@/assets/hero-background.jpg";

interface HeroSectionProps {
  userName: string;
  verse?: {
    text: string;
    reference: string;
  };
}

export function HeroSection({ userName, verse }: HeroSectionProps) {
  return (
    <section className="relative h-[45vh] min-h-[320px] overflow-hidden">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={heroBackground}
          alt="Contemplative mountain landscape"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="glass-hero absolute inset-0" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-5 pb-8">
        {/* Logo */}
        <motion.div 
          className="absolute top-5 left-5 flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass-button rounded-full p-2">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <span className="text-foreground/80 font-semibold text-lg">FeViva</span>
        </motion.div>

        {/* Greeting Card */}
        <motion.div 
          className="glass-card rounded-2xl p-5 mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-white/70 text-sm mb-1">Buenos días</p>
          <h1 className="font-heading text-2xl font-bold text-white">
            {userName || "Peregrino"}
          </h1>
        </motion.div>

        {/* Verse of the Day */}
        {verse && (
          <motion.div 
            className="glass-card rounded-xl p-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-white/90 text-sm italic leading-relaxed">
              "{verse.text}"
            </p>
            <p className="text-white/60 text-xs mt-2">— {verse.reference}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
