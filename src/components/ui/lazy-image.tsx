"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: string;
  priority?: boolean;
}

const DEFAULT_FALLBACK =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";

export function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  fallback = DEFAULT_FALLBACK,
  priority = false,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const effectiveSrc = hasError ? fallback : src;

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && !hasError && (
        <Skeleton
          className={cn("absolute inset-0 animate-pulse", className)}
          style={{ width, height }}
        />
      )}
      <Image
        src={effectiveSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-50",
          className
        )}
        width={width || 200}
        height={height || 200}
        loading={priority ? "eager" : "lazy"}
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
