import { useNavigate } from "react-router-dom";
import { Hand, BookOpen, Flame, MessageCircle } from "lucide-react";

const actions = [
  { 
    icon: Hand, 
    label: "Orar", 
    path: "/oraciones",
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  { 
    icon: BookOpen, 
    label: "Rosario", 
    path: "/rosario",
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  { 
    icon: Flame, 
    label: "Novenas", 
    path: "/novenas",
    gradient: "from-red-500/20 to-pink-500/20"
  },
  { 
    icon: MessageCircle, 
    label: "Coach", 
    path: "/coach",
    gradient: "from-emerald-500/20 to-teal-500/20"
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <section className="px-5 -mt-4 relative z-20">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="glass-button flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[80px] transition-smooth hover:scale-105 active:scale-95"
          >
            <div className={`p-3 rounded-full bg-gradient-to-br ${action.gradient}`}>
              <action.icon className="w-6 h-6 text-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground/80">{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
