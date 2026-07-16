import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";

import { locationStyles } from "./styles";

interface LocationAutocompleteDropdownProps {
  locations: string[];
  placeholder?: string;
  onSelect: (location: string) => void;
}

const LocationAutocompleteDropdown = ({
  locations,
  placeholder = "Enter location",
  onSelect,
}: LocationAutocompleteDropdownProps) => {
  const [query, setQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);

    if (text.trim() === "") {
      setFilteredLocations([]);
      return;
    }

    const filtered = locations.filter((location) =>
      location.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredLocations(filtered);
  };

  const handleSelect = (location: string) => {
    setQuery(location);
    setFilteredLocations([]);
    onSelect(location);
  };

  return (
    <View style={locationStyles.container}>
      <TextInput
        style={locationStyles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={handleSearch}
      />

      {filteredLocations.length > 0 && (
        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={locationStyles.item}
              onPress= {() => handleSelect(item)}
            >
              <Text style={locationStyles.itemText}>{item}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

export default LocationAutocompleteDropdown;