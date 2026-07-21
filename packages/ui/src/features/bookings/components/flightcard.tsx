import React from "react";
import { View, Text, Image } from "react-native";

import { flightCardStyles } from "./styles";

interface FlightCardProps {
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  rating: number;
}

const FlightCard = ({
  airline,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  rating,
}: FlightCardProps) => {
  return (
    <View style={flightCardStyles.card}>
      {/* <Image
        source={{ uri: airlineLogo }}
        style={flightCardStyles.logo}
      /> */}

      <Text style={flightCardStyles.airline}>
        {airline}
      </Text>

      <Text>
        {from} → {to}
      </Text>

      <Text>
        {departureTime} - {arrivalTime}
      </Text>

      {/* <Text>{duration}</Text> */}

      <Text> Rs {price}</Text>

      <Text> * {rating}</Text>
    </View>
  );
};

export default FlightCard;