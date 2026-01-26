// Shared UI public API
export { AppLayout } from "./app-layout";
export { LoadingOverlay } from "./loading-overlay";
export {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
} from "./data-table";
export { ConfirmationModal, useConfirmationModal } from "./confirmation-modal";
export { ThemeToggle } from "./theme-toggle";
export { LocaleSwitcher, CompactLocaleSwitcher } from "./locale-switcher";

// Enhanced error handling components
export {
  ErrorBoundary,
  DefaultErrorFallback,
} from "./error-boundary/error-boundary";

export type {
  ErrorBoundaryProps,
  ErrorFallbackProps,
} from "./error-boundary/error-boundary";

export {
  useErrorHandler,
  withErrorBoundary,
} from "./error-boundary/error-boundary-utils";

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

// Enhanced form fields - comprehensive form field with Mantine + Zod + Lingui
export { FormField, EnhancedFormField } from "./enhanced-form-field";

export { useEnhancedFormValidation } from "./enhanced-form-field/validation-utils";

// Performance optimization components
export { VirtualizedList } from "./virtualized-list";
export { LazyLoad } from "./lazy-load";
export { ProgressiveLoader } from "./progressive-loader";
export { PerformanceDashboard } from "./performance-dashboard";

// Feature management components
export { FeatureGate } from "./FeatureGate";
export { withFeatureGate } from "./feature-gate-utils";
export {
  FeatureErrorBoundary,
  SilentFeatureErrorBoundary,
} from "./FeatureErrorBoundary";
export {
  FeatureUsage,
  CompactFeatureUsage,
  FeatureUsageList,
} from "./FeatureUsage";
export { SubscriptionInfo, SubscriptionStatusBadge } from "./SubscriptionInfo";

// Service health components
export { BillingServiceDegradationBanner } from "./BillingServiceDegradationBanner";
export { GenericServiceDegradationBanner } from "./GenericServiceDegradationBanner";

// Access guards
export { ServiceAccessGuard } from "./guards/ServiceAccessGuard";
export { BillingAccessGuard } from "./guards/BillingAccessGuard";
