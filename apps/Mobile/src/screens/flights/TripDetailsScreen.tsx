import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { ArrowLeft, Check, X, Clock, CircleAlert } from 'lucide-react-native';
import {
  useTripBookingDetailsMobile,
  useCancelTripBookingMobile,
  type TripBooking,
  type TripBookingDetails,
  type TripBookingSegment,
} from '@workspace/ui';
import { styles, RED } from './TripDetailsScreen.styles';
import { PURPLE, MUTED, GREEN } from './MyTripsScreen.styles';
import { AirlineLogo } from './FlightResultsScreen';
import { CancelBookingModal } from './CancelBookingModal';
import {
  STATUS_ID_FAILED,
  STATUS_ID_HELD,
  STATUS_ID_TICKETING,
  canCancel,
  isExpiredHold,
  formatCurrency,
  formatDuration,
  formatShortDate,
  formatTime24,
} from './myTripsHelpers';

interface TripDetailsScreenProps {
  tripBookingId: string;
  onBack: () => void;
}

interface FlightLine {
  key: string;
  legIndex: number;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  title: string;
  meta: string;
}

// One line per leg: the supplier's segments when it answered (times, stops,
// duration), otherwise the booking's own legs (date only).
function flightLines(details: TripBookingDetails): FlightLine[] {
  const { booking, segments } = details;
  if (segments.length > 0) {
    const byLeg = new Map<number, TripBookingSegment[]>();
    segments.forEach((s) => byLeg.set(s.legIndex, [...(byLeg.get(s.legIndex) ?? []), s]));
    return [...byLeg.entries()]
      .sort(([a], [b]) => a - b)
      .map(([legIndex, segs]) => {
        const first = segs[0];
        const last = segs[segs.length - 1];
        const stops = segs.length - 1;
        // Flying time only: departure/arrival are each airport's local time, so
        // the gap between them isn't a real duration across time zones.
        const duration = formatDuration(segs.reduce((sum, s) => sum + s.durationMinutes, 0));
        return {
          key: `seg-${legIndex}`,
          legIndex,
          airlineCode: first.airlineCode,
          airlineName: first.airlineName,
          flightNumber: segs.map((s) => s.flightNumber).join(', '),
          title: `${first.origin} ${formatTime24(first.departureDateTime)} – ${last.destination} ${formatTime24(
            last.arrivalDateTime
          )}`,
          meta: [formatShortDate(first.departureDateTime), stops === 0 ? 'Non-stop' : `${stops} Stop${stops > 1 ? 's' : ''}`, duration]
            .filter(Boolean)
            .join(' · '),
        };
      });
  }
  return [...booking.legs]
    .sort((a, b) => a.legIndex - b.legIndex)
    .map((leg) => ({
      key: `leg-${leg.legIndex}`,
      legIndex: leg.legIndex,
      airlineCode: leg.airlineCode,
      airlineName: leg.airlineName,
      flightNumber: leg.flightNumber,
      title: `${leg.origin} → ${leg.destination}`,
      meta: formatShortDate(leg.travelDate),
    }));
}

function bookingStatus(booking: TripBooking): { title: string; color: string; background: string; icon: 'check' | 'x' | 'clock' } {
  if (booking.localStatus === 'Cancelled') {
    return { title: 'Booking Cancelled', color: RED, background: '#FDECEE', icon: 'x' };
  }
  if (booking.localStatus === 'Released') {
    return { title: 'Hold Released', color: '#4C5973', background: '#F1F3F7', icon: 'x' };
  }
  if (booking.statusId === STATUS_ID_FAILED) {
    return { title: 'Booking Failed', color: RED, background: '#FDECEE', icon: 'x' };
  }
  if (isExpiredHold(booking)) {
    return { title: 'Hold Expired', color: '#4C5973', background: '#F1F3F7', icon: 'x' };
  }
  if (booking.statusId === STATUS_ID_HELD) {
    return { title: 'Booking On Hold', color: '#B45309', background: '#FEF3C7', icon: 'clock' };
  }
  if (booking.statusId === STATUS_ID_TICKETING) {
    return { title: 'Ticketing in progress', color: '#1D4ED8', background: '#E6EEFF', icon: 'clock' };
  }
  return { title: 'Booking Confirmed', color: GREEN, background: '#E7F8EE', icon: 'check' };
}

function initials(first: string, last: string): string {
  return `${first.trim()[0] ?? ''}${last.trim()[0] ?? ''}`.toUpperCase() || '?';
}

