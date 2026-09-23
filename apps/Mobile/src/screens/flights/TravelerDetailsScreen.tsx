import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { ArrowLeft, ArrowLeftRight, Info, Plus, Check, CheckCircle2 } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import {
  useTravellersMobile,
  useCreateRazorpayOrderMobile,
  useVerifyRazorpayPaymentMobile,
  type FlightOffer,
  type Traveler,
} from '@workspace/ui';
import { findAirportByCode } from '../../data/airports';
import { AirlineLogo } from './FlightResultsScreen';
import { WhatsIncludedSection } from './WhatsIncludedSection';
import { styles } from './TravelerDetailsScreen.styles';

// The Add Travellers list only shows the first 4 saved travellers inline; a
// 5th+ traveller pushes the rest behind a "More" button that opens the full
// list in a modal instead of growing this screen indefinitely.
const INLINE_TRAVELER_LIMIT = 4;

function formatCurrency(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

function airportForCode(code: string) {
  return findAirportByCode(code) ?? { code, city: code, state: '', country: '', name: code };
}

// 24-hour "17:30" and "Mon, 30.1" — this screen's flight-summary card mirrors
// the "Flight details" review modal's own formatting (see FlightResultsScreen),
// since Figma reuses that exact card here.
function formatTime24(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatWeekdayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const weekday = date.toLocaleDateString([], { weekday: 'short' });
  return `${weekday}, ${date.getDate()}.${date.getMonth() + 1}`;
}

function formatTotalDuration(startIso: string, endIso: string): string {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) return '';
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

function formatTravelerDob(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

interface TravelerDetailsScreenProps {
  // The offer(s) already chosen for this trip — one per leg (round-trip's
  // Onward/Return, multi-city's Flight 1/2/..., or a single one-way offer).
  legs: FlightOffer[];
  legLabels?: string[];
  passengerCount: number;
  onBack: () => void;
  onAddTraveler: () => void;
  onEditTraveler: (id: string) => void;
}

// The Figma frame this matches is titled "Flight Details" again — a
// copy-paste leftover in the design file, not the intended title. This is
// really the traveller-selection step of booking, so the header here reads
// "Traveller Details" instead of repeating that mislabeled title.
export const TravelerDetailsScreen: React.FC<TravelerDetailsScreenProps> = ({
  legs,
  legLabels,
  passengerCount,
  onBack,
  onAddTraveler,
  onEditTraveler,
}) => {
  const { data: travelers, isLoading } = useTravellersMobile();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAllTravelers, setShowAllTravelers] = useState(false);
  const [addOnTotal, setAddOnTotal] = useState(0);

  const createOrder = useCreateRazorpayOrderMobile();
  const verifyPayment = useVerifyRazorpayPaymentMobile();
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentError, setPaymentError] = useState('');

  // Each leg's totalAmount is already the full priced total for the searched
  // passenger count (same figure the results/fare-review screens show), so
  // the booking total is the sum across legs plus whatever paid extras
  // (baggage/seat/meal) the traveller added in the Whats Included section.
  const baseTotalAmount = useMemo(() => legs.reduce((sum, leg) => sum + leg.totalAmount, 0), [legs]);
  const totalAmount = baseTotalAmount + addOnTotal;
  const currencyCode = legs[0]?.currencyCode ?? 'INR';

  const visibleTravelers = (travelers ?? []).slice(0, INLINE_TRAVELER_LIMIT);
  const hasMoreTravelers = (travelers ?? []).length > INLINE_TRAVELER_LIMIT;

  // Add-ons apply to whichever travellers are actually on this booking, not
  // every saved traveller — so the Whats Included modals only list the ones
  // currently checked in the Add travellers block above.
  const addOnTravelers = useMemo(
    () =>
      (travelers ?? [])
        .filter((t) => selectedIds.has(t.id))
        .map((t) => ({ id: t.id, name: `${t.firstName} ${t.lastName}` })),
    [travelers, selectedIds]
  );

  const legRoutes = useMemo(
    () =>
      legs.map((leg, index) => {
        const first = leg.segments[0];
        const last = leg.segments[leg.segments.length - 1];
        // fares[0] is always the fare backing this leg's totalAmount (the
        // backend derives totalAmount from it), so its baggage allowance is
        // the real one for the price already shown above — not a guess.
        const primaryFare = leg.fares[0];
        return {
          label: legLabels?.[index] ?? `Flight ${index + 1}`,
          origin: first?.origin ?? '',
          destination: last?.destination ?? '',
          handBaggage: primaryFare?.handBaggage ?? null,
          checkInBaggage: primaryFare?.checkInBaggage ?? null,
        };
      }),
    [legs, legLabels]
  );
  // Stable for the lifetime of this screen so a retried payment reuses the
  // same BookingPayment row on the backend instead of creating a new one.
  const bookingReference = useMemo(() => `GV-${Date.now()}`, []);

  const handlePayNow = async () => {
    if (selectedIds.size === 0) {
      setPaymentError('Please select at least one traveller.');
      return;
    }

    setPaymentError('');
    setPaymentState('processing');

    try {
      const order = await createOrder.mutateAsync({
        bookingReference,
        amount: totalAmount,
        currency: currencyCode,
        sourceClient: 'Mobile',
      });

      const checkoutResult = await RazorpayCheckout.open({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'GoVoylo',
        description: 'Flight booking payment',
      });

      const verified = await verifyPayment.mutateAsync({
        razorpayOrderId: checkoutResult.razorpay_order_id,
        razorpayPaymentId: checkoutResult.razorpay_payment_id,
        razorpaySignature: checkoutResult.razorpay_signature,
      });

      if (verified.status === 'Succeeded') {
        setPaymentState('success');
      } else {
        setPaymentState('idle');
        setPaymentError('Payment could not be verified. Please try again.');
      }
    } catch (err) {
      setPaymentState('idle');
      const description = (err as { description?: string; message?: string })?.description;
      const message = (err as { message?: string })?.message;
      setPaymentError(description || message || 'Payment was not completed.');
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderTravelerRow = (traveler: Traveler) => {
    const isSelected = selectedIds.has(traveler.id);
    return (
      <View key={traveler.id} style={styles.travelerRow}>
        <TouchableOpacity style={styles.travelerRowLeft} onPress={() => toggleSelected(traveler.id)} activeOpacity={0.7}>
          <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
            {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <View>
            <Text style={styles.travelerName}>
              {traveler.firstName} {traveler.lastName}
            </Text>
            <Text style={styles.travelerMeta}>
              {[traveler.gender, formatTravelerDob(traveler.dateOfBirth)].filter(Boolean).join(', ')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEditTraveler(traveler.id)}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={22} color="#182339" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Traveller Details</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {legs.map((leg, legIndex) => {
          const first = leg.segments[0];
          const last = leg.segments[leg.segments.length - 1];
          if (!first || !last) return null;

          return (
            <View key={`${leg.offerId}-${legIndex}`}>
              {legs.length > 1 && (
                <Text style={styles.legLabel}>{legLabels?.[legIndex] ?? `Flight ${legIndex + 1}`}</Text>
              )}
              <View style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <Text style={styles.routeHeaderText}>
                    {airportForCode(first.origin).city} <ArrowLeftRight size={12} color="#FFFFFF" strokeWidth={2} />{' '}
                    {airportForCode(last.destination).city}
                  </Text>
                  <Text style={styles.routeHeaderDuration}>
                    {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}
                  </Text>
                </View>

                {leg.segments.map((segment, index) => (
                  <React.Fragment key={`${segment.airlineCode}${segment.flightNumber}-${index}`}>
                    <View style={styles.segmentBlock}>
                      <View style={styles.segmentLeftCol}>
                        <View style={styles.segmentTimeSlot}>
                          <Text style={styles.segmentTime} numberOfLines={1}>
                            {formatTime24(segment.departureDateTime)}
                          </Text>
                          <Text style={styles.segmentDate}>{formatWeekdayDate(segment.departureDateTime)}</Text>
                        </View>
                        <View style={[styles.durationSlot, styles.durationSlotCentered]}>
                          <Text style={styles.durationText}>
                            {formatTotalDuration(segment.departureDateTime, segment.arrivalDateTime)}
                          </Text>
                        </View>
                        <View style={styles.segmentTimeSlot}>
                          <Text style={styles.segmentTime} numberOfLines={1}>
                            {formatTime24(segment.arrivalDateTime)}
                          </Text>
                          <Text style={styles.segmentDate}>{formatWeekdayDate(segment.arrivalDateTime)}</Text>
                        </View>
                      </View>

                      <View style={styles.railCol}>
                        <View style={styles.railDot} />
                        <View style={styles.railLineHalf} />
                        <MaterialIcons name="flight" size={22} color="#182339" style={styles.railPlaneIcon} />
                        <View style={styles.railLineHalf} />
                        <View style={styles.railDot} />
                      </View>

                      <View style={styles.segmentRightCol}>
                        <View style={styles.segmentCitySlot}>
                          <Text style={styles.segmentCity}>
                            {airportForCode(segment.origin).city} · {segment.origin}
                          </Text>
                          <Text style={styles.segmentAirportName}>{airportForCode(segment.origin).name}</Text>
                        </View>

                        <View style={styles.durationRow}>
                          <View style={styles.carrierBadge}>
                            <AirlineLogo airlineCode={segment.airlineCode} size={24} style={styles.carrierLogo} />
                            <Text style={styles.carrierName}>{segment.airlineName || leg.airlineName}</Text>
                          </View>
                        </View>

                        <View style={styles.segmentCitySlot}>
                          <Text style={styles.segmentCity}>
                            {airportForCode(segment.destination).city} · {segment.destination}
                          </Text>
                          <Text style={styles.segmentAirportName}>
                            {airportForCode(segment.destination).name}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {index < leg.segments.length - 1 && (
                      <View style={styles.layoverRow}>
                        <Info size={12} color="#697691" strokeWidth={2} />
                        <Text style={styles.layoverText}>
                          {formatTotalDuration(segment.arrivalDateTime, leg.segments[index + 1].departureDateTime)}{' '}
                          Layover at {airportForCode(segment.destination).city}
                        </Text>
                      </View>
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          );
        })}

        <TouchableOpacity onPress={onBack}>
          <Text style={styles.viewFlightDetailsLink}>View Flight Details</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Add travellers</Text>

        <View style={styles.noticeBanner}>
          <Info size={16} color="#D9822B" strokeWidth={2} style={styles.noticeIcon} />
          <Text style={styles.noticeText}>
            Please ensure your visa is valid, passport has 6+ months validity, and name matches your passport.
          </Text>
        </View>

        <View style={styles.travelerCountRow}>
          <Text style={styles.travelerCountLabel}>Traveller</Text>
          <Text style={styles.travelerCountValue}>
            {selectedIds.size}/{passengerCount} Selected
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#7C1AEE" style={styles.loadingIndicator} />
        ) : (travelers ?? []).length === 0 ? (
          <Text style={styles.emptyStateText}>No saved travellers yet.</Text>
        ) : (
          visibleTravelers.map(renderTravelerRow)
        )}

        {hasMoreTravelers && (
          <TouchableOpacity style={styles.moreButton} onPress={() => setShowAllTravelers(true)} activeOpacity={0.7}>
            <Text style={styles.moreButtonText}>More</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.addTravelerRow} onPress={onAddTraveler} activeOpacity={0.7}>
          <Text style={styles.addTravelerText}>Add new travellers</Text>
          <Plus size={16} color="#7C1AEE" strokeWidth={2} />
        </TouchableOpacity>

        <WhatsIncludedSection
          legRoutes={legRoutes}
          travelers={addOnTravelers}
          currencyCode={currencyCode}
          onTotalChange={setAddOnTotal}
        />

        {paymentState === 'success' ? (
          <View style={styles.paymentSuccessBanner}>
            <CheckCircle2 size={28} color="#1E9E5A" strokeWidth={2} />
            <Text style={styles.paymentSuccessTitle}>Payment Successful</Text>
            <Text style={styles.paymentSuccessSubtitle}>
              Your payment of {formatCurrency(totalAmount, currencyCode)} was received. Your booking is confirmed.
            </Text>
          </View>
        ) : (
          <View style={styles.paymentSection}>
            <View style={styles.paymentAmountRow}>
              <Text style={styles.paymentAmountLabel}>Total amount</Text>
              <Text style={styles.paymentAmountValue}>{formatCurrency(totalAmount, currencyCode)}</Text>
            </View>

            {!!paymentError && <Text style={styles.paymentErrorText}>{paymentError}</Text>}

            <TouchableOpacity
              style={[styles.payButton, paymentState === 'processing' && styles.payButtonDisabled]}
              onPress={handlePayNow}
              disabled={paymentState === 'processing'}
            >
              <Text style={styles.payButtonText}>
                {paymentState === 'processing' ? 'Processing...' : 'Pay Now'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={showAllTravelers} animationType="slide" transparent onRequestClose={() => setShowAllTravelers(false)}>
        <View style={styles.allTravelersBackdrop}>
          <View style={styles.allTravelersSheet}>
            <View style={styles.allTravelersHeader}>
              <Text style={styles.allTravelersTitle}>Add Traveller</Text>
            </View>
            <View style={styles.travelerCountRow}>
              <Text style={styles.travelerCountLabel}>Adult</Text>
              <Text style={styles.travelerCountValue}>
                {selectedIds.size}/{passengerCount} Selected
              </Text>
            </View>
            <ScrollView style={styles.allTravelersList}>{(travelers ?? []).map(renderTravelerRow)}</ScrollView>
            <View style={styles.allTravelersFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAllTravelers(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAllTravelers(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
