import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AudioQueueItem } from "@/contexts/AudioPlayerContext";
import { toast } from "sonner";

export interface PlaylistItem {
  id: string;
  type: 'oracion' | 'sleep_story';
  title: string;
  subtitle?: string;
  audioUrl?: string | null;
  imageUrl?: string;
  orden: number;
}

interface UserPlaylist {
  id: string;
  user_id: string;
  nombre: string;
  tipo: string;
  items: PlaylistItem[];
  created_at: string;
  updated_at: string;
}

export function usePlaylistManager() {
  const [dailyPlaylist, setDailyPlaylist] = useState<PlaylistItem[]>([]);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load playlist on mount
  useEffect(() => {
    loadPlaylist();
  }, []);

  const loadPlaylist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('user_playlists')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('tipo', 'daily')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading playlist:', error);
      }

      if (data) {
        setPlaylistId(data.id);
        // Parse items from JSONB - safely cast
        const rawItems = data.items;
        const items = Array.isArray(rawItems) 
          ? (rawItems as unknown as PlaylistItem[]) 
          : [];
        setDailyPlaylist(items);
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlaylist = async (items: PlaylistItem[]) => {
    if (!userId) return;

    try {
      // Convert items to JSON-safe format
      const jsonItems = JSON.parse(JSON.stringify(items));
      
      if (playlistId) {
        // Update existing
        await supabase
          .from('user_playlists')
          .update({ 
            items: jsonItems,
            updated_at: new Date().toISOString()
          })
          .eq('id', playlistId);
      } else {
        // Create new
        const { data, error } = await supabase
          .from('user_playlists')
          .insert([{
            user_id: userId,
            nombre: 'Mi Rutina Diaria',
            tipo: 'daily',
            items: jsonItems
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) setPlaylistId(data.id);
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  };

  const addItem = useCallback(async (item: AudioQueueItem) => {
    const newItem: PlaylistItem = {
      id: item.id,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      audioUrl: item.audioUrl,
      imageUrl: item.imageUrl,
      orden: dailyPlaylist.length + 1
    };

    const updatedPlaylist = [...dailyPlaylist, newItem];
    setDailyPlaylist(updatedPlaylist);
    await savePlaylist(updatedPlaylist);
    toast.success("Añadido a tu rutina diaria");
  }, [dailyPlaylist, userId, playlistId]);

  const removeItem = useCallback(async (itemId: string) => {
    const updatedPlaylist = dailyPlaylist
      .filter(item => item.id !== itemId)
      .map((item, index) => ({ ...item, orden: index + 1 }));
    
    setDailyPlaylist(updatedPlaylist);
    await savePlaylist(updatedPlaylist);
    toast.success("Eliminado de tu rutina");
  }, [dailyPlaylist]);

  const reorder = useCallback(async (items: PlaylistItem[]) => {
    const reorderedItems = items.map((item, index) => ({
      ...item,
      orden: index + 1
    }));
    
    setDailyPlaylist(reorderedItems);
    await savePlaylist(reorderedItems);
  }, []);

  const clearPlaylist = useCallback(async () => {
    setDailyPlaylist([]);
    await savePlaylist([]);
    toast.success("Rutina vaciada");
  }, []);

  const isInPlaylist = useCallback((itemId: string) => {
    return dailyPlaylist.some(item => item.id === itemId);
  }, [dailyPlaylist]);

  // Convert playlist items to audio queue items
  const toQueueItems = useCallback((): AudioQueueItem[] => {
    return dailyPlaylist.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl,
      audioUrl: item.audioUrl || null,
      type: item.type,
    }));
  }, [dailyPlaylist]);

  return {
    dailyPlaylist,
    isLoading,
    addItem,
    removeItem,
    reorder,
    clearPlaylist,
    isInPlaylist,
    toQueueItems,
    totalItems: dailyPlaylist.length,
    isLoggedIn: !!userId,
  };
}
