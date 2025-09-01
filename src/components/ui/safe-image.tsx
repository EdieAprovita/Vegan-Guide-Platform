"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SafeImageProps {
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
}

export function SafeImage({
  src,
  alt,
  className,
  width,
  height,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=",
  fallback = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=",
  priority = false,
  fill = false,
  sizes,
  quality = 75,
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldUseNextImage, setShouldUseNextImage] = useState(true);

  useEffect(() => {
    // Validar que src sea una URL válida
    if (!src || src === placeholder) {
      setIsLoading(false);
      return;
    }

    // Si es una data URL, usarla directamente
    if (src.startsWith('data:')) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // Verificar si Next.js Image está disponible
    try {
      // Check if we're in a Next.js environment
      if (typeof window !== 'undefined' && (window as Window & { __NEXT_DATA__?: unknown }).__NEXT_DATA__) {
        setShouldUseNextImage(true);
      } else {
        setShouldUseNextImage(false);
      }
    } catch {
      setShouldUseNextImage(false);
    }

    const img = new window.Image();
    
    const handleLoad = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    const handleError = () => {
      console.warn(`Failed to load image: ${src}`);
      setImageSrc(fallback);
      setIsLoading(false);
      setHasError(true);
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    
    // Agregar timeout para evitar esperas infinitas
    const timeout = setTimeout(() => {
      if (isLoading) {
        handleError();
      }
    }, 10000); // 10 segundos de timeout

    img.src = src;

    return () => {
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback, placeholder, isLoading]);

  if (isLoading) {
    return (
      <Skeleton 
        className={cn("animate-pulse", className)} 
        style={{ width, height }}
      />
    );
  }

  // Si hay error y no hay fallback válido, mostrar skeleton
  if (hasError && (!fallback || fallback === placeholder)) {
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

  // Si Next.js Image no está disponible o hay errores, usar img nativo
  if (!shouldUseNextImage || hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
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
        loading={priority ? "eager" : "lazy"}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageSrc(fallback);
          }
        }}
      />
    );
  }

  // Usar Next.js Image cuando esté disponible
  try {
    // Use dynamic import instead of require
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
        width={fill ? undefined : (width || 200)}
        height={fill ? undefined : (height || 200)}
        fill={fill}
        sizes={sizes}
        quality={quality}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        unoptimized={imageSrc.startsWith('data:')}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageSrc(fallback);
          }
        }}
      />
    );
  } catch (error) {
    // Fallback a img nativo si Next.js Image falla
    console.warn('Next.js Image failed, falling back to native img:', error);
    return (
      // eslint-disable-next-line @next/next/no-img-element
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
        loading={priority ? "eager" : "lazy"}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageSrc(fallback);
          }
        }}
      />
    );
  }
}
