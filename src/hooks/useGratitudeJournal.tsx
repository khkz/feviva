import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GratitudeEntry {
  id: string;
  entrada_1: string;
  entrada_2: string | null;
  entrada_3: string | null;
  reflexion_biblica: string | null;
  versiculo_sugerido: string | null;
  fecha: string;
  created_at: string;
}

export const useGratitudeJournal = () => {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<GratitudeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchEntries = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Fetch all entries
      const { data, error } = await supabase
        .from('gratitude_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false })
        .limit(30);

      if (error) throw error;

      setEntries(data || []);
      
      // Check if there's an entry for today
      const todayData = data?.find(e => e.fecha === today);
      setTodayEntry(todayData || null);
    } catch (error) {
      console.error('Error fetching gratitude entries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const generateBiblicalReflection = async (gratitudes: string[]): Promise<{ reflexion: string; versiculo: string }> => {
    try {
      const response = await supabase.functions.invoke('generate-gratitude-reflection', {
        body: { gratitudes }
      });

      if (response.error) throw response.error;
      
      return {
        reflexion: response.data.reflexion || '',
        versiculo: response.data.versiculo || ''
      };
    } catch (error) {
      console.error('Error generating reflection:', error);
      // Fallback reflection
      return {
        reflexion: 'La gratitud abre las puertas del cielo. Como dice San Pablo, "Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús."',
        versiculo: '1 Tesalonicenses 5:18'
      };
    }
  };

  const saveEntry = async (gratitudes: string[]): Promise<boolean> => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para guardar tu gratitud",
          variant: "destructive"
        });
        return false;
      }

      const today = new Date().toISOString().split('T')[0];
      const filledGratitudes = gratitudes.filter(g => g.trim().length > 0);

      // Generate biblical reflection
      const { reflexion, versiculo } = await generateBiblicalReflection(filledGratitudes);

      const entryData = {
        user_id: user.id,
        entrada_1: filledGratitudes[0] || '',
        entrada_2: filledGratitudes[1] || null,
        entrada_3: filledGratitudes[2] || null,
        reflexion_biblica: reflexion,
        versiculo_sugerido: versiculo,
        fecha: today
      };

      if (todayEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('gratitude_entries')
          .update(entryData)
          .eq('id', todayEntry.id);

        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('gratitude_entries')
          .insert(entryData);

        if (error) throw error;
      }

      toast({
        title: "¡Gratitud guardada!",
        description: "Tu reflexión bíblica ha sido generada"
      });

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Error saving gratitude:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar tu gratitud",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    entries,
    todayEntry,
    loading,
    saving,
    saveEntry,
    fetchEntries
  };
};
