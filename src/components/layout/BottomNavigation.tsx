import { Link, useLocation } from "react-router-dom";
import { Home, Hand, BookOpen, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Inicio" },
  { path: "/oraciones/app", icon: Hand, label: "Orar" },
  { path: "/library", icon: BookOpen, label: "Aprender" },
  { path: "/santos/app", icon: Sparkles, label: "Santos" },
  { path: "/profile", icon: User, label: "Perfil" },
];

export function BottomNavigation() {
  const location = useLocation();

  const getActiveIndex = () => {
    return navItems.findIndex((item) => 
      location.pathname === item.path || 
      (item.path === "/oraciones/app" && ["/oraciones/app", "/rosario", "/novenas", "/novenas/app", "/sleep-stories"].includes(location.pathname)) ||
      (item.path === "/library" && ["/library", "/apostle-path", "/bible-plan", "/coach"].some((path) => location.pathname.startsWith(path))) ||
      (item.path === "/santos/app" && ["/santos", "/santos/app", "/santo"].some((path) => location.pathname.startsWith(path)))
    );
  };

  const activeIndex = getActiveIndex();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-inset-bottom lg:hidden">
      <div className="relative flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {/* Animated pill indicator */}
        {activeIndex >= 0 && (
          <motion.div
            className="absolute bottom-1 h-1 w-10 bg-primary rounded-full"
            layoutId="activeTabIndicator"
            initial={false}
            animate={{
              x: `calc(${activeIndex * 100}% + ${activeIndex * 0.4}rem)`,
            }}
            style={{
              left: `calc(10% + ${activeIndex * 20}% - 1.25rem)`,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
            }}
          />
        )}
        
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-smooth min-w-[44px] min-h-[44px]",
                "active:scale-95 active:opacity-80",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div 
                className={cn(
                  "p-2 rounded-xl transition-smooth",
                  isActive && "bg-primary/10"
                )}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <item.icon 
                  className="w-5 h-5 transition-smooth"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium transition-smooth",
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
