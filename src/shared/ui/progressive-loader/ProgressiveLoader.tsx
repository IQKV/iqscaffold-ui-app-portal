import React, { useState, useEffect } from "react";
import { Box, Skeleton } from "@mantine/core";

/**
 * ProgressiveLoader Component
 *
 * Implements progressive loading for components with staggered reveal.
 * Improves perceived performance by showing content incrementally.
 *
 * Features:
 * - Staggered loading animation
 * - Configurable delay between items
 * - Smooth fade-in transitions
 * - Skeleton placeholder support
 *
 * Requirements: 13.2, 13.4, 13.6
 */

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  delay?: number;
  isLoading?: boolean;
  skeletonHeight?: number | string;
  index?: number;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  delay = 100,
  isLoading = false,
  skeletonHeight = 200,
  index = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay * index);

      return () => clearTimeout(timer);
    }
    // Reset visibility when loading starts - use separate effect or derived state
    return undefined;
  }, [isLoading, delay, index]);

  // Derive visibility from loading state
  const shouldShow = !isLoading && isVisible;

  if (isLoading) {
    return <Skeleton height={skeletonHeight} />;
  }

  return (
    <Box
      style={{
        opacity: shouldShow ? 1 : 0,
        transform: shouldShow ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
      }}
    >
      {children}
    </Box>
  );
};
