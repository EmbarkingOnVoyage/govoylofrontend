import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, SafeAreaView } from 'react-native';
import { ChevronDown, X, Check } from 'lucide-react-native';
import { styles } from './SelectField.styles';

interface SelectFieldProps {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  title?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  options,
  onSelect,
  placeholder = 'Select',
  title = 'Select an option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredOptions =
    query.trim().length === 0
      ? options
      : options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()));

  const handleOpen = () => {
    setQuery('');
    setIsOpen(true);
  };

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.field} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={value ? styles.fieldText : styles.fieldPlaceholder}>{value || placeholder}</Text>
        <ChevronDown size={18} color="#7C8CAD" strokeWidth={2} />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={() => setIsOpen(false)}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={22} color="#182339" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {options.length > 6 && (
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionRow} onPress={() => handleSelect(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                  {item === value && <Check size={18} color="#7C1AEE" strokeWidth={2.5} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No matches found.</Text>
              }
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};
