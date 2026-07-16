import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Button from "./packages/ui/src/features/bookings/components/Button";
import Input from "./packages/ui/src/features/bookings/components/Input";
import Card from "./packages/ui/src/features/bookings/components/Card";
import LocationAutocompleteDropdown from "./packages/ui/src/features/bookings/components/LocationAutocompleteDropdown";

export default function App() {
  const handlePress = () => {
    console.log("Button Pressed!");
  };

  const cities = [
  "Pune",
  "Mumbai",
  "Delhi",
  "Nagpur",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Nashik",
  "Ahmedabad",
];

  return (
    <View style={styles.container}>
<LocationAutocompleteDropdown
       locations={cities}
         placeholder="Enter your city"
        onSelect={(city) => console.log("Selected City:", city)}
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