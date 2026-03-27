import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Cloud, Flame, Battery, Sparkles } from "lucide-react";
import { EmergencyKit } from "./EmergencyKit";

export type SoulState = "ansioso" | "agradecido" | "triste" | "tentacion" | "agotado";

interface SoulOption {
  id: SoulState;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  verse: { text: string; reference: string };
}

const SOUL_OPTIONS: SoulOption[] = [
  {
    id: "ansioso",
    label: "Ansioso",
    icon: <Cloud className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
    verse: {
      text: "No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios.",
      reference: "Filipenses 4:6",
    },
  },
  {
    id: "agradecido",
    label: "Agradecido",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-secondary",
    bgColor: "bg-secondary/10 hover:bg-secondary/20 border-secondary/20",
    verse: {
      text: "Den gracias en todo, porque esta es la voluntad de Dios para ustedes en Cristo Jesús.",
      reference: "1 Tesalonicenses 5:18",
    },
  },
  {
    id: "triste",
    label: "Triste",
    icon: <Heart className="w-5 h-5" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
    verse: {
      text: "El Señor está cerca de los quebrantados de corazón, y salva a los de espíritu abatido.",
      reference: "Salmo 34:18",
    },
  },
  {
    id: "tentacion",
    label: "En Tentación",
    icon: <Flame className="w-5 h-5" />,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20",
    verse: {
      text: "No os ha sobrevenido ninguna tentación que no sea humana; pero fiel es Dios, que no os dejará ser tentados más de lo que podéis resistir.",
      reference: "1 Corintios 10:13",
    },
  },
  {
    id: "agotado",
    label: "Agotado",
    icon: <Battery className="w-5 h-5" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
    verse: {
      text: "Vengan a mí todos ustedes que están cansados y agobiados, y yo les daré descanso.",
      reference: "Mateo 11:28",
    },
  },
];

export function SoulTriageHero() {
  const [selectedState, setSelectedState] = useState<SoulState | null>(null);
  const selectedOption = SOUL_OPTIONS.find((o) => o.id === selectedState);

  return (
    <section className="px-5 lg:px-0 mb-6">
      <motion.div
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-card to-secondary/5 border border-border/50 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-5 pb-4">
          {/* Header */}
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 font-medium">
              Triaje Espiritual
            </p>
            <h2 className="font-heading text-lg font-bold text-foreground">
              ¿Cómo está tu alma hoy?
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Toca lo que sientes. Te preparamos un botiquín de paz.
            </p>
          </motion.div>

          {/* Emotion Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {SOUL_OPTIONS.map((option, i) => {
              const isSelected = selectedState === option.id;
              return (
                <motion.button
                  key={option.id}
                  onClick={() =>
                    setSelectedState(isSelected ? null : option.id)
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? `${option.bgColor} ${option.color} ring-1 ring-current/30 scale-105`
                      : `${option.bgColor} ${option.color}`
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: isSelected ? 1.05 : 1 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.icon}
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Emergency Kit - slides down when state selected */}
        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <EmergencyKit
                soulState={selectedOption.id}
                verse={selectedOption.verse}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
