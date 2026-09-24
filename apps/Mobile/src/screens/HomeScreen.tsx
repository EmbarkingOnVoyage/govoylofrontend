import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plane, Sparkles } from 'lucide-react-native';
// global.d.ts types *.png as `string` for @workspace/ui's web-only re-exports;
// Metro actually resolves a local RN import like this to an asset module id
// (number), which is what Image.source expects — cast to match the runtime type.
import flightsButtonCloudsSrc from '../assets/images/flights-button-clouds.png';
const flightsButtonClouds = flightsButtonCloudsSrc as unknown as number;

interface HomeScreenProps {
  onSelectFlightsAndHotels: () => void;
  onSelectHotels: () => void;
  onSelectFlights: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectFlightsAndHotels,
  onSelectHotels,
  onSelectFlights,
}) => (
  <View style={styles.screen}>
    <View style={styles.buttonGroup}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.squareButton} onPress={onSelectFlightsAndHotels} activeOpacity={0.85}>
          <Text style={styles.squareButtonText}>Flights{'\n'}+{'\n'}Hotels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.squareButton} onPress={onSelectHotels} activeOpacity={0.85}>
          <Text style={styles.squareButtonText}>Hotels</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onSelectFlights} activeOpacity={0.85}>
        <LinearGradient
          colors={['#973DFF', '#CF31FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.flightsButton}
        >
          <Image source={flightsButtonClouds} style={styles.flightsButtonClouds} resizeMode="cover" />
          <Plane size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.flightsButtonText}>Flights</Text>
          <Sparkles size={5} color="#D9D9D9" style={styles.star1} />
          <Sparkles size={8} color="#D9D9D9" style={styles.star2} />
          <Sparkles size={8} color="#D9D9D9" style={styles.star3} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonGroup: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 19,
  },
  squareButton: {
    flex: 1,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#6A16CB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  squareButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  flightsButton: {
    height: 80,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#973DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  // Matches Figma's "Group 3" cloud decoration — positioned to bleed off the
  // button's bottom edge, clipped by flightsButton's overflow: hidden.
  flightsButtonClouds: {
    position: 'absolute',
    top: 49,
    left: 99,
    width: 226,
    height: 99,
  },
  flightsButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  star1: {
    position: 'absolute',
    top: 3,
    right: 53,
  },
  star2: {
    position: 'absolute',
    top: 8,
    right: 17,
  },
  star3: {
    position: 'absolute',
    top: 28,
    right: 36,
  },
});
