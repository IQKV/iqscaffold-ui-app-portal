import React, { useEffect } from "react";
import { useAuth, redirectToAuth } from "@/processes/auth";
import { LoadingOverlay } from "@/shared/ui";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 * Redirects to auth.iqkv.com if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToAuth();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
