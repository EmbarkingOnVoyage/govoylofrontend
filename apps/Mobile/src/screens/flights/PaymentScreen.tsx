import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, ChevronRight, ChevronUp, ChevronDown, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import type { FlightOffer } from '@workspace/ui';
import { AirlineLogo } from './FlightResultsScreen';
import type { AddOnSelection } from './WhatsIncludedSection';
import { styles } from './PaymentScreen.styles';
import { PAYMENT_BADGE_SVG } from '../../components/paymentBadges';
import { formatPrice as formatMoney } from '@workspace/ui/src/features/flights/logic/flightResults';
import { useHardwareBack } from '../../navigation/useHardwareBack';

export interface PaymentTraveller {
  id: string;
  firstName: string;
  lastName: string;
}

interface PaymentScreenProps {
  legs: FlightOffer[];
  legLabels?: string[];
  travellers: PaymentTraveller[];
  addOnSelections: AddOnSelection[];
  // Flight fares for every passenger plus add-ons and the convenience fee —
  // what Securely pay charges unless the airline re-prices at booking
  // (confirmedAmount).
  totalAmount: number;
  // GoVoylo's convenience fee, included in totalAmount.
  convenienceFee: number;
  confirmedAmount: number | null;
  currencyCode: string;
  paymentState: 'idle' | 'processing' | 'success';
  paymentError: string;
  bookingRefNo?: string | null;
  airlinePnr?: string | null;
  // Booked as a guest: where to sign in to find this trip again.
  guestEmail?: string;
  onBack: () => void;
  onPay: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


function formatTime24(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// "Thu, 22 Oct"
function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function minutesText(minutes: number): string {
  if (!minutes || minutes < 0) return '';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

// Segment durations come as minutes ("250", Tripjack) or "HH:MM" (Flyshop).
function segmentMinutes(segment: FlightOffer['segments'][number]): number {
  const value = segment.duration?.trim() ?? '';
  if (/^\d+$/.test(value)) return Number(value);
  const hm = /^(\d+):(\d{1,2})/.exec(value);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  const diff = (new Date(segment.arrivalDateTime).getTime() - new Date(segment.departureDateTime).getTime()) / 60000;
  return isNaN(diff) ? 0 : Math.round(diff);
}

function stopsText(stops: number): string {
  return stops === 0 ? 'Non-stop' : `${stops} Stop${stops > 1 ? 's' : ''}`;
}

function initials(first: string, last: string): string {
  return `${first.trim()[0] ?? ''}${last.trim()[0] ?? ''}`.toUpperCase() || '?';
}

// A trip of one leg: segments grouped by tripIndex (a combined return or
// multi-city offer carries several trips in one leg).
function tripsOf(leg: FlightOffer): FlightOffer['segments'][] {
  const byTrip = new Map<number, FlightOffer['segments']>();
  leg.segments.forEach((s) => {
    const key = s.tripIndex ?? 0;
    byTrip.set(key, [...(byTrip.get(key) ?? []), s]);
  });
  return [...byTrip.entries()].sort(([a], [b]) => a - b).map(([, segs]) => segs);
}

// The fare being booked on a leg and its base fare for every passenger — 0
// when the supplier didn't split base and taxes.
function legBaseFare(leg: FlightOffer): number {
  const fare =
    leg.fares.find((f) => f.fareId === leg.selectedFareId) ??
    leg.fares.find((f) => Math.round(f.bookingTotalAmount) === Math.round(leg.totalAmount));
  return fare?.bookingBaseAmount ?? 0;
}

const ADD_ON_LABELS: Record<AddOnSelection['category'], string> = {
  seat: 'Seats',
  meal: 'Meals',
  baggage: 'Extra baggage',
};

// Payment method badges exactly as drawn in the Figma Payment frame.
const PaymentMethods: React.FC = () => (
  <View style={styles.methodsRow}>
    {PAYMENT_BADGE_SVG.map((xml, index) => (
      <SvgXml key={index} xml={xml} width={60} height={36} />
    ))}
  </View>
);

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  legs,
  legLabels,
  travellers,
  addOnSelections,
  totalAmount,
  convenienceFee,
  confirmedAmount,
  currencyCode,
  paymentState,
  paymentError,
  bookingRefNo,
  airlinePnr,
  onBack,
  onPay,
  guestEmail,
}) => {
  const [tripOpen, setTripOpen] = useState(false);
  const [fareOpen, setFareOpen] = useState(false);
  const [addOnsOpen, setAddOnsOpen] = useState(true);
  const money = (amount: number) => formatMoney(amount, currencyCode);
  const payable = confirmedAmount ?? totalAmount;

  // Android back returns to Traveller Details, except mid-payment.
  useHardwareBack(() => {
    if (paymentState !== 'processing') onBack();
  });

  const allTrips = useMemo(() => legs.flatMap(tripsOf), [legs]);
  const firstTrip = allTrips[0] ?? [];
  const firstSegment = firstTrip[0];
  const lastOfFirstTrip = firstTrip[firstTrip.length - 1];
  const lastTrip = allTrips[allTrips.length - 1] ?? [];
  const finalDestination = lastTrip[lastTrip.length - 1]?.destination;
  // Results labels a round trip's legs Onward/Return. Trust that over airport
  // codes: a return can land at another airport of the same city (DEL out,
  // DXN back).
  const isRoundTrip =
    allTrips.length === 2 && (legLabels?.[1] === 'Return' || finalDestination === firstSegment?.origin);
  const routeTitle = firstSegment
    ? isRoundTrip
      ? `${firstSegment.origin} ⇌ ${lastOfFirstTrip?.destination}`
      : allTrips.length > 2
        ? allTrips.map((t) => t[0]?.origin).concat(finalDestination ?? '').join(' → ')
        : `${firstSegment.origin} → ${finalDestination ?? lastOfFirstTrip?.destination}`
    : '';
  const firstTripMinutes = firstTrip.reduce((sum, s) => sum + segmentMinutes(s), 0);
  const tripMeta = firstSegment
    ? [formatShortDate(firstSegment.departureDateTime), stopsText(firstTrip.length - 1), minutesText(firstTripMinutes)]
        .filter(Boolean)
        .join(' · ')
    : '';

  // Fare breakdown. The supplier splits base fare and taxes per fare; add-ons
  // are what the traveller picked. Any re-price at booking shows as its own row.
  const flightTotal = legs.reduce((sum, leg) => sum + leg.totalAmount, 0);
  const baseFare = legs.reduce((sum, leg) => sum + legBaseFare(leg), 0);
  const baseKnown = legs.every((leg) => legBaseFare(leg) > 0);
  const addOnTotal = addOnSelections.reduce((sum, s) => sum + s.amount, 0);
  const addOnGroups = (['seat', 'meal', 'baggage'] as AddOnSelection['category'][])
    .map((category) => ({
      category,
      amount: addOnSelections.filter((s) => s.category === category).reduce((sum, s) => sum + s.amount, 0),
    }))
    .filter((g) => g.amount > 0);
  const fareChange = confirmedAmount != null ? confirmedAmount - totalAmount : 0;

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={paymentState === 'processing'}>
            <ArrowLeft size={22} color="#3E4B64" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <TouchableOpacity style={styles.tripBlock} onPress={() => setTripOpen(true)} activeOpacity={0.7}>
            <AirlineLogo airlineCode={firstSegment?.airlineCode ?? ''} size={36} style={styles.tripLogo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tripRoute} numberOfLines={1}>
                {routeTitle}
              </Text>
              <Text style={styles.tripMeta}>{tripMeta}</Text>
            </View>
            <ChevronRight size={20} color="#3E4B64" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.amountBlock} onPress={() => setFareOpen(true)} activeOpacity={0.7}>
            <ShieldCheck size={18} color="#2563EB" strokeWidth={2} style={{ alignSelf: 'flex-start', marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.amountLabel}>Amount to be paid</Text>
              <Text style={styles.amountSub}>
                {addOnTotal > 0 ? `Taxes and ${money(addOnTotal)} add-ons included` : 'Taxes and fees included'}
              </Text>
            </View>
            <Text style={styles.amountValue}>{money(payable)}</Text>
            <ChevronRight size={20} color="#3E4B64" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {paymentState === 'success' ? (
          <View style={styles.successBox}>
            <CheckCircle2 size={32} color="#15803D" strokeWidth={2} />
            <Text style={styles.successTitle}>Payment Successful</Text>
            <Text style={styles.successText}>
              Your payment of {money(payable)} was received. Your booking is confirmed.
            </Text>
            {bookingRefNo ? <Text style={styles.successText}>Booking reference: {bookingRefNo}</Text> : null}
            {airlinePnr ? <Text style={styles.successText}>Airline PNR: {airlinePnr}</Text> : null}
            {guestEmail ? (
              <Text style={styles.successText}>
                Your e-ticket is on its way to {guestEmail}. Sign in with this email to see this trip anytime.
              </Text>
            ) : null}
          </View>
        ) : (
          <>
            <Text style={styles.payUsing}>Pay using UPI, Cards, or Net Banking.</Text>
            <PaymentMethods />
            {paymentError ? <Text style={styles.errorText}>{paymentError}</Text> : null}
            <TouchableOpacity
              style={[styles.payButton, paymentState === 'processing' && styles.payButtonDisabled]}
              onPress={onPay}
              disabled={paymentState === 'processing'}
              activeOpacity={0.8}
            >
              {paymentState === 'processing' ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.payButtonText}>Processing…</Text>
                </>
              ) : (
                <Text style={styles.payButtonText}>Securely pay {money(payable)}</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Trip Summary */}
      <Modal visible={tripOpen} transparent animationType="slide" onRequestClose={() => setTripOpen(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Trip Summary</Text>
            <Text style={styles.sheetSubtitle}>
              {travellers.length} {travellers.length === 1 ? 'Traveller' : 'Travellers'}
            </Text>
            <ScrollView>
              <View style={styles.segmentsCard}>
                {legs.map((leg, legIndex) => (
                  <View key={`${leg.offerId}-${legIndex}`}>
                    {legs.length > 1 ? (
                      <Text style={[styles.legCaption, legIndex > 0 && { borderTopWidth: 1, borderTopColor: '#B9C3D3' }]}>
                        {(legLabels?.[legIndex] ?? `Flight ${legIndex + 1}`).toUpperCase()}
                      </Text>
                    ) : null}
                    {leg.segments.map((segment, index) => (
                      <View
                        key={`${segment.airlineCode}${segment.flightNumber}-${index}`}
                        style={[styles.segmentRow, index > 0 && styles.segmentRowDivided]}
                      >
                        <AirlineLogo airlineCode={segment.airlineCode} size={34} style={styles.tripLogo} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.segmentCarrier}>
                            {segment.airlineName || leg.airlineName} · {segment.airlineCode} · {segment.flightNumber}
                          </Text>
                          <Text style={styles.segmentTimes}>
                            {segment.origin} {formatTime24(segment.departureDateTime)} – {segment.destination}{' '}
                            {formatTime24(segment.arrivalDateTime)}
                          </Text>
                          <Text style={styles.segmentMeta}>
                            {[formatShortDate(segment.departureDateTime), minutesText(segmentMinutes(segment))]
                              .filter(Boolean)
                              .join(' · ')}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>

              <Text style={styles.travellersCaption}>TRAVELLER DETAILS</Text>
              {travellers.map((t) => (
                <View key={t.id} style={styles.travellerRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(t.firstName, t.lastName)}</Text>
                  </View>
                  <Text style={styles.travellerName}>
                    {t.firstName} {t.lastName}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setTripOpen(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Fare Summary */}
      <Modal visible={fareOpen} transparent animationType="slide" onRequestClose={() => setFareOpen(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, { marginBottom: 8 }]}>Fare Summary</Text>
            <ScrollView>
              {baseKnown ? (
                <>
                  <View style={styles.fareRow}>
                    <Text style={styles.fareLabel}>Base Fare</Text>
                    <Text style={styles.fareValue}>{money(baseFare)}</Text>
                  </View>
                  <View style={styles.fareRow}>
                    <Text style={styles.fareLabel}>Taxes & Fees</Text>
                    <Text style={styles.fareValue}>{money(flightTotal - baseFare)}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Flight fare (incl. taxes)</Text>
                  <Text style={styles.fareValue}>{money(flightTotal)}</Text>
                </View>
              )}

              {addOnTotal > 0 ? (
                <>
                  <TouchableOpacity style={styles.fareRow} onPress={() => setAddOnsOpen((v) => !v)} activeOpacity={0.7}>
                    <Text style={styles.fareLabel}>Add-Ons</Text>
                    <View style={styles.addOnToggle}>
                      {addOnsOpen ? (
                        <ChevronUp size={16} color="#3E4B64" strokeWidth={2} />
                      ) : (
                        <ChevronDown size={16} color="#3E4B64" strokeWidth={2} />
                      )}
                      <Text style={styles.fareValue}>{money(addOnTotal)}</Text>
                    </View>
                  </TouchableOpacity>
                  {addOnsOpen ? (
                    <View style={styles.addOnList}>
                      {addOnGroups.map((group, index) => (
                        <View
                          key={group.category}
                          style={[styles.addOnRow, index === addOnGroups.length - 1 && styles.addOnRowLast]}
                        >
                          <Text style={styles.addOnLabel}>{ADD_ON_LABELS[group.category]}</Text>
                          <Text style={styles.addOnValue}>{money(group.amount)}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}

              {convenienceFee > 0 ? (
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Convenience Fee</Text>
                  <Text style={styles.fareValue}>{money(convenienceFee)}</Text>
                </View>
              ) : null}

              {Math.abs(fareChange) >= 1 ? (
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Fare change by airline</Text>
                  <Text style={styles.fareValue}>
                    {fareChange > 0 ? '+' : '−'}
                    {money(Math.abs(fareChange))}
                  </Text>
                </View>
              ) : null}

              <View style={styles.doubleRule} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Net Payable Amount</Text>
                <Text style={styles.totalValue}>{money(payable)}</Text>
              </View>
              {travellers.length > 1 ? (
                <Text style={styles.fareNote}>Fares are for all {travellers.length} travellers.</Text>
              ) : null}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setFareOpen(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

