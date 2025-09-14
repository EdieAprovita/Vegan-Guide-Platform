/**
 * Utility functions for image handling in Next.js 15
 */

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  className?: string;
}

/**
 * Check if Next.js Image component is available
 */
export function isNextImageAvailable(): boolean {
  try {
    // Check if we're in a Next.js environment
    if (
      typeof window !== "undefined" &&
      (window as Window & { __NEXT_DATA__?: unknown }).__NEXT_DATA__
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  // Allow data URLs
  if (url.startsWith("data:")) return true;

  // Allow relative URLs
  if (url.startsWith("/")) return true;

  // Allow absolute URLs
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Get fallback image for errors
 */
export function getFallbackImage(width = 200, height = 200): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">
        Image not available
      </text>
    </svg>
  `)}`;
}

/**
 * Get placeholder image for loading states
 */
export function getPlaceholderImage(width = 200, height = 200): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">
        Loading...
      </text>
    </svg>
  `)}`;
}

/**
 * Preload image for better performance
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isValidImageUrl(src)) {
      reject(new Error("Invalid image URL"));
      return;
    }

    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Get optimized image dimensions
 */
export function getOptimizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  if (maxWidth / aspectRatio <= maxHeight) {
    return { width: maxWidth, height: Math.round(maxWidth / aspectRatio) };
  } else {
    return { width: Math.round(maxHeight * aspectRatio), height: maxHeight };
  }
}

/**
 * Check if image should be optimized
 */
export function shouldOptimizeImage(src: string): boolean {
  // Don't optimize data URLs
  if (src.startsWith("data:")) return false;

  // Don't optimize SVG files
  if (src.endsWith(".svg")) return false;

  // Don't optimize if already optimized
  if (src.includes("?") && (src.includes("w=") || src.includes("h="))) return false;

  return true;
}
