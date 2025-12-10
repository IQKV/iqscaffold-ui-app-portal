import { i18n } from "@lingui/core";

/**
 * Locale-aware currency formatting utilities
 */
export class LocaleCurrencyUtils {
  /**
   * Format currency with user's locale
   */
  static format(
    amount: number,
    currency: string = "USD",
    locale?: string
  ): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    try {
      return new Intl.NumberFormat(userLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback to USD formatting if currency is not supported
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  }

  /**
   * Format currency with compact notation for large amounts
   */
  static formatCompact(
    amount: number,
    currency: string = "USD",
    locale?: string
  ): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    try {
      return new Intl.NumberFormat(userLocale, {
        style: "currency",
        currency,
        notation: "compact",
        compactDisplay: "short",
      }).format(amount);
    } catch (error) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        compactDisplay: "short",
      }).format(amount);
    }
  }

  /**
   * Get currency symbol for locale
   */
  static getCurrencySymbol(currency: string = "USD", locale?: string): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    try {
      const formatter = new Intl.NumberFormat(userLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      
      const parts = formatter.formatToParts(0);
      const symbolPart = parts.find(part => part.type === "currency");
      return symbolPart?.value || currency;
    } catch (error) {
      return currency;
    }
  }
}

/**
 * Locale-aware date and time formatting utilities
 */
export class LocaleDateUtils {
  /**
   * Format date with user's locale
   */
  static formatDate(date: Date, locale?: string): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    return new Intl.DateTimeFormat(userLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  /**
   * Format date with short format
   */
  static formatDateShort(date: Date, locale?: string): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    return new Intl.DateTimeFormat(userLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  /**
   * Format date and time
   */
  static formatDateTime(date: Date, locale?: string): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    return new Intl.DateTimeFormat(userLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Format relative time (e.g., "2 days ago", "in 3 hours")
   */
  static formatRelativeTime(date: Date, locale?: string): string {
    const userLocale = locale || i18n.locale || "en-US";
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    
    try {
      const rtf = new Intl.RelativeTimeFormat(userLocale, { numeric: "auto" });
      
      const absDiff = Math.abs(diffInSeconds);
      
      if (absDiff < 60) {
        return rtf.format(diffInSeconds, "second");
      } else if (absDiff < 3600) {
        return rtf.format(Math.floor(diffInSeconds / 60), "minute");
      } else if (absDiff < 86400) {
        return rtf.format(Math.floor(diffInSeconds / 3600), "hour");
      } else if (absDiff < 2592000) {
        return rtf.format(Math.floor(diffInSeconds / 86400), "day");
      } else if (absDiff < 31536000) {
        return rtf.format(Math.floor(diffInSeconds / 2592000), "month");
      } else {
        return rtf.format(Math.floor(diffInSeconds / 31536000), "year");
      }
    } catch (error) {
      // Fallback to simple formatting
      return this.formatDate(date, locale);
    }
  }

  /**
   * Format billing period
   */
  static formatBillingPeriod(
    startDate: Date,
    endDate: Date,
    locale?: string
  ): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    const start = this.formatDateShort(startDate, userLocale);
    const end = this.formatDateShort(endDate, userLocale);
    
    return `${start} - ${end}`;
  }
}

/**
 * Locale-aware number formatting utilities
 */
export class LocaleNumberUtils {
  /**
   * Format number with locale-specific separators
   */
  static format(number: number, locale?: string): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    return new Intl.NumberFormat(userLocale).format(number);
  }

  /**
   * Format percentage
   */
  static formatPercentage(
    value: number,
    locale?: string,
    minimumFractionDigits: number = 0,
    maximumFractionDigits: number = 1
  ): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    return new Intl.NumberFormat(userLocale, {
      style: "percent",
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value / 100);
  }

  /**
   * Format decimal number
   */
  static formatDecimal(
    number: number,
    locale?: string,
    minimumFractionDigits: number = 2,
    maximumFractionDigits: number = 2
  ): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    return new Intl.NumberFormat(userLocale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(number);
  }

  /**
   * Format compact number (e.g., 1.2K, 3.4M)
   */
  static formatCompact(number: number, locale?: string): string {
    const userLocale = locale || i18n.locale || "en-US";
    
    try {
      return new Intl.NumberFormat(userLocale, {
        notation: "compact",
        compactDisplay: "short",
      }).format(number);
    } catch (error) {
      // Fallback for older browsers
      if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)}M`;
      }
      if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}K`;
      }
      return number.toString();
    }
  }
}

