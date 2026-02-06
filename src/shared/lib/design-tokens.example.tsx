/**
 * Design Tokens Usage Examples
 *
 * This file demonstrates various ways to use design tokens in components.
 * These examples can be used as reference when building new components.
 */

import { Box, Button, Card, Text, Stack, Group, useMantineTheme } from "@mantine/core";
import {
  spacing,
  colors,
  typography,
  borderRadius,
  shadows,
  components,
  getSpacing,
  mediaQuery,
  createTransition,
  getColorWithOpacity,
} from "./design-tokens";

// ============================================================================
// Example 1: Basic Component with Design Tokens
// ============================================================================

export function BasicCard() {
  return (
    <Card
      style={{
        padding: spacing.lg,
        backgroundColor: colors.background.paper,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md,
      }}
    >
      <Text
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: spacing.sm,
        }}
      >
        Card Title
      </Text>
      <Text
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary,
        }}
      >
        Card description with design tokens
      </Text>
    </Card>
  );
}

// ============================================================================
// Example 2: Using Utility Functions
// ============================================================================

export function UtilityExample() {
  return (
    <Box
      style={{
        // Custom spacing calculation
        padding: getSpacing(3), // 12px

        // Color with opacity
        backgroundColor: getColorWithOpacity(colors.primary[500], 0.1),

        // Custom transition
        transition: createTransition(["opacity", "transform"], "base", "easeInOut"),

        // Border
        border: `1px solid ${colors.border.default}`,
        borderRadius: borderRadius.md,
      }}
    >
      <Text>Component with utility functions</Text>
    </Box>
  );
}

// ============================================================================
// Example 3: Responsive Design with Breakpoints
// ============================================================================

export function ResponsiveComponent() {
  return (
    <Box
      style={{
        padding: spacing.md,

        // Responsive padding
        [mediaQuery("md")]: {
          padding: spacing.lg,
        },
        [mediaQuery("lg")]: {
          padding: spacing.xl,
        },

        // Responsive layout
        display: "flex",
        flexDirection: "column",
        [mediaQuery("md")]: {
          flexDirection: "row",
        },
      }}
    >
      <Text>Responsive content</Text>
    </Box>
  );
}

// ============================================================================
// Example 4: Component-Specific Tokens
// ============================================================================

export function CustomButton() {
  return (
    <Button
      style={{
        height: components.button.height.md,
        padding: components.button.padding.md,
        fontSize: components.button.fontSize.md,
        borderRadius: borderRadius.md,
        transition: createTransition(["background-color", "transform"]),

        // Hover state
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: shadows.lg,
        },
      }}
    >
      Custom Button
    </Button>
  );
}

// ============================================================================
// Example 5: Semantic Colors
// ============================================================================

export function AlertExamples() {
  return (
    <Stack gap={spacing.md}>
      {/* Success Alert */}
      <Box
        style={{
          padding: spacing.md,
          backgroundColor: colors.semantic.success.light,
          color: colors.semantic.success.dark,
          borderRadius: borderRadius.md,
          borderLeft: `4px solid ${colors.semantic.success.main}`,
        }}
      >
        <Text fw={typography.fontWeight.semibold}>Success!</Text>
        <Text size="sm">Operation completed successfully</Text>
      </Box>

      {/* Warning Alert */}
      <Box
        style={{
          padding: spacing.md,
          backgroundColor: colors.semantic.warning.light,
          color: colors.semantic.warning.dark,
          borderRadius: borderRadius.md,
          borderLeft: `4px solid ${colors.semantic.warning.main}`,
        }}
      >
        <Text fw={typography.fontWeight.semibold}>Warning!</Text>
        <Text size="sm">Please review this information</Text>
      </Box>

      {/* Error Alert */}
      <Box
        style={{
          padding: spacing.md,
          backgroundColor: colors.semantic.error.light,
          color: colors.semantic.error.dark,
          borderRadius: borderRadius.md,
          borderLeft: `4px solid ${colors.semantic.error.main}`,
        }}
      >
        <Text fw={typography.fontWeight.semibold}>Error!</Text>
        <Text size="sm">Something went wrong</Text>
      </Box>

      {/* Info Alert */}
      <Box
        style={{
          padding: spacing.md,
          backgroundColor: colors.semantic.info.light,
          color: colors.semantic.info.dark,
          borderRadius: borderRadius.md,
          borderLeft: `4px solid ${colors.semantic.info.main}`,
        }}
      >
        <Text fw={typography.fontWeight.semibold}>Info</Text>
        <Text size="sm">Here's some helpful information</Text>
      </Box>
    </Stack>
  );
}

// ============================================================================
// Example 6: Complex Layout with Multiple Tokens
// ============================================================================

