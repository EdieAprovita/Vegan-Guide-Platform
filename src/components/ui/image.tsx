"use client";

import { useState } from "react";
import NextImage from "next/image";
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

const DEFAULT_FALLBACK =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";

export function Image({
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
  loading,
  unoptimized = false,
  onLoad,
  onError,
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
      <NextImage
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
        loading={loading || (priority ? "eager" : "lazy")}
        priority={priority}
        unoptimized={unoptimized || effectiveSrc.startsWith("data:")}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => {
          setIsLoading(false);
          if (!hasError) {
            setHasError(true);
            onError?.();
          }
        }}
      />
    </div>
  );
}
