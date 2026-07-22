import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Button from "./packages/ui/src/features/bookings/components/Button";
import Input from "./packages/ui/src/features/bookings/components/Input";
import Card from "./packages/ui/src/features/bookings/components/Card";
import LocationAutocompleteDropdown from "./packages/ui/src/features/bookings/components/LocationAutocompleteDropdown";
import Calendar from "./packages/ui/src/features/bookings/components/Calendar";
import SearchWidget from "./packages/ui/src/features/bookings/components/SearchWidget";
// import FlightCard from "./packages/ui/src/features/bookings/components/flightcard";
import { getFlights, Flight } from "./packages/ui/src/features/bookings/services/flightService";
import Checkbox from "./packages/ui/src/features/bookings/components/Checkbox";
// import { beTarask } from "date-fns/locale";
import ResultsList from "./packages/ui/src/features/bookings/components/ResultsList";

export default function App() {
  const [flights, setFlights] = useState<Flight[]>([]);

  const [nonStop, setNonStop] = useState(false);
  const [breakfast, setBreakfast] = useState(false);
  const [wifi, setWifi] = useState(false);

// useEffect (() => {
//   const loadFlights = async () => {
//     try {
//       const data = await getFlights();

//       console.log(data);

//       setFlights(data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   loadFlights();
// }, []);


useEffect(() => {
  const loadFlights = async () => {
    try {
      const data = await getFlights();

      console.log("API Response:", data);

      setFlights(data);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  loadFlights();
}, []);

useEffect(() => {
  console.log("Flights state updated:", flights);
}, [flights]);

  const handlePress = () => {
    console.log("Button Pressed!");
  };
 
  return (
    <View style={styles.container}>
      {/* Combining multiple components here */}
        <SearchWidget />

      {/* {flights.map((flight) => (
  <FlightCard
    key={flight.id}
    airline={flight.airline}
    from={flight.from}
    to={flight.to}
    departureTime={flight.departureTime}
    arrivalTime={flight.arrivalTime}
    price={flight.price}
    rating={flight.rating}
  />
))} */}

<ResultsList flights={flights} />

      <Checkbox
        label="Non-stop Flights"
        checked={nonStop}
        onToggle={() => setNonStop(!nonStop)}
      />
       <Checkbox
       label = "5 star Hotel"
       checked ={breakfast}
       onToggle={()=> setBreakfast(!breakfast)}
       />
       <Checkbox 
       label = "Free wifi"
       checked = {wifi}
       onToggle={()=> setWifi(!wifi)}
       />
      <Card>
        <Text style={styles.title}>Login</Text>

        <Input
          placeholder="Enter your email"
          onChangeText={(text) => console.log(text)}
        />
        
        <Input
          placeholder="Enter your password"
          secureTextEntry
          onChangeText={(text) => console.log(text)}
        />
        <Button
          title="Login"
          variant="primaryButton"
          onPress={handlePress}
        />
      </Card>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});