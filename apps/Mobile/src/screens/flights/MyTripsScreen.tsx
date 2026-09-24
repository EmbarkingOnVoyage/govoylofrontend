import React from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMyTripsMobile, useCancelTripBookingMobile, type TripBooking } from '@workspace/ui';
import { styles } from './MyTripsScreen.styles';

// Air_Ticketing's own docs: 11-Success (ticketed), 22-Failed, 33-Block (hold) —
// this is Flyshop's status at the moment of booking, distinct from localStatus
// below, which reflects what this app has since done to the booking.
const STATUS_ID_FAILED = '22';

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatCurrency(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

// localStatus (Active/Cancelled/Released) is what the badge shows once the user
// has acted on a booking; otherwise it falls back to Flyshop's own statusId.
function getStatusDisplay(booking: TripBooking): { label: string; color: string; background: string } {
  if (booking.localStatus === 'Cancelled') {
    return { label: 'Cancelled', color: '#6B7280', background: '#F3F4F6' };
  }
  if (booking.localStatus === 'Released') {
    return { label: 'Released', color: '#6B7280', background: '#F3F4F6' };
  }
  if (booking.statusId === STATUS_ID_FAILED) {
    return { label: 'Failed', color: '#EF4444', background: '#FEE2E2' };
  }
  if (booking.statusId === '33') {
    return { label: 'Held', color: '#B45309', background: '#FEF3C7' };
  }
  return { label: 'Confirmed', color: '#15803D', background: '#DCFCE7' };
}

export const MyTripsScreen: React.FC = () => {
  const { data: trips, isLoading } = useMyTripsMobile();
  const cancelBooking = useCancelTripBookingMobile();

  const handleCancel = (booking: TripBooking) => {
    const isHold = booking.statusId === '33';
    Alert.alert(
      isHold ? 'Release this hold?' : 'Cancel this booking?',
      isHold
        ? 'This will release the flight hold with the airline. This cannot be undone.'
        : 'This will cancel your ticket with the airline, subject to their cancellation policy. This cannot be undone.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: isHold ? 'Release' : 'Cancel booking',
          style: 'destructive',
          onPress: () => {
            cancelBooking.mutate(booking.id, {
              onError: (err) => {
                Alert.alert('Could not complete this', (err as Error)?.message || 'Please try again.');
              },
            });
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: TripBooking }) => {
    const status = getStatusDisplay(item);
    const canCancel = item.localStatus === 'Active' && item.statusId !== STATUS_ID_FAILED;
    const isCancellingThis = cancelBooking.isPending && cancelBooking.variables === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.routeText}>
            {item.legs.map((leg) => `${leg.origin}-${leg.destination}`).join('  •  ')}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {item.legs.map((leg) => (
          <View key={leg.legIndex} style={styles.legRow}>
            <Text style={styles.legText}>
              {leg.airlineName} {leg.airlineCode} {leg.flightNumber}
            </Text>
            <Text style={styles.legText}>{formatDate(leg.travelDate)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Booking ref</Text>
          <Text style={styles.metaValue}>{item.bookingRefNo}</Text>
        </View>
        {item.airlinePnr ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Airline PNR</Text>
            <Text style={styles.metaValue}>{item.airlinePnr}</Text>
          </View>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Passengers</Text>
          <Text style={styles.metaValue}>{item.passengerNames}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Total paid</Text>
          <Text style={styles.amountText}>{formatCurrency(item.totalAmount, item.currencyCode)}</Text>
        </View>

        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, isCancellingThis && styles.cancelButtonDisabled]}
            onPress={() => handleCancel(item)}
            disabled={isCancellingThis}
          >
            {isCancellingThis ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Text style={styles.cancelButtonText}>
                {item.statusId === '33' ? 'Release hold' : 'Cancel booking'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#6A16CB', '#350B65']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <SafeAreaView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Trips</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#7C1AEE" />
        </View>
      ) : (
        <FlatList
          data={trips ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No trips booked yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};
