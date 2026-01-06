import { useState } from 'react';
import { ChevronDown, ChevronUp, Book, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface BibleTextViewerProps {
  reference: string;
  label?: string;
}

export const BibleTextViewer = ({ reference, label }: BibleTextViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchText = async () => {
    if (text) {
      setIsExpanded(!isExpanded);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-bible-text', {
        body: { reference }
      });

      if (fnError) throw fnError;
      
      if (data.text) {
        setText(data.text);
        setIsExpanded(true);
      } else {
        setError('No se pudo obtener el texto');
      }
    } catch (err) {
      console.error('Error fetching bible text:', err);
      setError('Error al cargar el texto bíblico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto hover:bg-white/5 min-h-[64px]"
        onClick={fetchText}
        disabled={loading}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Book className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            {label && <p className="text-xs text-muted-foreground">{label}</p>}
            <p className="font-semibold text-base">{reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground hidden sm:inline">Leer</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </Button>

      <AnimatePresence>
        {isExpanded && text && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 max-h-[60vh] overflow-y-auto overscroll-contain">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {text.split('\n').map((line, i) => {
                  if (line.startsWith('**')) {
                    return (
                      <h4 key={i} className="font-bold text-primary mt-4 mb-2 first:mt-0 text-base">
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  return (
                    <p key={i} className="text-[15px] leading-relaxed mb-2 text-foreground/90">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-4 pt-0">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};
