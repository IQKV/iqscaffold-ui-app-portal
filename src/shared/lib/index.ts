// Shared lib public API
export { queryClient } from "./query-client";
export { api } from "./client";
export { publicApi } from "./public-client";

export { notificationService } from "./notifications";
export * from "./dates";
export * from "./helpers";
export * from "./string-helper";
export * from "./pagination";
export * from "./http-error";
export * from "./rfc9457-problem-details";
export * from "./retry-utils";
export * from "./use-form-mutation";
export * from "./auth-utils";
export * from "./test-utils";
export * from "./msw-config";
export { useMSWControl } from "./use-msw-control";

// Tenant utilities
export * from "./tenant-utils";

// Locale management
export * from "./locale-preference";
export * from "./locale-manager";

// Feature management
export { useFeatures } from "./hooks/useFeatures";
export { useEnabledFeatures } from "./hooks/useEnabledFeatures";
export { FeatureProvider, useFeatureContext } from "./contexts/FeatureContext";
