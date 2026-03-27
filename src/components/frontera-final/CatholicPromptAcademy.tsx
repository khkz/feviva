import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Sparkles, MessageSquareText, Calendar, Heart, BookOpen, Shield, Brain, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  prompt: string;
  category: 'caridad' | 'productividad' | 'familia' | 'apologetica';
}

const PROMPT_CARDS: PromptCard[] = [
  {
    id: 'traductor-paz',
    title: 'El Traductor de Paz',
    subtitle: 'Reescribe con caridad extrema',
    icon: Heart,
    color: 'from-rose-500/20 to-amber-500/20',
    category: 'caridad',
    prompt: `Actúa como un consultor de comunicación cristiana experto en Comunicación No Violenta. Te voy a pegar un correo/mensaje que escribí estando frustrado o enojado. Tu tarea es reescribirlo manteniendo TODOS los puntos importantes que quiero comunicar, pero transformando el tono para que refleje caridad, firmeza serena y respeto por la dignidad de la otra persona. Reglas: 1) No elimines ningún punto válido. 2) Sustituye acusaciones por observaciones objetivas. 3) Propón soluciones, no solo quejas. 4) El resultado debe ser algo que San Francisco de Sales aprobaría. Aquí está mi mensaje original: [PEGA TU MENSAJE AQUÍ]`,
  },
  {
    id: 'organizador',
    title: 'El Organizador',
    subtitle: 'Más tiempo para lo que importa',
    icon: Calendar,
    color: 'from-blue-500/20 to-cyan-500/20',
    category: 'productividad',
    prompt: `Eres un coach de productividad cristiano. Diseña un horario semanal optimizado para mí con estas prioridades (en este orden): 1) Oración diaria (mínimo 15 min mañana y noche). 2) Tiempo de calidad con mi familia (mínimo 1 hora diaria sin pantallas). 3) Trabajo/estudio eficiente. 4) Ejercicio físico. 5) Descanso real (no scroll en redes). Mis datos: trabajo de [HORARIO], tengo [NÚMERO] hijos de [EDADES]. Quiero que me sobre al menos 30 minutos diarios de "tiempo discrecional". Usa bloques de tiempo y explica por qué cada bloque está donde está.`,
  },
  {
    id: 'escudo-digital',
    title: 'El Escudo Digital',
    subtitle: 'Filtra contenido tóxico',
    icon: Shield,
    color: 'from-emerald-500/20 to-teal-500/20',
    category: 'familia',
    prompt: `Actúa como un experto en seguridad digital familiar y bienestar cristiano. Necesito que me ayudes a crear un "protocolo de protección digital" para mi familia. Incluye: 1) Configuración de controles parentales recomendados por edad. 2) Lista de apps/sitios seguros para niños católicos. 3) Reglas familiares para el uso de pantallas que sean justas pero firmes. 4) Señales de alerta de que un hijo está consumiendo contenido dañino. 5) Cómo tener "la conversación" sobre peligros digitales sin generar miedo. Mis hijos tienen [EDADES]. Hazlo práctico y accionable.`,
  },
  {
    id: 'apologeta-bolsillo',
    title: 'El Apologeta de Bolsillo',
    subtitle: 'Respuestas a objeciones comunes',
    icon: Brain,
    color: 'from-purple-500/20 to-indigo-500/20',
    category: 'apologetica',
    prompt: `Eres un teólogo católico experto en apologética, con el carisma de G.K. Chesterton y la precisión de Santo Tomás de Aquino. Alguien me ha dicho: "[ESCRIBE LA OBJECIÓN AQUÍ]". Necesito que me des: 1) Una respuesta breve (30 segundos) para conversaciones casuales. 2) Una respuesta completa (2 minutos) con argumentos filosóficos y bíblicos. 3) Una pregunta socrática que puedo hacerle para que reflexione. 4) Un dato histórico o científico que apoye la postura católica. 5) Cómo responder con amor, sin ganar la discusión pero sí el corazón. Tono: firme pero amable. Nunca condescendiente.`,
  },
  {
    id: 'mentor-vocacional',
    title: 'El Mentor Vocacional',
    subtitle: 'Discernimiento con IA',
    icon: Sparkles,
    color: 'from-amber-500/20 to-yellow-500/20',
    category: 'productividad',
    prompt: `Actúa como un director espiritual laico con formación en psicología vocacional y espiritualidad ignaciana. Quiero discernir una decisión importante. Guíame a través de un proceso de 5 pasos: 1) Ayúdame a identificar mis talentos y dones naturales. 2) Pregúntame sobre qué actividades me hacen perder la noción del tiempo. 3) Analiza dónde el mundo necesita lo que yo puedo ofrecer. 4) Hazme preguntas de la "Regla de Discernimiento" de San Ignacio (consolación vs. desolación). 5) Sintetiza todo en 3 posibles caminos. Mi situación actual: [DESCRIBE TU SITUACIÓN]`,
  },
  {
    id: 'puente-generacional',
    title: 'El Puente Generacional',
    subtitle: 'Conecta generaciones con fe',
    icon: Users,
    color: 'from-orange-500/20 to-rose-500/20',
    category: 'familia',
    prompt: `Eres un experto en comunicación intergeneracional y evangelización familiar. Mis padres/abuelos no entienden por qué paso tiempo en redes sociales y yo no entiendo por qué ellos [DESCRIBE LA SITUACIÓN]. Ayúdame a: 1) Entender su perspectiva desde su contexto generacional. 2) Explicarles mi mundo digital en términos que ellos comprendan. 3) Encontrar 3 actividades que podamos disfrutar juntos mezclando lo analógico y lo digital. 4) Crear un "pacto familiar" donde ambas generaciones cedan algo. 5) Sugerir una oración familiar que podamos rezar juntos sobre esto.`,
  },
];

