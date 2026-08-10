import { ViewStyle, TextStyle } from "react-native";

export interface IButtonStyles {
  buttonContainer: ViewStyle;
  buttonText: TextStyle;
}

export abstract class BaseButtonStyles implements IButtonStyles {
  public abstract buttonContainer: ViewStyle;
  public abstract buttonText: TextStyle;

  // Virtual helper providing the standard structural blueprint
  protected getSharedButtonContainerProperties(): ViewStyle {
    return {
      height: 54,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    };
  }

  // Virtual helper providing standard typography weights
  protected getSharedButtonTextProperties(): TextStyle {
    return {
      fontSize: 16,
      fontWeight: "700",
    };
  }
}
