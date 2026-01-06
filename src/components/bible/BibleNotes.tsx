import { useState, useEffect } from 'react';
import { PenLine, Save, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface BibleNotesProps {
  dia: number;
}

export const BibleNotes = ({ dia }: BibleNotesProps) => {
  const [note, setNote] = useState('');
  const [originalNote, setOriginalNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNote();
  }, [dia]);

  const loadNote = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('bible_plan_notes')
        .select('nota')
        .eq('user_id', user.id)
        .eq('dia', dia)
        .maybeSingle();

      if (data) {
        setNote(data.nota);
        setOriginalNote(data.nota);
      } else {
        setNote('');
        setOriginalNote('');
      }
    } catch (error) {
      console.error('Error loading note:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Inicia sesión para guardar notas', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('bible_plan_notes')
        .upsert({
          user_id: user.id,
          dia,
          nota: note,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,dia'
        });

      if (error) throw error;

      setOriginalNote(note);
      setIsEditing(false);
      toast({ title: 'Nota guardada ✓' });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({ title: 'Error al guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = note !== originalNote;
  const charCount = note.length;
  const maxChars = 2000;

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div 
      className="glass-card rounded-xl p-4 space-y-3"
      layout
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <PenLine className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium">Mis notas del día {dia}</span>
        </div>
        {!isEditing && note && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-9">
            Editar
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing || !note ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, maxChars))}
              placeholder="Escribe tus reflexiones, preguntas o lo que Dios te habló hoy..."
              className="min-h-[140px] resize-none text-[15px] leading-relaxed bg-background/50 border-white/10 focus:border-primary/30"
              onFocus={() => setIsEditing(true)}
            />
            
            <div className="flex items-center justify-between">
              <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {charCount}/{maxChars}
              </span>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setNote(originalNote);
                      setIsEditing(false);
                    }}
                    className="h-9 px-3"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={saveNote}
                    disabled={saving || !hasChanges}
                    className="h-9 px-4"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.p 
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[15px] text-muted-foreground whitespace-pre-wrap leading-relaxed"
          >
            {note}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
