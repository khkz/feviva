import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Heart, Users, Eye, Trash2, CheckCircle, Clock, Search, Filter, MessageCircle, XCircle } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { useCommentModeration } from '@/hooks/useCommentModeration';

type PostType = 'testimonio' | 'peticion_oracion' | 'reflexion';
type PostEstado = 'borrador' | 'revisado' | 'publicado';

interface Post {
  id: string;
  user_id: string;
  tipo: PostType;
  contenido: string;
  estado: PostEstado;
  likes_count: number;
  created_at: string;
  profiles?: {
    nombre: string;
    email: string;
  };
}

const tipoLabels: Record<PostType, string> = {
  testimonio: 'Testimonio',
  peticion_oracion: 'Petición de Oración',
  reflexion: 'Reflexión',
};

const tipoColors: Record<PostType, string> = {
  testimonio: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  peticion_oracion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  reflexion: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const estadoLabels: Record<PostEstado, string> = {
  borrador: 'Borrador',
  revisado: 'Revisado',
  publicado: 'Publicado',
};

const estadoColors: Record<PostEstado, string> = {
  borrador: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  revisado: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  publicado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function AdminCommunity() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const { comments, isLoading: loadingComments, updateStatus: updateCommentStatus, deleteComment } = useCommentModeration();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (nombre, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: PostEstado }) => {
      const { error } = await supabase
        .from('posts')
        .update({ estado })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Post actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el post');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setPostToDelete(null);
      toast.success('Post eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar el post');
    },
  });

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.profiles?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || post.tipo === filterTipo;
    const matchesEstado = filterEstado === 'all' || post.estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const stats = {
    total: posts.length,
    publicados: posts.filter((p) => p.estado === 'publicado').length,
    pendientes: posts.filter((p) => p.estado !== 'publicado').length,
    testimonios: posts.filter((p) => p.tipo === 'testimonio').length,
    peticiones: posts.filter((p) => p.tipo === 'peticion_oracion').length,
    reflexiones: posts.filter((p) => p.tipo === 'reflexion').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comunidad</h1>
        <p className="text-muted-foreground">Gestiona los posts de la comunidad</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard title="Total Posts" value={stats.total} icon={MessageSquare} />
        <StatCard title="Publicados" value={stats.publicados} icon={CheckCircle} />
        <StatCard title="Pendientes" value={stats.pendientes} icon={Clock} />
        <StatCard title="Testimonios" value={stats.testimonios} icon={Heart} />
        <StatCard title="Peticiones" value={stats.peticiones} icon={Users} />
        <StatCard title="Reflexiones" value={stats.reflexiones} icon={MessageSquare} />
        <StatCard title="Comentarios" value={comments.length} icon={MessageCircle} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por contenido o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="testimonio">Testimonios</SelectItem>
                <SelectItem value="peticion_oracion">Peticiones</SelectItem>
                <SelectItem value="reflexion">Reflexiones</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="revisado">Revisado</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Contenido</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="hidden md:table-cell">Likes</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Cargando posts...
                  </TableCell>
                </TableRow>
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron posts
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      {post.profiles?.nombre || 'Usuario'}
                    </TableCell>
                    <TableCell>
                      <Badge className={tipoColors[post.tipo]} variant="secondary">
                        {tipoLabels[post.tipo]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {post.contenido.substring(0, 60)}...
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoColors[post.estado]} variant="secondary">
                        {estadoLabels[post.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(post.created_at), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes_count || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPost(post)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPostToDelete(post)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead className="hidden md:table-cell">Post</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingComments ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Cargando comentarios...
                      </TableCell>
                    </TableRow>
                  ) : comments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay comentarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    comments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell className="font-medium">
                          {comment.profiles?.nombre || 'Usuario'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {comment.contenido.substring(0, 50)}...
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge className={tipoColors[comment.posts?.tipo as PostType] || ''} variant="secondary">
                            {tipoLabels[comment.posts?.tipo as PostType] || 'Post'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={estadoColors[comment.estado]} variant="secondary">
                            {estadoLabels[comment.estado]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(comment.created_at), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {comment.estado !== 'publicado' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateCommentStatus.mutate({ id: comment.id, estado: 'publicado' })}
                                title="Publicar"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {comment.estado === 'publicado' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateCommentStatus.mutate({ id: comment.id, estado: 'revisado' })}
                                title="Ocultar"
                              >
                                <XCircle className="h-4 w-4 text-orange-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCommentToDelete(comment.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Post Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPost && (
                <Badge className={tipoColors[selectedPost.tipo]} variant="secondary">
                  {tipoLabels[selectedPost.tipo]}
                </Badge>
              )}
              Post de {selectedPost?.profiles?.nombre || 'Usuario'}
            </DialogTitle>
            <DialogDescription>
              {selectedPost && format(new Date(selectedPost.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="whitespace-pre-wrap">{selectedPost?.contenido}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {selectedPost?.likes_count || 0} likes
              </span>
              <span>Estado: {selectedPost?.estado && estadoLabels[selectedPost.estado]}</span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedPost?.estado !== 'publicado' && (
              <Button
                onClick={() => {
                  updateMutation.mutate({ id: selectedPost!.id, estado: 'publicado' });
                  setSelectedPost(null);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Publicar
              </Button>
            )}
            {selectedPost?.estado === 'publicado' && (
              <Button
                variant="outline"
                onClick={() => {
                  updateMutation.mutate({ id: selectedPost!.id, estado: 'revisado' });
                  setSelectedPost(null);
                }}
              >
                Ocultar
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSelectedPost(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El post será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && deleteMutation.mutate(postToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (commentToDelete) {
                  deleteComment.mutate(commentToDelete);
                  setCommentToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
