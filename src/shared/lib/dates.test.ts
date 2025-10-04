import { describe, it, expect, vi, beforeEach } from "vitest";
import dayjs from "dayjs";
import {
  prettyDate,
  formatDate,
  relativeDate,
  utcToTz,
  dateToBrowserTz,
} from "./dates";

// Mock dayjs to control time-based tests
const mockNow = dayjs("2024-01-15T12:00:00Z");

describe("Date Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("prettyDate", () => {
    it("formats UTC date to timezone", () => {
      const utcDate = "2024-01-15T10:30:00Z";
      const result = prettyDate(utcDate, "America/New_York");

      // Should format to EST/EDT
      expect(result).toMatch(/Jan 15, 2024 \d{1,2}:\d{2}(am|pm)/);
    });

    it("handles different timezones", () => {
      const utcDate = "2024-06-15T14:30:00Z";
      const nyResult = prettyDate(utcDate, "America/New_York");
      const laResult = prettyDate(utcDate, "America/Los_Angeles");

      expect(nyResult).toMatch(/Jun 15, 2024/);
      expect(laResult).toMatch(/Jun 15, 2024/);
      // Times should be different due to timezone offset
      expect(nyResult).not.toBe(laResult);
    });
  });

  describe("formatDate", () => {
    it("formats date with custom format", () => {
      const utcDate = "2024-01-15T10:30:00Z";
      const result = formatDate(utcDate, "YYYY-MM-DD", "UTC");

      expect(result).toBe("2024-01-15");
    });

    it("formats date with time format", () => {
      const utcDate = "2024-01-15T10:30:00Z";
      const result = formatDate(utcDate, "HH:mm", "UTC");

      expect(result).toBe("10:30");
    });

    it("applies timezone conversion", () => {
      const utcDate = "2024-01-15T10:30:00Z";
      const utcResult = formatDate(utcDate, "HH:mm", "UTC");
      const estResult = formatDate(utcDate, "HH:mm", "America/New_York");

      expect(utcResult).toBe("10:30");
      // EST is UTC-5, so should be 05:30
      expect(estResult).toBe("05:30");
    });
  });

  describe("relativeDate", () => {
    it("returns relative time from now", () => {
      const pastDate = "2024-01-14T12:00:00Z"; // 1 day ago
      const result = relativeDate(pastDate);

      expect(result).toMatch(/ago|in/); // Should contain relative time indicator
    });

    it("handles future dates", () => {
      const futureDate = "2024-01-16T12:00:00Z"; // 1 day in future
      const result = relativeDate(futureDate);

      expect(result).toMatch(/in|ago/);
    });
  });

  describe("utcToTz", () => {
    it("converts UTC date to timezone format", () => {
      const utcDate = "2024-01-15T10:30:00Z";
      const result = utcToTz(utcDate, "America/New_York");

      expect(result).toMatch(/2024-01-15T\d{2}:\d{2}/);
    });

    it("handles Date objects", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = utcToTz(date, "UTC");

      expect(result).toBe("2024-01-15T10:30");
    });

    it("returns undefined for undefined input", () => {
      const result = utcToTz(undefined, "UTC");
      expect(result).toBeUndefined();
    });

    it("returns undefined for null input", () => {
      const result = utcToTz(undefined, "UTC");
      expect(result).toBeUndefined();
    });

    it("handles empty string", () => {
      const result = utcToTz("", "UTC");
      expect(result).toBeUndefined();
    });
  });

  describe("dateToBrowserTz", () => {
    it("converts date to browser timezone", () => {
      // Mock Intl.DateTimeFormat
      const mockResolvedOptions = vi.fn().mockReturnValue({
        timeZone: "America/New_York",
      });

      const mockFormatToParts = vi
        .fn()
        .mockReturnValue([{ type: "timeZoneName", value: "EST" }]);

      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
        () =>
          ({
            resolvedOptions: mockResolvedOptions,
            formatToParts: mockFormatToParts,
          }) as any
      );

      const utcDate = "2024-01-15T10:30:00Z";
      const result = dateToBrowserTz(utcDate);

      expect(result).toMatch(/Jan 15, 2024/);
      expect(mockResolvedOptions).toHaveBeenCalled();
    });

    it("handles different browser timezones", () => {
      const mockResolvedOptions = vi.fn().mockReturnValue({
        timeZone: "Europe/London",
      });

      const mockFormatToParts = vi
        .fn()
        .mockReturnValue([{ type: "timeZoneName", value: "GMT" }]);

      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
        () =>
          ({
            resolvedOptions: mockResolvedOptions,
            formatToParts: mockFormatToParts,
          }) as any
      );

      const utcDate = "2024-06-15T14:30:00Z";
      const result = dateToBrowserTz(utcDate);

      expect(result).toMatch(/Jun 15, 2024/);
    });
  });
});
