export const formatCurrency = (value: number | string, currency = "USD") => {
  const locale = typeof window !== "undefined" ? navigator.language : "en-US";
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  return formatter.format(numericValue);
};

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
  const locale = typeof window !== "undefined" ? navigator.language : "en-US";
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

export const formatDateTime = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
  const locale = typeof window !== "undefined" ? navigator.language : "en-US";
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
  const locale = typeof window !== "undefined" ? navigator.language : "en-US";
  const formatter = new Intl.NumberFormat(locale, options);

  return formatter.format(value);
};

export const formatPercentage = (value: number, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};
