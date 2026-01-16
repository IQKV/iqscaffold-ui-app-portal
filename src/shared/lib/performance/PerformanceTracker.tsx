import React, { useEffect, useRef } from "react";
import { performanceMonitor } from "./performanceMonitor";

/**
 * PerformanceTracker Component
 *
 * HOC and component for tracking component render performance.
 * Automatically measures render times and reports slow renders.
 *
 * Requirements: 13.7
 */

interface PerformanceTrackerProps {
  name: string;
  children: React.ReactNode;
  trackRenders?: boolean;
  trackMounts?: boolean;
}

export const PerformanceTracker: React.FC<PerformanceTrackerProps> = ({
  name,
  children,
  trackRenders = true,
  trackMounts = true,
}) => {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  // Track mount time
  useEffect(() => {
    if (trackMounts) {
      mountTime.current = performance.now();
      performanceMonitor.trackMetric("component_mount", 0, { component: name });

      return () => {
        const unmountTime = performance.now();
        const lifetime = unmountTime - mountTime.current;
        performanceMonitor.trackMetric("component_lifetime", lifetime, {
          component: name,
          renderCount: renderCount.current,
        });
      };
    }
  }, [name, trackMounts]);

  // Track render time
  useEffect(() => {
    if (trackRenders) {
      renderCount.current += 1;
      const renderTime = performance.now();

      // Use requestIdleCallback if available, otherwise setTimeout
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => {
          const duration = performance.now() - renderTime;
          performanceMonitor.trackMetric("component_render", duration, {
            component: name,
            renderNumber: renderCount.current,
          });
        });
      } else {
        setTimeout(() => {
          const duration = performance.now() - renderTime;
          performanceMonitor.trackMetric("component_render", duration, {
            component: name,
            renderNumber: renderCount.current,
          });
        }, 0);
      }
    }
  });

  return <>{children}</>;
};
