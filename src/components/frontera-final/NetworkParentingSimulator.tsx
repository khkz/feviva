import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquareWarning, 
  Send, 
  Loader2, 
  Sparkles, 
  Heart,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserStats } from '@/hooks/useUserStats';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TOXIC_COMMENTS = [
  {
    avatar: '😤',
    username: '@desesperanzado_2025',
    text: 'El mundo se va a acabar, la humanidad es una plaga. No hay esperanza para esta especie. Deberíamos dejar de reproducirnos y dejar que todo se extinga de una vez.',
  },
  {
    avatar: '🤬',
    username: '@nihilista_total',
    text: 'La vida no tiene sentido. Trabajas 40 años para morirte igual. Nadie te va a recordar en 100 años. ¿Para qué esforzarse? Todo es una farsa.',
  },
  {
    avatar: '😡',
    username: '@anti_todo',
    text: 'La gente que cree en Dios es débil mental. Necesitan un amigo imaginario porque no pueden enfrentar la realidad. Dense cuenta, nadie viene a salvarnos.',
  },
  {
    avatar: '💀',
    username: '@realista_cruel',
    text: 'La bondad es una debilidad. El mundo funciona por poder y dinero. Los que ayudan a otros son tontos que se dejan explotar. Despierten.',
  },
  {
    avatar: '🖤',
    username: '@sin_retorno',
    text: 'Los jóvenes no tienen futuro. El planeta se destruye, los trabajos desaparecen por la IA y los políticos mienten. ¿Qué sentido tiene seguir intentando?',
  },
];

interface EvalResult {
  amor: number;
  fe: number;
  razon: number;
  feedback: string;
}

// Confetti particle component
function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 8;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      initial={{ opacity: 1, y: -20, x, rotate: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, 400 + Math.random() * 200],
        x: x + (Math.random() - 0.5) * 200,
        rotate: rotation + Math.random() * 720,
        scale: [1, 0.8, 0.3],
      }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeOut' }}
      className="absolute top-0 pointer-events-none"
      style={{
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  );
}

