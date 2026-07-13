import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Button from "./packages/ui/src/features/bookings/components/ui/Button";
import Input from "./packages/ui/src/features/bookings/components/ui/Input";
import Card from "./packages/ui/src/features/bookings/components/ui/Card";

export default function App() {
  const handlePress = () => {
    console.log("Button Pressed!");
  };

  return (
    <View style={styles.container}>
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
          variant="primary"
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