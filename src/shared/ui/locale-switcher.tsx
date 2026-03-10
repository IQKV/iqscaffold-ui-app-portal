/**
 * Locale Switcher Component
 *
 * Provides a UI for users to change their language preference.
 * Uses the unified i18n approach to update both frontend and backend.
 */

import { Select } from "@mantine/core";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react";
import { changeLocale, getCurrentLocale } from "@/shared/lib/locale-manager";
import {
  availableLocales,
  localeToNameMap,
  localeToFlagEmojiMap,
  type SupportedLocales,
} from "@/shared/locales";
import { notificationService } from "@/shared/lib/notifications";

interface LocaleSwitcherProps {
  /**
   * Whether to update backend user preference
   * Set to false for unauthenticated users
   */
  updateBackend?: boolean;

  /**
   * Size of the select component
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  /**
   * Custom width
   */
  width?: string | number;
}

export function LocaleSwitcher({
  updateBackend = true,
  size = "sm",
  width = 200,
}: LocaleSwitcherProps) {
  const { i18n } = useLingui();
  const [isChanging, setIsChanging] = useState(false);

  const currentLocale = getCurrentLocale();

  const localeOptions = availableLocales.map((locale) => ({
    value: locale,
    label: `${localeToFlagEmojiMap[locale as SupportedLocales]} ${localeToNameMap[locale as SupportedLocales]}`,
  }));

  const handleLocaleChange = async (value: string | null) => {
    if (!value || value === currentLocale) {
      return;
    }

    setIsChanging(true);

    try {
      await changeLocale(value, updateBackend);

      notificationService.success({
        title: i18n._("Language changed"),
        message: i18n._("Your language preference has been updated"),
      });
    } catch (error) {
      console.error("Failed to change locale:", error);

      notificationService.error({
        title: i18n._("Language change failed"),
        message: i18n._("Failed to update language preference. Please try again."),
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Select
      label={i18n._("Language")}
      placeholder={i18n._("Select language")}
      data={localeOptions}
      value={currentLocale}
      onChange={handleLocaleChange}
      disabled={isChanging}
      size={size}
      w={width}
      searchable={false}
      allowDeselect={false}
    />
  );
}

/**
 * Compact locale switcher without label (for headers/toolbars)
 */
export function CompactLocaleSwitcher({
  updateBackend = true,
  size = "xs",
}: Omit<LocaleSwitcherProps, "width">) {
  const { i18n } = useLingui();
  const [isChanging, setIsChanging] = useState(false);

  const currentLocale = getCurrentLocale();

  const localeOptions = availableLocales.map((locale) => ({
    value: locale,
    label: `${localeToFlagEmojiMap[locale as SupportedLocales]} ${localeToNameMap[locale as SupportedLocales]}`,
  }));

  const handleLocaleChange = async (value: string | null) => {
    if (!value || value === currentLocale) {
      return;
    }

    setIsChanging(true);

    try {
      await changeLocale(value, updateBackend);

      notificationService.success({
        message: i18n._("Language changed successfully"),
      });
    } catch (error) {
      console.error("Failed to change locale:", error);

      notificationService.error({
        message: i18n._("Failed to change language"),
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Select
      data={localeOptions}
      value={currentLocale}
      onChange={handleLocaleChange}
      disabled={isChanging}
      size={size}
      w={120}
      searchable={false}
      allowDeselect={false}
      aria-label={i18n._("Select language")}
    />
  );
}