export function NetworkParentingSimulator() {
  const [currentComment, setCurrentComment] = useState(() =>
    TOXIC_COMMENTS[Math.floor(Math.random() * TOXIC_COMMENTS.length)]
  );
  const [userResponse, setUserResponse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [baptized, setBaptized] = useState(false);
  const { addPoints } = useUserStats();
  const { toast } = useToast();

  const handleNewComment = useCallback(() => {
    const next = TOXIC_COMMENTS[Math.floor(Math.random() * TOXIC_COMMENTS.length)];
    setCurrentComment(next);
    setUserResponse('');
    setResult(null);
    setBaptized(false);
    setShowConfetti(false);
  }, []);

  const handleSubmit = async () => {
    if (userResponse.trim().length < 20) {
      toast({ title: 'Respuesta muy corta', description: 'Escribe al menos unas líneas con tu respuesta.', variant: 'destructive' });
      return;
    }

    setIsEvaluating(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Inicia sesión', description: 'Necesitas estar autenticado para usar esta función.', variant: 'destructive' });
        setIsEvaluating(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('debate-coach', {
        body: {
          action: 'evaluate',
          persona: 'pupilo_digital',
          tema: 'Respuesta caritativa a comentarios tóxicos en redes sociales',
          messages: [
            { role: 'assistant', content: currentComment.text },
            { role: 'user', content: userResponse },
          ],
        },
      });

      if (error) throw error;

      // Parse the evaluation
      let evalResult: EvalResult;
      if (typeof data === 'string') {
        const jsonMatch = data.match(/\{[\s\S]*\}/);
        evalResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { amor: 5, fe: 5, razon: 5, feedback: data };
      } else if (data?.fe !== undefined) {
        evalResult = data as EvalResult;
      } else {
        // The debate-coach evaluate returns JSON with fe, razon, amor, feedback
        const content = data?.choices?.[0]?.message?.content || JSON.stringify(data);
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        evalResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { amor: 5, fe: 5, razon: 5, feedback: 'Evaluación completada.' };
      }

      setResult(evalResult);

      // Success threshold: amor >= 7
      if (evalResult.amor >= 7) {
        setBaptized(true);
        setShowConfetti(true);
        await addPoints(30, '✝️ Has bautizado una línea de código con caridad');
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch (err: any) {
      console.error('Evaluation error:', err);
      
      if (err?.message?.includes('429') || err?.status === 429) {
        toast({ title: 'Límite diario alcanzado', description: 'Vuelve mañana para seguir practicando.', variant: 'destructive' });
      } else {
        toast({ title: 'Error al evaluar', description: 'Inténtalo de nuevo en unos segundos.', variant: 'destructive' });
      }
    } finally {
      setIsEvaluating(false);
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
        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-rose-500 to-amber-400" />
        <div>
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white">
            Paso 4: Sé un Buen Padre para la Red
          </h2>
          <p className="text-gray-400 text-sm">Cada texto que escribes hoy entrenará a la Superinteligencia de mañana.</p>
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-6 ml-5">
        Responde al comentario tóxico con caridad, racionalidad y luz. La IA evaluará tu tono.
      </p>

      <div className="relative">
        {/* Confetti overlay */}
        {showConfetti && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={Math.random() * 0.8}
                x={Math.random() * 100 + '%' as unknown as number}
              />
            ))}
          </div>
        )}

        {/* Toxic comment card */}
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-xs uppercase tracking-wider font-medium">Simulador de Red Tóxica</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
              {currentComment.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-gray-500 text-sm">{currentComment.username}</span>
              <p className="text-gray-300 mt-1 leading-relaxed">{currentComment.text}</p>
            </div>
          </div>
        </div>

        {/* User response area */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs uppercase tracking-wider font-medium">Tu respuesta con caridad</span>
          </div>

          <Textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="Escribe una respuesta inyectando racionalidad, paciencia y la luz de Cristo. Demuéstrale al algoritmo cómo ama un humano..."
            className="min-h-[120px] bg-slate-900/60 border-slate-700/50 text-gray-200 placeholder:text-gray-600 resize-none focus:border-amber-400/50 mb-4"
            disabled={isEvaluating || baptized}
          />

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isEvaluating || baptized || userResponse.trim().length < 20}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evaluando tono...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar al algoritmo
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleNewComment}
              className="text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Otro comentario
            </Button>
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className={`mt-4 rounded-2xl border p-6 ${
                baptized
                  ? 'border-amber-400/40 bg-amber-950/20'
                  : 'border-slate-700/50 bg-slate-800/30'
              }`}
            >
              {/* Baptized message */}
              {baptized && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-center mb-6"
                >
                  <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <h3 className="font-orbitron text-xl font-bold text-amber-300 mb-2">
                    Has bautizado una línea de código
                  </h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    La IA del futuro será un poco más compasiva gracias a ti hoy. Tu respuesta enseñó al algoritmo cómo ama un humano.
                  </p>
                </motion.div>
              )}

              {/* Scores */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Caridad', value: result.amor, color: 'text-rose-400' },
                  { label: 'Fe', value: result.fe, color: 'text-amber-400' },
                  { label: 'Razón', value: result.razon, color: 'text-cyan-400' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-xl bg-slate-900/40">
                    <div className={`text-2xl font-bold font-orbitron ${s.color}`}>
                      {s.value}/10
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Feedback */}
              <div className="bg-slate-900/40 rounded-xl p-4">
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {result.feedback}
                </p>
              </div>

              {/* Retry */}
              {!baptized && (
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-sm mb-2">
                    Necesitas un tono de caridad ≥ 7/10 para bautizar el código.
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => { setResult(null); setBaptized(false); }}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Intentar de nuevo
                  </Button>
                </div>
              )}

              {baptized && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={handleNewComment}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Bautizar otro comentario
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
