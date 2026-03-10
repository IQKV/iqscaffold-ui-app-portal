import React from "react";
import { FeatureGate } from "./FeatureGate";

/**
 * Higher-order component version of FeatureGate for wrapping components.
 *
 * @example
 * ```tsx
 * const ProtectedComponent = withFeatureGate('advanced_analytics')(MyComponent);
 * ```
 */
export const withFeatureGate = (feature: string, fallback?: React.ReactNode) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    const WrappedComponent: React.FC<P> = (props) => (
      <FeatureGate feature={feature} fallback={fallback}>
        <Component {...props} />
      </FeatureGate>
    );

    WrappedComponent.displayName = `withFeatureGate(${Component.displayName || Component.name})`;

    return WrappedComponent;
  };
};
