/**
 * Design Tokens - Single source of truth for design values
 *
 * These tokens ensure consistency across the application and make
 * theme changes easier to manage.
 *
 * @module design-tokens
 */

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  /** Base spacing unit (4px) */
  unit: 4,

  /** Spacing scale */
  xs: "0.25rem" as const, // 4px
  sm: "0.5rem" as const, // 8px
  md: "1rem" as const, // 16px
  lg: "1.5rem" as const, // 24px
  xl: "2rem" as const, // 32px
  xxl: "3rem" as const, // 48px
  xxxl: "4rem" as const, // 64px

  /** Component-specific spacing */
  component: {
    padding: {
      xs: "0.5rem" as const,
      sm: "0.75rem" as const,
      md: "1rem" as const,
      lg: "1.5rem" as const,
      xl: "2rem" as const,
    },
    margin: {
      xs: "0.5rem" as const,
      sm: "0.75rem" as const,
      md: "1rem" as const,
      lg: "1.5rem" as const,
      xl: "2rem" as const,
    },
    gap: {
      xs: "0.25rem" as const,
      sm: "0.5rem" as const,
      md: "0.75rem" as const,
      lg: "1rem" as const,
      xl: "1.5rem" as const,
    },
  },

  /** Layout spacing */
  layout: {
    containerPadding: "1rem" as const,
    sectionGap: "2rem" as const,
    cardGap: "1rem" as const,
    headerHeight: "4rem" as const,
    sidebarWidth: "16rem" as const,
    sidebarCollapsedWidth: "4rem" as const,
  },
} as const;

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  /** Primary palette (Blue) */
  primary: {
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#2196f3", // Main
    600: "#1e88e5",
    700: "#1976d2",
    800: "#1565c0",
    900: "#0d47a1",
  },

  /** Secondary palette (Pink) */
  secondary: {
    50: "#fce4ec",
    100: "#f8bbd9",
    200: "#f48fb1",
    300: "#f06292",
    400: "#ec407a",
    500: "#e91e63", // Main
    600: "#d81b60",
    700: "#c2185b",
    800: "#ad1457",
    900: "#880e4f",
  },

  /** Semantic colors */
  semantic: {
    success: {
      light: "#d1fae5",
      main: "#10b981",
      dark: "#065f46",
    },
    warning: {
      light: "#fef3c7",
      main: "#f59e0b",
      dark: "#92400e",
    },
    error: {
      light: "#fee2e2",
      main: "#ef4444",
      dark: "#991b1b",
    },
    info: {
      light: "#dbeafe",
      main: "#3b82f6",
      dark: "#1e40af",
    },
  },

  /** Neutral colors */
  neutral: {
    white: "#ffffff",
    black: "#000000",
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },

  /** Background colors */
  background: {
    default: "#ffffff",
    paper: "#f9fafb",
    elevated: "#ffffff",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  /** Text colors */
  text: {
    primary: "#111827",
    secondary: "#6b7280",
    disabled: "#9ca3af",
    hint: "#d1d5db",
    inverse: "#ffffff",
  },

  /** Border colors */
  border: {
    default: "#e5e7eb",
    light: "#f3f4f6",
    dark: "#d1d5db",
    focus: "#2196f3",
  },

  /** State colors */
  state: {
    hover: "rgba(0, 0, 0, 0.04)",
    selected: "rgba(33, 150, 243, 0.08)",
    disabled: "rgba(0, 0, 0, 0.12)",
    focus: "rgba(33, 150, 243, 0.12)",
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  /** Font families */
  fontFamily: {
    base: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    heading: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },

  /** Font sizes */
  fontSize: {
    xs: "0.75rem" as const, // 12px
    sm: "0.875rem" as const, // 14px
    base: "1rem" as const, // 16px
    lg: "1.125rem" as const, // 18px
    xl: "1.25rem" as const, // 20px
    "2xl": "1.5rem" as const, // 24px
    "3xl": "1.875rem" as const, // 30px
    "4xl": "2.25rem" as const, // 36px
    "5xl": "3rem" as const, // 48px
  },

  /** Font weights */
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  /** Line heights */
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  /** Letter spacing */
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: "0",
  sm: "0.125rem" as const, // 2px
  base: "0.25rem" as const, // 4px
  md: "0.375rem" as const, // 6px
  lg: "0.5rem" as const, // 8px
  xl: "0.75rem" as const, // 12px
  "2xl": "1rem" as const, // 16px
  "3xl": "1.5rem" as const, // 24px
  full: "9999px",
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
} as const;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  max: 9999,
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transitions = {
  /** Duration values */
  duration: {
    instant: "0ms",
    fast: "150ms",
    base: "200ms",
    slow: "300ms",
    slower: "500ms",
    slowest: "700ms",
  },

  /** Easing functions */
  easing: {
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },

  /** Common transition presets */
  presets: {
    fade: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    scale: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slide: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    all: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const breakpoints = {
  xs: "36em" as const, // 576px
  sm: "48em" as const, // 768px
  md: "62em" as const, // 992px
  lg: "75em" as const, // 1200px
  xl: "88em" as const, // 1408px
} as const;

/** Breakpoint values in pixels for calculations */
export const breakpointsPx = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1408,
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  /** Button tokens */
  button: {
    height: {
      xs: "1.875rem" as const, // 30px
      sm: "2.25rem" as const, // 36px
      md: "2.625rem" as const, // 42px
      lg: "3.125rem" as const, // 50px
      xl: "3.75rem" as const, // 60px
    },
    padding: {
      xs: "0.5rem 0.75rem",
      sm: "0.625rem 1rem",
      md: "0.75rem 1.25rem",
      lg: "0.875rem 1.5rem",
      xl: "1rem 2rem",
    },
    fontSize: {
      xs: typography.fontSize.xs,
      sm: typography.fontSize.sm,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg,
      xl: typography.fontSize.xl,
    },
  },

  /** Input tokens */
  input: {
    height: {
      xs: "1.875rem" as const,
      sm: "2.25rem" as const,
      md: "2.625rem" as const,
      lg: "3.125rem" as const,
      xl: "3.75rem" as const,
    },
    padding: {
      xs: "0.375rem 0.5rem",
      sm: "0.5rem 0.75rem",
      md: "0.625rem 1rem",
      lg: "0.75rem 1.25rem",
      xl: "1rem 1.5rem",
    },
  },

  /** Card tokens */
  card: {
    padding: {
      xs: "0.75rem" as const,
      sm: "1rem" as const,
      md: "1.25rem" as const,
      lg: "1.5rem" as const,
      xl: "2rem" as const,
    },
    borderRadius: borderRadius.lg,
    shadow: shadows.sm,
  },

  /** Modal tokens */
  modal: {
    padding: {
      xs: "1rem" as const,
      sm: "1.25rem" as const,
      md: "1.5rem" as const,
      lg: "2rem" as const,
      xl: "2.5rem" as const,
    },
    maxWidth: {
      xs: "20rem" as const,
      sm: "28rem" as const,
      md: "36rem" as const,
      lg: "48rem" as const,
      xl: "64rem" as const,
    },
  },

  /** Table tokens */
  table: {
    cellPadding: {
      xs: "0.5rem" as const,
      sm: "0.75rem" as const,
      md: "1rem" as const,
      lg: "1.25rem" as const,
    },
    headerHeight: "3rem" as const,
    rowHeight: "3.5rem" as const,
  },

  /** Avatar tokens */
  avatar: {
    size: {
      xs: "1.5rem" as const,
      sm: "2rem" as const,
      md: "2.5rem" as const,
      lg: "3rem" as const,
      xl: "4rem" as const,
    },
  },

  /** Badge tokens */
  badge: {
    height: {
      xs: "1rem" as const,
      sm: "1.25rem" as const,
      md: "1.5rem" as const,
      lg: "1.75rem" as const,
    },
    padding: {
      xs: "0 0.375rem",
      sm: "0 0.5rem",
      md: "0 0.625rem",
      lg: "0 0.75rem",
    },
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get spacing value by multiplying base unit
 * @param multiplier - Number to multiply by base unit (4px)
 * @returns Spacing value in pixels
 * @example
 * getSpacing(2) // "8px"
 * getSpacing(4) // "16px"
 */
export function getSpacing(multiplier: number): string {
  return `${spacing.unit * multiplier}px`;
}

/**
 * Get responsive spacing using CSS clamp
 * @param mobile - Multiplier for mobile
 * @param tablet - Multiplier for tablet
 * @param desktop - Multiplier for desktop
 * @returns CSS clamp value
 * @example
 * getResponsiveSpacing(2, 3, 4) // "clamp(8px, 12px, 16px)"
 */
export function getResponsiveSpacing(mobile: number, tablet: number, desktop: number): string {
  return `clamp(${getSpacing(mobile)}, ${getSpacing(tablet)}, ${getSpacing(desktop)})`;
}

/**
 * Convert rem to pixels
 * @param rem - Rem value
 * @param baseFontSize - Base font size in pixels (default: 16)
 * @returns Pixel value
 * @example
 * remToPx("1rem") // 16
 * remToPx("1.5rem") // 24
 */
export function remToPx(rem: string, baseFontSize = 16): number {
  const value = parseFloat(rem.replace("rem", ""));
  return value * baseFontSize;
}

/**
 * Convert pixels to rem
 * @param px - Pixel value
 * @param baseFontSize - Base font size in pixels (default: 16)
 * @returns Rem value
 * @example
 * pxToRem(16) // "1rem"
 * pxToRem(24) // "1.5rem"
 */
export function pxToRem(px: number, baseFontSize = 16): string {
  return `${px / baseFontSize}rem`;
}

/**
 * Get color with opacity
 * @param color - Hex color
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 * @example
 * getColorWithOpacity("#2196f3", 0.5) // "rgba(33, 150, 243, 0.5)"
 */
export function getColorWithOpacity(color: string, opacity: number): string {
  // Remove # if present
  const hex = color.replace("#", "");

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Create media query string
 * @param breakpoint - Breakpoint key
 * @param type - Query type (min or max)
 * @returns Media query string
 * @example
 * mediaQuery("md", "min") // "@media (min-width: 62em)"
 * mediaQuery("lg", "max") // "@media (max-width: 75em)"
 */
export function mediaQuery(
  breakpoint: keyof typeof breakpoints,
  type: "min" | "max" = "min",
): string {
  return `@media (${type}-width: ${breakpoints[breakpoint]})`;
}

/**
 * Create transition string
 * @param properties - CSS properties to transition
 * @param duration - Duration key
 * @param easing - Easing key
 * @returns Transition string
 * @example
 * createTransition(["opacity", "transform"]) // "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)"
 */
export function createTransition(
  properties: string[],
  duration: keyof typeof transitions.duration = "base",
  easing: keyof typeof transitions.easing = "easeInOut",
): string {
  return properties
    .map((prop) => `${prop} ${transitions.duration[duration]} ${transitions.easing[easing]}`)
    .join(", ");
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

/** Spacing token keys */
export type SpacingKey = keyof typeof spacing;

/** Color token keys */
export type ColorKey = keyof typeof colors;

/** Typography token keys */
export type TypographyKey = keyof typeof typography;

/** Border radius token keys */
export type BorderRadiusKey = keyof typeof borderRadius;

/** Shadow token keys */
export type ShadowKey = keyof typeof shadows;

/** Z-index token keys */
export type ZIndexKey = keyof typeof zIndex;

/** Transition token keys */
export type TransitionKey = keyof typeof transitions;

/** Breakpoint token keys */
export type BreakpointKey = keyof typeof breakpoints;

/** Component token keys */
export type ComponentKey = keyof typeof components;

/** All design tokens */
export const designTokens = {
  spacing,
  colors,
  typography,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
  breakpointsPx,
  components,
} as const;

/** Design tokens type */
export type DesignTokens = typeof designTokens;
