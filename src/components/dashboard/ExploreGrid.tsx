import { useNavigate } from "react-router-dom";
import { MessageCircle, BookOpen, Users, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ExploreItem {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  image: string;
}

const exploreItems: ExploreItem[] = [
  {
    icon: MessageCircle,
    label: "Coach IA",
    description: "Practica debates",
    path: "/coach",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80"
  },
  {
    icon: BookOpen,
    label: "Biblioteca",
    description: "Lecciones de fe",
    path: "/library",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&auto=format&fit=crop&q=80"
  },
  {
    icon: Users,
    label: "Comunidad",
    description: "Comparte y ora",
    path: "/community",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80"
  },
  {
    icon: Target,
    label: "Hábitos",
    description: "Crece cada día",
    path: "/habits",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop&q=80"
  },
];

export function ExploreGrid() {
  const navigate = useNavigate();

  return (
    <section className="px-5 py-4">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
        Explora
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {exploreItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="relative h-32 rounded-2xl overflow-hidden transition-smooth hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Background Image */}
            <img
              src={item.image}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-3">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-4 h-4 text-white/90" />
                <span className="font-semibold text-white text-sm">{item.label}</span>
              </div>
              <p className="text-white/70 text-xs">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
