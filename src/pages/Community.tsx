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
import { motion } from "framer-motion";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CommentSection } from "@/components/community/CommentSection";
import { FeaturedTestimonials } from "@/components/community/FeaturedTestimonials";
import { ListRowsSkeleton } from "@/components/shared/PageSkeletons";

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
  const [openComments, setOpenComments] = useState<string | null>(null);

  useEffect(() => {
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
        tipo: newPostType as "testimonio" | "peticion_oracion" | "reflexion",
        contenido: newPostContent,
        estado: "publicado" as const,
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
      <div className="min-h-screen flex w-full bg-background">
        <DesktopSidebar />
        <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/60" />
            <div className="relative z-10 container mx-auto px-4 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-white/20 rounded animate-pulse" />
                  <div className="h-3 w-56 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <main className="container mx-auto px-4 py-8 max-w-3xl -mt-4 relative z-10">
            <ListRowsSkeleton count={6} />
          </main>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full animate-fade-in">
      <DesktopSidebar />
      <div className="flex-1 lg:ml-64 pb-20 md:pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/60" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
        
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 container mx-auto px-4 py-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-button text-foreground hover:bg-background/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold text-white">Comunidad</h1>
                <p className="text-white/80">Comparte y crece junto a otros creyentes</p>
              </div>
            </div>
            <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
              <DialogTrigger asChild>
                <Button className="glass-button bg-secondary/20 hover:bg-secondary/30 text-white border-secondary/30 gap-2">
                  <Send className="w-4 h-4" />
                  Nueva Publicación
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                  <DialogTitle>Compartir con la Comunidad</DialogTitle>
                  <DialogDescription>
                    Comparte un testimonio, petición de oración o reflexión
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={newPostType} onValueChange={setNewPostType}>
                    <SelectTrigger className="glass-button bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
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
                    className="glass-button bg-background/50"
                  />
                  <div className="glass-card p-3 rounded-lg text-sm text-muted-foreground">
                    💡 Recuerda mantener un tono respetuoso y edificante
                  </div>
                  <Button onClick={createPost} className="w-full shadow-glow">
                    Publicar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl -mt-4 relative z-10">
        <FeaturedTestimonials />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card border-border/50 text-center">
            <CardHeader>
              <CardTitle>El muro abierto llega pronto</CardTitle>
              <CardDescription>
                Estamos curando la comunidad para asegurar contenido edificante. Mientras tanto, disfruta de las Historias de Fe reales de arriba. Cuando alcancemos masa crítica, reactivaremos el feed de testimonios, peticiones y reflexiones.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </main>
      <BottomNavigation />
      </div>
    </div>
  );
};

export default Community;
