import React from 'react';
import { View, TextInput, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Calendar, ChevronDown } from 'lucide-react-native';

interface DateFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

// Typed DD/MM/YYYY field drawn like the Figma date inputs on the profile
// forms: calendar icon on the left, chevron on the right.
export const DateField: React.FC<DateFieldProps> = ({ value, onChangeText, placeholder = 'DD/MM/YYYY', style }) => (
  <View style={[styles.field, style]}>
    <Calendar size={20} color="#182339" strokeWidth={1.2} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#697691"
      keyboardType="numbers-and-punctuation"
    />
    <ChevronDown size={20} color="#182339" strokeWidth={2} />
  </View>
);

const styles = StyleSheet.create({
  field: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#182339',
  },
});
