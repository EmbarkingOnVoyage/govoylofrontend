// packages/styles/base/BaseInput.styles.ts
import { ViewStyle, TextStyle } from "react-native";
import { getThemeStyles, ThemeMode } from "../../theme/tokens";

export interface IControlStyles {
  container: ViewStyle;
  input: TextStyle;
}

/**
 * 💡 Centralised pure function enforcing uniform input field layouts across the system.
 * This replaces the abstract constructor class pattern completely.
 */
export const getSharedInputProperties = (mode: ThemeMode = "light"): TextStyle => {
  const theme = getThemeStyles(mode);

  return {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 6,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
  };
};
