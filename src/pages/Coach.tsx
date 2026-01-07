import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, ArrowLeft, Send, BookOpen, Heart, Brain, TrendingUp, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Evaluation {
  fe: number;
  razon: number;
  amor: number;
  feedback: string;
}

interface Suggestion {
  sugerencias: Array<{
    categoria: "Fe" | "Razón" | "Amor";
    titulo: string;
    consejo: string;
    ejemplo: string;
  }>;
  versiculo_sugerido: string;
  argumento_clave: string;
}

const personas = [
  { value: "ateo_cientifico", label: "Ateo Científico", description: "Busca evidencia empírica" },
  { value: "agnostico", label: "Agnóstico Curioso", description: "Abierto pero escéptico" },
  { value: "herido_iglesia", label: "Herido por la Iglesia", description: "Con dolor y resentimiento" },
  { value: "relativista", label: "Relativista Moral", description: "No cree en verdad absoluta" },
];

const temas = [
  "¿Existe Dios?",
  "El problema del mal y el sufrimiento",
  "¿Es confiable la Biblia?",
  "Ciencia y Fe",
  "Jesús histórico",
  "Moral objetiva",
];

const Coach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { incrementDebates } = useUserStats();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState("ateo_cientifico");
  const [selectedTema, setSelectedTema] = useState(temas[0]);
  const [debateStarted, setDebateStarted] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [debateId, setDebateId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const startDebate = async () => {
    setDebateStarted(true);
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Create debate record
    const { data, error } = await supabase
      .from("debates")
      .insert({
        user_id: session.user.id,
        tema: selectedTema,
        personaje: selectedPersona,
        transcript: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating debate:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el debate",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setDebateId(data.id);

    // Get initial message from AI
    try {
      const response = await supabase.functions.invoke("debate-coach", {
        body: {
          persona: selectedPersona,
          tema: selectedTema,
          messages: [],
          action: "start",
        },
      });

      if (response.error) throw response.error;

      const aiMessage: Message = {
        role: "assistant",
        content: response.data.message,
      };

      setMessages([aiMessage]);
    } catch (error) {
      console.error("Error starting debate:", error);
      toast({
        title: "Error",
        description: "No se pudo conectar con el coach",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await supabase.functions.invoke("debate-coach", {
        body: {
          persona: selectedPersona,
          tema: selectedTema,
          messages: [...messages, userMessage],
          action: "respond",
        },
      });

      if (response.error) throw response.error;

      const aiMessage: Message = {
        role: "assistant",
        content: response.data.message,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update transcript
      if (debateId) {
        await supabase
          .from("debates")
          .update({ transcript: [...messages, userMessage, aiMessage] as any })
          .eq("id", debateId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    if (loading || messages.length < 2) return;

    setLoading(true);
    setShowSuggestions(true);

    try {
      const response = await supabase.functions.invoke("debate-coach", {
        body: {
          persona: selectedPersona,
          tema: selectedTema,
          messages,
          action: "suggest",
        },
      });

      if (response.error) throw response.error;

      setSuggestion(response.data);
      toast({
        title: "Sugerencias recibidas",
        description: "Revisa los consejos para mejorar tu respuesta",
      });
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast({
        title: "Error",
        description: "No se pudieron obtener sugerencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const evaluateDebate = async () => {
    if (!debateId || loading) return;

    setLoading(true);

    try {
      const response = await supabase.functions.invoke("debate-coach", {
        body: {
          persona: selectedPersona,
          tema: selectedTema,
          messages,
          action: "evaluate",
        },
      });

      if (response.error) throw response.error;

      const evalData = response.data;
      setEvaluation(evalData);

      // Update debate record
      await supabase
        .from("debates")
        .update({
          completed: true,
          puntaje_fe: evalData.fe,
          puntaje_razon: evalData.razon,
          puntaje_amor: evalData.amor,
          feedback: evalData.feedback,
        })
        .eq("id", debateId);

      // Update user stats
      await incrementDebates();

      toast({
        title: "Evaluación completada",
        description: "Revisa tu desempeño y sigue mejorando",
      });
    } catch (error) {
      console.error("Error evaluating debate:", error);
      toast({
        title: "Error",
        description: "No se pudo evaluar el debate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add suggestion example to input
  const addToInput = (text: string) => {
    setInput((prev) => prev ? `${prev}\n\n${text}` : text);
    if (isMobile) {
      setShowSuggestions(false);
    }
    toast({
      title: "Sugerencia añadida",
      description: "Revisa y personaliza tu respuesta",
    });
  };

  // Add all suggestions to input
  const addAllSuggestions = () => {
    if (!suggestion) return;
    const allExamples = suggestion.sugerencias.map(s => s.ejemplo).join("\n\n");
    setInput(allExamples);
    if (isMobile) {
      setShowSuggestions(false);
    }
    toast({
      title: "Todas las sugerencias añadidas",
      description: "Revisa y personaliza tu respuesta",
    });
  };

  // Suggestions content component (reused in Sheet and Card)
  const SuggestionsContent = () => (
    <div className="space-y-4">
      <div className="glass-card p-3 rounded-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Argumento Clave</h4>
            <p className="text-sm text-muted-foreground">{suggestion?.argumento_clave}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs shrink-0"
            onClick={() => addToInput(suggestion?.argumento_clave || "")}
          >
            <Plus className="w-3 h-3 mr-1" />
            Usar
          </Button>
        </div>
      </div>

      <div className="glass-card p-3 rounded-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Versículo Sugerido</h4>
            <p className="text-sm text-muted-foreground italic">{suggestion?.versiculo_sugerido}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs shrink-0"
            onClick={() => addToInput(suggestion?.versiculo_sugerido || "")}
          >
            <Plus className="w-3 h-3 mr-1" />
            Usar
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Mejora tu respuesta:</h4>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={addAllSuggestions}
          >
            <Plus className="w-3 h-3 mr-1" />
            Usar todas
          </Button>
        </div>
        {suggestion?.sugerencias.map((sug, idx) => (
          <div key={idx} className="border-l-2 border-primary pl-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {sug.categoria === "Fe" && <BookOpen className="w-4 h-4 text-secondary" />}
                {sug.categoria === "Razón" && <Brain className="w-4 h-4 text-primary" />}
                {sug.categoria === "Amor" && <Heart className="w-4 h-4 text-secondary" />}
                <span className="font-medium text-sm">{sug.titulo}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs shrink-0"
                onClick={() => addToInput(sug.ejemplo)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{sug.consejo}</p>
            <p className="text-xs text-muted-foreground italic">💡 {sug.ejemplo}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (!debateStarted) {
    return (
      <div className="min-h-screen bg-background flex">
        <DesktopSidebar userName="Usuario" userLevel={1} userStreak={0} />
        
        <div className="flex-1 lg:pl-64 pb-20 lg:pb-0">
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
                className="glass-button text-foreground hover:bg-background/20 mb-4 lg:hidden"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl lg:text-3xl font-bold text-white">Coach de Debate</h1>
                  <p className="text-white/80 text-sm lg:text-base">Entrena tu apologética con IA</p>
                </div>
              </div>
            </motion.header>
          </div>

          <main className="container mx-auto px-4 py-8 max-w-3xl -mt-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Configura tu Entrenamiento</CardTitle>
                  <CardDescription>
                    Elige el tipo de persona con quien dialogar y el tema a tratar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Personaje</label>
                    <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                      <SelectTrigger className="glass-button bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                        {personas.map((persona) => (
                          <SelectItem key={persona.value} value={persona.value}>
                            <div>
                              <div className="font-medium">{persona.label}</div>
                              <div className="text-xs text-muted-foreground">{persona.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tema</label>
                    <Select value={selectedTema} onValueChange={setSelectedTema}>
                      <SelectTrigger className="glass-button bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                        {temas.map((tema) => (
                          <SelectItem key={tema} value={tema}>
                            {tema}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={startDebate} className="w-full shadow-glow" disabled={loading}>
                    {loading ? "Preparando..." : "Comenzar Entrenamiento"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DesktopSidebar userName="Usuario" userLevel={1} userStreak={0} />
      
      <div className="flex-1 lg:pl-64 flex flex-col pb-20 lg:pb-0">
        {/* Header */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/60" />
          
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 container mx-auto px-4 py-3 lg:py-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/dashboard")}
                  className="glass-button text-white hover:bg-white/20 lg:hidden h-8 w-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                </div>
                <div>
                  <h1 className="font-heading text-lg lg:text-xl font-bold text-white">Coach de Debate</h1>
                  <p className="text-xs lg:text-sm text-white/70 truncate max-w-[150px] lg:max-w-none">{selectedTema}</p>
                </div>
              </div>
              <Badge className="glass-button bg-secondary/20 text-white border-secondary/30 text-xs">
                {personas.find((p) => p.value === selectedPersona)?.label}
              </Badge>
            </div>
          </motion.header>
        </div>

        <main className="flex-1 container mx-auto px-4 py-4 lg:py-6 flex flex-col lg:flex-row gap-4 max-w-7xl overflow-hidden">
          {!evaluation ? (
            <>
              <motion.div 
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 lg:space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <Card
                        className={`max-w-[85%] lg:max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "glass-card border-border/50"
                        }`}
                      >
                        <CardContent className="p-3 lg:p-4">
                          <p className="whitespace-pre-wrap text-sm lg:text-base">{message.content}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="flex-shrink-0 space-y-2">
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      className="resize-none glass-button bg-background/50 flex-1 min-h-[60px] lg:min-h-[80px]"
                      rows={isMobile ? 2 : 3}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    {/* Desktop: vertical buttons */}
                    <div className="hidden lg:flex flex-col gap-2">
                      <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon" className="shadow-glow">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={getSuggestions}
                        variant="outline"
                        size="icon"
                        disabled={loading || messages.length < 2}
                        title="Pedir ayuda"
                        className="glass-button"
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={evaluateDebate}
                        variant="outline"
                        size="icon"
                        disabled={loading || messages.length < 4}
                        title="Evaluar debate"
                        className="glass-button"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobile: horizontal buttons */}
                  <div className="flex lg:hidden gap-2">
                    <Button 
                      onClick={sendMessage} 
                      disabled={loading || !input.trim()} 
                      className="flex-1 shadow-glow"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                    <Button
                      onClick={getSuggestions}
                      variant="outline"
                      size="sm"
                      disabled={loading || messages.length < 2}
                      className="glass-button"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Ayuda
                    </Button>
                    <Button
                      onClick={evaluateDebate}
                      variant="outline"
                      size="sm"
                      disabled={loading || messages.length < 4}
                      className="glass-button"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Evaluar
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Desktop: Side panel for suggestions */}
              {showSuggestions && suggestion && !isMobile && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="hidden lg:block"
                >
                  <Card className="w-80 xl:w-96 flex-shrink-0 glass-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>Sugerencias</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSuggestions(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SuggestionsContent />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Mobile: Sheet for suggestions */}
              <Sheet open={showSuggestions && isMobile && !!suggestion} onOpenChange={setShowSuggestions}>
                <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Sugerencias</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <SuggestionsContent />
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl mx-auto"
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Evaluación del Debate</CardTitle>
                  <CardDescription>Tu desempeño en este entrenamiento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-2 lg:gap-4">
                    <div className="text-center glass-card p-3 lg:p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-1 lg:gap-2 mb-2">
                        <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                        <span className="font-medium text-xs lg:text-sm">Amor</span>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-secondary">{evaluation.amor}/10</div>
                    </div>
                    <div className="text-center glass-card p-3 lg:p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-1 lg:gap-2 mb-2">
                        <Brain className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                        <span className="font-medium text-xs lg:text-sm">Razón</span>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-primary">{evaluation.razon}/10</div>
                    </div>
                    <div className="text-center glass-card p-3 lg:p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-1 lg:gap-2 mb-2">
                        <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                        <span className="font-medium text-xs lg:text-sm">Fe</span>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-secondary">{evaluation.fe}/10</div>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Retroalimentación</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {evaluation.feedback}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1 glass-button">
                      Volver al Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        setDebateStarted(false);
                        setMessages([]);
                        setEvaluation(null);
                        setDebateId(null);
                      }}
                      className="flex-1 shadow-glow"
                    >
                      Nuevo Debate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Coach;
