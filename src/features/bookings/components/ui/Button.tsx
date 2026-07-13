import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
}

const Button = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[
        styles.button,
        variant === "primary"
          ? styles.primaryButton
          : styles.secondaryButton,
        isDisabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: "#007AFF",
  },

  secondaryButton: {
    backgroundColor: "#6C757D",
  },

  disabledButton: {
    backgroundColor: "#C4C4C4",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Button;