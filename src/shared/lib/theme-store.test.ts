import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThemeStore } from "./theme-store";

describe("Theme Store", () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store state
    useThemeStore.setState({ colorScheme: "light" });
  });

  describe("initial state", () => {
    it("has light color scheme by default", () => {
      const { result } = renderHook(() => useThemeStore());
      expect(result.current.colorScheme).toBe("light");
    });
  });

  describe("setColorScheme", () => {
    it("sets color scheme to dark", () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setColorScheme("dark");
      });

      expect(result.current.colorScheme).toBe("dark");
    });

    it("sets color scheme to light", () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setColorScheme("dark");
      });

      act(() => {
        result.current.setColorScheme("light");
      });

      expect(result.current.colorScheme).toBe("light");
    });

    it("persists color scheme to localStorage", () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setColorScheme("dark");
      });

      const stored = localStorage.getItem("theme-storage");
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!).state.colorScheme).toBe("dark");
    });
  });

  describe("toggleColorScheme", () => {
    it("toggles from light to dark", () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.toggleColorScheme();
      });

      expect(result.current.colorScheme).toBe("dark");
    });

    it("toggles from dark to light", () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setColorScheme("dark");
      });

      act(() => {
        result.current.toggleColorScheme();
      });

      expect(result.current.colorScheme).toBe("light");
    });

    it("toggles multiple times correctly", () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.toggleColorScheme(); // light -> dark
      });
      expect(result.current.colorScheme).toBe("dark");

      act(() => {
        result.current.toggleColorScheme(); // dark -> light
      });
      expect(result.current.colorScheme).toBe("light");

      act(() => {
        result.current.toggleColorScheme(); // light -> dark
      });
      expect(result.current.colorScheme).toBe("dark");
    });
  });

  describe("persistence", () => {
    it("persists state across hook instances", () => {
      const { result: result1 } = renderHook(() => useThemeStore());

      act(() => {
        result1.current.setColorScheme("dark");
      });

      // Create new hook instance
      const { result: result2 } = renderHook(() => useThemeStore());
      expect((result2.current as { colorScheme: string }).colorScheme).toBe(
        "dark"
      );
    });
  });
});
