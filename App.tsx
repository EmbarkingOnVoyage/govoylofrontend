import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Button from "./src/features/bookings/components/ui/Button";

export default function App() {
  const handlePress = () => {
    console.log("Button Pressed!");
  };

  return (
    <View style={styles.container}>
      <Button
        title="Login"
        variant="primary"
        onPress={handlePress}
      />

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
});
