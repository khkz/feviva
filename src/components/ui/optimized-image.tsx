import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with lazy loading, blur placeholder, and error handling.
 * Use priority=true for above-the-fold images (hero, landing page).
 */
export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "100vw",
  aspectRatio,
  fallbackIcon,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if already loaded (cached)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  if (hasError && fallbackIcon) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted/50",
          className
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Blur placeholder skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/60 to-muted/30 animate-pulse" />
      )}
      
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
