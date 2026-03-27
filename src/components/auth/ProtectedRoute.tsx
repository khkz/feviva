import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/shared/LoadingScreen";

/**
 * ProtectedRoute — única fuente de verdad para protección de rutas.
 * Escucha onAuthStateChange y redirige a /auth si no hay sesión.
 * Muestra LoadingScreen mientras verifica el estado de autenticación.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Set up listener FIRST (per Supabase best practices)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    );

    // 2. Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null || isAuthenticated === false) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
