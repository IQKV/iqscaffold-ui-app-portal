import React from "react";
import { PerformanceTracker } from "./PerformanceTracker";

/**
 * HOC for wrapping components with performance tracking
 *
 * Requirements: 13.7
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name =
      componentName || Component.displayName || Component.name || "Unknown";

    return (
      <PerformanceTracker name={name}>
        <Component {...props} />
      </PerformanceTracker>
    );
  };

  WrappedComponent.displayName = `withPerformanceTracking(${
    componentName || Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
