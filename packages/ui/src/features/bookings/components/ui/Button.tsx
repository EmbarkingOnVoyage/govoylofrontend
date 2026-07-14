import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

import { buttonStyles } from "./styles";

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "primaryButton" | "secondaryButton";
  loading?: boolean;
  disabled?: boolean;
}

const Button = ({
  title,
  onPress,
  variant = "secondaryButton",
  loading = false,
  disabled = false,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[
        buttonStyles.button,
        variant === "secondaryButton"
          ? buttonStyles.primaryButton
          : buttonStyles.secondaryButton,
        isDisabled && buttonStyles.disabledButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={buttonStyles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
};

export default Button;