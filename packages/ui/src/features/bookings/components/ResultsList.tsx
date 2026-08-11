import React from "react";
import { FlatList, Text, View } from "react-native";
import FlightCard from "./flightcard";
import { resultsListStyles } from "./styles";
import { Flight } from "../services/flightService";

interface ResultsListProps {
  flights: Flight[];
}

const ResultsList = ({ flights }: ResultsListProps) => {
    console.log("Flights received:", flights);

  return (
   <FlatList
  style={{ width: "100%" }}
  contentContainerStyle={resultsListStyles.contentContainer}
  data={flights}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <FlightCard
      airline={item.airline}
      from={item.from}
      to={item.to}
      departureTime={item.departureTime}
      arrivalTime={item.arrivalTime}
      price={item.price}
      rating={item.rating}
    />
  )}
/>
  );
};
export default ResultsList;