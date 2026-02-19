import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FronteraArticulo {
  id: string;
  titulo: string;
  subtitulo: string;
  icon_name: string;
  color: string;
  categoria: string;
  categoria_grupo: string;
  descripcion: string;
  quotes: { text: string; author: string; source?: string }[];
  sections: { title: string; icon_name?: string; content: string }[];
  video_id?: string;
  video_title?: string;
  reflection: string;
  related_articles: { id: string; title: string; href: string }[];
  orden: number;
}

async function fetchArticulos(): Promise<FronteraArticulo[]> {
  const { data, error } = await supabase
    .from('frontera_articulos')
    .select('*')
    .order('orden');

  if (error) throw error;

  return (data as any[]).map((row) => ({
    id: row.id,
    titulo: row.titulo,
    subtitulo: row.subtitulo,
    icon_name: row.icon_name,
    color: row.color,
    categoria: row.categoria,
    categoria_grupo: row.categoria_grupo,
    descripcion: row.descripcion,
    quotes: row.quotes as FronteraArticulo['quotes'],
    sections: row.sections as FronteraArticulo['sections'],
    video_id: row.video_id,
    video_title: row.video_title,
    reflection: row.reflection,
    related_articles: row.related_articles as FronteraArticulo['related_articles'],
    orden: row.orden,
  }));
}

export function useFronteraArticulos() {
  return useQuery({
    queryKey: ['frontera-articulos'],
    queryFn: fetchArticulos,
    staleTime: 1000 * 60 * 60, // 1 hour cache
    gcTime: 1000 * 60 * 60 * 24, // 24h gc
  });
}

export function useFronteraArticulo(id: string) {
  const { data: articulos, ...rest } = useFronteraArticulos();
  const articulo = articulos?.find((a) => a.id === id);
  return { data: articulo, ...rest };
}
