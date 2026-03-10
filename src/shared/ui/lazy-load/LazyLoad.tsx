import React, { useRef, useEffect, useState } from "react";
import { useIntersection } from "@mantine/hooks";
import { Box, Skeleton } from "@mantine/core";

/**
 * LazyLoad Component
 *
 * Implements lazy loading for components using Intersection Observer.
 * Only renders children when they enter the viewport.
 *
 * Features:
 * - Intersection Observer based lazy loading
 * - Configurable threshold and root margin
 * - Optional skeleton loader
 * - Once loaded, stays loaded (no unmounting)
 *
 * Requirements: 13.2, 13.3
 */

interface LazyLoadProps {
  children: React.ReactNode;
  height?: number | string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: React.ReactNode;
  once?: boolean;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = 200,
  threshold = 0.1,
  rootMargin = "50px",
  placeholder,
  once = true,
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const { ref, entry } = useIntersection({
    threshold,
    rootMargin,
  });

  // Determine if content should render based on intersection
  const isIntersecting = entry?.isIntersecting ?? false;
  const shouldRender = once ? hasLoaded || isIntersecting : isIntersecting;

  // Update hasLoaded when intersecting (only for 'once' mode)
  useEffect(() => {
    if (once && isIntersecting && !hasLoaded) {
      // Use setTimeout to avoid setState in effect
      const timer = setTimeout(() => setHasLoaded(true), 0);
      return () => clearTimeout(timer);
    }
  }, [once, isIntersecting, hasLoaded]);

  return (
    <Box ref={ref} style={{ minHeight: typeof height === "number" ? `${height}px` : height }}>
      {shouldRender ? children : placeholder || <Skeleton height={height} />}
    </Box>
  );
};