export function DashboardCard() {
  return (
    <Card
      style={{
        padding: components.card.padding.lg,
        backgroundColor: colors.background.paper,
        borderRadius: components.card.borderRadius,
        boxShadow: components.card.shadow,
        transition: createTransition(["box-shadow", "transform"]),

        "&:hover": {
          boxShadow: shadows.lg,
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Header */}
      <Group
        justify="space-between"
        mb={spacing.md}
        style={{
          paddingBottom: spacing.sm,
          borderBottom: `1px solid ${colors.border.light}`,
        }}
      >
        <Text
          style={{
            fontSize: typography.fontSize["2xl"],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
          }}
        >
          Dashboard
        </Text>
        <Box
          style={{
            padding: `${spacing.xs} ${spacing.sm}`,
            backgroundColor: getColorWithOpacity(colors.primary[500], 0.1),
            color: colors.primary[700],
            borderRadius: borderRadius.full,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          Active
        </Box>
      </Group>

      {/* Content */}
      <Stack gap={spacing.md}>
        <Box>
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginBottom: spacing.xs,
            }}
          >
            Total Revenue
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize["3xl"],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            $12,345
          </Text>
        </Box>

        <Box>
          <Text
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginBottom: spacing.xs,
            }}
          >
            Growth
          </Text>
          <Text
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.semantic.success.main,
            }}
          >
            +23.5%
          </Text>
        </Box>
      </Stack>

      {/* Footer */}
      <Group
        justify="flex-end"
        mt={spacing.lg}
        style={{
          paddingTop: spacing.md,
          borderTop: `1px solid ${colors.border.light}`,
        }}
      >
        <Button
          variant="subtle"
          style={{
            height: components.button.height.sm,
            padding: components.button.padding.sm,
          }}
        >
          View Details
        </Button>
      </Group>
    </Card>
  );
}

// ============================================================================
// Example 7: Using Theme Context
// ============================================================================

export function ThemeContextExample() {
  const theme = useMantineTheme();
  const tokens = theme.other.designTokens;

  return (
    <Box
      style={{
        padding: tokens.spacing.md,
        backgroundColor: tokens.colors.background.paper,
        borderRadius: tokens.borderRadius.lg,
      }}
    >
      <Text>Using tokens from theme context</Text>
    </Box>
  );
}

// ============================================================================
// Example 8: Animated Component
// ============================================================================

export function AnimatedCard() {
  return (
    <Card
      style={{
        padding: spacing.lg,
        backgroundColor: colors.background.paper,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.sm,

        // Multiple transitions
        transition: createTransition(
          ["box-shadow", "transform", "background-color"],
          "base",
          "easeInOut"
        ),

        // Hover effects
        "&:hover": {
          boxShadow: shadows.xl,
          transform: "scale(1.02)",
          backgroundColor: colors.neutral.gray[50],
        },

        // Active effects
        "&:active": {
          transform: "scale(0.98)",
        },
      }}
    >
      <Text>Hover over me!</Text>
    </Card>
  );
}

// ============================================================================
// Example 9: Form Input with Tokens
// ============================================================================

export function CustomInput() {
  return (
    <Box
      component="input"
      style={{
        height: components.input.height.md,
        padding: components.input.padding.md,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.base,
        color: colors.text.primary,
        backgroundColor: colors.background.default,
        border: `1px solid ${colors.border.default}`,
        borderRadius: borderRadius.md,
        transition: createTransition(["border-color", "box-shadow"]),

        "&:focus": {
          outline: "none",
          borderColor: colors.border.focus,
          boxShadow: `0 0 0 3px ${getColorWithOpacity(colors.primary[500], 0.1)}`,
        },

        "&::placeholder": {
          color: colors.text.hint,
        },
      }}
      placeholder="Enter text..."
    />
  );
}

// ============================================================================
// Example 10: Data Table with Tokens
// ============================================================================

export function DataTableExample() {
  return (
    <Box
      component="table"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: colors.background.paper,
        borderRadius: borderRadius.lg,
        overflow: "hidden",
        boxShadow: shadows.sm,
      }}
    >
      <Box
        component="thead"
        style={{
          backgroundColor: colors.neutral.gray[50],
        }}
      >
        <Box component="tr">
          <Box
            component="th"
            style={{
              padding: components.table.cellPadding.md,
              textAlign: "left",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              borderBottom: `2px solid ${colors.border.default}`,
            }}
          >
            Name
          </Box>
          <Box
            component="th"
            style={{
              padding: components.table.cellPadding.md,
              textAlign: "left",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              borderBottom: `2px solid ${colors.border.default}`,
            }}
          >
            Status
          </Box>
        </Box>
      </Box>
      <Box component="tbody">
        <Box
          component="tr"
          style={{
            transition: createTransition(["background-color"]),
            "&:hover": {
              backgroundColor: colors.state.hover,
            },
          }}
        >
          <Box
            component="td"
            style={{
              padding: components.table.cellPadding.md,
              fontSize: typography.fontSize.sm,
              color: colors.text.primary,
              borderBottom: `1px solid ${colors.border.light}`,
            }}
          >
            John Doe
          </Box>
          <Box
            component="td"
            style={{
              padding: components.table.cellPadding.md,
              fontSize: typography.fontSize.sm,
              borderBottom: `1px solid ${colors.border.light}`,
            }}
          >
            <Box
              component="span"
              style={{
                padding: `${spacing.xs} ${spacing.sm}`,
                backgroundColor: colors.semantic.success.light,
                color: colors.semantic.success.dark,
                borderRadius: borderRadius.full,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              Active
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
