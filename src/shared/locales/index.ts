import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";

export type SupportedLocales = "en" | "ru";

export const availableLocales = ["en", "ru"];

export const localeToFlagEmojiMap: Record<SupportedLocales, string> = {
  en: "🇬🇧",
  ru: "🇷🇺",
};

export const localeToNameMap: Record<SupportedLocales, string> = {
  en: `English`,
  ru: `Русский`,
};

export const getLocaleName = (locale: SupportedLocales) => {
  // eslint-disable-next-line lingui/no-single-variables-to-translate,lingui/no-expression-in-message
  return t`${localeToNameMap[locale]}`;
};

export const getClientLocale = () => {
  if (typeof window !== "undefined") {
    const storedLocale = document.cookie
      .split(";")
      .find((c) => c.includes("locale="))
      ?.split("=")[1];

    if (storedLocale) {
      return getSupportedLocale(storedLocale);
    }

    return getSupportedLocale(window.navigator.language);
  }

  return "en";
};

export async function dynamicActivateLocale(locale: string) {
  const activeLocale = availableLocales.includes(locale) ? locale : "en";
  const module = await import(`../../../locales/${locale}.po`);
  i18n.load(activeLocale, module.messages);
  i18n.activate(activeLocale);
}

export const getSupportedLocale = (userLocale: string) => {
  const normalizedLocale = userLocale.toLowerCase();

  if (availableLocales.includes(normalizedLocale)) {
    return normalizedLocale;
  }

  const mainLanguage = normalizedLocale.split("-")[0];
  const mainLocale = availableLocales.find((locale) => locale.startsWith(mainLanguage));
  if (mainLocale) {
    return mainLocale;
  }

  return "en";
};
