import { describe, it, expect } from "vitest";
import {
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
  getSpacing,
  getResponsiveSpacing,
  remToPx,
  pxToRem,
  getColorWithOpacity,
  mediaQuery,
  createTransition,
  designTokens,
} from "./design-tokens";

describe("Design Tokens", () => {
  describe("Spacing Tokens", () => {
    it("should have correct base unit", () => {
      expect(spacing.unit).toBe(4);
    });

    it("should have all spacing scale values", () => {
      expect(spacing.xs).toBe("0.25rem");
      expect(spacing.sm).toBe("0.5rem");
      expect(spacing.md).toBe("1rem");
      expect(spacing.lg).toBe("1.5rem");
      expect(spacing.xl).toBe("2rem");
      expect(spacing.xxl).toBe("3rem");
      expect(spacing.xxxl).toBe("4rem");
    });

    it("should have component-specific spacing", () => {
      expect(spacing.component.padding.md).toBe("1rem");
      expect(spacing.component.margin.lg).toBe("1.5rem");
      expect(spacing.component.gap.sm).toBe("0.5rem");
    });

    it("should have layout spacing", () => {
      expect(spacing.layout.containerPadding).toBe("1rem");
      expect(spacing.layout.sectionGap).toBe("2rem");
      expect(spacing.layout.headerHeight).toBe("4rem");
    });
  });

  describe("Color Tokens", () => {
    it("should have primary color palette", () => {
      expect(colors.primary[500]).toBe("#2196f3");
      expect(colors.primary[50]).toBe("#e3f2fd");
      expect(colors.primary[900]).toBe("#0d47a1");
    });

    it("should have secondary color palette", () => {
      expect(colors.secondary[500]).toBe("#e91e63");
      expect(colors.secondary[50]).toBe("#fce4ec");
      expect(colors.secondary[900]).toBe("#880e4f");
    });

    it("should have semantic colors", () => {
      expect(colors.semantic.success.main).toBe("#10b981");
      expect(colors.semantic.warning.main).toBe("#f59e0b");
      expect(colors.semantic.error.main).toBe("#ef4444");
      expect(colors.semantic.info.main).toBe("#3b82f6");
    });

    it("should have neutral colors", () => {
      expect(colors.neutral.white).toBe("#ffffff");
      expect(colors.neutral.black).toBe("#000000");
      expect(colors.neutral.gray[500]).toBe("#6b7280");
    });

    it("should have background colors", () => {
      expect(colors.background.default).toBe("#ffffff");
      expect(colors.background.paper).toBe("#f9fafb");
    });

    it("should have text colors", () => {
      expect(colors.text.primary).toBe("#111827");
      expect(colors.text.secondary).toBe("#6b7280");
    });

    it("should have border colors", () => {
      expect(colors.border.default).toBe("#e5e7eb");
      expect(colors.border.focus).toBe("#2196f3");
    });
  });

  describe("Typography Tokens", () => {
    it("should have font families", () => {
      expect(typography.fontFamily.base).toContain("Inter");
      expect(typography.fontFamily.heading).toContain("Inter");
      expect(typography.fontFamily.mono).toContain("monospace");
    });

    it("should have font sizes", () => {
      expect(typography.fontSize.xs).toBe("0.75rem");
      expect(typography.fontSize.base).toBe("1rem");
      expect(typography.fontSize["2xl"]).toBe("1.5rem");
    });

    it("should have font weights", () => {
      expect(typography.fontWeight.light).toBe(300);
      expect(typography.fontWeight.normal).toBe(400);
      expect(typography.fontWeight.bold).toBe(700);
    });

    it("should have line heights", () => {
      expect(typography.lineHeight.tight).toBe(1.25);
      expect(typography.lineHeight.normal).toBe(1.5);
      expect(typography.lineHeight.loose).toBe(2);
    });

    it("should have letter spacing", () => {
      expect(typography.letterSpacing.tight).toBe("-0.025em");
      expect(typography.letterSpacing.normal).toBe("0");
      expect(typography.letterSpacing.wide).toBe("0.025em");
    });
  });

  describe("Border Radius Tokens", () => {
    it("should have all border radius values", () => {
      expect(borderRadius.none).toBe("0");
      expect(borderRadius.sm).toBe("0.125rem");
      expect(borderRadius.md).toBe("0.375rem");
      expect(borderRadius.lg).toBe("0.5rem");
      expect(borderRadius.full).toBe("9999px");
    });
  });

  describe("Shadow Tokens", () => {
    it("should have all shadow values", () => {
      expect(shadows.xs).toContain("rgb(0 0 0 / 0.05)");
      expect(shadows.md).toContain("rgb(0 0 0 / 0.1)");
      expect(shadows.none).toBe("none");
    });
  });

  describe("Z-Index Tokens", () => {
    it("should have correct z-index hierarchy", () => {
      expect(zIndex.base).toBe(0);
      expect(zIndex.dropdown).toBe(1000);
      expect(zIndex.modal).toBe(1050);
      expect(zIndex.notification).toBe(1080);
      expect(zIndex.max).toBe(9999);
    });

    it("should maintain proper layering order", () => {
      expect(zIndex.dropdown).toBeLessThan(zIndex.modal);
      expect(zIndex.modal).toBeLessThan(zIndex.notification);
    });
  });

  describe("Transition Tokens", () => {
    it("should have duration values", () => {
      expect(transitions.duration.fast).toBe("150ms");
      expect(transitions.duration.base).toBe("200ms");
      expect(transitions.duration.slow).toBe("300ms");
    });

    it("should have easing functions", () => {
      expect(transitions.easing.linear).toBe("linear");
      expect(transitions.easing.easeInOut).toContain("cubic-bezier");
    });

    it("should have preset transitions", () => {
      expect(transitions.presets.fade).toContain("opacity");
      expect(transitions.presets.scale).toContain("transform");
    });
  });

  describe("Breakpoint Tokens", () => {
    it("should have all breakpoint values", () => {
      expect(breakpoints.xs).toBe("36em");
      expect(breakpoints.sm).toBe("48em");
      expect(breakpoints.md).toBe("62em");
      expect(breakpoints.lg).toBe("75em");
      expect(breakpoints.xl).toBe("88em");
    });

    it("should have pixel values", () => {
      expect(breakpointsPx.xs).toBe(576);
      expect(breakpointsPx.md).toBe(992);
      expect(breakpointsPx.xl).toBe(1408);
    });
  });

  describe("Component Tokens", () => {
    it("should have button tokens", () => {
      expect(components.button.height.md).toBe("2.625rem");
      expect(components.button.padding.md).toBe("0.75rem 1.25rem");
    });

    it("should have input tokens", () => {
      expect(components.input.height.md).toBe("2.625rem");
      expect(components.input.padding.md).toBe("0.625rem 1rem");
    });

    it("should have card tokens", () => {
      expect(components.card.padding.md).toBe("1.25rem");
      expect(components.card.borderRadius).toBe(borderRadius.lg);
    });

    it("should have modal tokens", () => {
      expect(components.modal.padding.md).toBe("1.5rem");
      expect(components.modal.maxWidth.md).toBe("36rem");
    });
  });

  describe("Utility Functions", () => {
    describe("getSpacing", () => {
      it("should calculate spacing correctly", () => {
        expect(getSpacing(1)).toBe("4px");
        expect(getSpacing(2)).toBe("8px");
        expect(getSpacing(4)).toBe("16px");
        expect(getSpacing(8)).toBe("32px");
      });

      it("should handle decimal values", () => {
        expect(getSpacing(1.5)).toBe("6px");
        expect(getSpacing(2.5)).toBe("10px");
      });

      it("should handle zero", () => {
        expect(getSpacing(0)).toBe("0px");
      });
    });

    describe("getResponsiveSpacing", () => {
      it("should create clamp value", () => {
        const result = getResponsiveSpacing(2, 3, 4);
        expect(result).toBe("clamp(8px, 12px, 16px)");
      });

      it("should handle different multipliers", () => {
        const result = getResponsiveSpacing(1, 2, 3);
        expect(result).toBe("clamp(4px, 8px, 12px)");
      });
    });

    describe("remToPx", () => {
      it("should convert rem to pixels", () => {
        expect(remToPx("1rem")).toBe(16);
        expect(remToPx("1.5rem")).toBe(24);
        expect(remToPx("2rem")).toBe(32);
      });

      it("should handle custom base font size", () => {
        expect(remToPx("1rem", 18)).toBe(18);
        expect(remToPx("2rem", 20)).toBe(40);
      });

      it("should handle decimal values", () => {
        expect(remToPx("0.5rem")).toBe(8);
        expect(remToPx("0.75rem")).toBe(12);
      });
    });

    describe("pxToRem", () => {
      it("should convert pixels to rem", () => {
        expect(pxToRem(16)).toBe("1rem");
        expect(pxToRem(24)).toBe("1.5rem");
        expect(pxToRem(32)).toBe("2rem");
      });

      it("should handle custom base font size", () => {
        expect(pxToRem(18, 18)).toBe("1rem");
        expect(pxToRem(40, 20)).toBe("2rem");
      });

      it("should handle decimal results", () => {
        expect(pxToRem(12)).toBe("0.75rem");
        expect(pxToRem(20)).toBe("1.25rem");
      });
    });

    describe("getColorWithOpacity", () => {
      it("should add opacity to hex color", () => {
        expect(getColorWithOpacity("#2196f3", 0.5)).toBe(
          "rgba(33, 150, 243, 0.5)"
        );
      });

      it("should handle hex without #", () => {
        expect(getColorWithOpacity("2196f3", 0.5)).toBe(
          "rgba(33, 150, 243, 0.5)"
        );
      });

      it("should handle different opacity values", () => {
        expect(getColorWithOpacity("#2196f3", 0)).toBe("rgba(33, 150, 243, 0)");
        expect(getColorWithOpacity("#2196f3", 1)).toBe("rgba(33, 150, 243, 1)");
        expect(getColorWithOpacity("#2196f3", 0.25)).toBe(
          "rgba(33, 150, 243, 0.25)"
        );
      });
    });

    describe("mediaQuery", () => {
      it("should create min-width media query by default", () => {
        expect(mediaQuery("md")).toBe("@media (min-width: 62em)");
      });

      it("should create min-width media query explicitly", () => {
        expect(mediaQuery("md", "min")).toBe("@media (min-width: 62em)");
      });

      it("should create max-width media query", () => {
        expect(mediaQuery("lg", "max")).toBe("@media (max-width: 75em)");
      });

      it("should work with all breakpoints", () => {
        expect(mediaQuery("xs")).toBe("@media (min-width: 36em)");
        expect(mediaQuery("sm")).toBe("@media (min-width: 48em)");
        expect(mediaQuery("xl")).toBe("@media (min-width: 88em)");
      });
    });

    describe("createTransition", () => {
      it("should create transition for single property", () => {
        const result = createTransition(["opacity"]);
        expect(result).toBe("opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)");
      });

      it("should create transition for multiple properties", () => {
        const result = createTransition(["opacity", "transform"]);
        expect(result).toContain("opacity 200ms");
        expect(result).toContain("transform 200ms");
      });

      it("should use custom duration", () => {
        const result = createTransition(["opacity"], "fast");
        expect(result).toContain("150ms");
      });

      it("should use custom easing", () => {
        const result = createTransition(["opacity"], "base", "easeOut");
        expect(result).toContain("cubic-bezier(0, 0, 0.2, 1)");
      });

      it("should combine custom duration and easing", () => {
        const result = createTransition(["opacity"], "slow", "easeIn");
        expect(result).toBe("opacity 300ms cubic-bezier(0.4, 0, 1, 1)");
      });
    });
  });

  describe("Design Tokens Export", () => {
    it("should export all token categories", () => {
      expect(designTokens).toHaveProperty("spacing");
      expect(designTokens).toHaveProperty("colors");
      expect(designTokens).toHaveProperty("typography");
      expect(designTokens).toHaveProperty("borderRadius");
      expect(designTokens).toHaveProperty("shadows");
      expect(designTokens).toHaveProperty("zIndex");
      expect(designTokens).toHaveProperty("transitions");
      expect(designTokens).toHaveProperty("breakpoints");
      expect(designTokens).toHaveProperty("breakpointsPx");
      expect(designTokens).toHaveProperty("components");
    });

    it("should have consistent structure", () => {
      expect(designTokens.spacing).toBe(spacing);
      expect(designTokens.colors).toBe(colors);
      expect(designTokens.typography).toBe(typography);
    });
  });

  describe("Type Safety", () => {
    it("should have readonly properties", () => {
      // TypeScript will catch mutations at compile time
      // This test verifies the structure is correct
      expect(Object.isFrozen(spacing)).toBe(false); // as const doesn't freeze
      expect(typeof spacing.md).toBe("string");
    });
  });

  describe("Token Consistency", () => {
    it("should have consistent spacing scale", () => {
      const spacingValues = [
        spacing.xs,
        spacing.sm,
        spacing.md,
        spacing.lg,
        spacing.xl,
      ];
      spacingValues.forEach((value) => {
        expect(value).toMatch(/^\d+(\.\d+)?rem$/);
      });
    });

    it("should have consistent color format", () => {
      const primaryColors = Object.values(colors.primary);
      primaryColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should have consistent font size format", () => {
      const fontSizes = Object.values(typography.fontSize);
      fontSizes.forEach((size) => {
        expect(size).toMatch(/^\d+(\.\d+)?rem$/);
      });
    });
  });
});
