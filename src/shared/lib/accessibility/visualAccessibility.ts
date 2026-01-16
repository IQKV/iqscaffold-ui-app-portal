// Import React at the top
import React from "react";

/**
 * Visual Accessibility Utilities
 *
 * Provides utilities for high contrast, focus indicators, and reduced motion
 * Requirements: 14.3
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-contrast: high)").matches;
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Get animation duration based on user preference
 * Returns 0 if user prefers reduced motion
 */
export function getAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

/**
 * Focus indicator styles for keyboard navigation
 * Provides visible focus indicators that meet WCAG 2.1 requirements
 */
export const focusIndicatorStyles = {
  // Standard focus indicator
  standard: {
    outline: "2px solid var(--mantine-color-blue-6)",
    outlineOffset: "2px",
    borderRadius: "4px",
  },

  // High contrast focus indicator
  highContrast: {
    outline: "3px solid var(--mantine-color-blue-7)",
    outlineOffset: "3px",
    borderRadius: "4px",
    boxShadow: "0 0 0 4px rgba(34, 139, 230, 0.2)",
  },

  // Focus within (for containers)
  within: {
    boxShadow: "0 0 0 2px var(--mantine-color-blue-6)",
    borderRadius: "4px",
  },
};

/**
 * Get focus indicator style based on user preference
 */
export function getFocusIndicatorStyle() {
  return prefersHighContrast()
    ? focusIndicatorStyles.highContrast
    : focusIndicatorStyles.standard;
}

/**
 * Color contrast utilities
 */

/**
 * Calculate relative luminance of a color
 * Used for WCAG contrast ratio calculations
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const l1 = getRelativeLuminance(...rgb1);
  const l2 = getRelativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsWCAGAA(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): boolean {
  return getContrastRatio(rgb1, rgb2) >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard (7:1 for normal text)
 */
export function meetsWCAGAAA(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): boolean {
  return getContrastRatio(rgb1, rgb2) >= 7;
}

/**
 * CSS class names for accessibility features
 */
export const a11yClassNames = {
  focusVisible: "focus-visible",
  reducedMotion: "reduced-motion",
  highContrast: "high-contrast",
  skipLink: "skip-link",
  visuallyHidden: "visually-hidden",
};

/**
 * Apply focus visible styles globally
 * This should be called once in the app initialization
 */
export function applyFocusVisibleStyles() {
  if (typeof document === "undefined") return;

  const style = document.createElement("style");
  style.textContent = `
    /* Focus visible styles for keyboard navigation */
    .focus-visible:focus-visible {
      outline: 2px solid var(--mantine-color-blue-6);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* High contrast focus styles */
    @media (prefers-contrast: high) {
      .focus-visible:focus-visible {
        outline: 3px solid var(--mantine-color-blue-7);
        outline-offset: 3px;
        box-shadow: 0 0 0 4px rgba(34, 139, 230, 0.2);
      }
    }

    /* Reduced motion styles */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* Skip link styles */
    .skip-link {
      position: absolute;
      left: -9999px;
      z-index: 999;
      padding: 1rem;
      background-color: var(--mantine-color-blue-6);
      color: white;
      text-decoration: none;
      border-radius: 0 0 4px 0;
    }

    .skip-link:focus {
      left: 0;
    }

    /* Visually hidden but accessible to screen readers */
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* High contrast mode adjustments */
    @media (prefers-contrast: high) {
      /* Increase border widths */
      button,
      input,
      select,
      textarea {
        border-width: 2px;
      }

      /* Ensure sufficient contrast for disabled elements */
      button:disabled,
      input:disabled,
      select:disabled,
      textarea:disabled {
        opacity: 0.7;
        border-style: dashed;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Hook to detect and respond to user preferences
 */
export function useAccessibilityPreferences() {
  if (typeof window === "undefined") {
    return {
      reducedMotion: false,
      highContrast: false,
      darkMode: false,
    };
  }

  const [preferences, setPreferences] = React.useState({
    reducedMotion: prefersReducedMotion(),
    highContrast: prefersHighContrast(),
    darkMode: prefersDarkMode(),
  });

  React.useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updatePreferences = () => {
      setPreferences({
        reducedMotion: reducedMotionQuery.matches,
        highContrast: highContrastQuery.matches,
        darkMode: darkModeQuery.matches,
      });
    };

    reducedMotionQuery.addEventListener("change", updatePreferences);
    highContrastQuery.addEventListener("change", updatePreferences);
    darkModeQuery.addEventListener("change", updatePreferences);

    return () => {
      reducedMotionQuery.removeEventListener("change", updatePreferences);
      highContrastQuery.removeEventListener("change", updatePreferences);
      darkModeQuery.removeEventListener("change", updatePreferences);
    };
  }, []);

  return preferences;
}

// Import React for the hook
import React from "react";