/**
 * Locale-aware validation utilities
 */
export class LocaleValidationUtils {
  /**
   * Get locale-specific validation patterns
   */
  static getValidationPatterns(locale?: string) {
    const userLocale = locale || i18n.locale || "en-US";
    
    // Common patterns that vary by locale
    const patterns = {
      "en-US": {
        phone: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
        postalCode: /^\d{5}(-\d{4})?$/,
        currency: /^\$?[\d,]+(\.\d{2})?$/,
      },
      "en-GB": {
        phone: /^\+?44[-.\s]?(\d{4})[-.\s]?(\d{6})$/,
        postalCode: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
        currency: /^£?[\d,]+(\.\d{2})?$/,
      },
      "de-DE": {
        phone: /^\+?49[-.\s]?(\d{3,4})[-.\s]?(\d{7,8})$/,
        postalCode: /^\d{5}$/,
        currency: /^€?[\d.]+(?:,\d{2})?$/,
      },
      "fr-FR": {
        phone: /^\+?33[-.\s]?(\d{1})[-.\s]?(\d{2})[-.\s]?(\d{2})[-.\s]?(\d{2})[-.\s]?(\d{2})$/,
        postalCode: /^\d{5}$/,
        currency: /^€?[\d\s]+(?:,\d{2})?$/,
      },
      "ja-JP": {
        phone: /^\+?81[-.\s]?(\d{1,4})[-.\s]?(\d{4})[-.\s]?(\d{4})$/,
        postalCode: /^\d{3}-\d{4}$/,
        currency: /^¥?[\d,]+$/,
      },
    };
    
    return patterns[userLocale as keyof typeof patterns] || patterns["en-US"];
  }

  /**
   * Validate phone number for locale
   */
  static isValidPhone(phone: string, locale?: string): boolean {
    const patterns = this.getValidationPatterns(locale);
    return patterns.phone.test(phone);
  }

  /**
   * Validate postal code for locale
   */
  static isValidPostalCode(postalCode: string, locale?: string): boolean {
    const patterns = this.getValidationPatterns(locale);
    return patterns.postalCode.test(postalCode);
  }

  /**
   * Validate currency format for locale
   */
  static isValidCurrencyFormat(currency: string, locale?: string): boolean {
    const patterns = this.getValidationPatterns(locale);
    return patterns.currency.test(currency);
  }
}

/**
 * Locale detection and management utilities
 */
export class LocaleUtils {
  /**
   * Detect user's preferred locale from browser
   */
  static detectLocale(): string {
    if (typeof window !== "undefined") {
      // Check for stored preference first
      const stored = localStorage.getItem("preferred-locale");
      if (stored) return stored;
      
      // Fall back to browser language
      const browserLang = navigator.language || navigator.languages?.[0];
      if (browserLang) {
        // Map browser language to supported locales
        const supportedLocales = ["en", "es", "fr", "de", "ja"];
        const langCode = browserLang.split("-")[0];
        
        if (supportedLocales.includes(langCode)) {
          return langCode;
        }
      }
    }
    
    return "en"; // Default fallback
  }

  /**
   * Set user's preferred locale
   */
  static setLocale(locale: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", locale);
    }
  }

  /**
   * Get locale display name
   */
  static getLocaleDisplayName(locale: string, displayLocale?: string): string {
    const userLocale = displayLocale || i18n.locale || "en";
    
    try {
      return new Intl.DisplayNames([userLocale], { type: "language" }).of(locale) || locale;
    } catch (error) {
      // Fallback to manual mapping
      const names: Record<string, string> = {
        en: "English",
        es: "Español",
        fr: "Français", 
        de: "Deutsch",
        ja: "日本語",
      };
      
      return names[locale] || locale;
    }
  }

  /**
   * Get text direction for locale
   */
  static getTextDirection(locale: string): "ltr" | "rtl" {
    const rtlLocales = ["ar", "he", "fa", "ur"];
    if (rtlLocales.includes(locale)) {
      return "rtl";
    }
    return "ltr";
  }
}