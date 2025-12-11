import React, { createContext, useContext, useEffect, useState } from "react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { LocaleUtils } from "./locale-formatting";
import { messages as enMessages } from "../../../locales/en";
import { messages as esMessages } from "../../../locales/es";
import { messages as frMessages } from "../../../locales/fr";
import { messages as deMessages } from "../../../locales/de";
import { messages as jaMessages } from "../../../locales/ja";

// Lazy load other locale messages
const loadLocaleMessages = async (locale: string) => {
  switch (locale) {
    case "es":
      return esMessages;
    case "fr":
      return frMessages;
    case "de":
      return deMessages;
    case "ja":
      return jaMessages;
    default:
      return enMessages;
  }
};

interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  isLoading: boolean;
  supportedLocales: readonly string[];
  getLocaleDisplayName: (locale: string) => string;
  textDirection: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  defaultLocale?: string;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({
  children,
  defaultLocale,
}) => {
  const [locale, setLocaleState] = useState<string>(
    defaultLocale || LocaleUtils.detectLocale()
  );
  const [isLoading, setIsLoading] = useState(true);

  const supportedLocales = ["en", "es", "fr", "de", "ja"] as const;

  // Initialize i18n with default locale
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        setIsLoading(true);

        // Load messages for the current locale
        const messages = await loadLocaleMessages(locale);

        // Configure i18n
        i18n.load(locale, messages);
        i18n.activate(locale);

        // Update document attributes
        document.documentElement.lang = locale;
        document.documentElement.dir = LocaleUtils.getTextDirection(locale);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize i18n:", error);

        // Fallback to English
        i18n.load("en", enMessages);
        i18n.activate("en");
        setLocaleState("en");
        setIsLoading(false);
      }
    };

    initializeI18n();
  }, [locale]);

  const setLocale = async (newLocale: string): Promise<void> => {
    if (!supportedLocales.includes(newLocale as any)) {
      console.warn(`Unsupported locale: ${newLocale}`);
      return;
    }

    try {
      setIsLoading(true);

      // Load messages for the new locale
      const messages = await loadLocaleMessages(newLocale);

      // Update i18n
      i18n.load(newLocale, messages);
      i18n.activate(newLocale);

      // Update state and storage
      setLocaleState(newLocale);
      LocaleUtils.setLocale(newLocale);

      // Update document attributes
      document.documentElement.lang = newLocale;
      document.documentElement.dir = LocaleUtils.getTextDirection(newLocale);

      setIsLoading(false);
    } catch (error) {
      console.error(`Failed to load locale ${newLocale}:`, error);
      setIsLoading(false);
    }
  };

  const getLocaleDisplayName = (targetLocale: string): string => {
    return LocaleUtils.getLocaleDisplayName(targetLocale, locale);
  };

  const textDirection = LocaleUtils.getTextDirection(locale);

  const contextValue: LocaleContextValue = {
    locale,
    setLocale,
    isLoading,
    supportedLocales,
    getLocaleDisplayName,
    textDirection,
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      <I18nProvider i18n={i18n}>
        <div dir={textDirection}>{children}</div>
      </I18nProvider>
    </LocaleContext.Provider>
  );
};

/**
 * Hook to access locale context
 */
export const useLocale = (): LocaleContextValue => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};

/**
 * Hook for locale-aware formatting
 */
export const useLocaleFormatting = () => {
  const { locale } = useLocale();

  return {
    formatCurrency: (amount: number, currency?: string) => {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency || "USD",
      }).format(amount);
    },

    formatDate: (date: Date) => {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    },

    formatNumber: (number: number) => {
      return new Intl.NumberFormat(locale).format(number);
    },

    formatPercentage: (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(value / 100);
    },
  };
};
