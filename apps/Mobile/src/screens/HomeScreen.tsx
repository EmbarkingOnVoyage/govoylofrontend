import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { STAR_SVG } from '../components/figmaIcons';
// global.d.ts types *.png as `string` for @workspace/ui's web-only re-exports;
// Metro actually resolves a local RN import like this to an asset module id
// (number), which is what Image.source expects — cast to match the runtime type.
// Gradient + clouds rendered from the Figma Flights tile.
import flightsTileSrc from '../assets/images/flights-tile-bg.png';
const flightsTileBackground = flightsTileSrc as unknown as number;

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


      <TouchableOpacity onPress={onSelectFlights} activeOpacity={0.85}>
        <ImageBackground
          source={flightsTileBackground}
          resizeMode="stretch"
          style={styles.flightsButton}
          imageStyle={styles.flightsButtonImage}
        >
          <Text style={styles.flightsButtonText}>Flights</Text>
          <SvgXml xml={STAR_SVG} width={4.76} height={4.52} style={styles.star1} />
          <SvgXml xml={STAR_SVG} width={7.61} height={7.24} style={styles.star2} />
          <SvgXml xml={STAR_SVG} width={7.61} height={7.24} style={styles.star3} />
        </ImageBackground>
      </TouchableOpacity>
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
  flightsButtonImage: {
    borderRadius: 8,
  },
  flightsButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  star1: {
    position: 'absolute',
    top: 3,
    right: 53.1,
  },
  star2: {
    position: 'absolute',
    top: 8,
    right: 17.2,
  },
  star3: {
    position: 'absolute',
    top: 28,
    right: 36.2,
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
