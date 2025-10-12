import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, Send, BookOpen, Heart, Brain, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState("ateo_cientifico");
  const [selectedTema, setSelectedTema] = useState(temas[0]);
  const [debateStarted, setDebateStarted] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [debateId, setDebateId] = useState<string | null>(null);
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

  if (!debateStarted) {
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
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-secondary" />
              <h1 className="font-heading text-3xl font-bold">Coach de Debate</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <Card>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {temas.map((tema) => (
                      <SelectItem key={tema} value={tema}>
                        {tema}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={startDebate} className="w-full" disabled={loading}>
                {loading ? "Preparando..." : "Comenzar Entrenamiento"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      <header className="bg-primary text-white shadow-medium">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-secondary" />
              <div>
                <h1 className="font-heading text-xl font-bold">Coach de Debate</h1>
                <p className="text-sm text-white/70">{selectedTema}</p>
              </div>
            </div>
            <Badge variant="secondary">
              {personas.find((p) => p.value === selectedPersona)?.label}
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        {!evaluation ? (
          <>
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-card"
                    }`}
                  >
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  onClick={evaluateDebate}
                  variant="outline"
                  size="icon"
                  disabled={loading || messages.length < 4}
                  title="Evaluar debate"
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Evaluación del Debate</CardTitle>
              <CardDescription>Tu desempeño en este entrenamiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-secondary" />
                    <span className="font-medium">Amor</span>
                  </div>
                  <div className="text-3xl font-bold text-secondary">{evaluation.amor}/10</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-medium">Razón</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">{evaluation.razon}/10</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-secondary" />
                    <span className="font-medium">Fe</span>
                  </div>
                  <div className="text-3xl font-bold text-secondary">{evaluation.fe}/10</div>
                </div>
              </div>

              <div className="bg-accent p-4 rounded-lg">
                <h3 className="font-medium mb-2">Retroalimentación</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {evaluation.feedback}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1">
                  Volver al Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setDebateStarted(false);
                    setMessages([]);
                    setEvaluation(null);
                    setDebateId(null);
                  }}
                  className="flex-1"
                >
                  Nuevo Debate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Coach;