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


export default Input;