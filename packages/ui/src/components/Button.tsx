// packages/ui/src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, TextStyle, ViewStyle, StyleProp } from 'react-native';
import { Text as RNText } from 'react-native'; 
import { getThemeStyles, ThemeMode } from '../theme/tokens';

// 💡 Clean, clean index import bypassing deep nested folder structures
import { loginButtonStyles } from '../styles/base/BaseButtonStyles'; 

export interface IButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'social';
  disabled?: boolean;
  mode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  mode = 'light',
  style,
}: IButtonProps) {
  const theme = getThemeStyles(mode);

  // Calls the dynamic layout calculation classes perfectly via the clean style instance
  const containerStyle = loginButtonStyles.getDynamicContainerStyle(variant, disabled, theme);
  const textStyle = loginButtonStyles.getDynamicTextStyle(variant, theme);

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled} 
      style={[containerStyle, style]} 
      activeOpacity={0.7}
    >
      <RNText style={textStyle}>
        {label}
      </RNText>
    </TouchableOpacity>
  );
}
