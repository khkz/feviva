import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SearchSource {
  source: string;
  reference: string;
  title: string | null;
  similarity: number;
}

interface SearchResult {
  answer: string;
  sources: SearchSource[];
}

export function useSemanticSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const search = useCallback(async (query: string, source?: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { query, source, match_count: 5 },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setResult(data as SearchResult);
    } catch (err) {
      console.error('Semantic search error:', err);
      toast({
        title: 'Error de búsqueda',
        description: 'No se pudo realizar la búsqueda. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResult = useCallback(() => setResult(null), []);

  return { search, isSearching, result, clearResult };
}
