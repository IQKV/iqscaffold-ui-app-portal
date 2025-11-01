import { getAuthConfig } from "@/app/config";

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
export function logoutAndRedirect() {
  const config = getAuthConfig();
  localStorage.removeItem(config.tokenStorage.accessTokenKey);
  localStorage.removeItem(config.tokenStorage.refreshTokenKey);
  redirectToAuth();
}
