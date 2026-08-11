import { ViewStyle, TextStyle } from "react-native";
import { getThemeStyles, ThemeMode } from "../../theme/tokens";

export interface IControlStyles {
  container: ViewStyle;
  input: TextStyle;
}

export abstract class BaseInputStyles implements IControlStyles {
  public abstract container: ViewStyle;
  public abstract input: TextStyle;
  protected theme: ReturnType<typeof getThemeStyles>;

  constructor(mode: ThemeMode = "light") {
    // Inject centralized design token values dynamically during instantiation
    this.theme = getThemeStyles(mode);
  }

  // Common protected method enforcing uniform input field layouts across the system
  protected getSharedInputProperties(): TextStyle {
    return {
      borderWidth: 1,
      borderColor: "#CCCCCC",
      backgroundColor: this.theme.colors.surface,
      paddingVertical: this.theme.spacing.sm,
      paddingHorizontal: this.theme.spacing.md,
      borderRadius: 6,
      fontSize: this.theme.typography.sizes.body,
      color: this.theme.colors.text,
    };
  }
}
