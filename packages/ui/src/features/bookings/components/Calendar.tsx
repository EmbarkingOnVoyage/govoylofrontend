import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { calendarStyles } from "./styles";

interface CalendarProps {
  onDateChange: (startDate: Date, endDate: Date) => void;
  minDate?: Date;
}

// Replaces heavy date-fns bundle size overhead with 0-byte native runtime formatting
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const Calendar: React.FC<CalendarProps> = ({ 
  onDateChange, 
  minDate = new Date() 
}) => {
  const [checkInDate, setCheckInDate] = useState<Date>(minDate);
  const [checkOutDate, setCheckOutDate] = useState<Date>(() => {
    const tomorrow = new Date(minDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  const [showCheckInPicker, setShowCheckInPicker] = useState<boolean>(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState<boolean>(false);

  const handleCheckInChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowCheckInPicker(Platform.OS === "ios");
    if (selectedDate) {
      setCheckInDate(selectedDate);
      
      let updatedCheckOut = checkOutDate;
      if (selectedDate >= checkOutDate) {
        updatedCheckOut = new Date(selectedDate);
        updatedCheckOut.setDate(updatedCheckOut.getDate() + 1);
        setCheckOutDate(updatedCheckOut);
      }
      onDateChange(selectedDate, updatedCheckOut);
    }
  };

  const handleCheckOutChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowCheckOutPicker(Platform.OS === "ios");
    if (selectedDate) {
      if (selectedDate <= checkInDate) return;
      setCheckOutDate(selectedDate);
      onDateChange(checkInDate, selectedDate);
    }
  };

  return (
    <View style={calendarStyles.container}>
      <Text style={calendarStyles.title}>Select Date Range</Text>

      <Pressable
        style={calendarStyles.dateBox}
        onPress={() => setShowCheckInPicker(true)}
        accessibilityRole="button"
        accessibilityLabel="Select check in date"
      >
        <Text style={calendarStyles.label}>Check In</Text>
        <Text style={calendarStyles.date}>{formatDate(checkInDate)}</Text>
      </Pressable>

      <Pressable
        style={calendarStyles.dateBox}
        onPress={() => setShowCheckOutPicker(true)}
        accessibilityRole="button"
        accessibilityLabel="Select check out date"
      >
        <Text style={calendarStyles.label}>Check Out</Text>
        <Text style={calendarStyles.date}>{formatDate(checkOutDate)}</Text>
      </Pressable>

      {/* Web Compiling Path */}
      {Platform.OS === "web" && showCheckInPicker && (
        <input
          type="date"
          data-testid="web-checkin-input"
          value={checkInDate.toISOString().split("T")[0]}
          onChange={(e) => handleCheckInChange({} as DateTimePickerEvent, e.target.value ? new Date(e.target.value) : undefined)}
          style={{ padding: "8px", margin: "8px 0" }}
        />
      )}

      {Platform.OS === "web" && showCheckOutPicker && (
        <input
          type="date"
          data-testid="web-checkout-input"
          value={checkOutDate.toISOString().split("T")[0]}
          onChange={(e) => handleCheckOutChange({} as DateTimePickerEvent, e.target.value ? new Date(e.target.value) : undefined)}
          style={{ padding: "8px", margin: "8px 0" }}
        />
      )}

      {/* Native Compiling Path */}
      {Platform.OS !== "web" && showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display="default"
          minimumDate={minDate}
          onChange={handleCheckInChange}
        />
      )}

      {Platform.OS !== "web" && showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display="default"
          minimumDate={checkInDate}
          onChange={handleCheckOutChange}
        />
      )}
    </View>
  );
};

export default Calendar;
