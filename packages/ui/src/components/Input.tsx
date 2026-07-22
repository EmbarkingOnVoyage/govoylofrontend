import React from 'react';
import { TextInput, View, ViewStyle, TextStyle } from 'react-native';
import { Text } from './Text';
import { getThemeStyles, ThemeMode } from '../theme/tokens';

// Enforce strict property validation contracts
export interface IInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  mode?: ThemeMode;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  mode = 'light',
}: IInputProps) {
  const theme = getThemeStyles(mode);

  const containerStyle: ViewStyle = {
    marginBottom: theme.spacing.md,
    width: '100%',
  };

  const inputStyle: TextStyle = {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 6,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text variant="caption" weight="medium" mode={mode} style={{ marginBottom: 4 }}>
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888888"
        secureTextEntry={secureTextEntry}
        style={inputStyle}
      />
    </View>
  );
}
