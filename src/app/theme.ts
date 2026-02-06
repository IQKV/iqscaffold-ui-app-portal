import { createTheme, MantineColorsTuple } from "@mantine/core";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  designTokens,
} from "@/shared/lib/design-tokens";

// Convert design tokens to Mantine color tuples
const primary: MantineColorsTuple = [
  colors.primary[50],
  colors.primary[100],
  colors.primary[200],
  colors.primary[300],
  colors.primary[400],
  colors.primary[500],
  colors.primary[600],
  colors.primary[700],
  colors.primary[800],
  colors.primary[900],
];

const secondary: MantineColorsTuple = [
  colors.secondary[50],
  colors.secondary[100],
  colors.secondary[200],
  colors.secondary[300],
  colors.secondary[400],
  colors.secondary[500],
  colors.secondary[600],
  colors.secondary[700],
  colors.secondary[800],
  colors.secondary[900],
];

// Create Mantine theme with design tokens
export const theme = createTheme({
  colors: {
    primary,
    secondary,
  },
  primaryColor: "primary",
  defaultRadius: borderRadius.md,
  fontFamily: typography.fontFamily.base,
  headings: {
    fontFamily: typography.fontFamily.heading,
    fontWeight: String(typography.fontWeight.bold),
  },
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
  },
  shadows: {
    xs: shadows.xs,
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
    xl: shadows.xl,
  },
  // Extend theme with design tokens for direct access
  other: {
    designTokens,
  },
});
