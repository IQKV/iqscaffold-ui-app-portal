/**
 * Utility functions for common operations
 *
 * Note: Date utilities have been moved to @/shared/lib/dates
 */

// Re-export date utilities for backward compatibility
export { formatDateSimple as formatDate, formatDateTime, formatRelativeTime } from "../dates";

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
};

/**
 * Generate initials from a full name
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};
