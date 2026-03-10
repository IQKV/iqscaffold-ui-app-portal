export const formatCurrency = (value: number | string, currency = "USD") => {
  const locale = typeof window !== "undefined" ? navigator.language : "en-US";
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  return formatter.format(numericValue / 100); // Assuming cents/input as per Stripe standard
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: { [key: string]: string } = {
    USD: "$",
    CAD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    RUB: "₽",
    AUD: "$",
    CHF: "CHF",
    BRL: "R$",
    ZAR: "R",
  };

  return currencySymbols[currencyCode.toUpperCase()] || currencyCode;
};

export const getUserCurrency = (): string => {
  if (typeof window === "undefined") {
    return "USD";
  }

  try {
    const locale = navigator.language;
    // Simple mapping for common locales
    if (locale.includes("US")) {
      return "USD";
    }
    if (locale.includes("GB")) {
      return "GBP";
    }
    if (locale.includes("CA")) {
      return "CAD";
    }
    if (locale.includes("AU")) {
      return "AUD";
    }
    if (["FR", "DE", "IT", "ES", "NL", "BE", "IE"].some((c) => locale.includes(c))) {
      return "EUR";
    }

    return "USD";
  } catch {
    return "USD";
  }
};
