import { useEffect, useState } from "react";
import { getAuthConfig } from "@/app/config";

/**
 * Hook to check authentication state
 * Returns whether the user is authenticated based on the presence of access token
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const config = getAuthConfig();
      const accessToken = localStorage.getItem(
        config.tokenStorage.accessTokenKey
      );
      setIsAuthenticated(!!accessToken);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (e.g., login/logout in another tab)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return { isAuthenticated, isLoading };
}

/**
 * Redirect to auth domain for login
 */
export function redirectToAuth() {
  const config = getAuthConfig();
  const currentUrl = window.location.href;
  window.location.href = `${config.domains.auth}?redirect=${encodeURIComponent(currentUrl)}`;
}

/**
 * Clear tokens and redirect to auth domain
 */
export function logout() {
  const config = getAuthConfig();
  localStorage.removeItem(config.tokenStorage.accessTokenKey);
  localStorage.removeItem(config.tokenStorage.refreshTokenKey);
  redirectToAuth();
}
