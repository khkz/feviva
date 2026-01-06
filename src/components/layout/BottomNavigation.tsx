import { Link, useLocation } from "react-router-dom";
import { Home, Compass, BookOpen, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Inicio" },
  { path: "/oraciones", icon: Compass, label: "Orar" },
  { path: "/library", icon: BookOpen, label: "Aprender" },
  { path: "/community", icon: Users, label: "Comunidad" },
  { path: "/profile", icon: User, label: "Perfil" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/oraciones" && ["/oraciones", "/rosario", "/novenas"].includes(location.pathname));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-smooth",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-smooth",
                isActive && "active-glow bg-primary/10"
              )}>
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-smooth",
                    isActive && "scale-110"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
