import { ViewStyle } from "react-native";
import { getThemeStyles, ThemeMode } from "../../theme/tokens";

// Enforces structural requirements across composite containers
export interface IWidgetStyles {
  container: ViewStyle;
}

export class SearchWidgetStyles implements IWidgetStyles {
  public container: ViewStyle;
  protected theme: ReturnType<typeof getThemeStyles>;

  constructor(mode: ThemeMode = "light") {
    this.theme = getThemeStyles(mode);

    // Structural Layout configuration using design token spacing rules
    this.container = {
      padding: this.theme.spacing.md,
      gap: this.theme.spacing.md,
      backgroundColor: this.theme.colors.surface,
      borderRadius: 8,
      width: "100%",
    };
  }
}

// Export single immutable instance using default theme parameters
export const styles = new SearchWidgetStyles("light");
