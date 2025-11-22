/**
 * Custom hook to access specific preference values
 * Useful for components that only need one preference value
 */

import { useUserPreferences } from "./use-user-preferences";
import type { UserPreference } from "./user-preference-types";

type PreferenceKey = keyof UserPreference;

/**
 * Hook to get a specific preference value
 * @param key - The preference key to retrieve
 * @param defaultValue - Default value if preference is not loaded
 */
export function usePreferenceValue<K extends PreferenceKey>(
  key: K,
  defaultValue?: UserPreference[K]
): UserPreference[K] | undefined {
  const { data: preferences } = useUserPreferences();
  return preferences?.[key] ?? defaultValue;
}

/**
 * Hook to get the current theme
 */
export function useTheme() {
  return usePreferenceValue("theme", "light");
}

/**
 * Hook to get the current locale
 */
export function useLocale() {
  return usePreferenceValue("locale", "en");
}

/**
 * Hook to get the current timezone
 */
export function useTimezone() {
  return usePreferenceValue("timezone", "UTC");
}

/**
 * Hook to get the current currency
 */
export function useCurrency() {
  return usePreferenceValue("currency", "USD");
}

/**
 * Hook to check if notifications are enabled
 */
export function useNotificationSettings() {
  const { data: preferences } = useUserPreferences();
  return {
    email: preferences?.notificationEmail ?? true,
    sms: preferences?.notificationSms ?? false,
    push: preferences?.notificationPush ?? true,
  };
}

/**
 * Hook to check if two-factor auth is enabled
 */
export function useTwoFactorStatus() {
  const { data: preferences } = useUserPreferences();
  return {
    enabled: preferences?.twoFactorEnabled ?? false,
    method: preferences?.twoFactorMethod ?? null,
  };
}
