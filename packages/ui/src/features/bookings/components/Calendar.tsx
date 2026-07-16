import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import { calendarStyles } from "./styles";

interface CalendarProps {
  onDateChange: (startDate: Date, endDate: Date) => void;
}

const Calendar = ({ onDateChange }: CalendarProps) => {
  const [checkInDate, setCheckInDate] = useState(new Date());

  const [checkOutDate, setCheckOutDate] = useState(new Date());

  const [showCheckInPicker, setShowCheckInPicker] = useState(false);

  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const handleCheckInChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowCheckInPicker(Platform.OS === "ios");

    if (selectedDate) {
      setCheckInDate(selectedDate);

      onDateChange(selectedDate, checkOutDate);
    }
  };

  const handleCheckOutChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowCheckOutPicker(Platform.OS === "ios");

    if (selectedDate) {
      setCheckOutDate(selectedDate);

      onDateChange(checkInDate, selectedDate);
    }
  };

  return (
    <View style={calendarStyles.container}>
      <Text style={calendarStyles.title}>
        Select Date Range
      </Text>

      {/* Check In */}

      <Pressable
        style={calendarStyles.dateBox}
        onPress={() => setShowCheckInPicker(true)}
      >
        <Text style={calendarStyles.label}>
          Check In
        </Text>

        <Text style={calendarStyles.date}>
          {format(checkInDate, "dd MMM yyyy")}
        </Text>
      </Pressable>

      {/* Check Out */}

      <Pressable
        style={calendarStyles.dateBox}
        onPress={() => setShowCheckOutPicker(true)}
      >
        <Text style={calendarStyles.label}>
          Check Out
        </Text>

        <Text style={calendarStyles.date}>
          {format(checkOutDate, "dd MMM yyyy")}
        </Text>
      </Pressable>

      {showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display="default"
          onChange={handleCheckInChange}
        />
      )}

      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display="default"
          onChange={handleCheckOutChange}
        />
      )}
    </View>
  );
};

export default Calendar;