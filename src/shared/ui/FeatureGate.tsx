import React from "react";
import { useEnabledFeatures } from "@/shared/lib/hooks/useEnabledFeatures";
import { Loader } from "@mantine/core";

interface FeatureGateProps {
  /** Feature code to check for enablement */
  feature: string;
  /** Content to render when feature is enabled */
  children: React.ReactNode;
  /** Content to render when feature is disabled (optional) */
  fallback?: React.ReactNode;
  /** Whether to show loading state while features are being fetched */
  showLoading?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
}

/**
 * Component for conditional rendering based on feature enablement.
 *
 * Automatically handles:
 * - Feature loading states
 * - Graceful fallback when features unavailable
 * - Performance optimization with lightweight feature checks
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FeatureGate feature="advanced_analytics">
 *   <AdvancedAnalyticsDashboard />
 * </FeatureGate>
 *
 * // With fallback content
 * <FeatureGate
 *   feature="premium_support"
 *   fallback={<UpgradePrompt />}
 * >
 *   <PremiumSupportPanel />
 * </FeatureGate>
 *
 * // Without loading state (for navigation items)
 * <FeatureGate feature="reporting" showLoading={false}>
 *   <NavItem href="/reports">Reports</NavItem>
 * </FeatureGate>
 * ```
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback = null,
  showLoading = true,
  loadingComponent,
}) => {
  const { hasFeature, loading, error } = useEnabledFeatures();

  // Show loading state if requested and still loading
  if (loading && showLoading) {
    return loadingComponent || <Loader size="sm" />;
  }

  // If there's an error, don't render anything (graceful degradation)
  if (error) {
    console.warn(`FeatureGate: Error checking feature '${feature}':`, error);
    return <>{fallback}</>;
  }

  // Render children if feature is enabled, otherwise render fallback
  return hasFeature(feature) ? <>{children}</> : <>{fallback}</>;
};

/**
 * Higher-order component version of FeatureGate for wrapping components.
 *
 * @example
 * ```tsx
 * const ProtectedComponent = withFeatureGate('advanced_analytics')(MyComponent);
 * ```
 */
export { withFeatureGate } from "./feature-gate-utils";
