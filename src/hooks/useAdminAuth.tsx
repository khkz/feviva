import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roles) {
          const roleNames = roles.map(r => r.role);
          setIsAdmin(roleNames.includes('admin'));
          setIsModerator(roleNames.includes('moderator') || roleNames.includes('admin'));
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  const requireAdmin = () => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  };

  const requireModerator = () => {
    if (!loading && !isModerator) {
      navigate('/dashboard');
    }
  };

  return { isAdmin, isModerator, loading, userId, requireAdmin, requireModerator };
};
