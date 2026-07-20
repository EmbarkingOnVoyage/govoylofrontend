import React, { useEffect, useState } from "react";
import { View } from "react-native";

import Button from "./Button";
import Calendar from "./Calendar";
import LocationAutocompleteDropdown from "./LocationAutocompleteDropdown";

import { getLocations } from "../services/locationService";

const SearchWidget = () => {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getLocations();
        setCities(response);
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    };

    fetchLocations();
  }, []);
  
  return (
    <View>
      {/* From */}
      <LocationAutocompleteDropdown
        locations={cities}
        placeholder="From"
        onSelect={(city) => console.log("From:", city)}
      />

      {/* To */}
      <LocationAutocompleteDropdown
        locations={cities}
        placeholder="To"
        onSelect={(city) => console.log("To:", city)}
      />

      {/* Calendar */}
      <Calendar
        onDateChange={(checkIn, checkOut) => {
          console.log("Check In:", checkIn);
          console.log("Check Out:", checkOut);
        }}
      />

      {/* Search Button */}
      <Button
        title="Search"
        variant="primaryButton"
        onPress={() => console.log("Searching...")}
      />
    </View>
  );
};

export default SearchWidget;
