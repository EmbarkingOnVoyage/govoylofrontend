import { ViewStyle, TextStyle } from "react-native";
import { BaseInputStyles } from "../base/BaseInputStyles";
import { ThemeMode } from "../../theme/tokens";

export class AutocompleteDropdownStyles extends BaseInputStyles {
  public container: ViewStyle;
  public input: TextStyle;
  public list: ViewStyle;
  public item: ViewStyle;

  constructor(mode: ThemeMode = "light") {
    super(mode);

    this.container = {
      width: "100%",
      marginBottom: this.theme.spacing.md,
      position: "relative", // Specialized child component modifier
    };

    this.input = {
      ...this.getSharedInputProperties(), // Pure Class Inheritance of Core UI rules
    };

    this.list = {
      maxHeight: 200,
      borderWidth: 1,
      borderColor: "#EAEAEA",
      backgroundColor: this.theme.colors.surface,
      borderRadius: 4,
      marginTop: 4,
    };

    this.item = {
      padding: this.theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: "#F5F5F5",
    };
  }
}

// Export single immutable instance using default theme parameters
export const styles = new AutocompleteDropdownStyles("light");
