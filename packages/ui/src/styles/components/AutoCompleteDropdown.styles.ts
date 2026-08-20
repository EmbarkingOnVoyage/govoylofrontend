// packages/styles/components/Autocompletedropdown.styles.ts
import { ViewStyle, TextStyle } from "react-native";
import { getSharedInputProperties } from "../base/BaseInput.styles";
import { getThemeStyles, ThemeMode } from "../../theme/tokens";

export interface IAutoCompleteStyles {
  container: ViewStyle;
  input: TextStyle;
  list: ViewStyle;
  item: ViewStyle;
}

/**
 * 💡 Pure dynamic style builder combining base inputs and theme tokens.
 * Replaces class constructor inheritance seamlessly.
 */
export const getAutoCompleteDropdownStyles = (mode: ThemeMode = "light"): IAutoCompleteStyles => {
  const theme = getThemeStyles(mode);

  return {
    container: {
      width: "100%",
      marginBottom: theme.spacing.md,
      position: "relative", // Specialized child component modifier
    },
    input: {
      ...getSharedInputProperties(mode), // Clean functional extension of Core UI rules
    },
    list: {
      maxHeight: 200,
      borderWidth: 1,
      borderColor: "#EAEAEA",
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
      marginTop: 4,
    },
    item: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: "#F5F5F5",
    },
  };
};

// Export a clear, static instance matching your original default parameters
export const styles = getAutoCompleteDropdownStyles("light");
