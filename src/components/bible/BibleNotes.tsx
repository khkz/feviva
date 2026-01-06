import { useState, useEffect } from 'react';
import { PenLine, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      toast({ title: 'Nota guardada' });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({ title: 'Error al guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = note !== originalNote;

  if (loading) {
    return (
      <div className="p-4 border rounded-xl flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Mis notas del día {dia}</span>
        </div>
        {!isEditing && note && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </div>

      {isEditing || !note ? (
        <>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escribe tus reflexiones, preguntas o lo que Dios te habló hoy..."
            className="min-h-[100px] resize-none"
            onFocus={() => setIsEditing(true)}
          />
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setNote(originalNote);
                  setIsEditing(false);
                }}
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={saveNote}
                disabled={saving || !hasChanges}
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
        </>
      ) : (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note}</p>
      )}
    </div>
  );
};
