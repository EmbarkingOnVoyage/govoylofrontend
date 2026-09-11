import React from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import type { FlightOffer, FlightOfferSegment } from '@workspace/ui';
import { styles } from './FlightResultsScreen.styles';

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatPrice(amount: number, currencyCode: string): string {
  return `${currencyCode} ${amount.toLocaleString()}`;
}

interface FlightResultsScreenProps {
  offers: FlightOffer[];
  onBack: () => void;
}

const FlightSegmentRow: React.FC<{ segment: FlightOfferSegment }> = ({ segment }) => (
  <View style={styles.segmentRow}>
    <View style={styles.segmentRoute}>
      <View style={styles.timeBlock}>
        <Text style={styles.timeText}>{formatTime(segment.departureDateTime)}</Text>
        <Text style={styles.codeText}>{segment.origin}</Text>
      </View>
      <View style={styles.durationBlock}>
        <Text style={styles.durationText}>{segment.duration}</Text>
        <View style={styles.durationLine} />
        <Text style={styles.flightNumberText}>
          {segment.airlineCode} {segment.flightNumber}
        </Text>
      </View>
      <View style={[styles.timeBlock, styles.timeBlockEnd]}>
        <Text style={styles.timeText}>{formatTime(segment.arrivalDateTime)}</Text>
        <Text style={styles.codeText}>{segment.destination}</Text>
      </View>
    </View>
  </View>
);

export const FlightResultsScreen: React.FC<FlightResultsScreenProps> = ({ offers, onBack }) => (
  <View style={styles.screen}>
    <LinearGradient colors={['#6A16CB', '#350B65']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{offers.length} flights found</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>

    <FlatList
      data={offers}
      keyExtractor={(item) => item.offerId}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No flights found for this search.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.airlineName}>{item.airlineName}</Text>
            <Text
              style={[
                styles.refundableTag,
                item.refundable ? styles.refundableTagYes : styles.refundableTagNo,
              ]}
            >
              {item.refundable ? 'Refundable' : 'Non-refundable'}
            </Text>
          </View>

          {item.segments.map((segment, index) => (
            <FlightSegmentRow key={index} segment={segment} />
          ))}

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <Text style={styles.seatsText}>{item.seatsAvailable} seats left</Text>
            <Text style={styles.priceText}>{formatPrice(item.totalAmount, item.currencyCode)}</Text>
          </View>
        </View>
      )}
    />
  </View>
);
