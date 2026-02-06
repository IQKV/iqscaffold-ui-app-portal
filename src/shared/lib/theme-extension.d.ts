/**
 * Mantine Theme Extension
 *
 * Extends Mantine's theme type to include our design tokens
 * This provides TypeScript autocomplete for theme.other.designTokens
 */

import type { DesignTokens } from "./design-tokens";

declare module "@mantine/core" {
  export interface MantineThemeOther {
    designTokens: DesignTokens;
  }
}
