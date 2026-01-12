import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import { caminoPhases, getCurrentPhase, type CaminoPhase } from "@/lib/caminoDelLeonData";

interface CrossLinkSuggestion {
  title: string;
  description: string;
  path: string;
  phase: string;
  phaseColor: string;
}

interface CrossLinkBannerProps {
  currentPath: string;
  streakDays: number;
}

function getSuggestionsForPath(currentPath: string, currentPhase: CaminoPhase): CrossLinkSuggestion[] {
  const suggestions: Record<string, CrossLinkSuggestion[]> = {
    "/morning": [
      { title: "Diario de Gratitud", description: "Continúa tu mañana anotando bendiciones", path: "/gratitude", phase: "DESPERTAR", phaseColor: "text-amber-400" },
      { title: "Biblia en 365 días", description: "Lee el pasaje del día", path: "/bible-plan", phase: "APRENDER", phaseColor: "text-blue-400" },
    ],
    "/evening": [
      { title: "Sleep Stories", description: "Descansa con historias bíblicas", path: "/sleep-stories", phase: "DESPERTAR", phaseColor: "text-amber-400" },
      { title: "Diario de Gratitud", description: "Cierra el día con gratitud", path: "/gratitude", phase: "DESPERTAR", phaseColor: "text-amber-400" },
    ],
    "/gratitude": [
      { title: "Ritual Matutino", description: "Inicia tu día con oración", path: "/morning", phase: "DESPERTAR", phaseColor: "text-amber-400" },
      { title: "Novenas", description: "Profundiza tu intercesión", path: "/novenas", phase: "ORAR", phaseColor: "text-rose-400" },
    ],
    "/bible-plan": [
      { title: "Biblioteca", description: "Lecciones que expanden la lectura", path: "/library", phase: "APRENDER", phaseColor: "text-blue-400" },
      { title: "Coach IA", description: "Practica defender lo aprendido", path: "/coach", phase: "DEFENDER", phaseColor: "text-emerald-400" },
    ],
    "/library": [
      { title: "Apologética 101", description: "Aplica lo aprendido", path: "/apologetics-intro", phase: "DEFENDER", phaseColor: "text-emerald-400" },
      { title: "Ruta del Apóstol", description: "Sigue un camino estructurado", path: "/apostle-path", phase: "DEFENDER", phaseColor: "text-emerald-400" },
    ],
    "/coach": [
      { title: "Tarjetas de Argumentos", description: "Refuerza con tarjetas", path: "/cards", phase: "DEFENDER", phaseColor: "text-emerald-400" },
      { title: "Comunidad", description: "Comparte tus experiencias", path: "/community", phase: "TRASCENDER", phaseColor: "text-violet-400" },
    ],
    "/oraciones/app": [
      { title: "Novenas", description: "9 días de oración profunda", path: "/novenas", phase: "ORAR", phaseColor: "text-rose-400" },
      { title: "Evangelio del Día", description: "Escucha la Palabra", path: "/evangelio", phase: "ORAR", phaseColor: "text-rose-400" },
    ],
    "/novenas": [
      { title: "Oraciones Guiadas", description: "Más oraciones para ti", path: "/oraciones/app", phase: "ORAR", phaseColor: "text-rose-400" },
      { title: "Diario de Gratitud", description: "Registra lo que Dios hace", path: "/gratitude", phase: "DESPERTAR", phaseColor: "text-amber-400" },
    ],
    "/frontera-final": [
      { title: "Biblioteca", description: "Profundiza en apologética", path: "/library", phase: "APRENDER", phaseColor: "text-blue-400" },
      { title: "Coach IA", description: "Practica estos temas", path: "/coach", phase: "DEFENDER", phaseColor: "text-emerald-400" },
    ],
    "/sleep-stories": [
      { title: "Ritual Nocturno", description: "Completas antes de dormir", path: "/evening", phase: "DESPERTAR", phaseColor: "text-amber-400" },
      { title: "Salmos Orbitales", description: "Meditación cósmica", path: "/frontera-final", phase: "ORAR", phaseColor: "text-rose-400" },
    ],
  };

  return suggestions[currentPath] || [
    { title: "Ritual Matutino", description: "Comienza con oración", path: "/morning", phase: "DESPERTAR", phaseColor: "text-amber-400" },
    { title: "Biblia en 365 días", description: "Sumérgete en la Palabra", path: "/bible-plan", phase: "APRENDER", phaseColor: "text-blue-400" },
  ];
}

export function CrossLinkBanner({ currentPath, streakDays }: CrossLinkBannerProps) {
  const navigate = useNavigate();
  const currentPhase = getCurrentPhase(streakDays);
  const suggestions = getSuggestionsForPath(currentPath, currentPhase);

  if (suggestions.length === 0) return null;

  const suggestion = suggestions[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-6"
    >
      <button
        onClick={() => navigate(suggestion.path)}
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-semibold uppercase tracking-wider ${suggestion.phaseColor}`}>
                  {suggestion.phase}
                </span>
              </div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Continúa con: {suggestion.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {suggestion.description}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </motion.div>
  );
}
