import { motion } from "framer-motion";
import { MessageSquare, Sparkles, User, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const chatTurns = [
  {
    role: "atheist" as const,
    text: "Si Dios existe, ¿por qué permite tanto sufrimiento inocente? Un ser bueno lo evitaría.",
  },
  {
    role: "user" as const,
    text: "El sufrimiento no refuta a Dios; presupone un estándar del bien que solo se sostiene si Él existe. La libertad humana también implica riesgo real.",
  },
  {
    role: "coach" as const,
    text: "Suma una distinción entre mal moral y mal físico, y cierra con la respuesta cristiana: Dios entra en el sufrimiento en la cruz.",
  },
];

const chips = [
  "Escucha primero",
  "Argumento cosmológico",
  "Argumento del diseño",
  "Argumento moral",
];

export const CoachDebateSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary mb-5">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Coach de Debate</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-5 leading-tight">
              Practica la conversación difícil{" "}
              <span className="text-gradient-gold">antes de tenerla.</span>
            </h2>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
              Elige a tu oponente (<strong className="text-foreground">Ateo Científico, Agnóstico, Escéptico</strong>),
              el tema (<strong className="text-foreground">¿Existe Dios?, El problema del mal, La Resurrección</strong>) y
              tu nivel (de <strong className="text-foreground">Tutorial guiado a Debate intenso</strong>).
              La IA te responde, te desafía y te corrige, sin juzgarte.
            </p>

            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <Badge
                  key={chip}
                  variant="outline"
                  className="border-secondary/40 text-foreground bg-secondary/5 hover:bg-secondary/15 transition-colors px-3 py-1.5 text-xs md:text-sm"
                >
                  {chip}
                </Badge>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-secondary/20 bg-gradient-to-br from-primary/95 to-primary shadow-2xl shadow-primary/20 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10 bg-black/20">
                <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Ateo Científico · ¿Existe Dios?</p>
                  <p className="text-[11px] text-white/60">Nivel: Debate intenso</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">Demo</span>
              </div>

              <div className="p-5 space-y-4">
                {chatTurns.map((turn, i) => {
                  const isUser = turn.role === "user";
                  const isCoach = turn.role === "coach";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isUser
                            ? "bg-secondary text-primary"
                            : isCoach
                            ? "bg-secondary/20 text-secondary"
                            : "bg-white/10 text-white/80"
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? "bg-secondary text-primary rounded-tr-sm"
                            : isCoach
                            ? "bg-secondary/15 text-white border border-secondary/30 rounded-tl-sm"
                            : "bg-white/10 text-white/90 rounded-tl-sm"
                        }`}
                      >
                        {isCoach && (
                          <p className="text-[10px] uppercase tracking-wider text-secondary font-bold mb-1">
                            Coach · Evaluación
                          </p>
                        )}
                        {turn.text}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-5 py-3 border-t border-white/10 bg-black/20">
                <div className="rounded-full bg-white/5 px-4 py-2 text-xs text-white/50">
                  Escribe tu respuesta…
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
