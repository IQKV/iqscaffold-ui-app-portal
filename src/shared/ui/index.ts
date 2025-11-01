// Shared UI public API
export { AppLayout } from "./app-layout";
export { LoadingOverlay } from "./loading-overlay";
export {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
} from "./data-table";
export { ConfirmationModal, useConfirmationModal } from "./confirmation-modal";
export { ProtectedRoute } from "./protected-route";

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

// Auth demo component
export { AuthDemo } from "./auth-demo";
export { LoginForm } from "./login-form";
export { AuthExamples } from "./auth-examples";
