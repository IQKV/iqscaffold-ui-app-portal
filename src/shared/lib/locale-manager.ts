/**
 * Locale Manager
 *
 * Unified i18n approach that coordinates frontend and backend:
 *
 * BACKEND LOCALE RESOLUTION (Spring Boot):
 * Priority: X-User-Locale header > Accept-Language header > Default locale
 * - Custom LocaleResolver checks X-User-Locale first (user preference)
 * - Falls back to Accept-Language (browser/current locale)
 * - MessageSource provides localized messages from i18n/messages*.properties
 *
 * FRONTEND LOCALE MANAGEMENT (React + Lingui):
 * - Lingui i18n for UI translations
 * - API client sends both Accept-Language and X-User-Locale headers
 * - Local storage caches user preference
 * - Query cache invalidation ensures fresh localized data
 *
 * UNIFIED FLOW:
 * 1. User changes locale → Update frontend UI (Lingui)
 * 2. Update backend user preference via API
 * 3. Store preference locally for immediate use
 * 4. Subsequent API calls include X-User-Locale header
 * 5. Backend returns localized responses (errors, validation, emails)
 */

import { i18n } from "@lingui/core";
import { dynamicActivateLocale } from "@/shared/locales";
import {
  getUserLocalePreference,
  setUserLocalePreference,
  clearUserLocalePreference,
} from "./locale-preference";
import { userPreferenceApi } from "@/shared/api/user-preference-api";
import { queryClient } from "@/shared/lib/query-client";

/**
 * Change the application locale
 * This updates both frontend and backend, and refreshes data
 *
 * @param newLocale - The locale code to switch to (e.g., 'en', 'es', 'fr')
 * @param updateBackend - Whether to update backend user preference (default: true)
 * @returns Promise that resolves when locale change is complete
 */
export async function changeLocale(
  newLocale: string,
  updateBackend: boolean = true,
): Promise<void> {
  try {
    // 1. Update frontend UI locale
    await dynamicActivateLocale(newLocale);

    // 2. Update backend user preference if requested and user is authenticated
    if (updateBackend) {
      try {
        await userPreferenceApi.updateMyPreferences({
          locale: newLocale,
        });

        // 3. Store preference locally for future requests
        setUserLocalePreference(newLocale);
      } catch (error) {
        // User might not be authenticated or backend update failed
        // Still update frontend, but don't persist preference
        console.warn("Failed to update backend locale preference:", error);
      }
    } else {
      // Just store locally without backend update
      setUserLocalePreference(newLocale);
    }

    // 4. Invalidate all queries to refetch data with new locale
    // This ensures error messages, validation messages, etc. are in the new language
    queryClient.invalidateQueries();
  } catch (error) {
    console.error("Failed to change locale:", error);
    throw error;
  }
}

/**
 * Initialize locale on application start
 * Priority: Backend user preference > Local storage > Browser locale
 *
 * @returns Promise that resolves with the initialized locale
 */
export async function initializeLocale(): Promise<string> {
  try {
    // Try to get user preferences from backend (requires authentication)
    const preferences = await userPreferenceApi.getMyPreferences();

    if (preferences.locale) {
      // Use backend preference as source of truth
      await dynamicActivateLocale(preferences.locale);
      setUserLocalePreference(preferences.locale);
      return preferences.locale;
    }
  } catch (error) {
    // User not authenticated or error fetching preferences
    // Fall through to local/browser locale
  }

  // Check local storage for previously set preference
  const localPreference = getUserLocalePreference();
  if (localPreference) {
    await dynamicActivateLocale(localPreference);
    return localPreference;
  }

  // Fall back to browser locale detection
  const browserLocale = getBrowserLocale();
  await dynamicActivateLocale(browserLocale);
  return browserLocale;
}

/**
 * Reset locale to browser default
 * Clears user preference from both frontend and backend
 */
export async function resetLocale(): Promise<void> {
  try {
    // Clear backend preference
    await userPreferenceApi.updateMyPreferences({
      locale: null as any, // Reset to null/default
    });
  } catch (error) {
    console.warn("Failed to clear backend locale preference:", error);
  }

  // Clear local preference
  clearUserLocalePreference();

  // Switch to browser locale
  const browserLocale = getBrowserLocale();
  await dynamicActivateLocale(browserLocale);

  // Refresh data
  queryClient.invalidateQueries();
}

/**
 * Get current active locale
 */
export function getCurrentLocale(): string {
  return i18n.locale || "en";
}

/**
 * Get browser's preferred locale
 * Uses navigator.language with fallback to 'en'
 */
function getBrowserLocale(): string {
  if (typeof window === "undefined") {
    return "en";
  }

  const browserLang = window.navigator.language;

  // Extract language code (e.g., 'en' from 'en-US')
  const langCode = browserLang.split("-")[0].toLowerCase();

  // Return language code or default to English
  return langCode || "en";
}
