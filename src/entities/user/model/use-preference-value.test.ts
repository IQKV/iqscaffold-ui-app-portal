import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  usePreferenceValue,
  useTheme,
  useLocale,
  useTimezone,
  useCurrency,
  useNotificationSettings,
  useTwoFactorStatus,
} from "./use-preference-value";
import * as useUserPreferencesModule from "./use-user-preferences";

vi.mock("./use-user-preferences", () => ({
  useUserPreferences: vi.fn(),
}));

describe("usePreferenceValue", () => {
  describe("usePreferenceValue", () => {
    it("returns preference value when available", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: { theme: "dark", locale: "en" },
      } as any);

      const { result } = renderHook(() => usePreferenceValue("theme"));
      expect(result.current).toBe("dark");
    });

    it("returns default value when preference is not loaded", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => usePreferenceValue("theme", "light"));
      expect(result.current).toBe("light");
    });

    it("returns undefined when no data and no default", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => usePreferenceValue("theme"));
      expect(result.current).toBeUndefined();
    });
  });

  describe("useTheme", () => {
    it("returns theme preference", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: { theme: "dark" },
      } as any);

      const { result } = renderHook(() => useTheme());
      expect(result.current).toBe("dark");
    });

    it("returns default light theme", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useTheme());
      expect(result.current).toBe("light");
    });
  });

  describe("useLocale", () => {
    it("returns locale preference", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: { locale: "es" },
      } as any);

      const { result } = renderHook(() => useLocale());
      expect(result.current).toBe("es");
    });

    it("returns default en locale", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useLocale());
      expect(result.current).toBe("en");
    });
  });

  describe("useTimezone", () => {
    it("returns timezone preference", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: { timezone: "America/New_York" },
      } as any);

      const { result } = renderHook(() => useTimezone());
      expect(result.current).toBe("America/New_York");
    });

    it("returns default UTC timezone", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useTimezone());
      expect(result.current).toBe("UTC");
    });
  });

  describe("useCurrency", () => {
    it("returns currency preference", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: { currency: "EUR" },
      } as any);

      const { result } = renderHook(() => useCurrency());
      expect(result.current).toBe("EUR");
    });

    it("returns default USD currency", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useCurrency());
      expect(result.current).toBe("USD");
    });
  });

  describe("useNotificationSettings", () => {
    it("returns notification settings", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: {
          notificationEmail: true,
          notificationSms: true,
          notificationPush: false,
        },
      } as any);

      const { result } = renderHook(() => useNotificationSettings());
      expect(result.current).toEqual({
        email: true,
        sms: true,
        push: false,
      });
    });

    it("returns default notification settings", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useNotificationSettings());
      expect(result.current).toEqual({
        email: true,
        sms: false,
        push: true,
      });
    });
  });

  describe("useTwoFactorStatus", () => {
    it("returns two-factor status", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: {
          twoFactorEnabled: true,
          twoFactorMethod: "totp",
        },
      } as any);

      const { result } = renderHook(() => useTwoFactorStatus());
      expect(result.current).toEqual({
        enabled: true,
        method: "totp",
      });
    });

    it("returns default two-factor status", () => {
      vi.mocked(useUserPreferencesModule.useUserPreferences).mockReturnValue({
        data: undefined,
      } as any);

      const { result } = renderHook(() => useTwoFactorStatus());
      expect(result.current).toEqual({
        enabled: false,
        method: null,
      });
    });
  });
});
