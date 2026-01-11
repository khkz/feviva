import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ShareImageType = 'santo' | 'evangelio' | 'versiculo' | 'reflexion';
export type ShareImageFormat = 'story' | 'post';

interface DailyShareImage {
  id: string;
  fecha: string;
  tipo: ShareImageType;
  formato: ShareImageFormat;
  image_url: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface UseDailyShareImagesResult {
  storyUrl: string | null;
  postUrl: string | null;
  metadata: Record<string, unknown> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useDailyShareImages = (tipo: ShareImageType): UseDailyShareImagesResult => {
  const today = new Date().toISOString().split('T')[0];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-share-images', tipo, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_share_images')
        .select('*')
        .eq('fecha', today)
        .eq('tipo', tipo);

      if (error) throw error;
      return data as DailyShareImage[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const storyImage = data?.find(img => img.formato === 'story');
  const postImage = data?.find(img => img.formato === 'post');

  return {
    storyUrl: storyImage?.image_url || null,
    postUrl: postImage?.image_url || null,
    metadata: storyImage?.metadata || postImage?.metadata || null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};

// Hook to get all daily images
export const useAllDailyShareImages = () => {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily-share-images', 'all', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_share_images')
        .select('*')
        .eq('fecha', today);

      if (error) throw error;
      return data as DailyShareImage[];
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
};

// Function to trigger manual generation
export const triggerDailyImageGeneration = async (force = false) => {
  const { data, error } = await supabase.functions.invoke('generate-daily-images', {
    body: { force }
  });
  
  if (error) throw error;
  return data;
};