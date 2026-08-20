import { ViewStyle } from "react-native";
import { getThemeStyles, ThemeMode } from "../../theme/tokens";

// Enforces structural requirements across composite containers
export interface IWidgetStyles {
  container: ViewStyle;
}

/**
 * 💡 Pure dynamic style builder combining theme tokens.
 * Replaces class constructor execution smoothly.
 */
export const getSearchWidgetStyles = (mode: ThemeMode = "light"): IWidgetStyles => {
  const theme = getThemeStyles(mode);

  return {
    // Structural Layout configuration using design token spacing rules
    container: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      width: "100%",
    },
  };
};

// Export a clear, static instance matching your original default parameters
export const styles = getSearchWidgetStyles("light");
