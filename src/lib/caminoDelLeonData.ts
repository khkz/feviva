import { Sunrise, BookHeart, Scroll, Sword, Crown, type LucideIcon } from "lucide-react";

export interface CaminoPhase {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  features: {
    name: string;
    path: string;
    description: string;
  }[];
  unlockRequirement: {
    type: 'days' | 'activities' | 'points';
    value: number;
  };
}

export const caminoPhases: CaminoPhase[] = [
  {
    id: 1,
    name: "DESPERTAR",
    subtitle: "El León abre los ojos",
    description: "Comienza tu viaje espiritual con rituales diarios y gratitud. Establece los cimientos de una vida de fe.",
    icon: Sunrise,
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 to-orange-500/20",
    features: [
      { name: "Ritual Matutino", path: "/morning", description: "Laudes y versículo del día" },
      { name: "Diario de Gratitud", path: "/gratitude", description: "3 bendiciones diarias" },
      { name: "Ritual Nocturno", path: "/evening", description: "Completas y examen de conciencia" },
      { name: "Sleep Stories", path: "/sleep-stories", description: "Descansa en paz" },
    ],
    unlockRequirement: { type: 'days', value: 0 }
  },
  {
    id: 2,
    name: "ORAR",
    subtitle: "El León ruge al cielo",
    description: "Profundiza tu conversación con Dios a través de la oración contemplativa y las devociones.",
    icon: BookHeart,
    color: "text-rose-400",
    bgGradient: "from-rose-500/20 to-pink-500/20",
    features: [
      { name: "Oraciones Guiadas", path: "/oraciones/app", description: "Oraciones con audio" },
      { name: "Novenas", path: "/novenas", description: "9 días de intercesión" },
      { name: "Evangelio del Día", path: "/evangelio", description: "Palabra diaria" },
      { name: "Salmos Orbitales", path: "/frontera-final", description: "Meditación cósmica" },
    ],
    unlockRequirement: { type: 'days', value: 3 }
  },
  {
    id: 3,
    name: "APRENDER",
    subtitle: "El León estudia la Palabra",
    description: "Sumérgete en las Escrituras y la doctrina cristiana para conocer mejor a quien amas.",
    icon: Scroll,
    color: "text-blue-400",
    bgGradient: "from-blue-500/20 to-indigo-500/20",
    features: [
      { name: "Biblia en 1 Año", path: "/bible", description: "365 días de lectura" },
      { name: "Biblioteca", path: "/library", description: "40+ lecciones en audio" },
      { name: "Frontera Final", path: "/frontera-final", description: "Fe y ciencia" },
      { name: "Apologética 101", path: "/apologetics-intro", description: "10 objeciones comunes" },
    ],
    unlockRequirement: { type: 'days', value: 7 }
  },
  {
    id: 4,
    name: "DEFENDER",
    subtitle: "El León protege la fe",
    description: "Aprende a defender tu fe con verdad, razón y amor. Prepárate para conversaciones difíciles.",
    icon: Sword,
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 to-teal-500/20",
    features: [
      { name: "Coach IA", path: "/coach", description: "Entrena con inteligencia artificial" },
      { name: "Ruta del Apóstol", path: "/apostle-path", description: "12 etapas de formación" },
      { name: "Historial de Debates", path: "/debate-history", description: "Revisa tus prácticas" },
      { name: "Tarjetas de Argumentos", path: "/cards", description: "Respuestas organizadas" },
    ],
    unlockRequirement: { type: 'days', value: 14 }
  },
  {
    id: 5,
    name: "TRASCENDER",
    subtitle: "El León guía al rebaño",
    description: "Comparte tu fe con otros y construye comunidad. El verdadero discípulo hace discípulos.",
    icon: Crown,
    color: "text-violet-400",
    bgGradient: "from-violet-500/20 to-purple-500/20",
    features: [
      { name: "Comunidad", path: "/community", description: "Conecta con otros creyentes" },
      { name: "Invita Amigos", path: "/profile", description: "Expande el Reino" },
      { name: "Logros", path: "/gamification", description: "Celebra tu progreso" },
      { name: "Misión", path: "/mission", description: "Tu llamado personal" },
    ],
    unlockRequirement: { type: 'days', value: 30 }
  },
];

export function getCurrentPhase(streakDays: number): CaminoPhase {
  // Find the highest phase the user has unlocked
  const unlockedPhases = caminoPhases.filter(
    phase => streakDays >= phase.unlockRequirement.value
  );
  return unlockedPhases[unlockedPhases.length - 1] || caminoPhases[0];
}

export function getPhaseProgress(streakDays: number, currentPhase: CaminoPhase): number {
  const currentPhaseIndex = caminoPhases.findIndex(p => p.id === currentPhase.id);
  const nextPhase = caminoPhases[currentPhaseIndex + 1];
  
  if (!nextPhase) return 100; // Max phase reached
  
  const daysInCurrentPhase = streakDays - currentPhase.unlockRequirement.value;
  const daysNeededForNext = nextPhase.unlockRequirement.value - currentPhase.unlockRequirement.value;
  
  return Math.min(100, Math.round((daysInCurrentPhase / daysNeededForNext) * 100));
}

export function getDaysToNextPhase(streakDays: number, currentPhase: CaminoPhase): number | null {
  const currentPhaseIndex = caminoPhases.findIndex(p => p.id === currentPhase.id);
  const nextPhase = caminoPhases[currentPhaseIndex + 1];
  
  if (!nextPhase) return null;
  
  return nextPhase.unlockRequirement.value - streakDays;
}