export const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({ tripBookingId, onBack }) => {
  const { data, isLoading, isError, refetch } = useTripBookingDetailsMobile(tripBookingId);
  const releaseHold = useCancelTripBookingMobile();
  const [cancelOpen, setCancelOpen] = useState(false);

  const header = (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={22} color="#3E4B64" strokeWidth={2} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Flight Details</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  if (isLoading || isError || !data) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.centerState}>
          {isLoading ? (
            <ActivityIndicator size="large" color={PURPLE} />
          ) : (
            <>
              <Text style={styles.stateText}>We couldn't load this booking.</Text>
              <TouchableOpacity onPress={() => refetch()}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  const { booking } = data;
  const status = bookingStatus(booking);
  const StatusIcon = status.icon === 'check' ? Check : status.icon === 'clock' ? Clock : X;
  const lines = flightLines(data);
  const isRoundTrip = lines.length > 1;
  const passengers =
    data.passengers.length > 0
      ? data.passengers.map((p) => ({ name: `${p.firstName} ${p.lastName}`.trim(), type: p.paxType, ini: initials(p.firstName, p.lastName) }))
      : booking.passengerNames
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean)
          .map((name) => {
            const parts = name.split(/\s+/);
            return { name, type: '', ini: initials(parts[0] ?? '', parts[parts.length - 1] ?? '') };
          });
  const isHeld = booking.statusId === STATUS_ID_HELD;
  const showCancel = canCancel(booking);

  const handleCancelPress = () => {
    if (!isHeld) {
      setCancelOpen(true);
      return;
    }
    // A hold was never paid for, so there's no refund to show — just confirm.
    Alert.alert('Release this hold?', 'This will release the flight hold with the airline. This cannot be undone.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Release',
        style: 'destructive',
        onPress: () =>
          releaseHold.mutate(
            { tripBookingId: booking.id },
            { onError: (err) => Alert.alert('Could not release the hold', (err as Error)?.message || 'Please try again.') }
          ),
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.card}>
          {lines.map((line, index) => (
            <View key={line.key} style={index > 0 ? styles.flightRowDivided : undefined}>
              {isRoundTrip ? (
                <Text style={styles.legLabel}>{line.legIndex === 0 ? 'ONWARD' : 'RETURN'}</Text>
              ) : null}
              <View style={styles.flightRow}>
                <AirlineLogo airlineCode={line.airlineCode} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.carrierText}>
                    {line.airlineName} · {line.airlineCode} · {line.flightNumber}
                  </Text>
                  <Text style={styles.timesText}>{line.title}</Text>
                  {line.meta ? <Text style={styles.flightMeta}>{line.meta}</Text> : null}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.statusCard, { backgroundColor: status.background }]}>
          <View style={[styles.statusIcon, { backgroundColor: status.color }]}>
            <StatusIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: status.color }]}>{status.title}</Text>
            <Text style={[styles.statusSub, { color: status.color }]}>
              Booking ID · <Text style={{ fontWeight: '700' }}>{booking.bookingRefNo}</Text>
              {booking.airlinePnr ? (
                <>
                  {'  ·  PNR '}
                  <Text style={{ fontWeight: '700' }}>{booking.airlinePnr}</Text>
                </>
              ) : null}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Passengers ({passengers.length})</Text>
          </View>
          {passengers.map((p, index) => (
            <View key={`${p.name}-${index}`} style={styles.passengerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.ini}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.passengerName}>{p.name}</Text>
                {p.type ? <Text style={styles.passengerType}>{p.type}</Text> : null}
              </View>
              {booking.localStatus === 'Active' && !isHeld && booking.statusId !== STATUS_ID_FAILED ? (
                <Check size={18} color={GREEN} strokeWidth={2.5} />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fare details</Text>
            {/* No action yet — invoices aren't generated in the app. */}
            <TouchableOpacity activeOpacity={0.7} hitSlop={8}>
              <Text style={styles.linkText}>View invoice</Text>
            </TouchableOpacity>
          </View>
          {data.baseFare != null ? (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Base Fare</Text>
              <Text style={styles.fareValue}>{formatCurrency(data.baseFare, booking.currencyCode)}</Text>
            </View>
          ) : null}
          {data.taxesAndFees != null ? (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Taxes & Fees</Text>
              <Text style={styles.fareValue}>{formatCurrency(data.taxesAndFees, booking.currencyCode)}</Text>
            </View>
          ) : null}
          {data.baseFare != null && data.taxesAndFees != null && data.totalPaid - data.baseFare - data.taxesAndFees >= 1 ? (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Add-ons & other charges</Text>
              <Text style={styles.fareValue}>
                {formatCurrency(data.totalPaid - data.baseFare - data.taxesAndFees, booking.currencyCode)}
              </Text>
            </View>
          ) : null}
          {data.baseFare != null || data.taxesAndFees != null ? <View style={styles.fareDivider} /> : null}
          <View style={styles.fareRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.totalPaid, booking.currencyCode)}</Text>
          </View>
          {booking.localStatus === 'Cancelled' ? (
            <View style={[styles.fareRow, { marginTop: 6 }]}>
              <Text style={styles.fareLabel}>Refund</Text>
              {booking.refundAmount != null ? (
                <Text style={styles.refundValue}>{formatCurrency(booking.refundAmount, booking.currencyCode)}</Text>
              ) : (
                <Text style={[styles.fareValue, { color: '#B45309', fontWeight: '600' }]}>Being processed</Text>
              )}
            </View>
          ) : null}
        </View>

        {!data.supplierDetailsAvailable && booking.statusId !== STATUS_ID_FAILED ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <CircleAlert size={16} color={MUTED} strokeWidth={2} />
            <Text style={[styles.flightMeta, { flex: 1, marginTop: 0 }]}>
              Live flight details from the airline are unavailable right now.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {booking.localStatus === 'Active' && booking.statusId !== STATUS_ID_FAILED && !isExpiredHold(booking) ? (
        <SafeAreaView>
          <View style={styles.footer}>
            {!isHeld ? (
              // No action yet — e-tickets aren't generated in the app.
              <TouchableOpacity style={styles.ticketButton} activeOpacity={0.7}>
                <Text style={styles.ticketButtonText}>Download E-Ticket</Text>
              </TouchableOpacity>
            ) : null}
            {showCancel ? (
              <TouchableOpacity
                style={[styles.cancelButton, releaseHold.isPending && styles.disabled]}
                onPress={handleCancelPress}
                disabled={releaseHold.isPending}
              >
                {releaseHold.isPending ? (
                  <ActivityIndicator size="small" color={RED} />
                ) : (
                  <Text style={styles.cancelButtonText}>{isHeld ? 'Release Hold' : 'Cancel Booking'}</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </SafeAreaView>
      ) : null}

      <CancelBookingModal
        visible={cancelOpen}
        booking={booking}
        onClose={() => setCancelOpen(false)}
      />
    </View>
  );
};
