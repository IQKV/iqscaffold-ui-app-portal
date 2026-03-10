import React, { useRef, useCallback, useEffect, useState } from "react";
import { Box, Center, Loader, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";

/**
 * VirtualizedList Component
 *
 * Implements virtual scrolling for large datasets to improve performance.
 * Only renders items that are visible in the viewport plus a buffer.
 *
 * Features:
 * - Virtual scrolling with configurable item height
 * - Infinite scroll support with load more callback
 * - Automatic viewport calculation
 * - Performance optimized with minimal re-renders
 *
 * Requirements: 13.1, 13.2, 13.3
 */

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  overscan?: number;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  containerHeight?: string | number;
}

export function VirtualizedList<T extends { id: string | number }>({
  items,
  renderItem,
  itemHeight = 120,
  overscan = 3,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  loadingMessage = "Loading more items...",
  emptyMessage = "No items to display",
  containerHeight = "calc(100vh - 300px)",
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightPx, setContainerHeightPx] = useState(600);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, entry } = useIntersection({
    threshold: 0.1,
  });

  // Update container height on mount and resize
  useEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      setContainerHeightPx(height);
    }
  }, []);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Trigger load more when intersection observer fires
  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [entry?.isIntersecting, hasMore, isLoading, onLoadMore]);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeightPx) / itemHeight) + overscan,
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <Box
        ref={containerRef}
        style={{
          height: containerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text c="dimmed">{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* Visible items container */}
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={item.id} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} style={{ height: 20, marginTop: 10 }}>
          {isLoading && (
            <Center py="md">
              <Loader size="sm" />
              <Text size="sm" c="dimmed" ml="sm">
                {loadingMessage}
              </Text>
            </Center>
          )}
        </div>
      )}
    </Box>
  );
}
