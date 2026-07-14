import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { cardStyles } from "./styles";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card = ({ children, style }: CardProps) => {
  return (
    <View style={[cardStyles.card, style]}>
      {children}
    </View>
  );
};

export default Card;




