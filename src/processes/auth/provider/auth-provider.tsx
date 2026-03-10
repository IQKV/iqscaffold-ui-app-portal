import { useEffect, type PropsWithChildren } from "react";
import { useAuthStore } from "../model/store";

export function AuthProvider({ children }: PropsWithChildren) {
  const initialize = useAuthStore((s) => s.initialize);
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);

  useEffect(() => {
    // Check for tokens in URL parameters (from auth portal redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // Store tokens and authenticate user SYNCHRONOUSLY
      loginWithTokens({ accessToken, refreshToken });

      // Clean URL immediately to remove tokens from browser history
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // Always initialize to handle existing tokens or set unauthenticated state
    initialize();
  }, [initialize, loginWithTokens]);

  return children as any;
}
