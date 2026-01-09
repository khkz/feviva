import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  BarChart3,
  Film,
  GraduationCap,
  Radio,
  ArrowLeft,
  Loader2,
  Library,
  Sunrise,
  Heart,
  Gift,
  BookHeart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/users', icon: Users, label: 'Usuarios' },
  { path: '/admin/community', icon: MessageSquare, label: 'Comunidad' },
  { path: '/admin/content', icon: FileText, label: 'Contenido' },
  { path: '/admin/daily-content', icon: Sunrise, label: 'Contenido Diario' },
  { path: '/admin/oraciones', icon: BookHeart, label: 'Oraciones' },
  { path: '/admin/gratitude', icon: Heart, label: 'Gratitud' },
  { path: '/admin/invitations', icon: Gift, label: 'Invitaciones' },
  { path: '/admin/courses', icon: GraduationCap, label: 'Cursos' },
  { path: '/admin/movies', icon: Film, label: 'Películas' },
  { path: '/admin/live', icon: Radio, label: 'En Vivo' },
  { path: '/admin/media', icon: Library, label: 'Media' },
  { path: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
  { path: '/admin/processing', icon: Settings, label: 'Procesamiento' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export const AdminLayout = () => {
  const { isModerator, loading } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isModerator) {
      navigate('/dashboard');
    }
  }, [loading, isModerator, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-bold text-lg">Panel Admin</h1>
          </div>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="h-8 w-8 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:p-6 p-4 pt-16 md:pt-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
