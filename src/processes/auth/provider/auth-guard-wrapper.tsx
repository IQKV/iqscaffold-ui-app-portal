import { type PropsWithChildren, useEffect } from "react";
import { useAuthStore } from "../model/store";
import { redirectToAuth } from "../lib/navigation";

/**
 * AuthGuardWrapper - Prevents rendering any content for unauthenticated users
 *
 * This wrapper ensures that:
 * 1. Nothing is shown to the user while authentication is being checked
 * 2. Unauthenticated users are immediately redirected to AUTH_DOMAIN
 * 3. Only authenticated users see the app content
 */
export function AuthGuardWrapper({ children }: PropsWithChildren) {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    // Redirect immediately when we know the user is not authenticated
    if (status === "unauthenticated") {
      redirectToAuth();
    }
  }, [status]);

  // Don't render anything until we're authenticated
  // This prevents any flash of content or UI elements
  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
