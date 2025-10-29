import React from "react";
import { type AppError } from "@/shared/lib/http-error";

/**
 * Hook for managing loading states with error handling
 */
export function useLoadingState(initialLoading = false) {
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [error, setError] = React.useState<AppError | null>(null);
  const [progress, setProgress] = React.useState(0);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  const setLoadingError = React.useCallback((error: AppError) => {
    setIsLoading(false);
    setError(error);
  }, []);

  const retry = React.useCallback(() => {
    setError(null);
    setIsLoading(true);
  }, []);

  const updateProgress = React.useCallback((value: number) => {
    setProgress(Math.max(0, Math.min(100, value)));
  }, []);

  return {
    isLoading,
    error,
    progress,
    startLoading,
    stopLoading,
    setLoadingError,
    retry,
    updateProgress,
  };
}
