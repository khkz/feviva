import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  BookOpen, 
  Hand, 
  Flame, 
  MessageCircle, 
  Moon, 
  Users, 
  User, 
  Target,
  Trophy,
  ChevronRight,
  Route,
  Flower2,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoElRugido from "@/assets/logo-elrugido.svg";

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
}

const mainNavItems: NavItem[] = [
  { path: "/dashboard", icon: Home, label: "Inicio" },
  { path: "/apostle-path", icon: Route, label: "Ruta del Apóstol" },
  { path: "/bible-plan", icon: BookOpen, label: "Biblia 365" },
  { path: "/oraciones/app", icon: Hand, label: "Oraciones" },
  { path: "/rosario", icon: Flower2, label: "Rosario" },
  { path: "/novenas", icon: Flame, label: "Novenas" },
  { path: "/sleep-stories", icon: Moon, label: "Dormir" },
];

const secondaryNavItems: NavItem[] = [
  { path: "/coach", icon: MessageCircle, label: "Coach de Fe" },
  { path: "/library", icon: GraduationCap, label: "Biblioteca" },
  { path: "/habits", icon: Target, label: "Hábitos" },
  { path: "/community", icon: Users, label: "Comunidad" },
  { path: "/gamification", icon: Trophy, label: "Logros" },
];

interface DesktopSidebarProps {
  userName?: string;
  userLevel?: number;
  userStreak?: number;
}

export function DesktopSidebar({ userName = "Peregrino", userLevel = 1, userStreak = 0 }: DesktopSidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 glass-sidebar border-r border-border/30 z-40"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border/20">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <motion.img 
            src={logoElRugido}
            alt="ElRugido"
            className="w-10 h-10"
            whileHover={{ scale: 1.05, rotate: 5 }}
          />
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              ElRugido
            </span>
            <span className="text-[10px] text-muted-foreground">elrugido.com</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-6">
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Principal
          </p>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-medium" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive && "text-secondary"
                  )} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      className="ml-auto"
                      layoutId="activeIndicator"
                    >
                      <ChevronRight className="w-4 h-4 text-secondary" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Explorar
          </p>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-medium" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive && "text-secondary"
                  )} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border/20">
        <Link 
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
              {userLevel}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {userStreak} días de racha
            </p>
          </div>
        </Link>
      </div>
    </motion.aside>
  );
}
