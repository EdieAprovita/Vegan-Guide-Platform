"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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

const DEFAULT_FALLBACK =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";

export function SafeImage({
  src,
  alt,
  className,
  width,
  height,
  fallback = DEFAULT_FALLBACK,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
}: SafeImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when src changes so a new URL gets a fresh load attempt
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const effectiveSrc = hasError ? fallback : src;

  return (
    <div
      className={cn("relative", fill ? "h-full w-full" : "")}
      style={fill ? undefined : { width, height }}
    >
      {isLoading && !hasError && (
        <Skeleton
          className={cn("absolute inset-0 animate-pulse", className)}
          style={fill ? undefined : { width, height }}
        />
      )}
      <Image
        src={effectiveSrc}
        alt={alt || "Image"}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-50",
          className
        )}
        width={fill ? undefined : width || 200}
        height={fill ? undefined : height || 200}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        unoptimized={effectiveSrc.startsWith("data:")}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          if (!hasError) {
            setHasError(true);
          }
        }}
      />
    </div>
  );
}
