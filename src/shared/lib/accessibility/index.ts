/**
 * Accessibility utilities for CRM features
 *
 * Provides keyboard navigation, focus management, and ARIA support
 * Requirements: 14.1, 14.2, 14.3, 14.6, 14.7
 */

export {
  useKeyboardNavigation,
  useFocusTrap,
  useRovingTabIndex,
  CRM_KEYBOARD_SHORTCUTS,
  type KeyboardShortcut,
  type UseKeyboardNavigationOptions,
} from "./useKeyboardNavigation";

export { VisuallyHidden } from "./VisuallyHidden";
export { SkipLink } from "./SkipLink";
export { useAnnouncer } from "./useAnnouncer";
export { FocusIndicator } from "./FocusIndicator";

export {
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  getAnimationDuration,
  getFocusIndicatorStyle,
  focusIndicatorStyles,
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  a11yClassNames,
  applyFocusVisibleStyles,
  useAccessibilityPreferences,
} from "./visualAccessibility";
