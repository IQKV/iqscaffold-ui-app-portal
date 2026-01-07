/**
 * Locale Preference Management
 *
 * Local storage management for user locale preferences.
 * Works in conjunction with backend user preferences API.
 *
 * STORAGE STRATEGY:
 * - Local storage provides immediate access for API headers
 * - Backend database is source of truth (synced across devices)
 * - Local storage updated after successful backend update
 *
 * USAGE IN API REQUESTS:
 * - X-User-Locale header sent when preference exists
 * - Backend LocaleResolver prioritizes X-User-Locale over Accept-Language
 * - Ensures consistent locale for API responses, errors, and emails
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
