import React from 'react';
import { TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import { Text as RNText } from 'react-native'; // Temporary internal representation
import { getThemeStyles, ThemeMode } from '../theme/tokens';

export interface IButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  mode?: ThemeMode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  mode = 'light',
}: IButtonProps) {
  const theme = getThemeStyles(mode);

  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary 
    ? theme.colors.primary 
    : theme.colors.surface;

  const containerStyle: ViewStyle = {
    backgroundColor: disabled ? '#CCCCCC' : backgroundColor,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : 1,
  };

  const textStyle: TextStyle = {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: isPrimary ? '#FFFFFF' : theme.colors.text,
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled} 
      style={containerStyle}
      activeOpacity={0.7}
    >
      <RNText style={textStyle}>
        {label}
      </RNText>
    </TouchableOpacity>
  );
}
