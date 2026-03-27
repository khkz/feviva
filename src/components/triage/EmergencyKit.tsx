import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, HandHeart, Moon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { SoulState } from "./SoulTriageHero";

interface EmergencyKitProps {
  soulState: SoulState;
  verse: { text: string; reference: string };
}

// Map soul states to prayer tags/categories for filtering
const SOUL_TAG_MAP: Record<SoulState, string[]> = {
  ansioso: ["paz", "ansiedad", "confianza", "tranquilidad", "serenidad"],
  agradecido: ["gratitud", "alabanza", "acción de gracias", "gozo"],
  triste: ["consuelo", "esperanza", "dolor", "tristeza", "duelo"],
  tentacion: ["fortaleza", "tentación", "protección", "pureza", "resistencia"],
  agotado: ["descanso", "fuerza", "cansancio", "refugio", "alivio"],
};

const SOUL_CATEGORY_MAP: Record<SoulState, string[]> = {
  ansioso: ["paz", "confianza"],
  agradecido: ["gratitud", "alabanza"],
  triste: ["consuelo", "esperanza"],
  tentacion: ["protección", "fortaleza"],
  agotado: ["descanso", "noche"],
};

interface TriageOracion {
  id: string;
  nombre: string;
  texto: string;
  categoria: string;
}

interface TriageStory {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
}

export function EmergencyKit({ soulState, verse }: EmergencyKitProps) {
  const [oracion, setOracion] = useState<TriageOracion | null>(null);
  const [story, setStory] = useState<TriageStory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKit();
  }, [soulState]);

  const fetchKit = async () => {
    setLoading(true);

    const tags = SOUL_TAG_MAP[soulState];
    const categories = SOUL_CATEGORY_MAP[soulState];

    // Fetch a matching prayer - try tags first, then category fallback
    const { data: oraciones } = await supabase
      .from("oraciones")
      .select("id, nombre, texto, categoria, tags")
      .or(
        tags.map((t) => `tags.cs.{${t}}`).join(",") +
          "," +
          categories.map((c) => `categoria.ilike.%${c}%`).join(",")
      )
      .limit(10);

    if (oraciones && oraciones.length > 0) {
      // Pick a random one for variety
      setOracion(oraciones[Math.floor(Math.random() * oraciones.length)]);
    } else {
      // Absolute fallback - just get any prayer
      const { data: fallback } = await supabase
        .from("oraciones")
        .select("id, nombre, texto, categoria")
        .limit(1);
      setOracion(fallback?.[0] ?? null);
    }

    // Fetch a matching sleep story
    const { data: stories } = await supabase
      .from("sleep_stories")
      .select("id, titulo, descripcion, categoria")
      .limit(10);

    if (stories && stories.length > 0) {
      setStory(stories[Math.floor(Math.random() * stories.length)]);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 px-5">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Preparando tu botiquín de paz...
        </span>
      </div>
    );
  }

  // Truncate prayer text for preview
  const previewText = oracion?.texto
    ? oracion.texto.length > 180
      ? oracion.texto.slice(0, 180) + "..."
      : oracion.texto
    : "";

  return (
    <div className="border-t border-border/50 bg-gradient-to-b from-transparent to-primary/[0.03] px-5 py-5 space-y-4">
      <p className="text-xs uppercase tracking-widest text-center text-muted-foreground font-medium">
        🩹 Tu Botiquín de Emergencia
      </p>

      {/* Verse Card */}
      <motion.div
        className="rounded-xl bg-primary/5 border border-primary/10 p-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-1">
              Versículo de Paz
            </p>
            <p className="text-sm text-foreground italic leading-relaxed">
              "{verse.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              — {verse.reference}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Prayer Card */}
      {oracion && (
        <motion.div
          className="rounded-xl bg-secondary/5 border border-secondary/10 p-4 cursor-pointer hover:bg-secondary/10 transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => {
            window.location.href = `/oracion/${oracion.id}`;
          }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary/10 shrink-0">
              <HandHeart className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary/70 uppercase tracking-wide mb-1">
                Oración para Ti
              </p>
              <p className="text-sm font-medium text-foreground mb-1">
                {oracion.nombre}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {previewText}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sleep Story Card */}
      {story && (
        <motion.div
          className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-4 cursor-pointer hover:bg-purple-500/10 transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            window.location.href = "/sleep-stories";
          }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
              <Moon className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-400/70 uppercase tracking-wide mb-1">
                Historia para Descansar
              </p>
              <p className="text-sm font-medium text-foreground mb-1">
                {story.titulo}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {story.descripcion}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
