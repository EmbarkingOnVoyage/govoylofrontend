import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

import { inputStyles } from "./styles";

interface InputProps extends TextInputProps {
  error?: string;
}

const Input = ({ error, style, ...props }: InputProps) => {
  return (
    <View style={inputStyles.container}>
      <TextInput
        style={[
          inputStyles.input,
          error && inputStyles.inputError,
          style,
        ]}
        {...props}
      />

      {error ? (
        <Text style={inputStyles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     width: "100%",
//     marginBottom: 16,
//   },

//   input: {
//     borderWidth: 1,
  
//     borderColor: "#CCCCCC",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     fontSize: 18,
//   },

//   inputError: {
//     borderColor: "red",
//   },

//   errorText: {
//     color: "red",
//     marginTop: 4,
//     fontSize: 12,
//   },
// });

export default Input;