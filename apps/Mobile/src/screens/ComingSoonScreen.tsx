import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { ArrowLeft } from 'lucide-react-native';
import { useHardwareBack } from '../navigation/useHardwareBack';
import iconFlightsSrc from '../assets/images/icon-flights.png';
import iconHotelsSrc from '../assets/images/icon-hotels.png';

const iconFlights = iconFlightsSrc as unknown as number;
const iconHotels = iconHotelsSrc as unknown as number;

export type ComingSoonFeature = 'Hotels' | 'Flights + Hotels' | 'Voylo AI';

const MESSAGES: Record<ComingSoonFeature, string> = {
  Hotels: 'Hotel stays are on their way. Soon you will be able to search and book hotels right here.',
  'Flights + Hotels': 'Flight and hotel packages are on their way. Soon you will be able to book both together and save.',
  'Voylo AI': 'Voylo AI, your smarter way to travel, is on its way. It will help you plan and book trips just by asking.',
};

// The Voylo AI banner's sparkle, in white.
const SPARKLE_SVG = `<svg width="38" height="36" viewBox="-1 -1 19 18" xmlns="http://www.w3.org/2000/svg"><path d="M11 15C12.2 11.322 13.526 9.995 17 9C13.526 8.005 12.2 6.678 11 3C9.8 6.678 8.474 8.005 5 9C8.474 9.995 9.8 11.322 11 15ZM3 6C3.6 4.16 4.263 3.497 6 3C4.263 2.503 3.6 1.84 3 0C2.4 1.84 1.737 2.503 0 3C1.737 3.497 2.4 4.16 3 6ZM4.5 16C4.8 15.08 5.131 14.749 6 14.5C5.131 14.251 4.8 13.92 4.5 13C4.2 13.92 3.869 14.251 3 14.5C3.869 14.749 4.2 15.08 4.5 16Z" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

interface ComingSoonScreenProps {
  feature: ComingSoonFeature;
  onBack: () => void;
  onSearchFlights: () => void;
}

// A product that isn't built yet (Hotels, Flights + Hotels, Voylo AI): says it's
// coming soon and offers flight search instead.
export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({ feature, onBack, onSearchFlights }) => {
  useHardwareBack(() => onBack());
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} accessibilityLabel="Back">
          <ArrowLeft size={24} color="#182339" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {feature}
        </Text>
      </View>

      <LinearGradient colors={['#E8EEFF', '#F4ECFF']} style={styles.body}>
        <View style={styles.card} accessibilityRole="text">
          {feature === 'Voylo AI' ? (
            <LinearGradient colors={['#9335FF', '#5731FF']} style={styles.aiIcon}>
              <SvgXml xml={SPARKLE_SVG} width={38} height={36} />
            </LinearGradient>
          ) : feature === 'Hotels' ? (
            <Image source={iconHotels} style={styles.icon} />
          ) : (
            <View style={styles.iconPair}>
              <Image source={iconFlights} style={styles.icon} />
              <Image source={iconHotels} style={[styles.icon, styles.iconOverlap]} />
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{feature}</Text>
          </View>
          <Text style={styles.title}>Coming soon</Text>
          <Text style={styles.message}>{MESSAGES[feature]}</Text>
          <Text style={styles.note}>Meanwhile, you can book flights with goVoylo.</Text>
          <TouchableOpacity style={styles.button} onPress={onSearchFlights} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Search flights</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, lineHeight: 24, fontWeight: '600', color: '#182339' },
  body: { flex: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#4F5E71',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  icon: { width: 72, height: 72, borderRadius: 36 },
  iconPair: { flexDirection: 'row' },
  iconOverlap: { marginLeft: -16 },
  aiIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  badge: { marginTop: 16, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F1E8FE' },
  badgeText: { fontSize: 13, lineHeight: 16, fontWeight: '600', color: '#7C1AEE' },
  title: { marginTop: 12, fontSize: 24, lineHeight: 32, fontWeight: '700', color: '#182339' },
  message: { marginTop: 8, fontSize: 15, lineHeight: 22, color: '#3E4B64', textAlign: 'center' },
  note: { marginTop: 12, fontSize: 14, lineHeight: 20, color: '#697691', textAlign: 'center' },
  button: {
    marginTop: 20,
    height: 48,
    alignSelf: 'stretch',
    borderRadius: 12,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, lineHeight: 20, fontWeight: '600', color: '#FFFFFF' },
});
