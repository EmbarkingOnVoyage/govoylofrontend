import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { ArrowLeft, ArrowLeftRight, ArrowRight, Pencil, Plane, Info, ChevronDown, ListFilter, Check, Minus, Plus, X, MapPin } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import {
  useFareCalendarMobile,
  useSearchFlightsMobile,
  useAirportsByCodesMobile,
  type FlightOffer,
  type FlightOfferSegment,
  type FareOption,
  type FlightSearchSummary,
  type FlightSearchSegment,
} from '@workspace/ui';
import { FlightSearchFormScreen, type FlightSearchFormInitialValues } from './FlightSearchFormScreen';
import { findAirportByCode, primeAirportCache } from '../../data/airports';
import { styles } from './FlightResultsScreen.styles';
// global.d.ts types *.png as `string` for @workspace/ui's web-only re-exports;
// Metro actually resolves a local RN import like this to an asset module id
// (number), which is what Image.source expects — cast to match the runtime type.
import insuranceBannerSrc from '../../assets/images/insurance-banner.png';
import { AIRLINE_LOGO_XML } from '../../assets/airlines/airlineLogos';
const insuranceBanner = insuranceBannerSrc as unknown as number;

const CABIN_CLASS_LABELS: Record<FlightSearchSummary['cabinClass'], string> = {
  Economy: 'Economy',
  PremiumEconomy: 'Premium Economy',
  Business: 'Business',
  First: 'First',
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// 24-hour "17:30" — the Flight details popup's own time format (Figma),
// distinct from the 12-hour AM/PM format the card list uses.
function formatTime24(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDateShort(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

// "Mon, 30.1" — the Flight details popup's own date format (Figma), distinct
// from every other date format already in this file.
function formatWeekdayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const weekday = date.toLocaleDateString([], { weekday: 'short' });
  return `${weekday}, ${date.getDate()}.${date.getMonth() + 1}`;
}

// DD/MM/YYYY — the display format FlightSearchFormScreen's own date fields use.
function formatDisplayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

// Falls back to a code-only stand-in when the airport isn't in the app's small
// hardcoded list (see data/airports.ts) — the form only needs a code and a
// label to prefill, not the full real airport record.
function airportForCode(code: string) {
  return findAirportByCode(code) ?? { code, city: code, state: '', country: '', name: code };
}

function toFormInitialValues(summary: FlightSearchSummary): FlightSearchFormInitialValues {
  return {
    tripType: summary.request.tripType,
    origin: airportForCode(summary.originCode),
    destination: airportForCode(summary.destinationCode),
    departureDate: formatDisplayDate(summary.departureDate),
    returnDate: summary.returnDate ? formatDisplayDate(summary.returnDate) : undefined,
    // The single origin/destination/departureDate above only ever reflect
    // the first requested leg — irrelevant for MultiCity (the form reads
    // multiCitySegments instead once tripType is 'MultiCity'), but without
    // this the edit overlay reopened a MultiCity search as two blank rows.
    multiCitySegments:
      summary.request.tripType === 'MultiCity'
        ? summary.request.segments.map((segment) => ({
            origin: airportForCode(segment.origin),
            destination: airportForCode(segment.destination),
            date: formatDisplayDate(segment.travelDate),
          }))
        : undefined,
    adultCount: summary.request.adultCount,
    childCount: summary.request.childCount,
    infantCount: summary.request.infantCount,
    cabinClass: summary.cabinClass,
  };
}

function formatDateRange(summary: FlightSearchSummary): string {
  const departure = formatDateShort(summary.departureDate);
  if (!summary.returnDate) return departure;
  return `${departure} - ${formatDateShort(summary.returnDate)}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹' };

function formatPrice(amount: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? `${currencyCode} `;
  return `${symbol}${amount.toLocaleString()}`;
}

// Total journey duration (first departure to last arrival) — not the same as
// any individual segment's own flight time when there's a layover in between.
function formatTotalDuration(startIso: string, endIso: string): string {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) return '';
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

// How many calendar days later (in the device's local timezone, matching
// formatTime) the arrival lands versus the departure — the "+1" shown next
// to an arrival time that's technically the next day.
function dayOffset(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.round((endDay - startDay) / 86400000);
}

function stopsLabel(stopCount: number): string {
  return stopCount === 0 ? 'Non-stop' : `${stopCount} stop${stopCount > 1 ? 's' : ''}`;
}

function formatMinutesDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(Math.round(minutes % 60)).padStart(2, '0')}m`;
}

// Flyshop's fares carry an airline-specific booking-class code (e.g. R/J/O/
// BR/BC), not a cabin class — there's no "Economy/Premium/Business" label
// anywhere in the data. But real fares split cleanly into 3 baggage tiers
// (single-piece ~30KG, two-piece ~30KG, two-piece ~40KG) with correspondingly
// higher prices, which lines up with the Economy/Premium/Business tabs in the
// Figma reference closely enough to use as the grouping signal.
type CabinTierId = 'economy' | 'premium' | 'business';

const CABIN_TIER_ORDER: CabinTierId[] = ['economy', 'premium', 'business'];
const CABIN_TIER_LABELS: Record<CabinTierId, string> = {
  economy: 'Economy',
  premium: 'Premium',
  business: 'Business',
};

function cabinTierForFare(fare: FareOption): CabinTierId {
  const weightMatch = fare.checkInBaggage?.match(/(\d+)/);
  const weightKg = weightMatch ? parseInt(weightMatch[1], 10) : 0;
  const isMultiPiece = /\(\s*\d+\s*pcs?\s*\)/i.test(fare.checkInBaggage ?? '');

  if (!isMultiPiece) return 'economy';
  return weightKg >= 40 ? 'business' : 'premium';
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatStripDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}

const STRIP_DAYS_BEFORE = 3;
const STRIP_DAYS_AFTER = 3;

// Horizontal strip of nearby departure dates with their fares (Figma "date
// slider" component) so the user can shop dates without leaving the results
// screen. Fetches the fare-calendar for the selected date's month only — a
// window that crosses a month boundary just shows a blank price for the days
// outside it rather than firing a second request, which is an acceptable gap
// for a 7-day window.
const DateFareStrip: React.FC<{
  originCode: string;
  destinationCode: string;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  disabled: boolean;
}> = ({ originCode, destinationCode, selectedDate, onSelectDate, disabled }) => {
  const selected = new Date(selectedDate);
  const month = selected.getMonth() + 1;
  const year = selected.getFullYear();

  const { data } = useFareCalendarMobile({ origin: originCode, destination: destinationCode, month, year });

  const fareByDate = useMemo(() => {
    const map = new Map<string, { amount: number; currencyCode: string }>();
    for (const day of data?.days ?? []) {
      const parsed = new Date(day.date);
      if (!isNaN(parsed.getTime())) {
        map.set(dateKey(parsed), { amount: day.amount, currencyCode: day.currencyCode });
      }
    }
    return map;
  }, [data]);

  const days = useMemo(() => {
    const list: Date[] = [];
    for (let offset = -STRIP_DAYS_BEFORE; offset <= STRIP_DAYS_AFTER; offset++) {
      const d = new Date(selected);
      d.setDate(d.getDate() + offset);
      list.push(d);
    }
    return list;
  }, [selectedDate]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateStrip} contentContainerStyle={styles.dateStripContent}>
      {days.map((day) => {
        const key = dateKey(day);
        const isSelected = key === dateKey(selected);
        const fare = fareByDate.get(key);

        return (
          <TouchableOpacity
            key={key}
            disabled={disabled || isSelected}
            onPress={() => onSelectDate(day.toISOString())}
            style={[styles.dateCard, isSelected && styles.dateCardSelected]}
          >
            <Text style={[styles.dateCardLabel, isSelected && styles.dateCardLabelSelected]}>
              {formatStripDate(day)}
            </Text>
            <Text style={[styles.dateCardPrice, isSelected && styles.dateCardPriceSelected]}>
              {fare ? formatPrice(fare.amount, fare.currencyCode) : '—'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

function parseDurationMinutes(duration: string): number {
  const [hours, minutes] = duration.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function getTotalDurationMinutes(offer: FlightOffer): number {
  return offer.segments.reduce((sum, segment) => sum + parseDurationMinutes(segment.duration), 0);
}

// One entry per stop (segments.length - 1) — the city of every intermediate
// airport the itinerary connects through, not just the first one shown on
// the card/details popup.
function getLayoverCities(offer: FlightOffer): string[] {
  return offer.segments.slice(0, -1).map((segment) => airportForCode(segment.destination).city);
}

interface FeaturedFlights {
  best: FlightOffer | null;
  fastest: FlightOffer | null;
  cheapest: FlightOffer | null;
  rest: FlightOffer[];
}

// "Best" balances price and duration (50/50, each normalized 0-1 across the result
// set) rather than picking a single metric — it's meant to read as a sensible
// default pick, distinct from the pure cheapest/fastest extremes shown alongside it.
function pickFeaturedFlights(offers: FlightOffer[]): FeaturedFlights {
  if (offers.length === 0) {
    return { best: null, fastest: null, cheapest: null, rest: [] };
  }

  const cheapest = offers.reduce((a, b) => (b.totalAmount < a.totalAmount ? b : a));
  const fastest = offers.reduce((a, b) =>
    getTotalDurationMinutes(b) < getTotalDurationMinutes(a) ? b : a
  );

  const prices = offers.map((o) => o.totalAmount);
  const durations = offers.map(getTotalDurationMinutes);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  const scored = offers
    .map((offer) => {
      const priceScore = maxPrice === minPrice ? 0 : (offer.totalAmount - minPrice) / (maxPrice - minPrice);
      const durationScore =
        maxDuration === minDuration ? 0 : (getTotalDurationMinutes(offer) - minDuration) / (maxDuration - minDuration);
      return { offer, score: priceScore * 0.5 + durationScore * 0.5 };
    })
    .sort((a, b) => a.score - b.score);

  const usedIds = new Set([cheapest.offerId, fastest.offerId]);
  const best = scored.find((s) => !usedIds.has(s.offer.offerId))?.offer ?? scored[0].offer;
  usedIds.add(best.offerId);

  const rest = offers.filter((o) => !usedIds.has(o.offerId));

  return { best, fastest, cheapest, rest };
}

// A round-trip "Combine Flights" card pairs one onward offer with one return
// offer into a single bookable unit. Flyshop returns onward and return
// options as two independently-priced lists (see FlightResultsScreen's
// onward/return split by tripLegIndex) — there's no supplier-provided
// pairing between them.
interface CombinedRoundTripOffer {
  id: string;
  onward: FlightOffer;
  returnOffer: FlightOffer;
  totalAmount: number;
  currencyCode: string;
}

// Cheapest-onward-with-cheapest-return, 2nd-with-2nd, etc. (by each leg's own
// price rank) is the simplest pairing that surfaces the best combined deals
// first without computing the full cross-product of every onward × every
// return option.
function pairOffersForCombine(onwardOffers: FlightOffer[], returnOffers: FlightOffer[]): CombinedRoundTripOffer[] {
  const sortedOnward = [...onwardOffers].sort((a, b) => a.totalAmount - b.totalAmount);
  const sortedReturn = [...returnOffers].sort((a, b) => a.totalAmount - b.totalAmount);
  const pairCount = Math.min(sortedOnward.length, sortedReturn.length);

  const pairs: CombinedRoundTripOffer[] = [];
  for (let i = 0; i < pairCount; i++) {
    const onward = sortedOnward[i];
    const returnOffer = sortedReturn[i];
    pairs.push({
      id: `${onward.offerId}_${returnOffer.offerId}`,
      onward,
      returnOffer,
      totalAmount: onward.totalAmount + returnOffer.totalAmount,
      currencyCode: onward.currencyCode,
    });
  }
  return pairs;
}

function getCombinedDurationMinutes(pair: CombinedRoundTripOffer): number {
  return getTotalDurationMinutes(pair.onward) + getTotalDurationMinutes(pair.returnOffer);
}

interface FeaturedCombined {
  best: CombinedRoundTripOffer | null;
  fastest: CombinedRoundTripOffer | null;
  cheapest: CombinedRoundTripOffer | null;
  rest: CombinedRoundTripOffer[];
}

// Same 50/50 price+duration scoring as pickFeaturedFlights, applied to
// combined pairs instead of single offers.
function pickFeaturedCombined(pairs: CombinedRoundTripOffer[]): FeaturedCombined {
  if (pairs.length === 0) {
    return { best: null, fastest: null, cheapest: null, rest: [] };
  }

  const cheapest = pairs.reduce((a, b) => (b.totalAmount < a.totalAmount ? b : a));
  const fastest = pairs.reduce((a, b) =>
    getCombinedDurationMinutes(b) < getCombinedDurationMinutes(a) ? b : a
  );

  const prices = pairs.map((p) => p.totalAmount);
  const durations = pairs.map(getCombinedDurationMinutes);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  const scored = pairs
    .map((pair) => {
      const priceScore = maxPrice === minPrice ? 0 : (pair.totalAmount - minPrice) / (maxPrice - minPrice);
      const durationScore =
        maxDuration === minDuration
          ? 0
          : (getCombinedDurationMinutes(pair) - minDuration) / (maxDuration - minDuration);
      return { pair, score: priceScore * 0.5 + durationScore * 0.5 };
    })
    .sort((a, b) => a.score - b.score);

  const usedIds = new Set([cheapest.id, fastest.id]);
  const best = scored.find((s) => !usedIds.has(s.pair.id))?.pair ?? scored[0].pair;
  usedIds.add(best.id);

  const rest = pairs.filter((p) => !usedIds.has(p.id)).sort((a, b) => a.totalAmount - b.totalAmount);

  return { best, fastest, cheapest, rest };
}

type SortOptionId =
  | 'priceLowToHigh'
  | 'priceHighToLow'
  | 'pricePerPerson'
  | 'best'
  | 'totalJourneyTime'
  | 'departureTime'
  | 'arrivalTime';

const SORT_OPTIONS: { id: SortOptionId; title: string; description: string }[] = [
  { id: 'priceLowToHigh', title: 'Price Lowest to Highest', description: 'Cheapest first' },
  { id: 'priceHighToLow', title: 'Price highest to lowest.', description: 'Expensive first' },
  { id: 'pricePerPerson', title: 'Price per person', description: 'Cheapest first' },
  { id: 'best', title: 'Best', description: 'Cheap short flights' },
  { id: 'totalJourneyTime', title: 'Total journey time', description: 'Fastest first' },
  { id: 'departureTime', title: 'Departure time', description: 'Earliest first' },
  { id: 'arrivalTime', title: 'Arrival time', description: 'Earliest first' },
];

// Same 50/50 price+duration score used to pick the "Best" featured card above
// — "Best" in the sort modal orders the whole list by that same score instead
// of just picking the single top one.
function bestScore(offer: FlightOffer, minPrice: number, maxPrice: number, minDuration: number, maxDuration: number) {
  const priceScore = maxPrice === minPrice ? 0 : (offer.totalAmount - minPrice) / (maxPrice - minPrice);
  const durationScore =
    maxDuration === minDuration ? 0 : (getTotalDurationMinutes(offer) - minDuration) / (maxDuration - minDuration);
  return priceScore * 0.5 + durationScore * 0.5;
}

function sortOffers(offers: FlightOffer[], sortId: SortOptionId | null, passengerCount: number): FlightOffer[] {
  if (!sortId || offers.length === 0) return offers;
  const sorted = [...offers];

  switch (sortId) {
    case 'priceLowToHigh':
      return sorted.sort((a, b) => a.totalAmount - b.totalAmount);
    case 'priceHighToLow':
      return sorted.sort((a, b) => b.totalAmount - a.totalAmount);
    case 'pricePerPerson': {
      const count = passengerCount > 0 ? passengerCount : 1;
      return sorted.sort((a, b) => a.totalAmount / count - b.totalAmount / count);
    }
    case 'best': {
      const prices = offers.map((o) => o.totalAmount);
      const durations = offers.map(getTotalDurationMinutes);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      return sorted.sort(
        (a, b) =>
          bestScore(a, minPrice, maxPrice, minDuration, maxDuration) -
          bestScore(b, minPrice, maxPrice, minDuration, maxDuration)
      );
    }
    case 'totalJourneyTime':
      return sorted.sort((a, b) => getTotalDurationMinutes(a) - getTotalDurationMinutes(b));
    case 'departureTime':
      return sorted.sort(
        (a, b) => new Date(a.segments[0].departureDateTime).getTime() - new Date(b.segments[0].departureDateTime).getTime()
      );
    case 'arrivalTime':
      return sorted.sort((a, b) => {
        const aArrival = a.segments[a.segments.length - 1].arrivalDateTime;
        const bArrival = b.segments[b.segments.length - 1].arrivalDateTime;
        return new Date(aArrival).getTime() - new Date(bArrival).getTime();
      });
    default:
      return sorted;
  }
}

const SortByModal: React.FC<{
  visible: boolean;
  activeSortId: SortOptionId | null;
  onSelect: (id: SortOptionId) => void;
  onClose: () => void;
}> = ({ visible, activeSortId, onSelect, onClose }) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View style={styles.modalRoot}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalSheet}>
        <Text style={styles.modalTitle}>Sort by</Text>
        {SORT_OPTIONS.map((option, index) => {
          const isSelected = option.id === activeSortId;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.modalListRow, index < SORT_OPTIONS.length - 1 && styles.modalListRowDivider]}
              onPress={() => onSelect(option.id)}
            >
              <View style={styles.modalListRowIcon}>
                {isSelected && <Check size={16} color="#114BFF" strokeWidth={2.5} />}
              </View>
              <View>
                <Text style={[styles.modalListRowTitle, isSelected && styles.modalListRowTitleSelected]}>
                  {option.title}
                </Text>
                <Text style={styles.modalListRowDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Shared Close/Save footer used by the Airline, Time, and Baggage modals —
// unlike Sort by's single full-width Close, these two commit (Save) or
// discard (Close) a pending selection.
const ModalActions: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => (
  <View style={styles.modalActionsRow}>
    <TouchableOpacity style={[styles.modalActionButton, styles.modalActionButtonClose]} onPress={onClose}>
      <Text style={styles.modalCloseButtonText}>Close</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.modalActionButton, styles.modalActionButtonSave]} onPress={onSave}>
      <Text style={styles.modalSaveButtonText}>Save</Text>
    </TouchableOpacity>
  </View>
);

const AirlineModal: React.FC<{
  visible: boolean;
  airlines: string[];
  airlineCodeByName: Record<string, string>;
  appliedAirlines: Set<string>;
  onSave: (selected: Set<string>) => void;
  onClose: () => void;
}> = ({ visible, airlines, airlineCodeByName, appliedAirlines, onSave, onClose }) => {
  const [pending, setPending] = useState<Set<string>>(appliedAirlines);

  // Reopening should always start from whatever was last actually applied,
  // not whatever was left half-picked the previous time it was dismissed.
  useEffect(() => {
    if (visible) setPending(appliedAirlines);
  }, [visible, appliedAirlines]);

  const toggle = (airline: string) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(airline)) next.delete(airline);
      else next.add(airline);
      return next;
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Airline</Text>
          <Text style={styles.modalSectionLabel}>Airline</Text>
          {airlines.map((airline) => {
            const isChecked = pending.has(airline);
            return (
              <TouchableOpacity key={airline} style={styles.checkRow} onPress={() => toggle(airline)}>
                <View style={styles.checkRowLeft}>
                  <AirlineLogo
                    airlineCode={airlineCodeByName[airline] ?? ''}
                    size={20}
                    style={styles.checkRowLogoBadge}
                  />
                  <Text style={styles.checkRowLabel}>{airline}</Text>
                </View>
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
          <ModalActions onClose={onClose} onSave={() => onSave(pending)} />
        </View>
      </View>
    </Modal>
  );
};

const LayoverModal: React.FC<{
  visible: boolean;
  layoverCities: string[];
  appliedLayoverCities: Set<string>;
  onSave: (selected: Set<string>) => void;
  onClose: () => void;
}> = ({ visible, layoverCities, appliedLayoverCities, onSave, onClose }) => {
  const [pending, setPending] = useState<Set<string>>(appliedLayoverCities);

  useEffect(() => {
    if (visible) setPending(appliedLayoverCities);
  }, [visible, appliedLayoverCities]);

  const toggle = (city: string) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(city)) next.delete(city);
      else next.add(city);
      return next;
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Layover</Text>
          <Text style={styles.modalSectionLabel}>Layover city</Text>
          {layoverCities.length === 0 && (
            <Text style={styles.filterBaggageNote}>No connecting flights in this search.</Text>
          )}
          {layoverCities.map((city) => {
            const isChecked = pending.has(city);
            return (
              <TouchableOpacity key={city} style={styles.checkRow} onPress={() => toggle(city)}>
                <View style={styles.checkRowLeft}>
                  <MapPin size={16} color="#7C8CAD" strokeWidth={2} />
                  <Text style={styles.checkRowLabel}>{city}</Text>
                </View>
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
          <ModalActions onClose={onClose} onSave={() => onSave(pending)} />
        </View>
      </View>
    </Modal>
  );
};

type TimeBucketId = 'before6am' | 'morning' | 'afternoon' | 'after6pm';

const TIME_BUCKETS: { id: TimeBucketId; label: string; matchesHour: (hour: number) => boolean }[] = [
  { id: 'before6am', label: 'Before 6AM', matchesHour: (h) => h < 6 },
  { id: 'morning', label: '6AM-12 Noon', matchesHour: (h) => h >= 6 && h < 12 },
  { id: 'afternoon', label: '12 Noon-6 PM', matchesHour: (h) => h >= 12 && h < 18 },
  { id: 'after6pm', label: 'After 6PM', matchesHour: (h) => h >= 18 },
];

// Cheapest price among offers whose departure/arrival hour falls in this
// bucket — matches Figma showing a price under each time-of-day option.
function cheapestInBucket(offers: FlightOffer[], bucket: TimeBucketId, field: 'departure' | 'arrival'): number | null {
  const matching = offers.filter((o) => {
    const iso = field === 'departure' ? o.segments[0].departureDateTime : o.segments[o.segments.length - 1].arrivalDateTime;
    const hour = new Date(iso).getHours();
    return TIME_BUCKETS.find((b) => b.id === bucket)?.matchesHour(hour) ?? false;
  });
  if (matching.length === 0) return null;
  return Math.min(...matching.map((o) => o.totalAmount));
}

const TimeBucketButton: React.FC<{
  label: string;
  price: number | null;
  currencyCode: string;
  selected: boolean;
  onPress: () => void;
}> = ({ label, price, currencyCode, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.dateCard, styles.timeBucketCard, selected && styles.dateCardSelected]}
    onPress={onPress}
    disabled={price === null}
  >
    <Text style={[styles.dateCardLabel, selected && styles.dateCardLabelSelected]}>{label}</Text>
    <Text style={[styles.dateCardPrice, selected && styles.dateCardPriceSelected]}>
      {price === null ? '—' : formatPrice(price, currencyCode)}
    </Text>
  </TouchableOpacity>
);

interface TimeSelection {
  departure: TimeBucketId | null;
  arrival: TimeBucketId | null;
}

const TimeModal: React.FC<{
  visible: boolean;
  offers: FlightOffer[];
  currencyCode: string;
  originCity: string;
  destinationCity: string;
  applied: TimeSelection;
  onSave: (selection: TimeSelection) => void;
  onClose: () => void;
}> = ({ visible, offers, currencyCode, originCity, destinationCity, applied, onSave, onClose }) => {
  const [pending, setPending] = useState<TimeSelection>(applied);

  useEffect(() => {
    if (visible) setPending(applied);
  }, [visible, applied]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Time</Text>

          <Text style={styles.timeSectionLabel}>Departure from {originCity}</Text>
          <View style={styles.timeBucketGrid}>
            {TIME_BUCKETS.map((bucket) => (
              <TimeBucketButton
                key={bucket.id}
                label={bucket.label}
                price={cheapestInBucket(offers, bucket.id, 'departure')}
                currencyCode={currencyCode}
                selected={pending.departure === bucket.id}
                onPress={() =>
                  setPending((prev) => ({
                    ...prev,
                    departure: prev.departure === bucket.id ? null : bucket.id,
                  }))
                }
              />
            ))}
          </View>

          <Text style={[styles.timeSectionLabel, styles.timeSectionLabelSpaced]}>
            Arrival at {destinationCity}
          </Text>
          <View style={styles.timeBucketGrid}>
            {TIME_BUCKETS.map((bucket) => (
              <TimeBucketButton
                key={bucket.id}
                label={bucket.label}
                price={cheapestInBucket(offers, bucket.id, 'arrival')}
                currencyCode={currencyCode}
                selected={pending.arrival === bucket.id}
                onPress={() =>
                  setPending((prev) => ({
                    ...prev,
                    arrival: prev.arrival === bucket.id ? null : bucket.id,
                  }))
                }
              />
            ))}
          </View>

          <ModalActions onClose={onClose} onSave={() => onSave(pending)} />
        </View>
      </View>
    </Modal>
  );
};

type StopBucketId = 'nonstop' | 'onestop' | 'threeplus';

const STOP_BUCKETS: { id: StopBucketId; label: string; matches: (stopCount: number) => boolean }[] = [
  { id: 'nonstop', label: 'Non Stop', matches: (s) => s === 0 },
  { id: 'onestop', label: '1 Stop', matches: (s) => s === 1 },
  // Matches Figma exactly — it jumps from "1 Stop" straight to "3+ Stop",
  // with no "2 Stop" bucket of its own.
  { id: 'threeplus', label: '3+ Stop', matches: (s) => s >= 3 },
];

function offerMatchesAnyStopBucket(offer: FlightOffer, buckets: Set<StopBucketId>): boolean {
  if (buckets.size === 0) return true;
  const stopCount = offer.segments.length - 1;
  return STOP_BUCKETS.some((b) => buckets.has(b.id) && b.matches(stopCount));
}

function cheapestForStopBucket(offers: FlightOffer[], bucket: StopBucketId): number | null {
  const def = STOP_BUCKETS.find((b) => b.id === bucket)!;
  const matching = offers.filter((o) => def.matches(o.segments.length - 1));
  return matching.length === 0 ? null : Math.min(...matching.map((o) => o.totalAmount));
}

interface CombinedFilterState {
  stops: Set<StopBucketId>;
  hideNonRefundable: boolean;
  cabinCheckinBaggage: boolean;
  airlines: Set<string>;
  layoverCities: Set<string>;
  time: TimeSelection;
  priceMax: number | null;
  durationMax: number | null;
}

function applyCombinedFilters(offers: FlightOffer[], state: CombinedFilterState): FlightOffer[] {
  return offers
    .filter((o) => offerMatchesAnyStopBucket(o, state.stops))
    .filter((o) => !state.hideNonRefundable || o.refundable)
    .filter((o) => {
      if (!state.time.departure) return true;
      const hour = new Date(o.segments[0].departureDateTime).getHours();
      return TIME_BUCKETS.find((b) => b.id === state.time.departure)?.matchesHour(hour) ?? true;
    })
    .filter((o) => {
      if (!state.time.arrival) return true;
      const hour = new Date(o.segments[o.segments.length - 1].arrivalDateTime).getHours();
      return TIME_BUCKETS.find((b) => b.id === state.time.arrival)?.matchesHour(hour) ?? true;
    })
    .filter((o) => state.airlines.size === 0 || state.airlines.has(o.airlineName))
    .filter(
      (o) => state.layoverCities.size === 0 || getLayoverCities(o).some((city) => state.layoverCities.has(city))
    )
    .filter((o) => state.priceMax === null || o.totalAmount <= state.priceMax)
    .filter((o) => state.durationMax === null || getTotalDurationMinutes(o) <= state.durationMax);
}

type FilterTabId = 'popular' | 'stop' | 'baggage' | 'price' | 'time' | 'airline';
const FILTER_TABS: { id: FilterTabId; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'stop', label: 'Stop' },
  { id: 'baggage', label: 'Baggage' },
  { id: 'price', label: 'Price' },
  { id: 'time', label: 'Time' },
  { id: 'airline', label: 'Airline' },
];

const FilterScreen: React.FC<{
  visible: boolean;
  allOffers: FlightOffer[];
  currencyCode: string;
  originCity: string;
  destinationCity: string;
  availableAirlines: string[];
  applied: CombinedFilterState;
  onSave: (state: CombinedFilterState) => void;
  onClose: () => void;
}> = ({ visible, allOffers, currencyCode, originCity, destinationCity, availableAirlines, applied, onSave, onClose }) => {
  const [tab, setTab] = useState<FilterTabId>('popular');
  const [pending, setPending] = useState<CombinedFilterState>(applied);
  // @react-native-community/slider only reflects a new `value` prop on
  // mount — it doesn't visually re-sync after the user has dragged it, so
  // programmatic resets (Clear, reopening the sheet) need a fresh instance.
  const [sliderResetKey, setSliderResetKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setPending(applied);
      setTab('popular');
      setSliderResetKey((k) => k + 1);
    }
  }, [visible, applied]);

  const maxPricePossible = Math.max(1, ...allOffers.map((o) => o.totalAmount));
  const maxDurationPossible = Math.max(1, ...allOffers.map(getTotalDurationMinutes));
  const matchCount = applyCombinedFilters(allOffers, pending).length;
  const airlineCodeByName = Object.fromEntries(allOffers.map((o) => [o.airlineName, o.airlineCode]));

  const toggleStop = (id: StopBucketId) => {
    setPending((prev) => {
      const next = new Set(prev.stops);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, stops: next };
    });
  };

  const toggleAirline = (airline: string) => {
    setPending((prev) => {
      const next = new Set(prev.airlines);
      if (next.has(airline)) next.delete(airline);
      else next.add(airline);
      return { ...prev, airlines: next };
    });
  };

  const isPopularAllSelected = pending.stops.has('onestop') && pending.hideNonRefundable && pending.cabinCheckinBaggage;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalSheet, styles.filterScreenSheet]}>
          <View style={styles.filterScreenHeader}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <ArrowLeft size={20} color="#182339" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter</Text>
            <View style={{ width: 20 }} />
          </View>
          <Text style={styles.filterScreenResultCount}>
            {matchCount} out of {allOffers.length} results
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabBar}>
            {FILTER_TABS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.filterTabChip, tab === t.id && styles.filterTabChipActive]}
                onPress={() => setTab(t.id)}
              >
                <Text style={[styles.filterTabChipText, tab === t.id && styles.filterTabChipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.filterScreenBody}>
            {tab === 'popular' && (
              <>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() =>
                    setPending((prev) => ({
                      ...prev,
                      stops: isPopularAllSelected ? new Set() : new Set([...prev.stops, 'onestop']),
                      hideNonRefundable: !isPopularAllSelected,
                      cabinCheckinBaggage: !isPopularAllSelected,
                    }))
                  }
                >
                  <Text style={styles.checkRowLabel}>Select all Popular</Text>
                  <View style={[styles.checkbox, isPopularAllSelected && styles.checkboxChecked]}>
                    {isPopularAllSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkRow} onPress={() => toggleStop('onestop')}>
                  <Text style={styles.checkRowLabel}>1 Stop</Text>
                  <View style={[styles.checkbox, pending.stops.has('onestop') && styles.checkboxChecked]}>
                    {pending.stops.has('onestop') && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setPending((prev) => ({ ...prev, hideNonRefundable: !prev.hideNonRefundable }))}
                >
                  <Text style={styles.checkRowLabel}>Hide Non Refundable flight</Text>
                  <View style={[styles.checkbox, pending.hideNonRefundable && styles.checkboxChecked]}>
                    {pending.hideNonRefundable && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setPending((prev) => ({ ...prev, cabinCheckinBaggage: !prev.cabinCheckinBaggage }))}
                >
                  <Text style={styles.checkRowLabel}>Cabin + check-in baggage</Text>
                  <View style={[styles.checkbox, pending.cabinCheckinBaggage && styles.checkboxChecked]}>
                    {pending.cabinCheckinBaggage && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>

                <Text style={[styles.timeSectionLabel, styles.timeSectionLabelSpaced]}>Flight Duration</Text>
                <Slider
                  key={`duration-${sliderResetKey}`}
                  minimumValue={0}
                  maximumValue={maxDurationPossible}
                  value={pending.durationMax ?? maxDurationPossible}
                  onValueChange={(v) => setPending((prev) => ({ ...prev, durationMax: Math.round(v) }))}
                  minimumTrackTintColor="#7C1AEE"
                  maximumTrackTintColor="#ECEEF3"
                  thumbTintColor="#7C1AEE"
                />
                <Text style={styles.filterSliderValue}>
                  Up to {formatMinutesDuration(pending.durationMax ?? maxDurationPossible)}
                </Text>
              </>
            )}

            {tab === 'stop' && (
              <>
                <Text style={styles.timeSectionLabel}>Stops</Text>
                <View style={styles.timeBucketGrid}>
                  {STOP_BUCKETS.map((bucket) => (
                    <TimeBucketButton
                      key={bucket.id}
                      label={bucket.label}
                      price={cheapestForStopBucket(allOffers, bucket.id)}
                      currencyCode={currencyCode}
                      selected={pending.stops.has(bucket.id)}
                      onPress={() => toggleStop(bucket.id)}
                    />
                  ))}
                </View>
              </>
            )}

            {tab === 'baggage' && (
              <>
                <Text style={styles.timeSectionLabel}>Baggage</Text>
                <Text style={styles.filterBaggageNote}>
                  Not connected to real fare data yet — adjusting this doesn't change the results below.
                </Text>
                {(['Cabin baggage', 'Checked baggage'] as const).map((label) => (
                  <View key={label} style={styles.baggageStepperRow}>
                    <Text style={styles.checkRowLabel}>{label}</Text>
                    <View style={styles.baggageStepper}>
                      <View style={styles.baggageStepperButton}>
                        <Minus size={14} color="#697691" strokeWidth={2} />
                      </View>
                      <Text style={styles.baggageStepperValue}>0</Text>
                      <View style={styles.baggageStepperButton}>
                        <Plus size={14} color="#697691" strokeWidth={2} />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {tab === 'price' && (
              <>
                <Text style={styles.timeSectionLabel}>Price</Text>
                <Slider
                  key={`price-${sliderResetKey}`}
                  minimumValue={0}
                  maximumValue={maxPricePossible}
                  value={pending.priceMax ?? maxPricePossible}
                  onValueChange={(v) => setPending((prev) => ({ ...prev, priceMax: Math.round(v) }))}
                  minimumTrackTintColor="#7C1AEE"
                  maximumTrackTintColor="#ECEEF3"
                  thumbTintColor="#7C1AEE"
                />
                <Text style={styles.filterSliderValue}>
                  Up to {formatPrice(pending.priceMax ?? maxPricePossible, currencyCode)}
                </Text>
              </>
            )}

            {tab === 'time' && (
              <>
                <Text style={styles.timeSectionLabel}>Departure from {originCity}</Text>
                <View style={styles.timeBucketGrid}>
                  {TIME_BUCKETS.map((bucket) => (
                    <TimeBucketButton
                      key={bucket.id}
                      label={bucket.label}
                      price={cheapestInBucket(allOffers, bucket.id, 'departure')}
                      currencyCode={currencyCode}
                      selected={pending.time.departure === bucket.id}
                      onPress={() =>
                        setPending((prev) => ({
                          ...prev,
                          time: {
                            ...prev.time,
                            departure: prev.time.departure === bucket.id ? null : bucket.id,
                          },
                        }))
                      }
                    />
                  ))}
                </View>
                <Text style={[styles.timeSectionLabel, styles.timeSectionLabelSpaced]}>
                  Arrival at {destinationCity}
                </Text>
                <View style={styles.timeBucketGrid}>
                  {TIME_BUCKETS.map((bucket) => (
                    <TimeBucketButton
                      key={bucket.id}
                      label={bucket.label}
                      price={cheapestInBucket(allOffers, bucket.id, 'arrival')}
                      currencyCode={currencyCode}
                      selected={pending.time.arrival === bucket.id}
                      onPress={() =>
                        setPending((prev) => ({
                          ...prev,
                          time: {
                            ...prev.time,
                            arrival: prev.time.arrival === bucket.id ? null : bucket.id,
                          },
                        }))
                      }
                    />
                  ))}
                </View>
              </>
            )}

            {tab === 'airline' && (
              <>
                <Text style={styles.modalSectionLabel}>Airline</Text>
                {availableAirlines.map((airline) => {
                  const isChecked = pending.airlines.has(airline);
                  return (
                    <TouchableOpacity key={airline} style={styles.checkRow} onPress={() => toggleAirline(airline)}>
                      <View style={styles.checkRowLeft}>
                        <AirlineLogo
                          airlineCode={airlineCodeByName[airline] ?? ''}
                          size={20}
                          style={styles.checkRowLogoBadge}
                        />
                        <Text style={styles.checkRowLabel}>{airline}</Text>
                      </View>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>

          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalActionButtonClose]}
              onPress={() => {
                setPending({
                  stops: new Set(),
                  hideNonRefundable: false,
                  cabinCheckinBaggage: false,
                  airlines: new Set(),
                  layoverCities: new Set(),
                  time: { departure: null, arrival: null },
                  priceMax: null,
                  durationMax: null,
                });
                setSliderResetKey((k) => k + 1);
              }}
            >
              <Text style={styles.modalCloseButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalActionButtonSave]}
              onPress={() => onSave(pending)}
            >
              <Text style={styles.modalSaveButtonText}>Show {matchCount} Flights</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Flyshop's search response only gives an airline code/name, no logo. Known
// Indian carriers use their real, current brand mark bundled locally (see
// airlineLogos.ts) so they stay accurate even after a rebrand (e.g. Air
// India's 2023 identity) and don't depend on a third party being up. Any
// other airline code falls back to this CDN, keyed by IATA code, and finally
// to the generic plane badge if that also fails.
function airlineLogoUri(airlineCode: string): string {
  return `https://pics.avs.io/200/200/${airlineCode}.png`;
}

export const AirlineLogo: React.FC<{
  airlineCode: string;
  size: number;
  // Shared between an Image/Svg and a View fallback with different style prop
  // types — kept loose rather than fighting StyleProp<ImageStyle | ViewStyle>.
  style?: any;
}> = ({ airlineCode, size, style }) => {
  const [failed, setFailed] = useState(false);
  const localLogoXml = AIRLINE_LOGO_XML[airlineCode];

  if (localLogoXml) {
    return (
      <View
        style={[
          { width: size, height: size, borderRadius: 4, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
          style,
        ]}
      >
        <SvgXml xml={localLogoXml} width="82%" height="82%" />
      </View>
    );
  }

  if (failed || !airlineCode) {
    return (
      <View style={[styles.airlineLogoBadge, { width: size, height: size, borderRadius: 4 }, style]}>
        <Plane size={size * 0.6} color="#FFFFFF" strokeWidth={2} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: airlineLogoUri(airlineCode) }}
      style={[{ width: size, height: size, borderRadius: 4, backgroundColor: '#FFFFFF' }, style]}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
};

type FeaturedVariant = 'bestValue' | 'cheapest' | 'fastest';

// Colors and labels taken from the "Serach card" component in Figma (Phone Dev
// page): each featured variant has a matching 1px card border and a rotated-text
// side strip in the same color; non-featured cards use a plain gray border with
// no strip.
const VARIANT_CONFIG: Record<FeaturedVariant, { color: string; label: string }> = {
  bestValue: { color: '#7C1AEE', label: 'Best Value' },
  cheapest: { color: '#007F20', label: 'Cheapest' },
  fastest: { color: '#114BFF', label: 'Fastest' },
};

const GENERAL_BORDER_COLOR = '#99A6C0';

const FlightOfferCard: React.FC<{ offer: FlightOffer; variant?: FeaturedVariant; onPress: () => void }> = ({
  offer,
  variant,
  onPress,
}) => {
  const config = variant ? VARIANT_CONFIG[variant] : null;
  const borderColor = config?.color ?? GENERAL_BORDER_COLOR;

  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];
  const stopCount = offer.segments.length - 1;
  const arrivalDayOffset = dayOffset(first.departureDateTime, last.arrivalDateTime);
  const flightNumbers = offer.segments.map((s) => `${s.airlineCode}${s.flightNumber}`).join(', ');

  // Only the first connection is shown, matching the Figma reference — it
  // doesn't define a pattern for surfacing every layover on a 2+ stop
  // itinerary, and stacking them all would need its own design pass.
  const firstLayover =
    stopCount > 0
      ? {
          duration: formatTotalDuration(first.arrivalDateTime, offer.segments[1].departureDateTime),
          city: findAirportByCode(first.destination)?.city ?? first.destination,
        }
      : null;

  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.card, { borderColor }]} onPress={onPress}>
      {config && (
        <View style={[styles.strip, { backgroundColor: config.color }]}>
          <Text style={styles.stripText}>{config.label}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={styles.airlineNameRow}>
            <AirlineLogo airlineCode={offer.airlineCode} size={24} />
            <Text style={styles.airlineName}>{offer.airlineName}</Text>
            <Text style={styles.flightNumbersText}>{flightNumbers}</Text>
          </View>
          <Text style={styles.priceText}>{formatPrice(offer.totalAmount, offer.currencyCode)}</Text>
        </View>

        <View style={styles.journeyRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeText}>{formatTime(first.departureDateTime)}</Text>
            <Text style={styles.codeText}>{first.origin}</Text>
          </View>
          <View style={styles.durationBlock}>
            <Text style={styles.durationText}>
              {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}
            </Text>
            <View style={styles.durationLine} />
            <Text style={styles.stopsText}>{stopsLabel(stopCount)}</Text>
          </View>
          <View style={[styles.timeBlock, styles.timeBlockEnd]}>
            <Text style={styles.timeText}>
              {formatTime(last.arrivalDateTime)}
              {arrivalDayOffset > 0 && <Text style={styles.dayOffsetText}>+{arrivalDayOffset}</Text>}
            </Text>
            <Text style={styles.codeText}>{last.destination}</Text>
          </View>
        </View>

        <View style={styles.dashedDivider} />

        <View style={styles.bottomRow}>
          {firstLayover ? (
            <View style={styles.layoverRow}>
              <Text style={styles.layoverText}>
                {firstLayover.duration} Layover at {firstLayover.city}
              </Text>
              <Info size={12} color="#697691" strokeWidth={2} />
            </View>
          ) : (
            <View />
          )}
          <TouchableOpacity style={styles.moreLink} onPress={onPress}>
            <Text style={styles.moreLinkText}>More</Text>
            <ChevronDown size={14} color="#7C1AEE" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// One direction's summary row inside a combined round-trip card — reused for
// both the onward and return blocks since they're laid out identically, just
// with a different direction label on the right.
const CombinedLegRow: React.FC<{ offer: FlightOffer; label: string }> = ({ offer, label }) => {
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];
  const stopCount = offer.segments.length - 1;
  const arrivalDayOffset = dayOffset(first.departureDateTime, last.arrivalDateTime);

  return (
    <View style={styles.combinedLegRow}>
      <View style={styles.combinedLegTopRow}>
        <View style={styles.airlineNameRow}>
          <AirlineLogo airlineCode={offer.airlineCode} size={20} />
          <Text style={styles.combinedLegAirlineName}>{offer.airlineName}</Text>
        </View>
        <Text style={styles.combinedLegLabel}>{label}</Text>
      </View>

      <View style={styles.journeyRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeText}>{formatTime(first.departureDateTime)}</Text>
          <Text style={styles.codeText}>{first.origin}</Text>
        </View>
        <View style={styles.durationBlock}>
          <Text style={styles.durationText}>
            {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}
          </Text>
          <View style={styles.durationLine} />
          <Text style={styles.stopsText}>{stopsLabel(stopCount)}</Text>
        </View>
        <View style={[styles.timeBlock, styles.timeBlockEnd]}>
          <Text style={styles.timeText}>
            {formatTime(last.arrivalDateTime)}
            {arrivalDayOffset > 0 && <Text style={styles.dayOffsetText}>+{arrivalDayOffset}</Text>}
          </Text>
          <Text style={styles.codeText}>{last.destination}</Text>
        </View>
      </View>
    </View>
  );
};

// The "Combine Flights" tab's list card: one onward leg + one return leg
// stacked in a single card with one combined price, matching the Figma
// "Round combine" reference. Tapping it opens FlightDetailsModal with both
// offers so the Onward/Return tabs there each show only their own segments.
const CombinedFlightOfferCard: React.FC<{
  pair: CombinedRoundTripOffer;
  variant?: FeaturedVariant;
  onPress: () => void;
}> = ({ pair, variant, onPress }) => {
  const config = variant ? VARIANT_CONFIG[variant] : null;
  const borderColor = config?.color ?? GENERAL_BORDER_COLOR;

  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.card, { borderColor }]} onPress={onPress}>
      {config && (
        <View style={[styles.strip, { backgroundColor: config.color }]}>
          <Text style={styles.stripText}>{config.label}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <CombinedLegRow offer={pair.onward} label="Onward" />
        <View style={styles.dashedDivider} />
        <CombinedLegRow offer={pair.returnOffer} label="Return" />
        <View style={styles.combinedPriceRow}>
          <Text style={styles.priceText}>{formatPrice(pair.totalAmount, pair.currencyCode)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Splits a multi-city "Combine Flights" offer's flat, concatenated segment
// list back into one group per requested leg. Flyshop bundles every leg into
// a single priced offer (Booking_Type=2), so there's no per-leg boundary in
// the data itself — this recovers it by matching each segment's destination
// against the request's own leg destinations, in order, so a leg with its
// own intermediate stop still ends up as one group.
function splitSegmentsByLegs(
  segments: FlightOfferSegment[],
  legs: FlightSearchSegment[]
): FlightOfferSegment[][] {
  const groups: FlightOfferSegment[][] = [];
  let current: FlightOfferSegment[] = [];
  let legIndex = 0;

  for (const segment of segments) {
    current.push(segment);
    if (legIndex < legs.length - 1 && segment.destination === legs[legIndex].destination) {
      groups.push(current);
      current = [];
      legIndex++;
    }
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

// "Trip-1 | Indigo, Akasa" in the Figma "Multicity" reference — every
// distinct airline actually flown on that leg, in flight order.
function airlinesForSegments(segments: FlightOfferSegment[]): string {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const segment of segments) {
    const name = segment.airlineName || segment.airlineCode;
    if (name && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names.join(', ');
}

// One requested leg's row inside a multi-city "Combine Flights" package card
// — the same journey layout as CombinedLegRow (times, duration, stops,
// layover), headed by "Trip-N | <airlines>" instead of an airline logo plus
// an Onward/Return label, matching the Figma "Multicity" reference.
const MultiCityTripRow: React.FC<{ segments: FlightOfferSegment[]; tripLabel: string }> = ({
  segments,
  tripLabel,
}) => {
  const first = segments[0];
  const last = segments[segments.length - 1];
  const stopCount = segments.length - 1;
  const arrivalDayOffset = dayOffset(first.departureDateTime, last.arrivalDateTime);
  const airlines = airlinesForSegments(segments);
  const firstLayover =
    stopCount > 0
      ? {
          duration: formatTotalDuration(first.arrivalDateTime, segments[1].departureDateTime),
          city: findAirportByCode(first.destination)?.city ?? first.destination,
        }
      : null;

  return (
    <View style={styles.combinedLegRow}>
      <Text style={[styles.combinedLegAirlineName, styles.multiCityTripLabel]}>
        {tripLabel}
        {airlines ? ` | ${airlines}` : ''}
      </Text>

      <View style={styles.journeyRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeText}>{formatTime(first.departureDateTime)}</Text>
          <Text style={styles.codeText}>{first.origin}</Text>
        </View>
        <View style={styles.durationBlock}>
          <Text style={styles.durationText}>
            {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}
          </Text>
          <View style={styles.durationLine} />
          <Text style={styles.stopsText}>{stopsLabel(stopCount)}</Text>
        </View>
        <View style={[styles.timeBlock, styles.timeBlockEnd]}>
          <Text style={styles.timeText}>
            {formatTime(last.arrivalDateTime)}
            {arrivalDayOffset > 0 && <Text style={styles.dayOffsetText}>+{arrivalDayOffset}</Text>}
          </Text>
          <Text style={styles.codeText}>{last.destination}</Text>
        </View>
      </View>

      {firstLayover && (
        <View style={styles.layoverRow}>
          <Text style={styles.layoverText}>
            {firstLayover.duration} Layover at {firstLayover.city}
          </Text>
          <Info size={12} color="#697691" strokeWidth={2} />
        </View>
      )}
    </View>
  );
};

// The "Combine Flights" tab's multi-city package card: every requested leg
// stacked in one card under one combined price, matching the Figma
// "Multicity" reference's "Trip-1 / Trip-2 / Trip-3" layout. Unlike
// round-trip's pairing, there's nothing to pair here — Flyshop already
// bundles every leg into this one priced offer — so this only needs to
// re-split its segments back into per-leg rows.
const MultiCityCombinedOfferCard: React.FC<{
  offer: FlightOffer;
  legs: FlightSearchSegment[];
  variant?: FeaturedVariant;
  onPress: () => void;
}> = ({ offer, legs, variant, onPress }) => {
  const config = variant ? VARIANT_CONFIG[variant] : null;
  const borderColor = config?.color ?? GENERAL_BORDER_COLOR;
  const legGroups = splitSegmentsByLegs(offer.segments, legs);

  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.card, { borderColor }]} onPress={onPress}>
      {config && (
        <View style={[styles.strip, { backgroundColor: config.color }]}>
          <Text style={styles.stripText}>{config.label}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        {legGroups.map((segments, index) => (
          <React.Fragment key={index}>
            {index > 0 && <View style={styles.dashedDivider} />}
            <MultiCityTripRow segments={segments} tripLabel={`Trip-${index + 1}`} />
          </React.Fragment>
        ))}
        <View style={styles.combinedPriceRow}>
          <Text style={styles.priceText}>{formatPrice(offer.totalAmount, offer.currencyCode)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Tapping a card or its "More" link opens this. Fare tiers come straight from
// Flyshop's own Air_Search response (FlightOffer.fares) — every fare the
// supplier returned for this flight, not just the cheapest one shown on the
// card. There's no consumer-friendly tier name in that data (no "Saver" /
// "Flexi" branding, just an airline booking-class code), so tiers are
// labelled by their real differentiator — checked-baggage allowance — instead
// of inventing names the data doesn't support. Selecting a fare here is local
// UI state only: there's no booking/reprice flow built yet for Continue to
// hand off to, so it just closes the modal.
// A fare selection is local to one leg (one offer) — a round-trip view keeps
// one of these per leg so picking Economy for the return doesn't reset an
// already-chosen Business tier for the onward.
interface FareSelection {
  tier: CabinTierId | null;
  fareId: string | null;
}

function cheapestFareSelection(offer: FlightOffer | null): FareSelection {
  const cheapest = offer ? [...(offer.fares ?? [])].sort((a, b) => a.totalAmount - b.totalAmount)[0] : undefined;
  return { tier: cheapest ? cabinTierForFare(cheapest) : null, fareId: cheapest?.fareId ?? null };
}

function resolveSelectedFare(offer: FlightOffer | null, selection: FareSelection): FareOption | undefined {
  if (!offer) return undefined;
  const inTier = (offer.fares ?? [])
    .filter((f) => cabinTierForFare(f) === selection.tier)
    .sort((a, b) => a.totalAmount - b.totalAmount);
  return inTier.find((f) => f.fareId === selection.fareId) ?? inTier[0];
}

const FlightDetailsModal: React.FC<{
  visible: boolean;
  // One offer = a plain single-flight preview, no tabs (one-way/multi-city
  // step preview/"Combine Flights" isn't used here). 2+ offers = a
  // multi-leg review (round-trip's Onward/Return, or multi-city's Flight 1,
  // Flight 2, ...) — tabs appear, each showing only that leg's own segments,
  // and the footer sums every leg's selected fare into one total.
  legs: FlightOffer[];
  // Tab labels, parallel to legs — only rendered/used when legs.length > 1.
  legLabels?: string[];
  passengerCount: number;
  onClose: () => void;
  // The footer's Continue button always calls this instead of onClose — for
  // a step preview (round-trip "Individual Flights" / multi-city's Flight N)
  // it means "select this leg"; on the last step it hands off to Traveller
  // details instead of just dismissing the modal.
  onContinue?: () => void;
  // Overrides the footer button's label — used alongside onContinue so a
  // step preview reads "Select Return Flight" / "Select Flight 3" instead of
  // "Continue".
  continueLabel?: string;
}> = ({ visible, legs, legLabels, passengerCount, onClose, onContinue, continueLabel = 'Continue' }) => {
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [legSelections, setLegSelections] = useState<FareSelection[]>([]);

  useEffect(() => {
    if (visible) {
      setActiveLegIndex(0);
      setLegSelections(legs.map((leg) => cheapestFareSelection(leg)));
    }
    // legs is a fresh array/object identity on every open by construction
    // (built at the call site right before setDetailsOffer et al.), so this
    // only needs to re-run when the modal opens, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (legs.length === 0) return null;

  const isMultiLegView = legs.length > 1;
  const activeOffer = legs[Math.min(activeLegIndex, legs.length - 1)];
  const activeSelection = legSelections[activeLegIndex] ?? { tier: null, fareId: null };
  const setActiveSelection = (next: FareSelection | ((prev: FareSelection) => FareSelection)) => {
    setLegSelections((prev) => {
      const updated = [...prev];
      const current = updated[activeLegIndex] ?? { tier: null, fareId: null };
      updated[activeLegIndex] = typeof next === 'function' ? (next as (p: FareSelection) => FareSelection)(current) : next;
      return updated;
    });
  };

  const first = activeOffer.segments[0];
  const last = activeOffer.segments[activeOffer.segments.length - 1];
  const allFares = activeOffer.fares ?? [];

  const tierSummaries = CABIN_TIER_ORDER.map((tier) => {
    const faresInTier = allFares.filter((f) => cabinTierForFare(f) === tier);
    const cheapestInTier = faresInTier.reduce<FareOption | null>(
      (min, f) => (min === null || f.totalAmount < min.totalAmount ? f : min),
      null
    );
    return { tier, cheapestInTier };
  }).filter((t) => t.cheapestInTier !== null);

  const sortedFares = allFares
    .filter((f) => cabinTierForFare(f) === activeSelection.tier)
    .sort((a, b) => a.totalAmount - b.totalAmount);
  const selectedFare = sortedFares.find((f) => f.fareId === activeSelection.fareId) ?? sortedFares[0];

  const perLegSelectedFares = legs.map((leg, i) => resolveSelectedFare(leg, legSelections[i] ?? { tier: null, fareId: null }));
  const footerAmount = isMultiLegView
    ? perLegSelectedFares.reduce((sum, fare) => sum + (fare?.totalAmount ?? 0), 0)
    : selectedFare?.totalAmount;
  const footerCurrency = selectedFare?.currencyCode ?? activeOffer.currencyCode;
  // Every leg must have a fare selected for a combined total to mean
  // anything — a leg with no fares at all leaves part of the sum missing.
  const footerReady = isMultiLegView ? perLegSelectedFares.every((fare) => fare !== undefined) : !!selectedFare;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalSheet, styles.filterScreenSheet]}>
          <View style={styles.filterScreenHeader}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color="#182339" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Flight details</Text>
            <View style={{ width: 20 }} />
          </View>

          {isMultiLegView && (
            <View style={styles.detailsLegTabRow}>
              {legs.map((_, index) => {
                const isActive = index === activeLegIndex;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.detailsLegTab, isActive && styles.detailsLegTabActive]}
                    onPress={() => setActiveLegIndex(index)}
                  >
                    <Text style={[styles.detailsLegTabText, isActive && styles.detailsLegTabTextActive]}>
                      {legLabels?.[index] ?? `Flight ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <ScrollView style={styles.filterScreenBody}>
            <View style={styles.detailsRouteCard}>
              <View style={styles.detailsRouteHeader}>
                <Text style={styles.detailsRouteHeaderText}>
                  {airportForCode(first.origin).city} <ArrowLeftRight size={12} color="#FFFFFF" strokeWidth={2} />{' '}
                  {airportForCode(last.destination).city}
                </Text>
                <Text style={styles.detailsRouteHeaderDuration}>
                  {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}
                </Text>
              </View>

              {activeOffer.segments.map((segment, index) => (
                <React.Fragment key={`${segment.airlineCode}${segment.flightNumber}-${index}`}>
                  <View style={styles.detailsSegmentBlock}>
                    <View style={styles.detailsSegmentLeftCol}>
                      <View style={styles.detailsSegmentTimeSlot}>
                        <Text style={styles.detailsSegmentTime} numberOfLines={1}>{formatTime24(segment.departureDateTime)}</Text>
                        <Text style={styles.detailsSegmentDate}>{formatWeekdayDate(segment.departureDateTime)}</Text>
                      </View>
                      <View style={[styles.detailsDurationSlot, styles.detailsDurationSlotCentered]}>
                        <Text style={styles.detailsDurationText}>
                          {formatTotalDuration(segment.departureDateTime, segment.arrivalDateTime)}
                        </Text>
                      </View>
                      <View style={styles.detailsSegmentTimeSlot}>
                        <Text style={styles.detailsSegmentTime} numberOfLines={1}>{formatTime24(segment.arrivalDateTime)}</Text>
                        <Text style={styles.detailsSegmentDate}>{formatWeekdayDate(segment.arrivalDateTime)}</Text>
                      </View>
                    </View>

                    <View style={styles.detailsRailCol}>
                      <View style={styles.detailsRailDot} />
                      <View style={styles.detailsRailLineHalf} />
                      <MaterialIcons name="flight" size={22} color="#182339" style={styles.detailsRailPlaneIcon} />
                      <View style={styles.detailsRailLineHalf} />
                      <View style={styles.detailsRailDot} />
                    </View>

                    <View style={styles.detailsSegmentRightCol}>
                      <View style={styles.detailsSegmentCitySlot}>
                        <Text style={styles.detailsSegmentCity}>
                          {airportForCode(segment.origin).city} · {segment.origin}
                        </Text>
                        <Text style={styles.detailsSegmentAirportName}>{airportForCode(segment.origin).name}</Text>
                      </View>

                      <View style={styles.detailsDurationRow}>
                        <View style={styles.detailsCarrierBadge}>
                          <AirlineLogo airlineCode={segment.airlineCode} size={24} style={styles.detailsCarrierLogo} />
                          <Text style={styles.detailsCarrierName}>{activeOffer.airlineName}</Text>
                        </View>
                      </View>

                      <View style={styles.detailsSegmentCitySlot}>
                        <Text style={styles.detailsSegmentCity}>
                          {airportForCode(segment.destination).city} · {segment.destination}
                        </Text>
                        <Text style={styles.detailsSegmentAirportName}>
                          {airportForCode(segment.destination).name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {index < activeOffer.segments.length - 1 && (
                    <View style={styles.detailsLayoverRow}>
                      <Info size={12} color="#697691" strokeWidth={2} />
                      <Text style={styles.detailsLayoverText}>
                        {formatTotalDuration(segment.arrivalDateTime, activeOffer.segments[index + 1].departureDateTime)}{' '}
                        Layover at {airportForCode(segment.destination).city}
                      </Text>
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>

            <Text style={[styles.modalSectionLabel, styles.detailsFareSectionLabel]}>Select Your Fare</Text>

            <View style={styles.cabinTierRow}>
              {tierSummaries.map(({ tier, cheapestInTier }) => {
                const isSelected = tier === activeSelection.tier;
                return (
                  <TouchableOpacity
                    key={tier}
                    style={[styles.cabinTierCard, isSelected && styles.cabinTierCardSelected]}
                    onPress={() => setActiveSelection({ tier, fareId: cheapestInTier?.fareId ?? null })}
                  >
                    <Text style={[styles.cabinTierLabel, isSelected && styles.cabinTierLabelSelected]}>
                      {CABIN_TIER_LABELS[tier]}
                    </Text>
                    <Text style={styles.cabinTierPrice}>
                      From {formatPrice(cheapestInTier!.totalAmount, cheapestInTier!.currencyCode)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {sortedFares.map((fare) => {
              const isSelected = fare.fareId === selectedFare?.fareId;
              return (
                <TouchableOpacity
                  key={fare.fareId}
                  style={[styles.fareCard, isSelected && styles.fareCardSelected]}
                  onPress={() => setActiveSelection((prev) => ({ ...prev, fareId: fare.fareId }))}
                >
                  <View style={styles.fareCardTopRow}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.fareCardPrice}>{formatPrice(fare.totalAmount, fare.currencyCode)}/adult</Text>
                    <Text style={fare.refundable ? styles.fareCardRefundable : styles.fareCardNonRefundable}>
                      {fare.refundable ? 'Refundable' : 'Non-refundable'}
                    </Text>
                  </View>
                  {(fare.checkInBaggage || fare.handBaggage) && (
                    <Text style={styles.fareCardBaggage}>
                      {fare.checkInBaggage ? `${fare.checkInBaggage} check-in` : 'No check-in baggage'}
                      {fare.handBaggage ? ` · ${fare.handBaggage} hand baggage` : ''}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.detailsFooter}>
            <View>
              <Text style={styles.detailsFooterPrice}>
                {footerReady ? `${formatPrice(footerAmount!, footerCurrency)}/adult` : '--'}
              </Text>
              <Text style={styles.detailsFooterTravellerCount}>
                for {passengerCount} Traveller{passengerCount > 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.detailsContinueButton} onPress={onContinue ?? onClose}>
              <Text style={styles.detailsContinueButtonText}>{continueLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Matches Figma's filter/sort bar below the fare calendar. All six chips are
// now wired to real filtering/sorting/state — "Filter" opens the combined
// multi-tab screen, the rest are quick single-purpose shortcuts into the
// same underlying filter state.
const FilterBar: React.FC<{
  onFilterPress: () => void;
  filterActive: boolean;
  nonStopOnly: boolean;
  onToggleNonStop: () => void;
  onSortPress: () => void;
  sortActive: boolean;
  onAirlinePress: () => void;
  airlineActive: boolean;
  onLayoverPress: () => void;
  layoverActive: boolean;
  onTimePress: () => void;
  timeActive: boolean;
}> = ({
  onFilterPress,
  filterActive,
  nonStopOnly,
  onToggleNonStop,
  onSortPress,
  sortActive,
  onAirlinePress,
  airlineActive,
  onLayoverPress,
  layoverActive,
  onTimePress,
  timeActive,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.filterBar}
    contentContainerStyle={styles.filterBarContent}
  >
    <TouchableOpacity
      style={[styles.filterChip, filterActive && styles.filterChipActive]}
      onPress={onFilterPress}
    >
      <ListFilter size={14} color={filterActive ? '#7C1AEE' : '#3E4B64'} strokeWidth={2} />
      <Text style={[styles.filterChipText, filterActive && styles.filterChipTextActive]}>Filter</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.filterChip, sortActive && styles.filterChipActive]}
      onPress={onSortPress}
    >
      <Text style={[styles.filterChipText, sortActive && styles.filterChipTextActive]}>Sort by</Text>
      <ChevronDown size={14} color={sortActive ? '#7C1AEE' : '#3E4B64'} strokeWidth={2} />
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.filterChip, nonStopOnly && styles.filterChipActive]}
      onPress={onToggleNonStop}
    >
      <Text style={[styles.filterChipText, nonStopOnly && styles.filterChipTextActive]}>Non stop</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.filterChip}>
      <Text style={styles.filterChipText}>Bags</Text>
      <ChevronDown size={14} color="#3E4B64" strokeWidth={2} />
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.filterChip, airlineActive && styles.filterChipActive]}
      onPress={onAirlinePress}
    >
      <Text style={[styles.filterChipText, airlineActive && styles.filterChipTextActive]}>Airline</Text>
      <ChevronDown size={14} color={airlineActive ? '#7C1AEE' : '#3E4B64'} strokeWidth={2} />
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.filterChip, layoverActive && styles.filterChipActive]}
      onPress={onLayoverPress}
    >
      <Text style={[styles.filterChipText, layoverActive && styles.filterChipTextActive]}>Layover</Text>
      <ChevronDown size={14} color={layoverActive ? '#7C1AEE' : '#3E4B64'} strokeWidth={2} />
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.filterChip, timeActive && styles.filterChipActive]}
      onPress={onTimePress}
    >
      <Text style={[styles.filterChipText, timeActive && styles.filterChipTextActive]}>Time</Text>
      <ChevronDown size={14} color={timeActive ? '#7C1AEE' : '#3E4B64'} strokeWidth={2} />
    </TouchableOpacity>
  </ScrollView>
);

const EMPTY_COMBINED_FILTERS: CombinedFilterState = {
  stops: new Set(),
  hideNonRefundable: false,
  cabinCheckinBaggage: false,
  airlines: new Set(),
  layoverCities: new Set(),
  time: { departure: null, arrival: null },
  priceMax: null,
  durationMax: null,
};

type RoundTripView = 'individual' | 'combine';

// The Figma reference's "Individual Flights | Combine Flights" pill toggle —
// only shown for a round-trip search. "Individual" walks onward-then-return
// as two separate picks; "Combine" pairs them into one priced card up front.
const RoundTripViewTabs: React.FC<{ active: RoundTripView; onChange: (view: RoundTripView) => void }> = ({
  active,
  onChange,
}) => (
  <View style={styles.roundTripTabRow}>
    <TouchableOpacity
      style={[styles.roundTripTab, active === 'individual' && styles.roundTripTabActive]}
      onPress={() => onChange('individual')}
    >
      <Text style={[styles.roundTripTabText, active === 'individual' && styles.roundTripTabTextActive]}>
        Individual Flights
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.roundTripTab, active === 'combine' && styles.roundTripTabActive]}
      onPress={() => onChange('combine')}
    >
      <Text style={[styles.roundTripTabText, active === 'combine' && styles.roundTripTabTextActive]}>
        Combine Flights
      </Text>
    </TouchableOpacity>
  </View>
);

// A compact summary of an already-picked leg, sitting above the next leg's
// list, with a way back to re-pick it — round-trip's step 2 shows one of
// these for the onward leg; multi-city shows one per leg already chosen
// (Flight 1, Flight 2, ...) above whichever leg's list is currently shown.
const LegSelectionBar: React.FC<{ offer: FlightOffer; label: string; onChange: () => void }> = ({
  offer,
  label,
  onChange,
}) => {
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];

  return (
    <View style={styles.onwardSelectionBar}>
      <View style={styles.onwardSelectionHeaderRow}>
        <Text style={styles.onwardSelectionTitle}>
          {label} from {first.origin} - {last.destination}
        </Text>
        <TouchableOpacity onPress={onChange}>
          <Text style={styles.onwardSelectionChangeText}>Change</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.onwardSelectionSummaryRow}>
        <AirlineLogo airlineCode={offer.airlineCode} size={18} />
        <Text style={styles.onwardSelectionAirline}>{offer.airlineName}</Text>
        <Text style={styles.onwardSelectionTimes}>
          {formatTime(first.departureDateTime)} - {formatTime(last.arrivalDateTime)}
        </Text>
      </View>
    </View>
  );
};

interface FlightResultsScreenProps {
  offers: FlightOffer[];
  summary: FlightSearchSummary | null;
  onBack: () => void;
  // Fired when the fare-review modal's Continue is tapped on its last step —
  // every leg the trip needs has a chosen offer at that point, matching the
  // Figma "Traveller details" step this hands off to.
  onContinueToTravelerDetails: (legs: FlightOffer[], legLabels: string[] | undefined, passengerCount: number) => void;
}

export const FlightResultsScreen: React.FC<FlightResultsScreenProps> = ({
  offers,
  summary,
  onBack,
  onContinueToTravelerDetails,
}) => {
  const [activeOffers, setActiveOffers] = useState(offers);
  const [activeSummary, setActiveSummary] = useState(summary);
  const [editVisible, setEditVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [activeSortId, setActiveSortId] = useState<SortOptionId | null>(null);
  const [airlineModalVisible, setAirlineModalVisible] = useState(false);
  const [layoverModalVisible, setLayoverModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [filterScreenVisible, setFilterScreenVisible] = useState(false);
  // legs.length === 1 is an ordinary single-offer preview; 2+ turns on the
  // modal's per-leg tabs (round-trip's Onward/Return, multi-city's Flight 1,
  // Flight 2, ...), each showing only that leg's own segments.
  const [detailsLegs, setDetailsLegs] = useState<FlightOffer[]>([]);
  const [detailsLegLabels, setDetailsLegLabels] = useState<string[] | undefined>(undefined);
  // Everything the "Filter" screen's tabs and the individual quick-access
  // chips (Non stop, Airline, Time) both read and write — one shared source
  // of truth so either path stays in sync with the other.
  const [combinedFilters, setCombinedFilters] = useState<CombinedFilterState>(EMPTY_COMBINED_FILTERS);
  const [roundTripView, setRoundTripView] = useState<RoundTripView>('individual');
  // The sequential-pick flow ("Individual Flights" for round-trip, or the
  // only flow multi-city has): each leg picked so far, in order. Length 0
  // means still choosing the first leg; once a leg's list is exhausted here,
  // the next leg's list is shown, with a LegSelectionBar per entry above it.
  const [selectedLegOffers, setSelectedLegOffers] = useState<FlightOffer[]>([]);
  // Multi-city's own search (Booking_Type 2) only returns pre-bundled whole
  // itineraries for "Combine Flights" — Flyshop has no way to ask for one
  // leg's alternatives on its own. "Individual Flights" gets those by firing
  // a separate one-way search per leg instead, lazily as each leg is reached.
  // undefined = not fetched yet; an array (possibly empty) = fetched.
  const [individualLegOffers, setIndividualLegOffers] = useState<(FlightOffer[] | undefined)[]>([]);
  const searchFlights = useSearchFlightsMobile();

  // A fresh search from the form (offers/summary prop identity changes) always
  // wins over whatever date the strip had locally selected, and starts the
  // multi-leg flow over from its first step.
  useEffect(() => {
    setActiveOffers(offers);
    setActiveSummary(summary);
    setRoundTripView('individual');
    setSelectedLegOffers([]);
    setIndividualLegOffers([]);
    setCombinedFilters(EMPTY_COMBINED_FILTERS);
    setActiveSortId(null);
  }, [offers, summary]);

  // findAirportByCode (used for layover-city names and the route header) is
  // cache-backed, not a hardcoded list — prime it with every code appearing
  // anywhere in this search's results in one batched fetch, rather than one
  // request per code.
  const offerCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const offer of activeOffers) {
      for (const segment of offer.segments) {
        codes.add(segment.origin);
        codes.add(segment.destination);
      }
    }
    if (activeSummary) {
      codes.add(activeSummary.originCode);
      codes.add(activeSummary.destinationCode);
    }
    return Array.from(codes);
  }, [activeOffers, activeSummary]);

  const { data: resolvedAirports } = useAirportsByCodesMobile(offerCodes);

  useEffect(() => {
    if (resolvedAirports) {
      primeAirportCache(resolvedAirports);
    }
  }, [resolvedAirports]);

  const handleSelectDate = async (iso: string) => {
    if (!activeSummary) return;

    const nextSegments = activeSummary.request.segments.map((segment, index) =>
      index === 0 ? { ...segment, travelDate: iso } : segment
    );
    const nextRequest = { ...activeSummary.request, segments: nextSegments };

    try {
      const response = await searchFlights.mutateAsync(nextRequest);
      setActiveOffers(response.offers);
      setActiveSummary({ ...activeSummary, request: nextRequest, departureDate: iso });
    } catch {
      // Keep showing the previous results — the strip itself has no error UI,
      // so a failed re-search is a silent no-op rather than a jarring blank state.
    }
  };

  // Round-trip's own search (Booking_Type 1) already returns one flat list
  // tagged by leg (see FlightOffer.tripLegIndex) — split it back into one
  // list per leg here. Multi-city's search (Booking_Type 2) is different: it
  // only returns pre-bundled whole itineraries for "Combine Flights"; its
  // "Individual Flights" per-leg lists come from separate one-way searches
  // (individualLegOffers) fired below instead.
  const isRoundTrip = activeSummary?.request.tripType === 'RoundTrip';
  const isMultiCity = activeSummary?.request.tripType === 'MultiCity';
  const isMultiLeg = isRoundTrip || isMultiCity;
  const legCount = isMultiCity ? activeSummary?.request.segments.length ?? 1 : isRoundTrip ? 2 : 1;
  const legOffers = isRoundTrip
    ? Array.from({ length: legCount }, (_, i) => activeOffers.filter((o) => o.tripLegIndex === i))
    : isMultiCity
      ? Array.from({ length: legCount }, (_, i) => individualLegOffers[i] ?? [])
      : [activeOffers];
  const onwardOffers = legOffers[0] ?? [];
  const returnOffers = legOffers[1] ?? [];

  // The sequential pick flow — round-trip's "Individual Flights", or
  // multi-city's own "Individual Flights": which leg's list is currently
  // shown (the first one not yet in selectedLegOffers), and whether picking
  // a flight from it means "review + open the final multi-leg tabs" (the
  // last leg) or "review + advance to the next leg's list" (every other leg).
  const currentLegIndex = Math.min(selectedLegOffers.length, legCount - 1);
  const isLastLeg = currentLegIndex >= legCount - 1;
  const currentLegLoading =
    isMultiCity && roundTripView === 'individual' && individualLegOffers[currentLegIndex] === undefined;
  // Round-trip keeps its established Onward/Return wording; multi-city (and
  // any other N-leg case) numbers each added route as Flight 1, Flight 2, ...
  const legTabLabel = (index: number) => (isRoundTrip ? (index === 0 ? 'Onward' : 'Return') : `Flight ${index + 1}`);
  const legBarLabel = (index: number) => (isRoundTrip ? 'Onward flight' : `Flight ${index + 1}`);
  const usingSequentialFlow = isMultiLeg && roundTripView === 'individual';

  // Fires the one-way search for whichever multi-city leg is currently being
  // picked, once, the first time that leg is reached — round-trip needs no
  // equivalent since its own search already covers both legs.
  useEffect(() => {
    if (!isMultiCity || roundTripView !== 'individual' || !activeSummary) return;
    if (individualLegOffers[currentLegIndex] !== undefined) return;
    const segment = activeSummary.request.segments[currentLegIndex];
    if (!segment) return;

    let cancelled = false;
    searchFlights
      .mutateAsync({
        tripType: 'OneWay',
        cabinClass: activeSummary.request.cabinClass,
        segments: [segment],
        adultCount: activeSummary.request.adultCount,
        childCount: activeSummary.request.childCount,
        infantCount: activeSummary.request.infantCount,
      })
      .then((response) => {
        if (cancelled) return;
        setIndividualLegOffers((prev) => {
          const next = [...prev];
          next[currentLegIndex] = response.offers;
          return next;
        });
      })
      .catch(() => {
        if (cancelled) return;
        setIndividualLegOffers((prev) => {
          const next = [...prev];
          next[currentLegIndex] = [];
          return next;
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiCity, roundTripView, currentLegIndex, activeSummary]);

  // The single-leg list currently driving the filter bar / featured cards /
  // "All flights" section: the plain one-way list, or whichever step of the
  // sequential flow the user is on. "Combine Flights" (round-trip's paired
  // cards, or multi-city's own bundled itineraries) uses activeOffers
  // directly instead, below.
  const listOffers = usingSequentialFlow ? legOffers[currentLegIndex] ?? [] : activeOffers;

  // The Airline modal always lists every airline actually in the current
  // list, regardless of what's currently filtered — narrowing the filter
  // shouldn't also shrink the list of options for picking it.
  const availableAirlines = Array.from(new Set(listOffers.map((o) => o.airlineName))).sort();
  const airlineCodeByName = Object.fromEntries(listOffers.map((o) => [o.airlineName, o.airlineCode]));
  const availableLayoverCities = Array.from(new Set(listOffers.flatMap(getLayoverCities))).sort();

  // Excludes the time filter itself, so the Time modal can compute a
  // cheapest-price for every bucket — including ones not currently selected
  // — rather than only the bucket already applied.
  const preTimeOffers = applyCombinedFilters(listOffers, {
    ...combinedFilters,
    time: { departure: null, arrival: null },
  });

  const visibleOffers = applyCombinedFilters(listOffers, combinedFilters);
  const { best, fastest, cheapest, rest } = pickFeaturedFlights(visibleOffers);
  // Sort only reorders "All flights" below — best/fastest/cheapest stay as
  // fixed curated picks regardless of the chosen sort.
  const sortedRest = sortOffers(rest, activeSortId, activeSummary?.passengerCount ?? 1);

  // "Combine Flights" (round-trip only — pairing doesn't generalize sensibly
  // past two legs): each leg is filtered independently (an airline/stops
  // filter means "both legs match"), then paired into priced round-trip
  // cards and featured the same way the single-offer list is above.
  const combinedPairs = isRoundTrip
    ? pairOffersForCombine(applyCombinedFilters(onwardOffers, combinedFilters), applyCombinedFilters(returnOffers, combinedFilters))
    : [];
  const combinedFeatured = pickFeaturedCombined(combinedPairs);

  const handleChangeRoundTripView = (view: RoundTripView) => {
    setRoundTripView(view);
    setSelectedLegOffers([]);
    setCombinedFilters(EMPTY_COMBINED_FILTERS);
    setActiveSortId(null);
  };

  // "Change" on the summary bar for an already-picked leg drops that leg and
  // every leg picked after it — they'd need re-picking anyway once this one
  // changes context.
  const handleChangeLegAt = (index: number) => {
    setSelectedLegOffers((prev) => prev.slice(0, index));
    setCombinedFilters(EMPTY_COMBINED_FILTERS);
    setActiveSortId(null);
  };

  // A single-offer card's press always opens the fare-detail modal first —
  // matching the Figma "round onward" / "Round return" screens, where
  // picking a flight means reviewing its fare before committing to it, not
  // selecting it outright. For every leg but the last in the sequential flow,
  // the modal opened here is a plain single-offer preview; its Continue
  // button (isPreviewingLegCandidate below) is what actually selects that
  // leg and reveals the next one's list. The last leg opens the modal with
  // every leg chosen so far so the per-leg tabs there can each show their
  // own segments, same as "Combine Flights".
  const handleOfferPress = (offer: FlightOffer) => {
    if (usingSequentialFlow) {
      if (!isLastLeg) {
        setDetailsLegs([offer]);
        setDetailsLegLabels(undefined);
        return;
      }
      setDetailsLegs([...selectedLegOffers, offer]);
      setDetailsLegLabels(Array.from({ length: legCount }, (_, i) => legTabLabel(i)));
      return;
    }
    setDetailsLegs([offer]);
    setDetailsLegLabels(undefined);
  };

  const handleCombinedPress = (pair: CombinedRoundTripOffer) => {
    setDetailsLegs([pair.onward, pair.returnOffer]);
    setDetailsLegLabels(['Onward', 'Return']);
  };

  const handleCloseDetails = () => {
    setDetailsLegs([]);
    setDetailsLegLabels(undefined);
  };

  // True while the open modal is previewing a leg candidate that isn't the
  // last one in the sequential flow — the one case where Continue means
  // "select this leg" rather than "done reviewing, close".
  const isPreviewingLegCandidate = usingSequentialFlow && !isLastLeg && detailsLegs.length === 1;

  const handleContinueLegCandidate = () => {
    if (detailsLegs[0]) {
      setSelectedLegOffers((prev) => [...prev, detailsLegs[0]]);
      setCombinedFilters(EMPTY_COMBINED_FILTERS);
      setActiveSortId(null);
    }
    setDetailsLegs([]);
    setDetailsLegLabels(undefined);
  };

  // Continue on the modal's last step — every leg already has a chosen
  // offer, so this is the fare review's real "done" action.
  const handleContinueToTraveler = () => {
    onContinueToTravelerDetails(detailsLegs, detailsLegLabels, activeSummary?.passengerCount ?? 1);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={22} color="#182339" />
          </TouchableOpacity>

          {activeSummary ? (
            <View style={styles.headerTitleBlock}>
              {isMultiCity ? (
                // Every added route, chained left to right — round-trip/one-way's
                // single "origin ⇋ destination" only ever has one pair to show,
                // but multi-city can have as many as the search form allowed.
                <View style={styles.multiCityRouteRow}>
                  {activeSummary.request.segments.map((segment, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Text style={styles.multiCityRouteSeparator}>|</Text>}
                      <Text style={styles.multiCityRouteText}>{segment.origin}</Text>
                      <ArrowRight size={12} color="#182339" style={styles.multiCityRouteIcon} />
                      <Text style={styles.multiCityRouteText}>{segment.destination}</Text>
                    </React.Fragment>
                  ))}
                </View>
              ) : (
                <View style={styles.routeRow}>
                  <Text style={styles.routeText}>{activeSummary.originCode}</Text>
                  <ArrowLeftRight size={14} color="#182339" style={styles.routeIcon} />
                  <Text style={styles.routeText}>{activeSummary.destinationCode}</Text>
                </View>
              )}
              <Text style={styles.routeSubtitle}>
                {formatDateRange(activeSummary)} · {activeSummary.passengerCount} ·{' '}
                {CABIN_CLASS_LABELS[activeSummary.cabinClass]}
              </Text>
            </View>
          ) : (
            <Text style={styles.headerTitle}>{activeOffers.length} flights found</Text>
          )}

          <TouchableOpacity style={styles.editButton} onPress={() => setEditVisible(true)}>
            <Pencil size={16} color="#182339" />
          </TouchableOpacity>
        </View>

        {activeSummary && (
          <View style={styles.dateStripRow}>
            <DateFareStrip
              originCode={activeSummary.originCode}
              destinationCode={activeSummary.destinationCode}
              selectedDate={activeSummary.departureDate}
              onSelectDate={handleSelectDate}
              disabled={searchFlights.isPending}
            />
            {searchFlights.isPending && (
              <ActivityIndicator size="small" color="#7C1AEE" style={styles.dateStripLoader} />
            )}
          </View>
        )}

        {isMultiLeg && <RoundTripViewTabs active={roundTripView} onChange={handleChangeRoundTripView} />}

        <FilterBar
          onFilterPress={() => setFilterScreenVisible(true)}
          filterActive={
            combinedFilters.stops.size > 0 ||
            combinedFilters.hideNonRefundable ||
            combinedFilters.cabinCheckinBaggage ||
            combinedFilters.airlines.size > 0 ||
            combinedFilters.layoverCities.size > 0 ||
            combinedFilters.time.departure !== null ||
            combinedFilters.time.arrival !== null ||
            // A slider left at its max position reports that max value on
            // mount (a quirk of the native component), not `null` — treat
            // "at max" the same as "unset" so a Clear doesn't look active.
            (combinedFilters.priceMax !== null &&
              combinedFilters.priceMax < Math.max(1, ...activeOffers.map((o) => o.totalAmount))) ||
            (combinedFilters.durationMax !== null &&
              combinedFilters.durationMax < Math.max(1, ...activeOffers.map(getTotalDurationMinutes)))
          }
          nonStopOnly={combinedFilters.stops.size === 1 && combinedFilters.stops.has('nonstop')}
          onToggleNonStop={() =>
            setCombinedFilters((prev) => ({
              ...prev,
              stops: prev.stops.size === 1 && prev.stops.has('nonstop') ? new Set() : new Set(['nonstop']),
            }))
          }
          onSortPress={() => setSortModalVisible(true)}
          sortActive={activeSortId !== null}
          onAirlinePress={() => setAirlineModalVisible(true)}
          airlineActive={combinedFilters.airlines.size > 0}
          onLayoverPress={() => setLayoverModalVisible(true)}
          layoverActive={combinedFilters.layoverCities.size > 0}
          onTimePress={() => setTimeModalVisible(true)}
          timeActive={combinedFilters.time.departure !== null || combinedFilters.time.arrival !== null}
        />
      </SafeAreaView>

      <SortByModal
        visible={sortModalVisible}
        activeSortId={activeSortId}
        onSelect={(id) => {
          setActiveSortId(id);
          setSortModalVisible(false);
        }}
        onClose={() => setSortModalVisible(false)}
      />

      <AirlineModal
        visible={airlineModalVisible}
        airlines={availableAirlines}
        airlineCodeByName={airlineCodeByName}
        appliedAirlines={combinedFilters.airlines}
        onSave={(selected) => {
          setCombinedFilters((prev) => ({ ...prev, airlines: selected }));
          setAirlineModalVisible(false);
        }}
        onClose={() => setAirlineModalVisible(false)}
      />

      <LayoverModal
        visible={layoverModalVisible}
        layoverCities={availableLayoverCities}
        appliedLayoverCities={combinedFilters.layoverCities}
        onSave={(selected) => {
          setCombinedFilters((prev) => ({ ...prev, layoverCities: selected }));
          setLayoverModalVisible(false);
        }}
        onClose={() => setLayoverModalVisible(false)}
      />

      <TimeModal
        visible={timeModalVisible}
        offers={preTimeOffers}
        currencyCode={activeOffers[0]?.currencyCode ?? 'INR'}
        originCity={
          (activeSummary && findAirportByCode(activeSummary.originCode)?.city) || activeSummary?.originCode || ''
        }
        destinationCity={
          (activeSummary && findAirportByCode(activeSummary.destinationCode)?.city) ||
          activeSummary?.destinationCode ||
          ''
        }
        applied={combinedFilters.time}
        onSave={(selection) => {
          setCombinedFilters((prev) => ({ ...prev, time: selection }));
          setTimeModalVisible(false);
        }}
        onClose={() => setTimeModalVisible(false)}
      />

      <FilterScreen
        visible={filterScreenVisible}
        allOffers={activeOffers}
        currencyCode={activeOffers[0]?.currencyCode ?? 'INR'}
        originCity={
          (activeSummary && findAirportByCode(activeSummary.originCode)?.city) || activeSummary?.originCode || ''
        }
        destinationCity={
          (activeSummary && findAirportByCode(activeSummary.destinationCode)?.city) ||
          activeSummary?.destinationCode ||
          ''
        }
        availableAirlines={availableAirlines}
        applied={combinedFilters}
        onSave={(state) => {
          setCombinedFilters(state);
          setFilterScreenVisible(false);
        }}
        onClose={() => setFilterScreenVisible(false)}
      />

      <FlightDetailsModal
        visible={detailsLegs.length > 0}
        legs={detailsLegs}
        legLabels={detailsLegLabels}
        passengerCount={activeSummary?.passengerCount ?? 1}
        onClose={handleCloseDetails}
        onContinue={isPreviewingLegCandidate ? handleContinueLegCandidate : handleContinueToTraveler}
        continueLabel={
          isPreviewingLegCandidate
            ? isRoundTrip
              ? 'Select Return Flight'
              : `Select Flight ${currentLegIndex + 2}`
            : undefined
        }
      />

      {isRoundTrip && roundTripView === 'combine' ? (
        <FlatList
          data={combinedFeatured.rest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            combinedPairs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No combined round-trip options for this search.</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            combinedFeatured.best ? (
              <>
                <CombinedFlightOfferCard
                  pair={combinedFeatured.best}
                  variant="bestValue"
                  onPress={() => handleCombinedPress(combinedFeatured.best!)}
                />
                {combinedFeatured.fastest && (
                  <CombinedFlightOfferCard
                    pair={combinedFeatured.fastest}
                    variant="fastest"
                    onPress={() => handleCombinedPress(combinedFeatured.fastest!)}
                  />
                )}
                {combinedFeatured.cheapest && (
                  <CombinedFlightOfferCard
                    pair={combinedFeatured.cheapest}
                    variant="cheapest"
                    onPress={() => handleCombinedPress(combinedFeatured.cheapest!)}
                  />
                )}
                <Image source={insuranceBanner} style={styles.promoBanner} resizeMode="cover" />
                {combinedFeatured.rest.length > 0 && (
                  <Text style={styles.sectionTitle}>All combined flights</Text>
                )}
              </>
            ) : null
          }
          renderItem={({ item }) => <CombinedFlightOfferCard pair={item} onPress={() => handleCombinedPress(item)} />}
        />
      ) : isMultiCity && roundTripView === 'combine' ? (
        <FlatList
          data={sortedRest}
          keyExtractor={(item) => item.offerId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            visibleOffers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No combined multi-city packages for this search.</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            best && activeSummary ? (
              <>
                <MultiCityCombinedOfferCard
                  offer={best}
                  legs={activeSummary.request.segments}
                  variant="bestValue"
                  onPress={() => handleOfferPress(best)}
                />
                {fastest && (
                  <MultiCityCombinedOfferCard
                    offer={fastest}
                    legs={activeSummary.request.segments}
                    variant="fastest"
                    onPress={() => handleOfferPress(fastest)}
                  />
                )}
                {cheapest && (
                  <MultiCityCombinedOfferCard
                    offer={cheapest}
                    legs={activeSummary.request.segments}
                    variant="cheapest"
                    onPress={() => handleOfferPress(cheapest)}
                  />
                )}
                <Image source={insuranceBanner} style={styles.promoBanner} resizeMode="cover" />
                {rest.length > 0 && <Text style={styles.sectionTitle}>All combined flights</Text>}
              </>
            ) : null
          }
          renderItem={({ item }) =>
            activeSummary ? (
              <MultiCityCombinedOfferCard
                offer={item}
                legs={activeSummary.request.segments}
                onPress={() => handleOfferPress(item)}
              />
            ) : null
          }
        />
      ) : (
        <FlatList
          data={sortedRest}
          keyExtractor={(item) => item.offerId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            currentLegLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="small" color="#7C1AEE" />
              </View>
            ) : visibleOffers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No flights found for this search.</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            <>
              {usingSequentialFlow &&
                selectedLegOffers.map((legOffer, index) => (
                  <LegSelectionBar
                    key={legOffer.offerId}
                    offer={legOffer}
                    label={legBarLabel(index)}
                    onChange={() => handleChangeLegAt(index)}
                  />
                ))}
              {best ? (
                <>
                  <FlightOfferCard offer={best} variant="bestValue" onPress={() => handleOfferPress(best)} />
                  {fastest && (
                    <FlightOfferCard offer={fastest} variant="fastest" onPress={() => handleOfferPress(fastest)} />
                  )}
                  {cheapest && (
                    <FlightOfferCard offer={cheapest} variant="cheapest" onPress={() => handleOfferPress(cheapest)} />
                  )}
                  <Image source={insuranceBanner} style={styles.promoBanner} resizeMode="cover" />
                  {rest.length > 0 && <Text style={styles.sectionTitle}>All flights</Text>}
                </>
              ) : null}
            </>
          }
          renderItem={({ item }) => <FlightOfferCard offer={item} onPress={() => handleOfferPress(item)} />}
        />
      )}

      <Modal
        visible={editVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        {editVisible && (
          <View style={styles.editOverlayRoot}>
            <FlightSearchFormScreen
              variant="overlay"
              onBack={() => setEditVisible(false)}
              onResults={(newOffers, newSummary) => {
                setActiveOffers(newOffers);
                setActiveSummary(newSummary);
                setEditVisible(false);
              }}
              initialValues={activeSummary ? toFormInitialValues(activeSummary) : undefined}
            />
            <TouchableOpacity
              style={styles.editOverlayBackdrop}
              activeOpacity={1}
              onPress={() => setEditVisible(false)}
            />
          </View>
        )}
      </Modal>
    </View>
  );
};
