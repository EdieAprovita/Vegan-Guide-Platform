"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  loading?: "lazy" | "eager";
  unoptimized?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function Image({
  src,
  alt,
  className,
  width,
  height,
  placeholder,
  fallback,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  loading,
  unoptimized = false,
  onLoad,
  onError,
}: ImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useNextImage, setUseNextImage] = useState(true);

  // Default placeholder and fallback
  const defaultPlaceholder = placeholder || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+";
  const defaultFallback = fallback || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";

  useEffect(() => {
    // Reset state when src changes
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);

    // Check if Next.js Image is available
    try {
      // Check if we're in a Next.js environment
      if (typeof window !== 'undefined' && (window as Window & { __NEXT_DATA__?: unknown }).__NEXT_DATA__) {
        setUseNextImage(true);
      } else {
        setUseNextImage(false);
      }
    } catch {
      setUseNextImage(false);
    }

    // Validate src
    if (!src || src === defaultPlaceholder) {
      setIsLoading(false);
      return;
    }

    // Handle data URLs
    if (src.startsWith('data:')) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // Preload image
    const img = new window.Image();
    
    const handleLoad = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    };
    
    const handleError = () => {
      console.warn(`Failed to load image: ${src}`);
      setImageSrc(defaultFallback);
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    
    // Timeout for loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        handleError();
      }
    }, 10000);

    img.src = src;

    return () => {
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
  }, [src, defaultPlaceholder, defaultFallback, onLoad, onError, isLoading]);

  if (isLoading) {
    return (
      <Skeleton 
        className={cn("animate-pulse", className)} 
        style={{ width, height }}
      />
    );
  }

  // Error state
  if (hasError && (!defaultFallback || defaultFallback === defaultPlaceholder)) {
    return (
      <div 
        className={cn(
          "bg-gray-200 flex items-center justify-center text-gray-500 text-sm",
          className
        )}
        style={{ width, height }}
      >
        <span>Image not available</span>
      </div>
    );
  }

  // Use native img if Next.js Image is not available or there are errors
  if (!useNextImage || hasError) {
    return (
      <img
        src={imageSrc}
        alt={alt || 'Image'}
        className={cn(
          "transition-opacity duration-300",
          hasError && "opacity-50",
          className
        )}
        width={width}
        height={height}
        loading={loading || (priority ? "eager" : "lazy")}
        onLoad={onLoad}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageSrc(defaultFallback);
            onError?.();
          }
        }}
      />
    );
  }

  // Use Next.js Image when available
  try {
    // Use dynamic import instead of require
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NextImage = require('next/image').default;
    
    return (
      <NextImage
        src={imageSrc}
        alt={alt || 'Image'}
        className={cn(
          "transition-opacity duration-300",
          hasError && "opacity-50",
          className
        )}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        quality={quality}
        loading={loading || (priority ? "eager" : "lazy")}
        priority={priority}
        unoptimized={unoptimized || imageSrc.startsWith('data:')}
        onLoad={onLoad}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageSrc(defaultFallback);
            onError?.();
          }
        }}
      />
    );
  } catch (error) {
    // Fallback to native img if Next.js Image fails
    console.warn('Next.js Image failed, falling back to native img:', error);
    return (
      <img
        src={imageSrc}
        alt={alt || 'Image'}
        className={cn(
          "transition-opacity duration-300",
          hasError && "opacity-50",
          className
        )}
        width={width}
        height={height}
        loading={loading || (priority ? "eager" : "lazy")}
        onLoad={onLoad}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageSrc(defaultFallback);
            onError?.();
          }
        }}
      />
    );
  }
}
