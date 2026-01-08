import { useCallback } from 'react';

const CACHE_NAME = 'elrugido-audio-cache';
const MAX_CACHE_ITEMS = 50;

/**
 * Hook for caching audio files locally using the Cache API.
 * This reduces network requests and enables offline playback.
 */
export function useAudioCache() {
  /**
   * Get audio from cache if available
   */
  const getCachedAudio = useCallback(async (url: string): Promise<Blob | null> => {
    if (!url || !('caches' in window)) return null;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      
      if (response) {
        return await response.blob();
      }
    } catch (error) {
      console.error('Error reading from audio cache:', error);
    }
    
    return null;
  }, []);

  /**
   * Store audio in cache
   */
  const cacheAudio = useCallback(async (url: string): Promise<Blob | null> => {
    if (!url || !('caches' in window)) return null;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      
      // Check if already cached
      const existing = await cache.match(url);
      if (existing) {
        return await existing.blob();
      }
      
      // Fetch and cache the audio
      const response = await fetch(url);
      if (response.ok) {
        const clonedResponse = response.clone();
        await cache.put(url, clonedResponse);
        
        // Clean old cache entries to keep size manageable
        await cleanOldCacheEntries(cache);
        
        return await response.blob();
      }
    } catch (error) {
      console.error('Error caching audio:', error);
    }
    
    return null;
  }, []);

  /**
   * Get audio - tries cache first, then fetches and caches
   */
  const getAudioWithCache = useCallback(async (url: string): Promise<string | null> => {
    if (!url) return null;
    
    // First check cache
    const cachedBlob = await getCachedAudio(url);
    if (cachedBlob) {
      return URL.createObjectURL(cachedBlob);
    }
    
    // If not cached, fetch and cache it
    const fetchedBlob = await cacheAudio(url);
    if (fetchedBlob) {
      return URL.createObjectURL(fetchedBlob);
    }
    
    // Fallback to direct URL
    return url;
  }, [getCachedAudio, cacheAudio]);

  /**
   * Check if audio is cached
   */
  const isCached = useCallback(async (url: string): Promise<boolean> => {
    if (!url || !('caches' in window)) return false;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      return !!response;
    } catch {
      return false;
    }
  }, []);

  /**
   * Clear all cached audio
   */
  const clearCache = useCallback(async (): Promise<void> => {
    if (!('caches' in window)) return;
    
    try {
      await caches.delete(CACHE_NAME);
    } catch (error) {
      console.error('Error clearing audio cache:', error);
    }
  }, []);

  return {
    getCachedAudio,
    cacheAudio,
    getAudioWithCache,
    isCached,
    clearCache,
  };
}

/**
 * Clean old cache entries to keep the cache size manageable
 */
async function cleanOldCacheEntries(cache: Cache): Promise<void> {
  try {
    const keys = await cache.keys();
    
    if (keys.length > MAX_CACHE_ITEMS) {
      // Remove oldest entries (first in list)
      const toDelete = keys.slice(0, keys.length - MAX_CACHE_ITEMS);
      await Promise.all(toDelete.map(key => cache.delete(key)));
    }
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
}
