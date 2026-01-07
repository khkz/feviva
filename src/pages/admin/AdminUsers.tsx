import { useState, useEffect } from 'react';
import { Search, MoreVertical, Shield, User, Crown, Activity, Trophy, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';
import { UserActivityModal } from '@/components/admin/UserActivityModal';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  nombre: string;
  email: string | null;
  created_at: string;
  roles: AppRole[];
  stats?: {
    puntos_totales: number;
    nivel: number;
    racha_actual_dias: number;
    ultima_actividad: string | null;
  };
}

const roleIcons: Record<AppRole, React.ReactNode> = {
  admin: <Crown className="h-3 w-3" />,
  moderator: <Shield className="h-3 w-3" />,
  revisor_teologico: <Shield className="h-3 w-3" />,
  lider_iglesia: <Shield className="h-3 w-3" />,
  user: <User className="h-3 w-3" />
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-500/10 text-red-500',
  moderator: 'bg-blue-500/10 text-blue-500',
  revisor_teologico: 'bg-purple-500/10 text-purple-500',
  lider_iglesia: 'bg-green-500/10 text-green-500',
  user: 'bg-gray-500/10 text-gray-500'
};

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nombre, email, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch user stats
      const { data: allStats } = await supabase
        .from('user_stats')
        .select('user_id, puntos_totales, nivel, racha_actual_dias, ultima_actividad');

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userStats = allStats?.find(s => s.user_id === profile.id);
        return {
          ...profile,
          roles: roles?.filter(r => r.user_id === profile.id).map(r => r.role) || ['user'],
          stats: userStats ? {
            puntos_totales: userStats.puntos_totales,
            nivel: userStats.nivel,
            racha_actual_dias: userStats.racha_actual_dias,
            ultima_actividad: userStats.ultima_actividad
          } : undefined
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId: string, role: AppRole, hasRole: boolean) => {
    try {
      if (hasRole) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
      } else {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
      }
      
      await fetchUsers();
      toast({
        title: "Éxito",
        description: `Rol ${hasRole ? 'removido' : 'asignado'} correctamente`
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Badge variant="outline">{users.length} usuarios</Badge>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-center">Nivel</TableHead>
                <TableHead className="text-center">Puntos</TableHead>
                <TableHead className="text-center">Racha</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map(role => (
                        <Badge 
                          key={role} 
                          variant="secondary"
                          className={roleColors[role]}
                        >
                          {roleIcons[role]}
                          <span className="ml-1">{role}</span>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.stats ? (
                      <Badge variant="outline" className="bg-primary/10">
                        <Trophy className="h-3 w-3 mr-1" />
                        {user.stats.nivel}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.stats ? (
                      <span className="font-medium">{user.stats.puntos_totales}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.stats && user.stats.racha_actual_dias > 0 ? (
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                        <Flame className="h-3 w-3 mr-1" />
                        {user.stats.racha_actual_dias}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedUserName(user.nombre);
                        }}
                        title="Ver actividad"
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(['admin', 'moderator', 'revisor_teologico', 'lider_iglesia'] as AppRole[]).map(role => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => toggleRole(user.id, role, user.roles.includes(role))}
                            >
                              {user.roles.includes(role) ? `Quitar ${role}` : `Asignar ${role}`}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserActivityModal 
        userId={selectedUserId}
        userName={selectedUserName}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
};
