import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Modal, Alert } from 'react-native';
import { ArrowLeft, ArrowRight, ChevronRight, Clock3, MapPinPlus, Plus, Check, CheckCircle2, Share2 } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import {
  useTravellersMobile,
  useCreateRazorpayOrderMobile,
  useVerifyRazorpayPaymentMobile,
  useCustomerProfileMobile,
  useCreateBookingMobile,
  useReleaseHoldMobile,
  useConvenienceFeeRules,
  convenienceFeeFor,
  BOOKING_STATUS_FAILED,
  type FlightOffer,
  type Traveler,
  type BookingTravelerRequest,
  type BookingLegRequest,
  type CreateBookingResponse,
  type PassengerCounts,
  type TripType,
} from '@workspace/ui';
import { findAirportByCode } from '../../data/airports';
import { AirlineLogo } from './FlightResultsScreen';
import { WhatsIncludedSection, type AddOnSelection } from './WhatsIncludedSection';
import { FareRulesModal, type FareRulesLeg } from './FareRulesModal';
import { PaymentScreen } from './PaymentScreen';
import { styles } from './TravelerDetailsScreen.styles';
import {
  GSTIN_PATTERN,
  PAX_API_TYPES,
  PAX_LABELS,
  PAX_TYPES,
  checkTravelerAge,
  formatTravelerDob,
  paxCountText,
  savedPaxType,
  type PaxType,
  type TravelerAgeCheck,
} from '@workspace/ui/src/features/flights/logic/travellers';
import { formatPrice as formatMoney } from '@workspace/ui/src/features/flights/logic/flightResults';
import { useHardwareBack } from '../../navigation/useHardwareBack';

// The Add Travellers list only shows the first 4 saved travellers inline; a
// 5th+ traveller pushes the rest behind a "More" button that opens the full
// list in a modal instead of growing this screen indefinitely.
const INLINE_TRAVELER_LIMIT = 4;


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

type SectionKey = 'farePolicy' | 'baggage' | 'travellers' | 'gst';

const SECTION_CHIPS: { key: SectionKey; label: string }[] = [
  { key: 'farePolicy', label: 'Fare policy' },
  { key: 'baggage', label: 'Baggage' },
  { key: 'travellers', label: 'Travellers' },
  { key: 'gst', label: 'GST details' },
];

function formatTotalDuration(startIso: string, endIso: string): string {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) return '';
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

