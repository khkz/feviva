import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { requireAuth } from "@/lib/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, ArrowLeft, Send, BookOpen, Heart, Brain, TrendingUp, X, Plus, Star, GraduationCap, Zap, Trophy, HelpCircle, Lightbulb, ChevronRight, CheckCircle2, Clock, Bot, Cpu, HeartHandshake, Eye, MessageCircleHeart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { ExportLightCard } from "@/components/shared/ExportLightCard";
import { PaywallModal } from "@/components/shared/PaywallModal";

interface Message {
  role: "user" | "assistant";
  content: string;
  score?: number;
  feedbackHint?: string;
}

interface Evaluation {
  fe: number;
  razon: number;
  amor: number;
  feedback: string;
}

interface PupiloEvaluation {
  empatia: number;
  claridad: number;
  ternura: number;
  profundidad: number;
  reporte_ia: string;
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

interface TutorialStep {
  title: string;
  description: string;
  tip: string;
  example?: string;
}

const modeOptions = [
  { value: "debate", label: "Coach de Debate", description: "Entrena contra personajes con objeciones", icon: Brain, color: "text-primary" },
  { value: "pupilo", label: "El Pupilo Digital", description: "Enséñale a una IA fría sobre el amor humano", icon: Bot, color: "text-cyan-500" },
];

const personas = [
  { value: "ateo_cientifico", label: "Ateo Científico", description: "Busca evidencia empírica" },
  { value: "agnostico", label: "Agnóstico Curioso", description: "Abierto pero escéptico" },
  { value: "herido_iglesia", label: "Herido por la Iglesia", description: "Con dolor y resentimiento" },
  { value: "relativista", label: "Relativista Moral", description: "No cree en verdad absoluta" },
];

const pupiloTemas = [
  "¿Por qué los humanos aman a sus enemigos?",
  "¿Qué es el perdón y por qué es lógico perdonar?",
  "¿Por qué Cristo se sacrificó pudiendo evitarlo?",
  "¿Por qué lloran los humanos cuando alguien muere?",
  "¿Qué es la misericordia y por qué supera a la justicia?",
  "¿Por qué una madre ama a un hijo que la lastimó?",
];

const dificultades = [
  { value: "tutorial", label: "Tutorial", description: "Guía paso a paso", icon: HelpCircle, color: "text-blue-500" },
  { value: "aprendiz", label: "Aprendiz", description: "Personaje receptivo", icon: GraduationCap, color: "text-green-500" },
  { value: "intermedio", label: "Intermedio", description: "Balance desafío/aprendizaje", icon: Zap, color: "text-yellow-500" },
  { value: "avanzado", label: "Avanzado", description: "Debate intenso", icon: Trophy, color: "text-red-500" },
];

const temas = [
  "¿Existe Dios?",
  "El problema del mal y el sufrimiento",
  "¿Es confiable la Biblia?",
  "Ciencia y Fe",
  "Jesús histórico",
  "Moral objetiva",
  "¿Por qué existe el amor?",
  "El sentido de la vida sin Dios",
  "¿Es posible la moral sin Dios?",
];

// Tutorial tips for each topic
const tutorialTipsByTopic: Record<string, TutorialStep[]> = {
  "¿Existe Dios?": [
    {
      title: "Escucha primero",
      description: "Antes de responder, asegúrate de entender qué está preguntando realmente.",
      tip: "Repite su objeción con tus palabras para confirmar que entendiste.",
      example: "Si entiendo bien, tu pregunta es sobre..."
    },
    {
      title: "Argumento cosmológico",
      description: "Todo lo que comienza a existir tiene una causa. El universo comenzó (Big Bang), por lo tanto tiene una causa.",
      tip: "Usa evidencia científica a tu favor: el Big Bang muestra un inicio.",
      example: "La ciencia misma muestra que el universo tuvo un principio..."
    },
    {
      title: "Argumento del diseño",
      description: "El ajuste fino del universo sugiere un diseñador inteligente.",
      tip: "Menciona las constantes físicas precisas para la vida.",
      example: "Las constantes del universo están ajustadas con precisión increíble..."
    },
    {
      title: "Argumento moral",
      description: "La existencia de valores morales objetivos apunta a un legislador moral.",
      tip: "Pregunta: ¿De dónde vienen los derechos humanos si no hay Dios?",
      example: "Si no hay Dios, ¿por qué el asesinato sería objetivamente malo?"
    },
  ],
  "El problema del mal y el sufrimiento": [
    {
      title: "Reconoce el dolor",
      description: "El sufrimiento es real y merece compasión, no solo argumentos.",
      tip: "Empatiza primero, argumenta después.",
      example: "Entiendo que el sufrimiento es algo muy difícil de enfrentar..."
    },
    {
      title: "Libre albedrío",
      description: "Dios permite el mal moral porque nos dio libertad genuina.",
      tip: "Un mundo con amor verdadero requiere libertad real.",
      example: "El amor forzado no es amor. Dios quiso seres libres..."
    },
    {
      title: "Bien mayor",
      description: "Dios puede permitir sufrimiento temporal para un bien mayor.",
      tip: "Como un médico que permite dolor temporal para sanar.",
      example: "A veces el sufrimiento nos forma y nos acerca a lo que importa..."
    },
    {
      title: "La respuesta de Jesús",
      description: "Dios no está ausente del sufrimiento; en Cristo, lo experimentó.",
      tip: "Dios no solo observa; entró al sufrimiento con nosotros.",
      example: "En la cruz, Dios mismo experimentó el peor sufrimiento..."
    },
  ],
  "¿Es confiable la Biblia?": [
    {
      title: "Evidencia manuscrita",
      description: "Tenemos más manuscritos antiguos de la Biblia que de cualquier otro texto antiguo.",
      tip: "Compara con otros textos antiguos que aceptamos.",
      example: "Tenemos más de 5,000 manuscritos griegos del Nuevo Testamento..."
    },
    {
      title: "Testigos oculares",
      description: "Los evangelios fueron escritos por testigos o basados en testimonios directos.",
      tip: "Menciona la cercanía temporal a los eventos.",
      example: "Pablo escribió 1 Corintios apenas 20 años después de la crucifixión..."
    },
    {
      title: "Arqueología",
      description: "La arqueología ha confirmado muchos detalles bíblicos.",
      tip: "Usa ejemplos concretos de descubrimientos.",
      example: "El Cilindro de Ciro, la inscripción de Pilato..."
    },
    {
      title: "Coherencia interna",
      description: "A pesar de 40 autores en 1500 años, hay un mensaje coherente.",
      tip: "Esta unidad es evidencia de inspiración divina.",
      example: "Desde Génesis hasta Apocalipsis, hay un hilo redentor..."
    },
  ],
  "Ciencia y Fe": [
    {
      title: "No son enemigas",
      description: "La ciencia responde al 'cómo', la fe al 'por qué' y 'para qué'.",
      tip: "Son complementarias, no contradictorias.",
      example: "La ciencia explica el mecanismo, la fe explica el propósito..."
    },
    {
      title: "Científicos creyentes",
      description: "Muchos grandes científicos han sido creyentes.",
      tip: "Menciona a Galileo, Newton, Faraday, Collins, Lennox.",
      example: "Francis Collins, director del Proyecto Genoma Humano, es cristiano..."
    },
    {
      title: "Origen de la ciencia",
      description: "La ciencia moderna nació en un contexto cristiano.",
      tip: "La fe en un Dios racional hizo posible la ciencia.",
      example: "Los primeros científicos creían en leyes naturales porque creían en un Legislador..."
    },
    {
      title: "Límites de la ciencia",
      description: "La ciencia no puede responder preguntas de significado y propósito.",
      tip: "La ciencia describe, no prescribe valores.",
      example: "La ciencia puede decir cómo hacer una bomba, no si debemos usarla..."
    },
  ],
  "Jesús histórico": [
    {
      title: "Fuentes no cristianas",
      description: "Historiadores romanos y judíos mencionan a Jesús.",
      tip: "Tácito, Josefo, Plinio el Joven confirman su existencia.",
      example: "Tácito, historiador romano, menciona a Cristo y su ejecución..."
    },
    {
      title: "Criterio del martirio",
      description: "Los apóstoles murieron por lo que vieron, no por lo que creían.",
      tip: "La gente muere por lo que cree verdad, no por mentiras conocidas.",
      example: "Los discípulos pudieron verificar la resurrección; murieron afirmándola..."
    },
    {
      title: "Tumba vacía",
      description: "Tanto cristianos como oponentes reconocían la tumba vacía.",
      tip: "Los oponentes inventaron explicaciones, no negaron el hecho.",
      example: "Los judíos dijeron que robaron el cuerpo, admitiendo la tumba vacía..."
    },
    {
      title: "Transformación de los discípulos",
      description: "De cobardes escondidos a mártires valientes.",
      tip: "¿Qué explica este cambio dramático?",
      example: "Pedro negó a Jesús tres veces; semanas después, predicaba en Jerusalén..."
    },
  ],
  "Moral objetiva": [
    {
      title: "Intuiciones morales",
      description: "Todos reconocemos que algunas cosas son objetivamente malas.",
      tip: "Usa ejemplos claros: tortura de inocentes, genocidio.",
      example: "¿El Holocausto fue objetivamente malo o solo una preferencia cultural?"
    },
    {
      title: "Fundamento necesario",
      description: "Los valores objetivos necesitan un fundamento trascendente.",
      tip: "Sin Dios, la moral es solo preferencia subjetiva.",
      example: "Si solo somos átomos reorganizados, ¿de dónde vienen los derechos?"
    },
    {
      title: "Argumento de Lewis",
      description: "La existencia de una Ley Moral apunta a un Legislador Moral.",
      tip: "Todos apelamos a un estándar de justicia más allá de nosotros.",
      example: "Cuando decimos 'eso es injusto', apelamos a un estándar objetivo..."
    },
    {
      title: "Dilema de Euthyphro resuelto",
      description: "La moral no es arbitraria ni independiente de Dios.",
      tip: "La moral fluye de la naturaleza de Dios, que es buena.",
      example: "Dios no decide qué es bueno; Él ES la bondad misma..."
    },
  ],
  "¿Por qué existe el amor?": [
    {
      title: "El argumento del duelo",
      description: "Seguimos amando a quienes ya murieron, aunque no 'sirve' biológicamente.",
      tip: "Si el amor es solo química, debería apagarse cuando la persona muere.",
      example: "¿Por qué seguimos llorando a alguien años después? La evolución no lo explica..."
    },
    {
      title: "Amor desinteresado",
      description: "El sacrificio sin beneficio reproductivo desafía la explicación evolutiva.",
      tip: "El amor a desconocidos, enemigos, o moribundos no tiene sentido evolutivo.",
      example: "Madre Teresa amó a moribundos sin familia. ¿Qué gen explica eso?"
    },
    {
      title: "Sentimiento vs. Voluntad",
      description: "El amor maduro es una decisión, no solo una emoción.",
      tip: "Las mariposas desaparecen; el amor verdadero es elegir amar cada día.",
      example: "Cuando la dopamina baja, ¿qué mantiene juntas a las parejas 50 años?"
    },
    {
      title: "Reflejo de lo eterno",
      description: "El amor humano apunta a un Amor originario.",
      tip: "San Juan: 'Dios es amor'. El amor humano es imagen del divino.",
      example: "Si el amor es lo más valioso, ¿de dónde viene? ¿Del caos?"
    },
  ],
  "El sentido de la vida sin Dios": [
    {
      title: "Significado creado vs. encontrado",
      description: "El humanismo dice que creamos significado. ¿Es suficiente?",
      tip: "El significado autoimpuesto puede sentirse arbitrario.",
      example: "Si yo invento mi propósito, ¿por qué debería tomarme en serio?"
    },
    {
      title: "La finitud sin esperanza",
      description: "¿La muerte da valor o lo destruye?",
      tip: "Para algunos, saber que todo termina lleva al nihilismo, no al aprecio.",
      example: "Si todo se olvida en el frío del universo, ¿importó realmente?"
    },
    {
      title: "Hambre de trascendencia",
      description: "El deseo humano de significado eterno es universal.",
      tip: "C.S. Lewis: 'Si tengo deseos que nada en este mundo satisface...'",
      example: "¿Por qué anhelamos que nuestro amor y trabajo 'importen para siempre'?"
    },
    {
      title: "Propósito como don",
      description: "Descubrir un propósito dado es más robusto que inventarlo.",
      tip: "Un mensaje en una botella: ¿tiene más sentido si alguien lo envió?",
      example: "La vida como regalo vs. la vida como accidente cósmico..."
    },
  ],
  "¿Es posible la moral sin Dios?": [
    {
      title: "Distinguir conocer de fundamentar",
      description: "Los ateos pueden ser morales; la pregunta es de dónde vienen los valores.",
      tip: "No cuestionamos su bondad, sino el fundamento de esa bondad.",
      example: "Un ateo puede ser más moral que un creyente. Pero ¿por qué existe 'bueno'?"
    },
    {
      title: "Evolución y obligación",
      description: "La evolución explica por qué tenemos impulsos, no por qué debemos obedecerlos.",
      tip: "Del 'es' no se sigue el 'debe'.",
      example: "También evolucionamos agresión. ¿Por qué la empatía es 'mejor'?"
    },
    {
      title: "Derechos humanos",
      description: "¿De dónde vienen los derechos inalienables si no hay legislador?",
      tip: "La declaración universal asume dignidad intrínseca. ¿Por qué?",
      example: "Si somos solo materia, ¿por qué un humano tiene más derechos que una piedra?"
    },
    {
      title: "Dostoievski revisitado",
      description: "'Si Dios no existe, todo está permitido' - ¿es cierto?",
      tip: "No es que todos se vuelvan inmorales, sino que falta el fundamento.",
      example: "Podemos actuar moralmente sin fe. Pero ¿podemos justificarlo?"
    },
  ],
};

const motivationalMessages = [
  "¡Excelente argumento! 🌟",
  "¡Muy bien pensado! 💪",
  "¡Buen punto! 👏",
  "¡Sigue así! ⭐",
];

const Coach = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { incrementDebates } = useUserStats();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const initialMode = searchParams.get("mode") === "pupilo" ? "pupilo" : "debate";
  const [selectedMode, setSelectedMode] = useState<"debate" | "pupilo">(initialMode);
  const [selectedPersona, setSelectedPersona] = useState("ateo_cientifico");
  const [selectedDificultad, setSelectedDificultad] = useState("tutorial");
  const [selectedTema, setSelectedTema] = useState(temas[0]);
  const [selectedPupiloTema, setSelectedPupiloTema] = useState(pupiloTemas[0]);
  const [debateStarted, setDebateStarted] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pupiloEvaluation, setPupiloEvaluation] = useState<PupiloEvaluation | null>(null);
  const [debateId, setDebateId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showPointAnimation, setShowPointAnimation] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorialPanel, setShowTutorialPanel] = useState(true);
  const [completedTutorialSteps, setCompletedTutorialSteps] = useState<number[]>([]);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPupiloMode = selectedMode === "pupilo";
  const isTutorialMode = selectedDificultad === "tutorial" && !isPupiloMode;
  const currentTutorialTips = tutorialTipsByTopic[selectedTema] || [];
  const currentTip = currentTutorialTips[tutorialStep];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startDebate = async () => {
    setDebateStarted(true);
    setLoading(true);
    setTotalPoints(0);
    setTutorialStep(0);
    setCompletedTutorialSteps([]);
    setShowTutorialPanel(true);
    setPupiloEvaluation(null);
    setEvaluation(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const activeTema = isPupiloMode ? selectedPupiloTema : selectedTema;
    const activePersona = isPupiloMode ? "pupilo_digital" : selectedPersona;

    // Create debate record
    const { data, error } = await supabase
      .from("debates")
      .insert({
        user_id: session.user.id,
        tema: activeTema,
        personaje: activePersona,
        transcript: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating debate:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setDebateId(data.id);

    // For tutorial mode, use aprendiz difficulty in backend
    const backendDificultad = isPupiloMode ? "aprendiz" : (isTutorialMode ? "aprendiz" : selectedDificultad);

    // Get initial message from AI
    try {
      if (!(await requireAuth())) { setLoading(false); return; }
      const response = await supabase.functions.invoke("debate-coach", {
        body: {
          persona: activePersona,
          tema: activeTema,
          dificultad: backendDificultad,
          messages: [],
          action: "start",
        },
      });

      if (response.error) {
        // Check for 429 quota exceeded
        if (response.error?.context?.status === 429 || response.data?.error === 'Límite diario alcanzado') {
          setQuotaExceeded(true);
          setDebateStarted(false);
          setLoading(false);
          return;
        }
        throw response.error;
      }

      const aiMessage: Message = {
        role: "assistant",
        content: response.data.message,
      };

      setMessages([aiMessage]);
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

    // Mark current tutorial step as completed
    if (isTutorialMode && !completedTutorialSteps.includes(tutorialStep)) {
      setCompletedTutorialSteps(prev => [...prev, tutorialStep]);
    }

    const backendDificultad = isPupiloMode ? "aprendiz" : (isTutorialMode ? "aprendiz" : selectedDificultad);
    const activePersona = isPupiloMode ? "pupilo_digital" : selectedPersona;
    const activeTema = isPupiloMode ? selectedPupiloTema : selectedTema;

    try {
      const response = await supabase.functions.invoke("debate-coach", {
        body: {
          persona: activePersona,
          tema: activeTema,
          dificultad: backendDificultad,
          messages: [...messages, userMessage],
          action: "respond",
        },
      });

      if (response.error) {
        if (response.error?.context?.status === 429 || response.data?.error === 'Límite diario alcanzado') {
          setQuotaExceeded(true);
          setLoading(false);
          return;
        }
        throw response.error;
      }

      const { message, userScore, feedbackHint } = response.data;

      // Update user message with score
      setMessages((prev) => {
        const updated = [...prev];
        const lastUserIdx = updated.length - 1;
        if (updated[lastUserIdx]?.role === "user") {
          updated[lastUserIdx] = {
            ...updated[lastUserIdx],
            score: userScore,
            feedbackHint: feedbackHint
          };
        }
        return updated;
      });

      // Show point animation for good scores
      if (userScore >= 2) {
        setLastScore(userScore);
        setTotalPoints(prev => prev + userScore);
        setShowPointAnimation(true);
        setTimeout(() => setShowPointAnimation(false), 2000);
        
        if (userScore === 3) {
          toast({
            title: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
            description: feedbackHint,
          });
        }
      }

      // Advance tutorial step after each exchange
      if (isTutorialMode && tutorialStep < currentTutorialTips.length - 1) {
        setTutorialStep(prev => prev + 1);
      }

      const aiMessage: Message = {
        role: "assistant",
        content: message,
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

    const backendDificultad = isTutorialMode ? "aprendiz" : selectedDificultad;

    try {
      const response = await supabase.functions.invoke("debate-coach", {
        body: {
          persona: selectedPersona,
          tema: selectedTema,
          dificultad: backendDificultad,
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

    const backendDificultad = isPupiloMode ? "aprendiz" : (isTutorialMode ? "aprendiz" : selectedDificultad);
    const activePersona = isPupiloMode ? "pupilo_digital" : selectedPersona;
    const activeTema = isPupiloMode ? selectedPupiloTema : selectedTema;

    try {
      const response = await supabase.functions.invoke("debate-coach", {
        body: {
          persona: activePersona,
          tema: activeTema,
          dificultad: backendDificultad,
          messages,
          action: isPupiloMode ? "evaluate_pupilo" : "evaluate",
        },
      });

      if (response.error) throw response.error;

      const evalData = response.data;
      
      if (isPupiloMode) {
        setPupiloEvaluation(evalData);
        // Save scores mapped to debate columns
        await supabase
          .from("debates")
          .update({
            completed: true,
            puntaje_fe: Math.round(evalData.profundidad / 10),
            puntaje_razon: Math.round(evalData.claridad / 10),
            puntaje_amor: Math.round(evalData.empatia / 10),
            feedback: evalData.feedback,
          })
          .eq("id", debateId);
      } else {
        setEvaluation(evalData);
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
      }

      // Update user stats
      await incrementDebates();

      // Show promotional paywall after user's FIRST completed debate (once)
      try {
        if (!localStorage.getItem("elrugido_paywall_first_debate_shown")) {
          localStorage.setItem("elrugido_paywall_first_debate_shown", "1");
          setTimeout(() => setShowPaywall(true), 800);
        }
      } catch (_) { /* ignore storage errors */ }

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

  // Use tutorial example
  const useTutorialExample = () => {
    if (currentTip?.example) {
      setInput(currentTip.example);
      toast({
        title: "Ejemplo añadido",
        description: "Personalízalo con tus propias palabras",
      });
    }
  };

  // Render score stars
  const renderScoreStars = (score: number) => {
    if (score === 0) return null;
    return (
      <div className="flex items-center gap-0.5 mt-1">
        {[...Array(score)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
        {[...Array(3 - score)].map((_, i) => (
          <Star key={i + score} className="w-3 h-3 text-muted-foreground/30" />
        ))}
      </div>
    );
  };

  // Tutorial Panel Component
  const TutorialPanel = () => (
    <Card className="glass-card border-blue-500/30 bg-blue-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-500" />
            Guía Tutorial
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setShowTutorialPanel(false)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress indicator */}
        <div className="flex items-center gap-1">
          {currentTutorialTips.map((_, idx) => (
            <div 
              key={idx} 
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                completedTutorialSteps.includes(idx) 
                  ? "bg-green-500" 
                  : idx === tutorialStep 
                    ? "bg-blue-500" 
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        {/* Current tip */}
        {currentTip && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600">
                Paso {tutorialStep + 1} de {currentTutorialTips.length}
              </Badge>
              {completedTutorialSteps.includes(tutorialStep) && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>
            
            <h4 className="font-semibold text-sm">{currentTip.title}</h4>
            <p className="text-sm text-muted-foreground">{currentTip.description}</p>
            
            <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
              <p className="text-xs font-medium text-blue-600 mb-1">💡 Consejo:</p>
              <p className="text-xs text-muted-foreground">{currentTip.tip}</p>
            </div>
            
            {currentTip.example && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs border-blue-500/30 hover:bg-blue-500/10"
                onClick={useTutorialExample}
              >
                <Plus className="w-3 h-3 mr-1" />
                Usar ejemplo: "{currentTip.example.slice(0, 30)}..."
              </Button>
            )}
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs"
            disabled={tutorialStep === 0}
            onClick={() => setTutorialStep(prev => prev - 1)}
          >
            Anterior
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs"
            disabled={tutorialStep >= currentTutorialTips.length - 1}
            onClick={() => setTutorialStep(prev => prev + 1)}
          >
            Siguiente
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          {/* Quota exceeded alert */}
          {quotaExceeded && (
            <Alert className="m-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-300">Límite diario alcanzado</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                Has usado tus 3 interacciones de IA por hoy. Vuelve mañana para seguir practicando. ¡Mientras tanto, revisa tu historial de debates!
              </AlertDescription>
            </Alert>
          )}
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
                  <p className="text-white/80 text-sm lg:text-base">Entrena tu apologética</p>
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
                    Elige el nivel de dificultad, personaje y tema para practicar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modo de Entrenamiento</label>
                    <div className="grid grid-cols-2 gap-3">
                      {modeOptions.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = selectedMode === mode.value;
                        return (
                          <button
                            key={mode.value}
                            onClick={() => setSelectedMode(mode.value as "debate" | "pupilo")}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? mode.value === "pupilo"
                                  ? "border-cyan-500 bg-cyan-500/10"
                                  : "border-primary bg-primary/10"
                                : "border-border/50 hover:border-primary/50 bg-background/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-5 h-5 ${mode.color}`} />
                              <span className="font-semibold text-sm">{mode.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{mode.description}</p>
                            {mode.value === "pupilo" && (
                              <Badge className="mt-2 text-[10px] bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                Nuevo · Formador de IA
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pupilo mode info */}
                  {isPupiloMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <Bot className="w-5 h-5 text-cyan-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm mb-1">El Pupilo Digital</h4>
                          <p className="text-xs text-muted-foreground">
                            Una IA fría y lógica que no entiende el amor, el perdón ni la misericordia. 
                            Tu misión es enseñarle con paciencia y ternura. Al final, ella evaluará 
                            tu capacidad de transmitir humanidad.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Pupilo tema selector */}
                  {isPupiloMode && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tema de Enseñanza</label>
                      <Select value={selectedPupiloTema} onValueChange={setSelectedPupiloTema}>
                        <SelectTrigger className="glass-button bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                          {pupiloTemas.map((tema) => (
                            <SelectItem key={tema} value={tema}>
                              {tema}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Debate mode options */}
                  {!isPupiloMode && (
                  <>
                  {/* Difficulty Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nivel de Dificultad</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {dificultades.map((dif) => {
                        const Icon = dif.icon;
                        const isSelected = selectedDificultad === dif.value;
                        const isTutorial = dif.value === "tutorial";
                        return (
                          <button
                            key={dif.value}
                            onClick={() => setSelectedDificultad(dif.value)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              isSelected 
                                ? isTutorial 
                                  ? "border-blue-500 bg-blue-500/10" 
                                  : "border-primary bg-primary/10"
                                : "border-border/50 hover:border-primary/50 bg-background/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-4 h-4 ${dif.color}`} />
                              <span className="font-medium text-sm">{dif.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{dif.description}</p>
                            {isTutorial && (
                              <Badge className="mt-2 text-[10px] bg-blue-500/20 text-blue-600 border-blue-500/30">
                                Recomendado para empezar
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tutorial mode info */}
                  {selectedDificultad === "tutorial" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm mb-1">Modo Tutorial</h4>
                          <p className="text-xs text-muted-foreground">
                            Recibirás guía paso a paso con argumentos clave, ejemplos y consejos 
                            específicos para el tema que elijas. Perfecto para aprender las bases 
                            de la apologética.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

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

                  {/* Preview of tutorial tips */}
                  {selectedDificultad === "tutorial" && tutorialTipsByTopic[selectedTema] && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        En este tutorial aprenderás:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {tutorialTipsByTopic[selectedTema].slice(0, 4).map((tip, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2"
                          >
                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                            <span className="truncate">{tip.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </>
                  )}

                  <Button 
                    onClick={startDebate} 
                    className={`w-full ${isPupiloMode ? "bg-cyan-600 hover:bg-cyan-700 text-white" : "shadow-glow"}`} 
                    disabled={loading}
                  >
                    {loading ? "Preparando..." : isPupiloMode ? "Comenzar Sesión con el Pupilo" : (selectedDificultad === "tutorial" ? "Comenzar Tutorial" : "Comenzar Entrenamiento")}
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
          <div className={`absolute inset-0 ${isPupiloMode ? "bg-gradient-to-br from-cyan-900 via-cyan-800 to-teal-700" : "bg-gradient-to-br from-primary via-primary/90 to-secondary/60"}`} />
          
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
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full ${isPupiloMode ? "bg-cyan-400/20" : "bg-secondary/20"} backdrop-blur-sm flex items-center justify-center`}>
                  {isPupiloMode 
                    ? <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-300" />
                    : <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                  }
                </div>
                <div>
                  <h1 className="font-heading text-lg lg:text-xl font-bold text-white">
                    {isPupiloMode ? "El Pupilo Digital" : (isTutorialMode ? "Tutorial" : "Coach de Debate")}
                  </h1>
                  <p className="text-xs lg:text-sm text-white/70 truncate max-w-[150px] lg:max-w-none">
                    {isPupiloMode ? selectedPupiloTema : selectedTema}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Points counter */}
                <div className="glass-button bg-yellow-500/20 text-white border-yellow-500/30 px-2 py-1 rounded-md flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{totalPoints}</span>
                </div>
                <Badge className={`glass-button text-white border-secondary/30 text-xs ${
                  isTutorialMode ? "bg-blue-500/20 border-blue-500/30" : "bg-secondary/20"
                }`}>
                  {dificultades.find((d) => d.value === selectedDificultad)?.label}
                </Badge>
                {/* Toggle tutorial panel button */}
                {isTutorialMode && !showTutorialPanel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTutorialPanel(true)}
                    className="glass-button text-white hover:bg-white/20 h-8 w-8"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.header>
        </div>

        {/* Point animation */}
        <AnimatePresence>
          {showPointAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-xl">+{lastScore}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 container mx-auto px-4 py-4 lg:py-6 flex flex-col lg:flex-row gap-4 max-w-7xl overflow-hidden">
          {!evaluation && !pupiloEvaluation ? (
            <>
              {/* Tutorial panel - Mobile: top, Desktop: side */}
              {isTutorialMode && showTutorialPanel && (
                <>
                  {/* Mobile tutorial panel */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:hidden mb-2"
                  >
                    <TutorialPanel />
                  </motion.div>
                </>
              )}

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
                      <div className="max-w-[85%] lg:max-w-[80%]">
                        <Card
                          className={`${
                            message.role === "user"
                              ? isPupiloMode ? "bg-teal-700 text-white" : "bg-primary text-primary-foreground"
                              : isPupiloMode ? "glass-card border-cyan-500/30 bg-cyan-950/20" : "glass-card border-border/50"
                          }`}
                        >
                          <CardContent className="p-3 lg:p-4">
                            {isPupiloMode && message.role === "assistant" && (
                              <div className="flex items-center gap-1.5 mb-2 text-cyan-400">
                                <Cpu className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Pupilo Digital</span>
                              </div>
                            )}
                            <p className="whitespace-pre-wrap text-sm lg:text-base">{message.content}</p>
                          </CardContent>
                        </Card>
                        {/* Score indicator for user messages */}
                        {message.role === "user" && message.score !== undefined && message.score > 0 && (
                          <div className="flex items-center gap-2 mt-1 justify-end">
                            {renderScoreStars(message.score)}
                            {message.feedbackHint && (
                              <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                                {message.feedbackHint}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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
                      placeholder={isPupiloMode ? "Enséñale al pupilo con paciencia y ternura..." : (isTutorialMode ? "Escribe tu respuesta (usa las sugerencias del panel de guía)..." : "Escribe tu respuesta...")}
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
                      <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon" className={isPupiloMode ? "bg-cyan-600 hover:bg-cyan-700 text-white" : "shadow-glow"}>
                        <Send className="w-4 h-4" />
                      </Button>
                      {!isPupiloMode && (
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
                      )}
                      <Button
                        onClick={evaluateDebate}
                        variant="outline"
                        size="icon"
                        disabled={loading || messages.length < 4}
                        title={isPupiloMode ? "Obtener reporte" : "Evaluar debate"}
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
                      className={`flex-1 ${isPupiloMode ? "bg-cyan-600 hover:bg-cyan-700 text-white" : "shadow-glow"}`}
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                    {!isPupiloMode && (
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
                    )}
                    <Button
                      onClick={evaluateDebate}
                      variant="outline"
                      size="sm"
                      disabled={loading || messages.length < 4}
                      className="glass-button"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {isPupiloMode ? "Reporte" : "Evaluar"}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Desktop: Side panels */}
              <div className="hidden lg:flex flex-col gap-4 w-80 xl:w-96 flex-shrink-0">
                {/* Tutorial panel - Desktop */}
                {isTutorialMode && showTutorialPanel && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <TutorialPanel />
                  </motion.div>
                )}

                {/* Suggestions panel */}
                {showSuggestions && suggestion && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="glass-card border-border/50">
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
              </div>

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
          ) : pupiloEvaluation ? (
            /* Pupilo Digital Evaluation */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl mx-auto"
            >
              <Card className="glass-card border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-background">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
                    <Bot className="w-8 h-8 text-cyan-400" />
                  </div>
                  <CardTitle className="text-xl">Reporte del Pupilo Digital</CardTitle>
                  <CardDescription>La IA ha procesado tu enseñanza</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Empatía", value: pupiloEvaluation.empatia, icon: HeartHandshake, color: "text-rose-400" },
                      { label: "Claridad", value: pupiloEvaluation.claridad, icon: Eye, color: "text-blue-400" },
                      { label: "Ternura", value: pupiloEvaluation.ternura, icon: MessageCircleHeart, color: "text-pink-400" },
                      { label: "Profundidad", value: pupiloEvaluation.profundidad, icon: Brain, color: "text-purple-400" },
                    ].map((metric) => (
                      <div key={metric.label} className="glass-card p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <metric.icon className={`w-4 h-4 ${metric.color}`} />
                          <span className="text-sm font-medium">{metric.label}</span>
                        </div>
                        <div className="text-2xl font-bold">{metric.value}<span className="text-sm text-muted-foreground">/100</span></div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>

                  {/* AI Report - the emotional core */}
                  <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-5">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500" />
                    <div className="flex items-start gap-3 mb-3">
                      <Cpu className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                      <h3 className="font-semibold text-cyan-300">Mensaje del Pupilo</h3>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-foreground/90">
                      "{pupiloEvaluation.reporte_ia}"
                    </p>
                  </div>

                  {/* Feedback */}
                  <div className="glass-card p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Retroalimentación para el Formador</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {pupiloEvaluation.feedback}
                    </p>
                  </div>

                  {/* Export Light - si empatía y ternura >= 80 */}
                  {(pupiloEvaluation.empatia >= 80 || pupiloEvaluation.ternura >= 80) && (
                    <ExportLightCard
                      text={pupiloEvaluation.reporte_ia}
                      context="Formador del Pupilo Digital"
                    />
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1 glass-button">
                      Volver al Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        setDebateStarted(false);
                        setMessages([]);
                        setEvaluation(null);
                        setPupiloEvaluation(null);
                        setDebateId(null);
                        setTotalPoints(0);
                      }}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      Nueva Sesión con el Pupilo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Standard Debate Evaluation */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl mx-auto"
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{isTutorialMode ? "Tutorial Completado" : "Evaluación del Debate"}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-yellow-400" />
                      <span className="font-bold">{totalPoints} pts</span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {isTutorialMode 
                      ? `Completaste ${completedTutorialSteps.length} de ${currentTutorialTips.length} pasos del tutorial`
                      : "Tu desempeño en este entrenamiento"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-2 lg:gap-4">
                    <div className="text-center glass-card p-3 lg:p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-1 lg:gap-2 mb-2">
                        <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                        <span className="font-medium text-xs lg:text-sm">Amor</span>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-secondary">{evaluation!.amor}/10</div>
                    </div>
                    <div className="text-center glass-card p-3 lg:p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-1 lg:gap-2 mb-2">
                        <Brain className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                        <span className="font-medium text-xs lg:text-sm">Razón</span>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-primary">{evaluation!.razon}/10</div>
                    </div>
                    <div className="text-center glass-card p-3 lg:p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-1 lg:gap-2 mb-2">
                        <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                        <span className="font-medium text-xs lg:text-sm">Fe</span>
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-secondary">{evaluation!.fe}/10</div>
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Retroalimentación</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {evaluation!.feedback}
                    </p>
                  </div>

                  {/* Export Light - si amor >= 8 */}
                  {evaluation!.amor >= 8 && (
                    <ExportLightCard
                      text={evaluation!.feedback}
                      context="Coach de Apologética"
                    />
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1 glass-button">
                      Volver al Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        setDebateStarted(false);
                        setMessages([]);
                        setEvaluation(null);
                        setPupiloEvaluation(null);
                        setDebateId(null);
                        setTotalPoints(0);
                        setTutorialStep(0);
                        setCompletedTutorialSteps([]);
                      }}
                      className="flex-1 shadow-glow"
                    >
                      {isTutorialMode ? "Nuevo Tutorial" : "Nuevo Debate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
      
      <BottomNavigation />
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
};

export default Coach;
