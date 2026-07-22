import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { checkboxStyles } from "./styles";

interface CheckboxProps{
 label: string;
  checked: boolean;
  onToggle: () => void;
} 

const Checkbox = ({ label, checked , onToggle}: CheckboxProps) =>{
    return (
        <Pressable style={checkboxStyles.container} onPress={onToggle}>
      <View 
           style={[checkboxStyles.checkbox, checked && checkboxStyles.checkedBox]}>
        {checked && <View style={checkboxStyles.checkmark} />}
      </View>

      <Text style={checkboxStyles.label}>{label}</Text>
    </Pressable>
  )
}

export default Checkbox;
