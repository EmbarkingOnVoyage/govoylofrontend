import { UI_VERSION } from "@workspace/ui";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Alert } from "react-native";
import { AppProvider, BookingDashboard, Button, Input, Card, AutoCompleteDropdown  } from '@workspace/ui';
import { LandingScreen } from './src/screens/LandingScreen'; 

export default function App() {
  return (
    <AppProvider contextName="MOBILE-APP-SHELL">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        
        {/* Render our brand-new landing screen layout */}
        <LandingScreen 
          onGetStarted={() => Alert.alert('Action', 'Navigating to onboarding registration...')}
          onLoginPress={() => Alert.alert('Action', 'Navigating to secure authorization login...')}
        />

      </SafeAreaView>
    </AppProvider>
  );
}

// export default function App() {
//   const handlePress = () => {
//     console.log("Button Pressed!");
//   };

//   const cities = [
//     "Pune",
//     "Mumbai",
//     "Delhi",
//     "Nagpur",
//     "Bangalore",
//     "Hyderabad",
//     "Chennai",
//     "Nashik",
//     "Ahmedabad",
//   ];

//   return (
//     <View style={styles.container}>
//       <AutoCompleteDropdown
//         data={cities}
//         placeholder="Enter your city"
//         onSelect={(city) => console.log("Selected City:", city)}
//         labelExtractor={(item) => item}
//         keyExtractor={(item) => item}
//       />

//       <Card>
//         <Text style={styles.title}>Login</Text>

//         <Input
//           placeholder="Enter your email"
//           value=""
//           onChangeText={(text) => console.log(text)}
//         />

//         <Input
//           placeholder="Enter your password"
//           value=""
//           secureTextEntry
//           onChangeText={(text) => console.log(text)}
//         />

//         <Button label="Login" variant="primary" onPress={handlePress} />
//       </Card>

//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
// });
