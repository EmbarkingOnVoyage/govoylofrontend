import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { showComingSoon } from '../components/comingSoon';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { GlowPill, PillIcon } from '../components/GlowPill';
import iconFlightsSrc from '../assets/images/icon-flights.png';
import iconHotelsSrc from '../assets/images/icon-hotels.png';

const iconFlights = iconFlightsSrc as unknown as number;
const iconHotels = iconHotelsSrc as unknown as number;

interface HomeScreenProps {
  onSelectFlightsAndHotels: () => void;
  onSelectHotels: () => void;
  onSelectFlights: () => void;
}

const SPARKLE_SVG = `<svg width="19" height="18" viewBox="-1 -1 19 18" xmlns="http://www.w3.org/2000/svg"><path d="M11 15C12.2 11.322 13.526 9.995 17 9C13.526 8.005 12.2 6.678 11 3C9.8 6.678 8.474 8.005 5 9C8.474 9.995 9.8 11.322 11 15ZM3 6C3.6 4.16 4.263 3.497 6 3C4.263 2.503 3.6 1.84 3 0C2.4 1.84 1.737 2.503 0 3C1.737 3.497 2.4 4.16 3 6ZM4.5 16C4.8 15.08 5.131 14.749 6 14.5C5.131 14.251 4.8 13.92 4.5 13C4.2 13.92 3.869 14.251 3 14.5C3.869 14.749 4.2 15.08 4.5 16Z" fill="none" stroke="#7C1AEE" stroke-width="2" stroke-linejoin="round"/></svg>`;

// Figma "Phone Dev" → "Privacy and data management" (the landing page, 375
// wide): a Voylo AI banner over a lilac panel of product pills with the web
// animated gradient ring (see GlowPill).
export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectFlightsAndHotels,
  onSelectHotels,
  onSelectFlights,
}) => (
  <View style={styles.screen}>
    <TouchableOpacity
      style={styles.banner}
      activeOpacity={0.8}
      onPress={() => showComingSoon('Voylo AI')}
      accessibilityLabel="Voylo AI"
    >
      <LinearGradient colors={['#9335FF', '#5731FF']} style={styles.bannerBorder}>
        <View style={styles.bannerInner} />
        <SvgXml xml={SPARKLE_SVG} width={19} height={18} style={[styles.sparkle, { left: 15 }]} />
        <Text style={styles.bannerText} numberOfLines={1}>
          Meet <Text style={styles.bannerAccent}>Voylo AI,</Text> Your Smarter Way to Travel.
        </Text>
        <SvgXml xml={SPARKLE_SVG} width={19} height={18} style={[styles.sparkle, { right: 16 }]} />
      </LinearGradient>
    </TouchableOpacity>

    <View style={styles.panel}>
      <GlowPill height={67.47} onPress={onSelectFlightsAndHotels} accessibilityLabel="Flights + Hotels">
        <PillIcon source={iconFlights} style={styles.iconLeft} />
        <Text style={[styles.pillText, styles.pillTextCentered]} numberOfLines={1}>
          Flights + Hotels
        </Text>
        <PillIcon source={iconHotels} style={styles.iconRight} />
      </GlowPill>
      <View style={styles.row}>
        <GlowPill height={67.47} style={styles.half} onPress={onSelectFlights} accessibilityLabel="Flights">
          <PillIcon source={iconFlights} style={styles.iconInline} />
          <Text style={styles.pillText} numberOfLines={1}>Flights</Text>
        </GlowPill>
        <GlowPill height={67.47} style={styles.half} onPress={onSelectHotels} accessibilityLabel="Hotels">
          <PillIcon source={iconHotels} style={styles.iconInline} />
          <Text style={styles.pillText} numberOfLines={1}>Hotels</Text>
        </GlowPill>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
  },
  // 48px #C0D2FF band; the panel below overlaps its last pixel.
  banner: {
    height: 48,
    backgroundColor: '#C0D2FF',
  },
  // 343x30 pill (on a 375 frame) with a centred 2px gradient stroke, so
  // 345x32 outside; it stretches with the screen width.
  bannerBorder: {
    position: 'absolute',
    left: 14,
    right: 16,
    top: 8,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
  },
  bannerInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 2,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  sparkle: {
    position: 'absolute',
    top: 7,
  },
  bannerText: {
    marginLeft: 40,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#697691',
  },
  bannerAccent: {
    fontWeight: '700',
    color: '#7C1AEE',
  },
  panel: {
    marginTop: -1,
    backgroundColor: '#F2EAFA',
    borderTopLeftRadius: 6,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 11.53,
    gap: 12.53,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  iconLeft: {
    position: 'absolute',
    left: 8.38,
  },
  iconRight: {
    position: 'absolute',
    right: 7.94,
  },
  iconInline: {
    marginLeft: 8.38,
    marginRight: 8.84,
  },
  pillText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#3E4B64',
  },
  pillTextCentered: {
    flex: 1,
    textAlign: 'center',
  },
});
