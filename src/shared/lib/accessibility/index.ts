import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardNavigationOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook for keyboard navigation and shortcuts
 */
export const useKeyboardNavigation = ({
  shortcuts,
  enabled = true,
}: UseKeyboardNavigationOptions) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === event.key.toLowerCase() &&
          !!s.ctrl === event.ctrlKey &&
          !!s.alt === event.altKey &&
          !!s.shift === event.shiftKey
      );

      if (shortcut) {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        shortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
};

/**
 * Hook for screen reader announcements
 */
export const useAnnouncer = () => {
  const announce = useCallback(
    (message: string, options?: { priority?: "polite" | "assertive" }) => {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", options?.priority || "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.setAttribute("class", "sr-only");
      announcement.style.position = "absolute";
      announcement.style.left = "-10000px";
      announcement.style.width = "1px";
      announcement.style.height = "1px";
      announcement.style.overflow = "hidden";
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
    []
  );

  return { announce };
};
