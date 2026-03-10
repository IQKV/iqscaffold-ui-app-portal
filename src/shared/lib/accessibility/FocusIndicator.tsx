import React from "react";
import { Box } from "@mantine/core";
import { useAccessibilityPreferences, getFocusIndicatorStyle } from "./visualAccessibility";

/**
 * FocusIndicator Component
 *
 * Wraps interactive elements with enhanced focus indicators
 * Automatically adjusts for high contrast mode
 * Requirements: 14.3
 */

interface FocusIndicatorProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  as: Component = "div",
  className,
  style,
}) => {
  const { highContrast } = useAccessibilityPreferences();
  const focusStyle = getFocusIndicatorStyle();

  return (
    <Box
      component={Component as any}
      className={className}
      style={style}
      sx={(theme: any) => ({
        "&:focus-visible": focusStyle,
        // Ensure focus is visible in high contrast mode
        ...(highContrast && {
          "&:focus": focusStyle,
        }),
      })}
    >
      {children}
    </Box>
  );
};
