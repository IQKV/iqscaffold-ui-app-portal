import React from "react";
import { errorFromAxios } from "@/shared/lib/http-error";
import { notificationService } from "@/shared/lib/notifications";

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  return React.useCallback((error: unknown, context?: string) => {
    const appError = errorFromAxios(error);

    console.error(`Error in ${context || "component"}:`, error);

    notificationService.fromAppError(appError, {
      title: context ? `Error in ${context}` : "Component Error",
      showTechnicalDetails: process.env.NODE_ENV === "development",
    });
  }, []);
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  _errorBoundaryProps?: any,
) {
  const WrappedComponent = (props: P) => {
    // This would need to import ErrorBoundary to avoid circular dependency
    // For now, just return the component as-is
    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
