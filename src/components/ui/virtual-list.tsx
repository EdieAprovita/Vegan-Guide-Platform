"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // Number of items to render outside the viewport
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Auto-scroll to top when items change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for infinite scrolling
export function useInfiniteScroll<T>(
  items: T[],
  loadMore: () => Promise<void>,
  hasMore: boolean,
  threshold: number = 100
) {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        setIsLoading(true);
        loadMore().finally(() => setIsLoading(false));
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  return {
    loadingRef,
    isLoading,
  };
}

// Combined virtual list with infinite scroll
export function VirtualInfiniteList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  loadMore,
  hasMore,
  className,
  overscan = 5,
  threshold = 100,
}: VirtualListProps<T> & {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
}) {
  const { loadingRef, isLoading } = useInfiniteScroll(items, loadMore, hasMore, threshold);

  // Add loading item to the end of items if hasMore
  const itemsWithLoading = hasMore ? [...items, null as T | null] : items;

  const renderItemWithLoading = (item: T | null, index: number) => {
    if (item === null && hasMore) {
      return (
        <div ref={loadingRef} className="p-4 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading more...</span>
            </div>
          ) : (
            <span className="text-gray-500">Scroll to load more</span>
          )}
        </div>
      );
    }
    return renderItem(item as T, index);
  };

  return (
    <VirtualList
      items={itemsWithLoading}
      height={height}
      itemHeight={itemHeight}
      renderItem={renderItemWithLoading}
      className={className}
      overscan={overscan}
    />
  );
}
