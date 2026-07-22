import React from 'react';
import { View, ViewStyle } from 'react-native';
import { getThemeStyles, ThemeMode } from '../theme/tokens';

// Enforce strict property contracts for our card containers
export interface ICardProps {
  children: React.ReactNode;
  mode?: ThemeMode;
  style?: ViewStyle; // Allows layout wrappers to override positioning
}

export function Card({
  children,
  mode = 'light',
  style,
}: ICardProps) {
  const theme = getThemeStyles(mode);

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: mode === 'light' ? '#E0E0E0' : '#333333',
    // Cross-Platform Clean Shadowing / Elevation
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  };

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}
