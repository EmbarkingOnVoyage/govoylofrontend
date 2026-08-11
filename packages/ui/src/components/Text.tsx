import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { getThemeStyles, ThemeMode } from '../theme/tokens';

export interface ITextProps {
  children: React.ReactNode;
  variant?: 'title' | 'heading' | 'body' | 'caption';
  weight?: 'regular' | 'medium' | 'bold';
  mode?: ThemeMode;
  style?: TextStyle;
}

export function Text({
  children,
  variant = 'body',
  weight = 'regular',
  mode = 'light',
  style,
}: ITextProps) {
  const theme = getThemeStyles(mode);

  const baseStyle: TextStyle = {
    fontSize: theme.typography.sizes[variant],
    fontWeight: theme.typography.weights[weight],
    color: theme.colors.text,
  };

  return (
    <RNText style={[baseStyle, style]}>
      {children}
    </RNText>
  );
}