const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: Sparkles },
  { id: 'caridad', label: 'Caridad', icon: Heart },
  { id: 'productividad', label: 'Productividad', icon: Calendar },
  { id: 'familia', label: 'Familia', icon: Users },
  { id: 'apologetica', label: 'Apologética', icon: BookOpen },
];

export function CatholicPromptAcademy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('todos');
  const { toast } = useToast();

  const filtered = activeCategory === 'todos'
    ? PROMPT_CARDS
    : PROMPT_CARDS.filter(c => c.category === activeCategory);

  const handleCopy = async (card: PromptCard) => {
    try {
      await navigator.clipboard.writeText(card.prompt);
      setCopiedId(card.id);
      toast({
        title: '📋 Prompt copiado',
        description: `"${card.title}" listo para pegar en tu IA favorita.`,
      });
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      toast({ title: 'Error', description: 'No se pudo copiar al portapapeles.', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-purple-400 to-cyan-400" />
        <div>
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white">
            Paso 2: Academia de Prompts Católicos
          </h2>
          <p className="text-gray-400 text-sm">Conviértete en el director. La IA es tu exoesqueleto, no tu cerebro.</p>
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-6 ml-5">
        Copia estos prompts maestros y pégalos en ChatGPT, Gemini o tu IA favorita. Tú mandas.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-slate-800/60 text-gray-400 border border-slate-700/50 hover:border-gray-500/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((card, i) => {
            const Icon = card.icon;
            const isCopied = copiedId === card.id;
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={`group relative rounded-2xl border border-slate-700/50 bg-gradient-to-br ${card.color} backdrop-blur-sm p-5 hover:border-amber-400/40 transition-all duration-300 cursor-pointer`}
                onClick={() => handleCopy(card)}
              >
                {/* Icon */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-600/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <motion.div
                    animate={isCopied ? { scale: [1, 1.3, 1] } : {}}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/60 text-gray-500 group-hover:text-amber-400'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </motion.div>
                </div>

                {/* Text */}
                <h3 className="font-semibold text-white text-base mb-1">{card.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{card.subtitle}</p>

                {/* Preview */}
                <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquareText className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Vista previa del prompt</span>
                  </div>
                  <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">
                    {card.prompt.substring(0, 150)}...
                  </p>
                </div>

                {/* CTA */}
                <p className="text-center text-xs text-gray-500 mt-3 group-hover:text-amber-400/70 transition-colors">
                  {isCopied ? '¡Copiado! Pégalo en tu IA' : 'Toca para copiar'}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
