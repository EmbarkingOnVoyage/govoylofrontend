// packages/styles/base/BaseButton.styles.ts
import { ViewStyle, TextStyle } from "react-native";

export interface IButtonStyles {
  buttonContainer: ViewStyle;
  buttonText: TextStyle;
}

// 1. Structural blueprint properties (Moved out of class to prevent duplicate memory creation)
const sharedButtonContainerProperties: ViewStyle = {
  height: 54,
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
};

const sharedButtonTextProperties: TextStyle = {
  fontSize: 16,
  fontWeight: "700",
};

/**
 * 💡 Centralised helper to compute the container styles dynamically based on props and design tokens.
 */
export const getDynamicContainerStyle = (
  variant: 'primary' | 'secondary' | 'social',
  disabled: boolean,
  theme: any
): ViewStyle => {
  const isPrimary = variant === 'primary';
  const isSocial = variant === 'social';

  let backgroundColor = isPrimary 
    ? theme.colors.primary 
    : theme.colors.surface;

  if (isSocial) {
    backgroundColor = '#F0F2F5'; // Exact visual hex token matching your figma spec
  }

  return {
    ...sharedButtonContainerProperties,
    backgroundColor: disabled ? '#CCCCCC' : backgroundColor,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 12, // Curvature matched directly to your center-box layout standard
    opacity: disabled ? 0.6 : 1,
  };
};

/**
 * 💡 Centralised helper to compute the button text styles dynamically.
 */
export const getDynamicTextStyle = (
  variant: 'primary' | 'secondary' | 'social',
  theme: any
): TextStyle => {
  const isPrimary = variant === 'primary';
  const isSocial = variant === 'social';

  return {
    ...sharedButtonTextProperties,
    fontSize: isSocial ? 20 : theme.typography.sizes.body,
    color: isPrimary ? '#FFFFFF' : theme.colors.text,
  };
};

export const defaultButtonStyles: IButtonStyles = {
  buttonContainer: {
    ...sharedButtonContainerProperties,
    backgroundColor: '#0284C7', // Default brand primary blue
    borderRadius: 8,           // Default generic corporate rounding
  },
  buttonText: {
    ...sharedButtonTextProperties,
    color: "#FFFFFF",
  },
};

// 2. Static object exports for the Login Form (Replaces "new LoginButtonStyles()")
export const loginButtonStyles: IButtonStyles = {
  buttonContainer: {},
  buttonText: {},
};
