import React, { useState } from "react";
import { View } from "react-native";
import { Button } from "../../../components/Button";
import { AutocompleteDropdown } from "../../../components/AutocompleteDropdown";
import { Calendar } from "./Calendar";
import { useLocations } from "@workspace/api";
import { styles } from "../../../styles/components/SearchWidget.styles"; // Direct Class Instance Binding

export interface SearchWidgetProps {
  onSearchSubmit: (payload: {
    fromCity: string;
    toCity: string;
    startDate: Date;
    endDate: Date;
  }) => void;
}

export function SearchWidget({ onSearchSubmit }: SearchWidgetProps) {
  // Enforce Cache Engine Contract via TanStack Query Hook
  const { data: cities = [], isLoading, isError } = useLocations();

  // Component State Variables
  const [fromCity, setFromCity] = useState<string>("");
  const [toCity, setToCity] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 1);
    return { startDate: start, endDate: end };
  });

  const handleSearchTrigger = () => {
    // Business Validation Rule: Protect pipeline from empty or incomplete submissions
    if (!fromCity.trim() || !toCity.trim()) {
      return;
    }
    
    onSearchSubmit({
      fromCity,
      toCity,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  if (isError) {
    throw new Error("Contract Violation: Failed to load locations from upstream API layer.");
  }

  return (
    <View style={styles.container}>
      {/* Reused Generic Dropdown for From Target Selection */}
      <AutocompleteDropdown<string>
        data={cities}
        placeholder={isLoading ? "Loading cities..." : "From"}
        onSelect={(city) => setFromCity(city)}
        labelExtractor={(item) => item}
        keyExtractor={(item) => `from-${item}`}
      />

      {/* Reused Generic Dropdown for To Target Selection */}
      <AutocompleteDropdown<string>
        data={cities}
        placeholder={isLoading ? "Loading cities..." : "To"}
        onSelect={(city) => setToCity(city)}
        labelExtractor={(item) => item}
        keyExtractor={(item) => `to-${item}`}
      />

      <Calendar
        onDateChange={(startDate, endDate) => setDateRange({ startDate, endDate })}
      />

      <Button
        label="Search"
        variant="primary"
        onPress={handleSearchTrigger}
        disabled={isLoading || !fromCity || !toCity}
      />
    </View>
  );
}

export default SearchWidget;
