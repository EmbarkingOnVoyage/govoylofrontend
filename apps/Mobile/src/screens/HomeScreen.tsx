import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlightsTile } from '../components/FlightsTile';

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
    <View style={styles.cardsContainer}>
     <View style={styles.buttonGroup}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.squareButton} onPress={onSelectFlightsAndHotels} activeOpacity={0.85}>
          <Text style={styles.squareButtonText}>Flights{'\n'}+{'\n'}Hotels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.squareButton} onPress={onSelectHotels} activeOpacity={0.85}>
          <Text style={styles.squareButtonText}>Hotels</Text>
        </TouchableOpacity>
      </View>
    </View>


      <FlightsTile onPress={onSelectFlights} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    paddingBottom : 0
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
    lineHeight: 18.5,
    // Android top-aligns text whose line height is below its font size.
    paddingTop: 8.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardsContainer: {
    backgroundColor: '#F2EAFA',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    borderTopLeftRadius: 6,
    gap: 16,
    width: '100%',
  },
});
