// Shared UI public API
export { AppLayout } from "./app-layout";
export { LoadingOverlay } from "./loading-overlay";
export { DataTable, type DataTableColumn, type DataTableProps } from "./data-table";
export { ConfirmationModal, useConfirmationModal } from "./confirmation-modal";
export { ThemeToggle } from "./theme-toggle";
export { LocaleSwitcher, CompactLocaleSwitcher } from "./locale-switcher";

// Enhanced error handling components
export { ErrorBoundary, DefaultErrorFallback } from "./error-boundary/error-boundary";

export type { ErrorBoundaryProps, ErrorFallbackProps } from "./error-boundary/error-boundary";

export { useErrorHandler, withErrorBoundary } from "./error-boundary/error-boundary-utils";

// Enhanced loading states
export {
  LoadingState,
  SkeletonLoading,
  ProgressLoading,
  RetryableLoading,
  CardLoading,
  TableLoading,
} from "./loading-state/loading-state";

export { useLoadingState } from "./loading-state/loading-state-hooks";

// Performance optimization components
export { VirtualizedList } from "./virtualized-list";
export { LazyLoad } from "./lazy-load";
export { ProgressiveLoader } from "./progressive-loader";
export { PerformanceDashboard } from "./performance-dashboard";

// Feature management components
export { FeatureGate } from "./FeatureGate";
export { withFeatureGate } from "./feature-gate-utils";
export { FeatureErrorBoundary, SilentFeatureErrorBoundary } from "./FeatureErrorBoundary";
export { FeatureUsage, CompactFeatureUsage, FeatureUsageList } from "./FeatureUsage";

// Generic service health components
export { GenericServiceDegradationBanner } from "./GenericServiceDegradationBanner";

// Generic access guards
export { ServiceAccessGuard } from "./guards/ServiceAccessGuard";

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================
// These components have been moved to their respective entity layers.
// Re-exporting here for backward compatibility during migration.
// TODO: Update all imports to use entity-specific paths and remove these exports

// Billing components (moved to @/entities/billing/ui)
export {
  BillingServiceDegradationBanner,
  SubscriptionInfo,
  BillingAccessGuard,
  BillingManagerGuard,
} from "@/entities/billing/ui";

// CRM components (moved to @/entities/crm/ui)
export {
  CrmServiceDegradationBanner,
  CrmAccessGuard,
  CrmContactManagerGuard,
  CrmLeadManagerGuard,
  CrmPipelineManagerGuard,
} from "@/entities/crm/ui";
