/**
 * Date utility functions
 * 
 * All dates are stored in UTC in the database.
 * This module provides both dayjs-based (timezone-aware) and native Date API utilities.
 */

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(advanced);

// ============================================================================
// Dayjs-based utilities (timezone-aware)
// ============================================================================

/**
 * Format a date with timezone support
 * @param date - Date string in UTC
 * @param tz - Target timezone
 * @returns Formatted date string
 */
export const prettyDate = (date: string, tz: string): string => {
  return dayjs.utc(date).tz(tz).format("MMM D, YYYY h:mma");
};

/**
 * Format a date with custom format and timezone
 * @param date - Date string in UTC
 * @param format - dayjs format string
 * @param tz - Target timezone
 * @returns Formatted date string
 */
export const formatDate = (
  date: string,
  format: string,
  tz: string
): string => {
  return dayjs.utc(date).tz(tz).format(format);
};

/**
 * Get relative time (e.g., "2 hours ago")
 * Displays in the user's timezone
 * @param date - Date string in UTC
 * @returns Relative time string
 */
export const relativeDate = (date: string): string => {
  const dateInUTC = dayjs.utc(date);
  return dayjs().to(dateInUTC);
};

/**
 * Convert UTC date to specific timezone
 * @param date - Date string or Date object in UTC
 * @param tz - Target timezone
 * @returns Formatted date string or undefined
 */
export const utcToTz = (
  date: undefined | string | Date,
  tz: string
): string | undefined => {
  if (!date) {
    return undefined;
  }
  return dayjs.utc(date).tz(tz).format("YYYY-MM-DDTHH:mm");
};

/**
 * Convert datetime to the user's browser timezone
 * @param date - Date string in UTC
 * @returns Formatted date string with timezone
 */
export const dateToBrowserTz = (date: string): string => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return dayjs.utc(date).tz(userTimezone).format("MMM D, YYYY h:mma z");
};

// ============================================================================
// Native Date API utilities (simple, no timezone handling)
// ============================================================================

/**
 * Format a date string to a human-readable format
 * Uses browser's locale for formatting
 * @param dateString - Date string
 * @returns Formatted date string (e.g., "January 1, 2024")
 */
export const formatDateSimple = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format a date string to include time
 * Uses browser's locale for formatting
 * @param dateString - Date string
 * @returns Formatted date and time string (e.g., "January 1, 2024, 12:00 PM")
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format a date string to a relative time (e.g., "2 days ago")
 * Simple implementation without dayjs
 * @param dateString - Date string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  }

  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(diffInDays / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};
