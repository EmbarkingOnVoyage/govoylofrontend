// packages/styles/base/baseButtonstyles.ts
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

  /**
   * 💡 NEW: Centralised helper to compute the container styles dynamically based on props and design tokens.
   */
  public getDynamicContainerStyle(
    variant: 'primary' | 'secondary' | 'social',
    disabled: boolean,
    theme: any
  ): ViewStyle {
    const isPrimary = variant === 'primary';
    const isSocial = variant === 'social';

    let backgroundColor = isPrimary 
      ? theme.colors.primary 
      : theme.colors.surface;

    if (isSocial) {
      backgroundColor = '#F0F2F5'; // Exact visual hex token matching your figma spec
    }

    return {
      ...this.getSharedButtonContainerProperties(),
      backgroundColor: disabled ? '#CCCCCC' : backgroundColor,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 12, // Curvature matched directly to your center-box layout standard
      opacity: disabled ? 0.6 : 1,
    };
  }

  /**
   * 💡 NEW: Centralised helper to compute the button text styles dynamically.
   */
  public getDynamicTextStyle(
    variant: 'primary' | 'secondary' | 'social',
    theme: any
  ): TextStyle {
    const isPrimary = variant === 'primary';
    const isSocial = variant === 'social';

    return {
      ...this.getSharedButtonTextProperties(),
      fontSize: isSocial ? 20 : theme.typography.sizes.body,
      color: isPrimary ? '#FFFFFF' : theme.colors.text,
    };
  }
}
export class LoginButtonStyles extends BaseButtonStyles {
  public buttonContainer = {};
  public buttonText = {};
}

// 💡 Crucial: This exact instance variable must be exported
export const loginButtonStyles = new LoginButtonStyles();