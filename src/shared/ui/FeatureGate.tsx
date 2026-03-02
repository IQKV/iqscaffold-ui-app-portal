import React from "react";
import { useEnabledFeatures } from "@/shared/lib/contexts/FeatureContext";
import { useAuth } from "@/processes/auth";
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
  /** Whether to use authority-based access check (default: true) */
  checkAuthorities?: boolean;
}

/**
 * Component for conditional rendering based on feature enablement and authority access.
 *
 * Automatically handles:
 * - Feature loading states
 * - Authority-based access validation
 * - Graceful fallback when features unavailable
 * - Performance optimization with lightweight feature checks
 *
 * @example
 * ```tsx
 * // Basic usage with authority check
 * <FeatureGate feature="crm">
 *   <CRMDashboard />
 * </FeatureGate>
 *
 * // Feature check only (no authority validation)
 * <FeatureGate feature="analytics" checkAuthorities={false}>
 *   <AnalyticsDashboard />
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
  checkAuthorities = true,
}) => {
  const { hasFeature, canAccessFeature, loading, error } = useEnabledFeatures();
  const { isSuperAdmin } = useAuth();

  // SUPER_ADMIN bypass: Always grant access to SUPER_ADMIN users
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Show loading state if requested and still loading
  if (loading && showLoading) {
    return loadingComponent || <Loader size="sm" />;
  }

  // If there's an error, don't render anything (graceful degradation)
  if (error) {
    console.warn(`FeatureGate: Error checking feature '${feature}':`, error);
    return <>{fallback}</>;
  }

  // Determine access based on checkAuthorities flag
  const hasAccess = checkAuthorities
    ? canAccessFeature(feature)
    : hasFeature(feature);

  // Render children if feature is accessible, otherwise render fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
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
