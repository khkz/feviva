import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Heart, MessageCircle, Send, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Post {
  id: string;
  user_id: string;
  tipo: string;
  contenido: string;
  estado: string;
  likes_count: number;
  created_at: string;
  profiles?: {
    nombre: string;
  };
}

const postTypeLabels = {
  testimonio: "Testimonio",
  peticion_oracion: "Petición de Oración",
  reflexion: "Reflexión",
};

const postTypeColors = {
  testimonio: "secondary",
  peticion_oracion: "destructive",
  reflexion: "default",
};

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState("testimonio");
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    checkAuth();
    loadPosts();
    
    // Subscribe to new posts
    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          nombre
        )
      `)
      .eq("estado", "publicado")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading posts:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const createPost = async () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Error",
        description: "El contenido no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("posts")
      .insert({
        user_id: session.user.id,
        tipo: newPostType,
        contenido: newPostContent,
        estado: "publicado",
      });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "¡Publicado!",
      description: "Tu mensaje ha sido compartido con la comunidad",
    });

    setNewPostContent("");
    setShowNewPost(false);
    loadPosts();
  };

  const likePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const { error } = await supabase
      .from("posts")
      .update({ likes_count: post.likes_count + 1 })
      .eq("id", postId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo dar me gusta",
        variant: "destructive",
      });
      return;
    }

    loadPosts();
  };

  const filteredPosts = selectedType === "all" 
    ? posts 
    : posts.filter(p => p.tipo === selectedType);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Users className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent">
      <header className="bg-primary text-white shadow-medium">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-secondary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-secondary" />
              <div>
                <h1 className="font-heading text-3xl font-bold">Comunidad</h1>
                <p className="text-white/80">Comparte y crece junto a otros creyentes</p>
              </div>
            </div>
            <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <Send className="w-4 h-4" />
                  Nueva Publicación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Compartir con la Comunidad</DialogTitle>
                  <DialogDescription>
                    Comparte un testimonio, petición de oración o reflexión
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={newPostType} onValueChange={setNewPostType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="testimonio">Testimonio</SelectItem>
                      <SelectItem value="peticion_oracion">Petición de Oración</SelectItem>
                      <SelectItem value="reflexion">Reflexión</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    rows={6}
                  />
                  <div className="bg-accent p-3 rounded text-sm text-muted-foreground">
                    💡 Recuerda mantener un tono respetuoso y edificante
                  </div>
                  <Button onClick={createPost} className="w-full">
                    Publicar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="testimonio">Testimonios</TabsTrigger>
            <TabsTrigger value="peticion_oracion">Oración</TabsTrigger>
            <TabsTrigger value="reflexion">Reflexiones</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredPosts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay publicaciones aún</CardTitle>
              <CardDescription>
                Sé el primero en compartir algo con la comunidad
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-medium transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {post.profiles?.nombre?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{post.profiles?.nombre || "Anónimo"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant={postTypeColors[post.tipo as keyof typeof postTypeColors] as any}>
                      {postTypeLabels[post.tipo as keyof typeof postTypeLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap">{post.contenido}</p>
                  
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likePost(post.id)}
                      className="gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {post.likes_count > 0 && <span>{post.likes_count}</span>}
                    </Button>
                    
                    {post.tipo === "peticion_oracion" && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4 text-secondary" />
                        <span>Orando por ti</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Community;