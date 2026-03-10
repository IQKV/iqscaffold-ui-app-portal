import { useEffect, useCallback, useRef, useState } from "react";

/**
 * Keyboard navigation hook for CRM interfaces
 *
 * Provides keyboard shortcuts and navigation support for accessibility
 * Requirements: 14.1, 14.6
 */

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export interface UseKeyboardNavigationOptions {
  shortcuts?: KeyboardShortcut[];
  enabled?: boolean;
  scope?: "global" | "local";
}

/**
 * Hook for managing keyboard navigation and shortcuts
 *
 * @param options - Configuration options for keyboard navigation
 * @returns Object with keyboard navigation utilities
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const { shortcuts = [], enabled = true, scope = "local" } = options;
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      const activeShortcuts = shortcutsRef.current;

      for (const shortcut of activeShortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const target = scope === "global" ? window : document;
    target.addEventListener("keydown", handleKeyDown as any);

    return () => {
      target.removeEventListener("keydown", handleKeyDown as any);
    };
  }, [handleKeyDown, enabled, scope]);
}

/**
 * Hook for managing focus trap in modals and dialogs
 *
 * @param containerRef - Ref to the container element
 * @param enabled - Whether the focus trap is enabled
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") {
        return;
      }

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else if (document.activeElement === lastElement) {
        // Tab
        e.preventDefault();
        firstElement?.focus();
      }
    };

    // Focus first element when trap is enabled
    firstElement?.focus();

    container.addEventListener("keydown", handleTabKey as any);

    return () => {
      container.removeEventListener("keydown", handleTabKey as any);
    };
  }, [containerRef, enabled]);
}

/**
 * Hook for managing roving tabindex navigation in lists
 *
 * @param itemCount - Number of items in the list
 * @param onSelect - Callback when an item is selected
 * @param orientation - Orientation of the list (horizontal or vertical)
 */
export function useRovingTabIndex(
  itemCount: number,
  onSelect?: (index: number) => void,
  orientation: "horizontal" | "vertical" = "vertical",
) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

      switch (event.key) {
        case nextKey:
          event.preventDefault();
          setActiveIndex((prev) => (prev + 1) % itemCount);
          break;
        case prevKey:
          event.preventDefault();
          setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
          break;
        case "Home":
          event.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          event.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onSelect?.(activeIndex);
          break;
      }
    },
    [itemCount, activeIndex, onSelect, orientation],
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      "aria-selected": index === activeIndex,
      onFocus: () => setActiveIndex(index),
    }),
  };
}

/**
 * Common keyboard shortcuts for CRM features
 */
export const CRM_KEYBOARD_SHORTCUTS = {
  // Navigation shortcuts
  GOTO_LEADS: { key: "l", ctrl: true, description: "Go to Leads" },
  GOTO_PIPELINE: { key: "p", ctrl: true, description: "Go to Pipeline" },
  GOTO_DASHBOARD: { key: "d", ctrl: true, description: "Go to Dashboard" },
  GOTO_FOLLOWUPS: { key: "f", ctrl: true, description: "Go to Follow-ups" },

  // Action shortcuts
  CREATE_LEAD: { key: "n", ctrl: true, description: "Create New Lead" },
  SEARCH: { key: "k", ctrl: true, description: "Focus Search" },
  SAVE: { key: "s", ctrl: true, description: "Save" },
  CANCEL: { key: "Escape", description: "Cancel/Close" },

  // List navigation
  NEXT_ITEM: { key: "j", description: "Next Item" },
  PREV_ITEM: { key: "k", description: "Previous Item" },
  SELECT_ITEM: { key: "Enter", description: "Select Item" },

  // Bulk actions
  SELECT_ALL: { key: "a", ctrl: true, description: "Select All" },
  DESELECT_ALL: {
    key: "a",
    ctrl: true,
    shift: true,
    description: "Deselect All",
  },
};