interface TravelerDetailsScreenProps {
  // The offer(s) already chosen for this trip — one per leg (round-trip's
  // Onward/Return, multi-city's Flight 1/2/..., or a single one-way offer).
  legs: FlightOffer[];
  legLabels?: string[];
  // Travellers of each type the search was for; the screen asks for exactly
  // these, in separate Adult / Children / Infant blocks.
  passengerCounts: PassengerCounts;
  // The search's trip type, for the convenience fee.
  searchTripType?: TripType;
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
  passengerCounts,
  searchTripType,
  onBack,
  onAddTraveler,
  onEditTraveler,
}) => {
  useHardwareBack(() => onBack());

  const { data: travelers, isLoading } = useTravellersMobile();
  const { data: customerProfile } = useCustomerProfileMobile();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Which type's full list the "More" modal is showing, if open.
  const [allTravelersType, setAllTravelersType] = useState<PaxType | null>(null);
  const [selectionHint, setSelectionHint] = useState('');
  const [addOnTotal, setAddOnTotal] = useState(0);
  const [addOnSelections, setAddOnSelections] = useState<AddOnSelection[]>([]);
  const [showFareRules, setShowFareRules] = useState(false);
  // Jump chips under the flight card scroll to these sections (Figma
  // "Booking details": Fare policy, Baggage, Travellers, GST details).
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<SectionKey, number>>({ farePolicy: 0, baggage: 0, travellers: 0, gst: 0 });
  const trackSection = (key: SectionKey) => (e: { nativeEvent: { layout: { y: number } } }) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  };
  const scrollToSection = (key: SectionKey) =>
    scrollRef.current?.scrollTo({ y: Math.max(0, sectionY.current[key] - 12), animated: true });
  const [useGst, setUseGst] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [gstHolderName, setGstHolderName] = useState('');
  const [gstAddress, setGstAddress] = useState('');

  const createOrder = useCreateRazorpayOrderMobile();
  const verifyPayment = useVerifyRazorpayPaymentMobile();
  const createBooking = useCreateBookingMobile();
  const releaseHold = useReleaseHoldMobile();
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentError, setPaymentError] = useState('');
  const [bookingResult, setBookingResult] = useState<CreateBookingResponse | null>(null);
  // Set once the supplier confirms a different amount than search showed and
  // the customer accepts it — what the total/success copy then reflect.
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);
  // Next opens the Payment page (Figma "Booking details"), where Securely pay
  // runs the hold → Razorpay → verify flow below.
  const [step, setStep] = useState<'details' | 'payment'>('details');

  // Each leg's totalAmount is already the full priced total for the searched
  // passenger count (same figure the results/fare-review screens show), so
  // the booking total is the sum across legs plus whatever paid extras
  // (baggage/seat/meal) the traveller added in the Whats Included section.
  const baseTotalAmount = useMemo(() => legs.reduce((sum, leg) => sum + leg.totalAmount, 0), [legs]);
  const totalAmount = baseTotalAmount + addOnTotal;
  const currencyCode = legs[0]?.currencyCode ?? 'INR';

  // GoVoylo's convenience fee, added on the Payment page. This is the app's
  // estimate from the shared rules; once the booking is held, the server's own
  // figure is what's charged.
  const { data: convenienceFeeRules } = useConvenienceFeeRules();
  const estimatedConvenienceFee = useMemo(
    () => convenienceFeeFor(convenienceFeeRules, legs, passengerCounts, searchTripType),
    [convenienceFeeRules, legs, passengerCounts, searchTripType]
  );
  const [chargedConvenienceFee, setChargedConvenienceFee] = useState<number | null>(null);
  const convenienceFee = chargedConvenienceFee ?? estimatedConvenienceFee;
  const payableAmount = totalAmount + estimatedConvenienceFee;

  const requiredCounts: Record<PaxType, number> = {
    adult: passengerCounts.adult,
    child: passengerCounts.child,
    infant: passengerCounts.infant,
  };
  // Only the passenger types the search included get a block.
  const visiblePaxTypes = PAX_TYPES.filter((type) => requiredCounts[type] > 0);

  // First and last flight departure dates of the whole trip — what each
  // traveller's age is checked against.
  const firstTravelIso = legs[0]?.segments[0]?.departureDateTime;
  const lastLegSegments = legs[legs.length - 1]?.segments ?? [];
  const lastTravelIso = lastLegSegments[lastLegSegments.length - 1]?.departureDateTime;

  const ageChecks = useMemo(() => {
    const checks = new Map<string, TravelerAgeCheck>();
    (travelers ?? []).forEach((t) => checks.set(t.id, checkTravelerAge(t, firstTravelIso, lastTravelIso)));
    return checks;
  }, [travelers, firstTravelIso, lastTravelIso]);

  const paxTypeOf = (traveler: Traveler): PaxType => ageChecks.get(traveler.id)?.type ?? savedPaxType(traveler);

  // Grouped by the type each traveller flies as on these dates, not just the
  // type saved on their profile.
  const travelersByType = useMemo(() => {
    const groups: Record<PaxType, Traveler[]> = { adult: [], child: [], infant: [] };
    (travelers ?? []).forEach((t) => groups[ageChecks.get(t.id)?.type ?? savedPaxType(t)].push(t));
    return groups;
  }, [travelers, ageChecks]);

  // Add-ons apply to whichever travellers are actually on this booking, not
  // every saved traveller — so the Whats Included modals only list the ones
  // currently checked in the Add travellers block above. Gender/travelerType
  // are needed (not just id/name) because the seat-map add-on hits a real
  // Flyshop endpoint that requires PAX details.
  // Adults first, then children, then infants — the order passengers are
  // sent to the supplier (Pax_Id 1..n).
  const selectedTravelers = useMemo(
    () => PAX_TYPES.flatMap((type) => travelersByType[type].filter((t) => selectedIds.has(t.id))),
    [travelersByType, selectedIds]
  );

  const selectedCount = (type: PaxType) => travelersByType[type].filter((t) => selectedIds.has(t.id)).length;

  const addOnTravelers = useMemo(
    () =>
      selectedTravelers.map((t) => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        gender: t.gender ?? 'Male',
        travelerType: PAX_API_TYPES[paxTypeOf(t)],
      })),
    [selectedTravelers]
  );

  // Flyshop's PAX_Id is a 1-based sequential index, not our traveller UUID —
  // this map lets the Whats Included section's per-traveller SSR selections
  // (keyed by our UUID) be translated into the booking request's PaxId when
  // Pay Now is tapped.
  const travelerPaxIds = useMemo(() => {
    const map = new Map<string, number>();
    selectedTravelers.forEach((t, index) => map.set(t.id, index + 1));
    return map;
  }, [selectedTravelers]);

  const legRoutes = useMemo(
    () =>
      legs.map((leg, index) => {
        const first = leg.segments[0];
        // A whole-trip offer (outbound + return in one) is labelled by its
        // turnaround point — the end of its first trip — rather than DEL • DEL.
        const firstTrip = leg.segments.filter((s) => (s.tripIndex ?? 0) === (first?.tripIndex ?? 0));
        const last = firstTrip.length < leg.segments.length
          ? firstTrip[firstTrip.length - 1]
          : leg.segments[leg.segments.length - 1];
        // The fare being booked is the one picked in the fare modal
        // (selectedFareId); its baggage allowance is the real one for the price
        // shown. fares[0] is only a fallback — it isn't the headline fare.
        const primaryFare = leg.fares.find((f) => f.fareId === leg.selectedFareId) ?? leg.fares[0];
        return {
          offerId: leg.offerId,
          fareId: leg.selectedFareId ?? null,
          label: legLabels?.[index] ?? `Flight ${index + 1}`,
          origin: first?.origin ?? '',
          destination: last?.destination ?? '',
          handBaggage: primaryFare?.handBaggage ?? null,
          checkInBaggage: primaryFare?.checkInBaggage ?? null,
        };
      }),
    [legs, legLabels]
  );

  const fareRuleLegs = useMemo<FareRulesLeg[]>(
    () =>
      legs.map((leg, index) => {
        const first = leg.segments[0];
        const last = leg.segments[leg.segments.length - 1];
        return {
          offerId: leg.offerId,
          label: legLabels?.[index] ?? `Flight ${index + 1}`,
          origin: first?.origin ?? '',
          destination: last?.destination ?? '',
          airlineName: leg.airlineName,
          airlineCode: first?.airlineCode,
          flightNumbers: leg.segments.map((s) => `${s.airlineCode} ${s.flightNumber}`),
          departureDateTime: first?.departureDateTime ?? '',
          segments: leg.segments.map((s) => ({
            origin: s.origin,
            destination: s.destination,
            departureDateTime: s.departureDateTime,
          })),
          fareId: leg.selectedFareId ?? null,
        };
      }),
    [legs, legLabels]
  );

  // Best-effort: if a hold was placed but the flow doesn't end in a completed
  // booking (checkout cancelled, payment failed/unverified, a later step
  // throws), release it via Air_ReleasePNR so the seat isn't held against the
  // customer for nothing. A failed release is swallowed — it must never mask
  // the actual payment error shown to the user.
  const releaseHeldBookingSilently = async (held: CreateBookingResponse | null) => {
    if (!held?.bookingRefNo || !held.airlinePnr) {
      return;
    }
    try {
      await releaseHold.mutateAsync({ bookingRefNo: held.bookingRefNo, airlinePnr: held.airlinePnr });
    } catch {
      // Swallowed deliberately — see comment above.
    }
  };

  // What still has to be filled in before payment, or '' when ready.
  const bookingProblem = (): string => {
    // Exactly the searched number of each passenger type — the fare was priced
    // for that mix, and the supplier rejects a booking that doesn't match it.
    const missing = visiblePaxTypes.filter((type) => selectedCount(type) !== requiredCounts[type]);
    if (missing.length > 0) {
      return `Please select ${missing.map((type) => paxCountText(type, requiredCounts[type])).join(', ')} for this booking.`;
    }
    if (!customerProfile?.phone || !customerProfile?.email) {
      return 'Please add a mobile number and email to your profile before booking.';
    }
    if (useGst && (!GSTIN_PATTERN.test(gstNumber.trim().toUpperCase()) || !gstHolderName.trim() || !gstAddress.trim())) {
      return 'Please enter a valid 15-character GSTIN, company name and company address.';
    }
    return '';
  };

  const handleNext = () => {
    const problem = bookingProblem();
    setPaymentError(problem);
    if (!problem) {
      setStep('payment');
    }
  };

  const handlePayNow = async () => {
    const problem = bookingProblem();
    if (problem || !customerProfile?.phone || !customerProfile?.email) {
      setPaymentError(problem);
      return;
    }

    setPaymentError('');
    setPaymentState('processing');

    let heldBooking: CreateBookingResponse | null = null;

    try {
      // The flight is held with the supplier first — before any money moves —
      // so a customer is never charged for a seat that couldn't actually be
      // held. See IFlightSupplierClient.CreateBlockTicketAsync (backend) for
      // why this is a reversible hold, not a final purchase.
      const bookingTravelers: BookingTravelerRequest[] = selectedTravelers.map((t) => ({
        paxId: travelerPaxIds.get(t.id) ?? 0,
        title: t.gender === 'Female' ? 'Ms' : 'Mr',
        firstName: t.firstName,
        lastName: t.lastName,
        gender: t.gender === 'Female' ? 'Female' : 'Male',
        // The type they fly as on these dates (see checkTravelerAge), which
        // can differ from the type saved on their profile.
        paxType: PAX_API_TYPES[paxTypeOf(t)],
        dateOfBirth: t.dateOfBirth || undefined,
        savedTravelerId: t.id,
      }));

      const bookingLegs: BookingLegRequest[] = legs.map((leg, legIndex) => ({
        offerId: leg.offerId,
        fareId: leg.selectedFareId,
        // The booked fare: the one picked, else the offer's own (its total matches).
        fareType:
          (
            leg.fares.find((f) => f.fareId === leg.selectedFareId) ??
            leg.fares.find((f) => Math.round(f.bookingTotalAmount) === Math.round(leg.totalAmount))
          )?.fareIdentifier ?? undefined,
        selectedSsrs: addOnSelections
          .filter((s) => s.legIndex === legIndex)
          .map((s) => ({ paxId: travelerPaxIds.get(s.travelerId) ?? 0, ssrKey: s.ssrKey })),
      }));

      const booking = await createBooking.mutateAsync({
        legs: bookingLegs,
        travelers: bookingTravelers,
        passengerMobile: customerProfile.phone,
        passengerEmail: customerProfile.email,
        ...(useGst && {
          gstNumber: gstNumber.trim().toUpperCase(),
          gstHolderName: gstHolderName.trim(),
          gstAddress: gstAddress.trim(),
        }),
      });

      if (booking.statusId === BOOKING_STATUS_FAILED) {
        throw new Error(booking.failureRemark || 'Could not hold your flight. Please try again.');
      }

      heldBooking = booking;
      setBookingResult(booking);

      // The supplier re-prices at booking time and the fare can move from what
      // search showed (in either direction) — charge what it will actually
      // charge, after the customer has seen and accepted any change.
      const serverConvenienceFee = booking.convenienceFee ?? estimatedConvenienceFee;
      setChargedConvenienceFee(serverConvenienceFee);
      const chargeAmount = (booking.confirmedTotalAmount ?? totalAmount) + serverConvenienceFee;
      if (Math.round(chargeAmount) !== Math.round(payableAmount)) {
        const accepted = await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Price updated',
            `The airline has updated the fare for this booking from ${formatMoney(payableAmount, currencyCode)} to ${formatMoney(chargeAmount, currencyCode)}.`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Continue', onPress: () => resolve(true) },
            ],
            { cancelable: false }
          )
        );
        if (!accepted) {
          throw new Error('Booking cancelled — the fare changed.');
        }
        setConfirmedAmount(chargeAmount);
      }

      // Reuses Flyshop's own Booking_RefNo (not a client-generated id) so the
      // backend's post-payment AddPayment/Book_Ticket step can look this exact
      // TripBooking back up by the same reference BookingPayment is stored under.
      const order = await createOrder.mutateAsync({
        bookingReference: booking.bookingRefNo,
        amount: chargeAmount,
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
        await releaseHeldBookingSilently(heldBooking);
      }
    } catch (err) {
      setPaymentState('idle');
      const description = (err as { description?: string; message?: string })?.description;
      const message = (err as { message?: string })?.message;
      setPaymentError(description || message || 'Payment was not completed.');
      await releaseHeldBookingSilently(heldBooking);
    }
  };

  const toggleSelected = (traveler: Traveler) => {
    const type = paxTypeOf(traveler);
    const check = ageChecks.get(traveler.id);
    if (!selectedIds.has(traveler.id) && check?.blocked) {
      setSelectionHint(`${traveler.firstName} ${traveler.lastName} can't travel on these dates: ${check.note.toLowerCase()}.`);
      return;
    }
    if (!selectedIds.has(traveler.id) && selectedCount(type) >= requiredCounts[type]) {
      setSelectionHint(
        `This search is for ${paxCountText(type, requiredCounts[type])}. Unselect one to choose another.`
      );
      return;
    }
    setSelectionHint('');
    setPaymentError('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(traveler.id)) {
        next.delete(traveler.id);
      } else {
        next.add(traveler.id);
      }
      return next;
    });
  };

  const renderTravelerRow = (traveler: Traveler) => {
    const isSelected = selectedIds.has(traveler.id);
    return (
      <View key={traveler.id} style={styles.travelerRow}>
        <TouchableOpacity style={styles.travelerRowLeft} onPress={() => toggleSelected(traveler)} activeOpacity={0.7}>
          <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
            {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <View style={styles.travelerInfo}>
            <Text style={styles.travelerName}>
              {traveler.firstName} {traveler.lastName}
            </Text>
            <Text style={styles.travelerMeta}>
              {[traveler.gender, formatTravelerDob(traveler.dateOfBirth)].filter(Boolean).join(', ')}
            </Text>
            {!!ageChecks.get(traveler.id)?.note && (
              <Text style={styles.travelerAgeNote}>{ageChecks.get(traveler.id)?.note}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEditTraveler(traveler.id)}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Traveller Details stays mounted (hidden) behind the Payment page so the
  // add-on picks held inside WhatsIncludedSection survive going back.
  return (
    <View style={{ flex: 1 }}>
      {step === 'payment' ? (
        <PaymentScreen
          legs={legs}
          legLabels={legLabels}
          travellers={selectedTravelers.map((t) => ({ id: t.id, firstName: t.firstName, lastName: t.lastName }))}
          addOnSelections={addOnSelections}
          // The fee being charged (the server's once held), so a "fare change"
          // row only ever reflects the airline's re-price.
          totalAmount={totalAmount + convenienceFee}
          convenienceFee={convenienceFee}
          confirmedAmount={confirmedAmount}
          currencyCode={currencyCode}
          paymentState={paymentState}
          paymentError={paymentError}
          bookingRefNo={bookingResult?.bookingRefNo}
          airlinePnr={bookingResult?.airlinePnr}
          onBack={() => setStep('details')}
          onPay={handlePayNow}
        />
      ) : null}
    <View style={[styles.screen, step === 'payment' && { display: 'none' }]}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={24} color="#182339" strokeWidth={1.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flight Details</Text>
          <View style={styles.backButton}>
            <Share2 size={16} color="#182339" strokeWidth={1.5} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
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
                  <View style={styles.routeHeaderTitleRow}>
                    <Text style={styles.routeHeaderText}>{airportForCode(first.origin).city}</Text>
                    <ArrowRight size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.routeHeaderText}>{airportForCode(last.destination).city}</Text>
                  </View>
                  <View style={styles.routeHeaderTitleRow}>
                    <Clock3 size={20} color="#FFFFFF" strokeWidth={1.5} />
                    <Text style={styles.routeHeaderDuration}>
                      {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}
                    </Text>
                  </View>
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
                        <View style={styles.layoverIcon}>
                          <MapPinPlus size={16} color="#182339" strokeWidth={1.5} />
                        </View>
                        <Text style={styles.layoverText}>
                          Layover at {airportForCode(segment.destination).city} (
                          {formatTotalDuration(segment.arrivalDateTime, leg.segments[index + 1].departureDateTime)})
                        </Text>
                      </View>
                    )}
                  </React.Fragment>
                ))}
                {legIndex === legs.length - 1 && (
                  <TouchableOpacity style={styles.viewFlightDetailsRow} onPress={onBack}>
                    <Text style={styles.viewFlightDetailsLink}>View Flight Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionChips}>
          {SECTION_CHIPS.map((chip) => (
            <TouchableOpacity key={chip.key} style={styles.sectionChip} onPress={() => scrollToSection(chip.key)}>
              <Text style={styles.sectionChipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.infoCard}
          onLayout={trackSection('farePolicy')}
          onPress={() => setShowFareRules(true)}
          activeOpacity={0.8}
        >
          <View style={styles.infoCardText}>
            <Text style={styles.infoCardTitle}>Fare policy</Text>
            <Text style={styles.infoCardSubtitle}>View cancellation and rescheduling charges</Text>
          </View>
          <ChevronRight size={20} color="#182339" strokeWidth={1.5} />
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionTitle} onLayout={trackSection('travellers')}>
          Add travellers
        </Text>

        <View style={styles.noticeBanner}>
          <View style={styles.noticeIcon}>
            <Text style={styles.noticeIconText}>!</Text>
          </View>
          <Text style={styles.noticeText}>
            Please ensure your visa is valid. passport has 6+ months validity, and name matches your passport.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#7C1AEE" style={styles.loadingIndicator} />
        ) : (
          visiblePaxTypes.map((type) => {
            const ofType = travelersByType[type];
            return (
              <View key={type} style={styles.paxBlock}>
                <View style={styles.travelerCountRow}>
                  <Text style={styles.travelerCountLabel}>{PAX_LABELS[type].block}</Text>
                  <Text style={styles.travelerCountValue}>
                    {selectedCount(type)}/{requiredCounts[type]} Selected
                  </Text>
                </View>
                {ofType.length === 0 ? (
                  <Text style={styles.emptyStateText}>
                    No saved {PAX_LABELS[type].plural} yet. Add one below.
                  </Text>
                ) : (
                  ofType.slice(0, INLINE_TRAVELER_LIMIT).map(renderTravelerRow)
                )}
                {ofType.length > INLINE_TRAVELER_LIMIT && (
                  <TouchableOpacity style={styles.moreButton} onPress={() => setAllTravelersType(type)} activeOpacity={0.7}>
                    <Text style={styles.moreButtonText}>More</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        {!!selectionHint && <Text style={styles.selectionHintText}>{selectionHint}</Text>}

        <TouchableOpacity style={styles.addTravelerRow} onPress={onAddTraveler} activeOpacity={0.7}>
          <Text style={styles.addTravelerText}>Add new travellers</Text>
          <Plus size={20} color="#7C1AEE" strokeWidth={1.5} />
        </TouchableOpacity>

        <View style={styles.sectionDivider} onLayout={trackSection('baggage')} />

        <WhatsIncludedSection
          legRoutes={legRoutes}
          travelers={addOnTravelers}
          currencyCode={currencyCode}
          onTotalChange={setAddOnTotal}
          onSelectionsChange={setAddOnSelections}
        />

        <TouchableOpacity
          style={[styles.infoCard, styles.gstCard]}
          onLayout={trackSection('gst')}
          onPress={() => setUseGst((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={styles.infoCardText}>
            <Text style={styles.infoCardTitle}>GST Number</Text>
            <Text style={styles.infoCardSubtitle}>Add GST to claim tax credit</Text>
          </View>
          <ChevronRight
            size={20}
            color="#182339"
            strokeWidth={1.5}
            style={useGst ? { transform: [{ rotate: '90deg' }] } : undefined}
          />
        </TouchableOpacity>

        {useGst && (
          <View style={styles.gstFields}>
            <TextInput
              style={styles.gstInput}
              placeholder="GSTIN"
              placeholderTextColor="#ADB8CD"
              value={gstNumber}
              onChangeText={setGstNumber}
              autoCapitalize="characters"
              maxLength={15}
            />
            <TextInput
              style={styles.gstInput}
              placeholder="Company name"
              placeholderTextColor="#ADB8CD"
              value={gstHolderName}
              onChangeText={setGstHolderName}
              maxLength={35}
            />
            <TextInput
              style={styles.gstInput}
              placeholder="Company address"
              placeholderTextColor="#ADB8CD"
              value={gstAddress}
              onChangeText={setGstAddress}
            />
          </View>
        )}

        {paymentState === 'success' ? (
          <View style={styles.paymentSuccessBanner}>
            <CheckCircle2 size={28} color="#1E9E5A" strokeWidth={2} />
            <Text style={styles.paymentSuccessTitle}>Payment Successful</Text>
            <Text style={styles.paymentSuccessSubtitle}>
              Your payment of {formatMoney(confirmedAmount ?? payableAmount, currencyCode)} was received. Your booking is confirmed.
            </Text>
            {!!bookingResult?.bookingRefNo && (
              <Text style={styles.paymentSuccessSubtitle}>Booking reference: {bookingResult.bookingRefNo}</Text>
            )}
            {!!bookingResult?.airlinePnr && (
              <Text style={styles.paymentSuccessSubtitle}>Airline PNR: {bookingResult.airlinePnr}</Text>
            )}
          </View>
        ) : (
          <View style={styles.paymentSection}>
            {!!paymentError && <Text style={styles.paymentErrorText}>{paymentError}</Text>}

            <View style={styles.paymentAmountRow}>
              <View>
                <Text style={styles.paymentAmountLabel}>Total</Text>
                <Text style={styles.paymentAmountValue}>{formatMoney(totalAmount, currencyCode)}</Text>
              </View>
              <TouchableOpacity style={styles.payButton} onPress={handleNext}>
                <Text style={styles.payButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={allTravelersType !== null} animationType="slide" transparent onRequestClose={() => setAllTravelersType(null)}>
        <View style={styles.allTravelersBackdrop}>
          <View style={styles.allTravelersSheet}>
            <View style={styles.allTravelersHeader}>
              <Text style={styles.allTravelersTitle}>Add Traveller</Text>
            </View>
            {allTravelersType && (
              <>
                <View style={styles.travelerCountRow}>
                  <Text style={styles.travelerCountLabel}>{PAX_LABELS[allTravelersType].block}</Text>
                  <Text style={styles.travelerCountValue}>
                    {selectedCount(allTravelersType)}/{requiredCounts[allTravelersType]} Selected
                  </Text>
                </View>
                <ScrollView style={styles.allTravelersList}>
                  {travelersByType[allTravelersType].map(renderTravelerRow)}
                </ScrollView>
                {!!selectionHint && <Text style={styles.selectionHintText}>{selectionHint}</Text>}
              </>
            )}
            <View style={styles.allTravelersFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAllTravelersType(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setAllTravelersType(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FareRulesModal visible={showFareRules} legs={fareRuleLegs} onClose={() => setShowFareRules(false)} />
    </View>
    </View>
  );
};
