import React, { useState } from "react";
import { View, TextInput, FlatList, Pressable } from "react-native";
import { Text } from "./Text"; 
import { styles } from "../styles/components/AutoCompleteDropdown.styles"; // Consolidated style class instance reference

export interface AutoCompleteDropdownProps<T> {
  data: T[];
  placeholder?: string;
  onSelect: (item: T) => void;
  labelExtractor: (item: T) => string; 
  keyExtractor: (item: T) => string;   
}

export function AutoCompleteDropdown<T,>({
  data,
  placeholder = "Search...",
  onSelect,
  labelExtractor,
  keyExtractor,
}: AutoCompleteDropdownProps<T>) {
  const [query, setQuery] = useState<string>("");
  const [filteredData, setFilteredData] = useState<T[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);

    if (text.trim() === "") {
      setFilteredData([]);
      return;
    }

    const matches = data.filter((item) =>
      labelExtractor(item).toLowerCase().includes(text.toLowerCase())
    );

    setFilteredData(matches);
  };

  const handleSelect = (item: T) => {
    setQuery(labelExtractor(item));
    setFilteredData([]);
    onSelect(item);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={handleSearch}
      />

      {filteredData.length > 0 && (
        <FlatList
          data={filteredData}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.item}
              onPress={() => handleSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${labelExtractor(item)}`}
            >
              <Text variant="body" weight="regular">
                {labelExtractor(item)}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
