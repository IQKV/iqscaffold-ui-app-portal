/**
 * Locale Preference Management
 *
 * Manages user locale preferences with support for:
 * - Local storage persistence
 * - Backend synchronization
 * - Fallback to browser locale
 */

const LOCALE_PREFERENCE_KEY = "userLocalePreference";

/**
 * Get user's explicitly set locale preference from local storage
 * Returns null if user hasn't set a preference
 */
export function getUserLocalePreference(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(LOCALE_PREFERENCE_KEY);
}

/**
 * Set user's locale preference in local storage
 * This should be called after successfully updating backend preference
 */
export function setUserLocalePreference(locale: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(LOCALE_PREFERENCE_KEY, locale);
}

/**
 * Clear user's locale preference from local storage
 * This should be called on logout or when resetting to browser default
 */
export function clearUserLocalePreference(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(LOCALE_PREFERENCE_KEY);
}

/**
 * Check if user has an explicit locale preference set
 */
export function hasUserLocalePreference(): boolean {
  return getUserLocalePreference() !== null;
}
