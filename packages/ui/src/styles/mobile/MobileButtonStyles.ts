import { ViewStyle, TextStyle } from "react-native";
import { BaseButtonStyles } from "../base/BaseButtonStyles";

export class MobileButtonStyles extends BaseButtonStyles {
  // Inherits and enforces standard core button styles
  public buttonContainer: ViewStyle = {
    ...this.getSharedButtonContainerProperties(),
    backgroundColor: '#0284C7', // Default brand primary blue
    borderRadius: 8,           // Default generic corporate rounding
  };

  public buttonText: TextStyle = {
    ...this.getSharedButtonTextProperties(),
    color: "#FFFFFF",
  };
}

// Export a single static instance for easy cross-project importing
export const mobileButtonStyles = new MobileButtonStyles();
