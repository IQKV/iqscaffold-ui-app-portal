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
export { LocaleSelector } from "./locale-selector";

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

// Billing UI Components
export * from "./billing";

// Authority-based Access Control Components
export * from "./authority-guard";
export * from "./protected-action";
export * from "./protected-route";
export * from "./conditional-widget";
