import { useCallback } from 'react';

const CACHE_NAME = 'elrugido-image-cache';
const MAX_CACHE_ITEMS = 100;

/**
 * Hook for caching images locally using the Cache API.
 * This reduces network requests and enables faster subsequent loads.
 */
export function useImageCache() {
  /**
   * Get image from cache if available
   */
  const getCachedImage = useCallback(async (url: string): Promise<string | null> => {
    if (!url || !('caches' in window)) return null;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      
      if (response) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Error reading from image cache:', error);
    }
    
    return null;
  }, []);

  /**
   * Store image in cache
   */
  const cacheImage = useCallback(async (url: string): Promise<string | null> => {
    if (!url || !('caches' in window)) return null;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      
      // Check if already cached
      const existing = await cache.match(url);
      if (existing) {
        const blob = await existing.blob();
        return URL.createObjectURL(blob);
      }
      
      // Fetch and cache the image
      const response = await fetch(url);
      if (response.ok) {
        const clonedResponse = response.clone();
        await cache.put(url, clonedResponse);
        
        // Clean old cache entries
        await cleanOldCacheEntries(cache);
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Error caching image:', error);
    }
    
    return null;
  }, []);

  /**
   * Get image - tries cache first, then fetches and caches
   */
  const getImageWithCache = useCallback(async (url: string): Promise<string | null> => {
    if (!url) return null;
    
    // First check cache
    const cachedUrl = await getCachedImage(url);
    if (cachedUrl) {
      return cachedUrl;
    }
    
    // If not cached, fetch and cache it
    const fetchedUrl = await cacheImage(url);
    if (fetchedUrl) {
      return fetchedUrl;
    }
    
    // Fallback to direct URL
    return url;
  }, [getCachedImage, cacheImage]);

  /**
   * Pre-cache multiple images in background
   */
  const preCacheImages = useCallback(async (urls: string[]): Promise<void> => {
    if (!('caches' in window)) return;
    
    // Cache in background without blocking
    urls.forEach(url => {
      if (url) {
        cacheImage(url).catch(() => {});
      }
    });
  }, [cacheImage]);

  /**
   * Clear all cached images
   */
  const clearCache = useCallback(async (): Promise<void> => {
    if (!('caches' in window)) return;
    
    try {
      await caches.delete(CACHE_NAME);
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  }, []);

  return {
    getCachedImage,
    cacheImage,
    getImageWithCache,
    preCacheImages,
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
      const toDelete = keys.slice(0, keys.length - MAX_CACHE_ITEMS);
      await Promise.all(toDelete.map(key => cache.delete(key)));
    }
  } catch (error) {
    console.error('Error cleaning image cache:', error);
  }
}
