// Pure flight-results logic shared by the mobile results screen and the web
// results page: formatting, cabin tiers, featured picks, round-trip packages,
// sorting, filters and fare selection. No React or platform code in here.
import type {
  FareOption,
  FlightOffer,
  FlightOfferSegment,
  FlightSearchSegment,
  FlightSearchSummary,
} from '../useSearchFlightsMobile';

// Airport code -> city name. Each app resolves this from its own airport
// lookup, so the layover helpers below stay platform-free.
export type CityForCode = (code: string) => string;

export const CABIN_CLASS_LABELS: Record<FlightSearchSummary['cabinClass'], string> = {
  Economy: 'Economy',
  PremiumEconomy: 'Premium Economy',
  Business: 'Business',
  First: 'First',
};

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// 24-hour "17:30" — the Flight details popup's own time format (Figma),
// distinct from the 12-hour AM/PM format the card list uses.
export function formatTime24(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

// "Mon, 30.1" — the Flight details popup's own date format (Figma), distinct
// from every other date format already in this file.
export function formatWeekdayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const weekday = date.toLocaleDateString([], { weekday: 'short' });
  return `${weekday}, ${date.getDate()}.${date.getMonth() + 1}`;
}

// DD/MM/YYYY — the display format FlightSearchFormScreen's own date fields use.
export function formatDisplayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function formatDateRange(summary: FlightSearchSummary): string {
  const departure = formatDateShort(summary.departureDate);
  if (!summary.returnDate) return departure;
  return `${departure} - ${formatDateShort(summary.returnDate)}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹' };

export function formatPrice(amount: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? `${currencyCode} `;
  return `${symbol}${amount.toLocaleString()}`;
}

// Total journey duration (first departure to last arrival) — not the same as
// any individual segment's own flight time when there's a layover in between.
export function formatTotalDuration(startIso: string, endIso: string): string {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) return '';
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

// How many calendar days later (in the device's local timezone, matching
// formatTime) the arrival lands versus the departure — the "+1" shown next
// to an arrival time that's technically the next day.
export function dayOffset(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.round((endDay - startDay) / 86400000);
}

export function stopsLabel(stopCount: number): string {
  return stopCount === 0 ? 'Non-stop' : `${stopCount} stop${stopCount > 1 ? 's' : ''}`;
}

// "flyshop" / "tripjack" (see FlightSupplierCodes on the backend) -> the
// display name shown in the badge. Falls back to the raw code so an unknown
// or missing supplier still shows something rather than silently disappearing.
export const SUPPLIER_DISPLAY_NAMES: Record<string, string> = {
  flyshop: 'Flyshop',
  tripjack: 'TripJack',
};

export function formatMinutesDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(Math.round(minutes % 60)).padStart(2, '0')}m`;
}

// Flyshop's fares carry an airline-specific booking-class code (e.g. R/J/O/
// BR/BC), not a cabin class — there's no "Economy/Premium/Business" label
// anywhere in the data. But real fares split cleanly into 3 baggage tiers
// (single-piece ~30KG, two-piece ~30KG, two-piece ~40KG) with correspondingly
// higher prices, which lines up with the Economy/Premium/Business tabs in the
// Figma reference closely enough to use as the grouping signal.
export type CabinTierId = 'economy' | 'premium' | 'business';

export const CABIN_TIER_ORDER: CabinTierId[] = ['economy', 'premium', 'business'];
export const CABIN_TIER_LABELS: Record<CabinTierId, string> = {
  economy: 'Economy',
  premium: 'Premium',
  business: 'Business',
};

export function cabinTierForFare(fare: FareOption): CabinTierId {
  const weightMatch = fare.checkInBaggage?.match(/(\d+)/);
  const weightKg = weightMatch ? parseInt(weightMatch[1], 10) : 0;
  const isMultiPiece = /\(\s*\d+\s*pcs?\s*\)/i.test(fare.checkInBaggage ?? '');

  if (!isMultiPiece) return 'economy';
  return weightKg >= 40 ? 'business' : 'premium';
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatStripDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}

export const STRIP_DAYS_BEFORE = 3;
export const STRIP_DAYS_AFTER = 3;

export function parseDurationMinutes(duration: string): number {
  const [hours, minutes] = duration.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function getTotalDurationMinutes(offer: FlightOffer): number {
  return offer.segments.reduce((sum, segment) => sum + parseDurationMinutes(segment.duration), 0);
}

// One entry per stop (segments.length - 1) — the city of every intermediate
// airport the itinerary connects through, not just the first one shown on
// the card/details popup.
export function getLayoverCities(offer: FlightOffer, cityForCode: CityForCode): string[] {
  return offer.segments.slice(0, -1).map((segment) => cityForCode(segment.destination));
}

export interface FeaturedFlights {
  best: FlightOffer | null;
  fastest: FlightOffer | null;
  cheapest: FlightOffer | null;
  rest: FlightOffer[];
}

// "Best" balances price and duration (50/50, each normalized 0-1 across the result
// set) rather than picking a single metric — it's meant to read as a sensible
// default pick, distinct from the pure cheapest/fastest extremes shown alongside it.
export function pickFeaturedFlights(offers: FlightOffer[]): FeaturedFlights {
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

// A round-trip "Combine Flights" card is a package the SUPPLIER priced as a
// whole — never an app-made pairing of independently priced legs (which the
// supplier may refuse to book: mixed suppliers, or a special-return fare
// paired with a non-matching return). Two kinds:
// - a single whole-trip offer (Tripjack prices an international return as one
//   combined option): onward is that offer, returnOffer is null;
// - a supplier special-return pair: one onward fare + the return fare its
//   matchingSpecialReturnIds names, each pinned onto its offer (pinFare).
export interface CombinedRoundTripOffer {
  id: string;
  onward: FlightOffer;
  returnOffer: FlightOffer | null;
  totalAmount: number;
  currencyCode: string;
}

// A special-return fare is only bookable paired with its matching fare on the
// other leg (Tripjack errCode 1080 otherwise), so it's never offered on its own.
export function isStandaloneFare(fare: FareOption): boolean {
  return fare.fareIdentifier !== 'SPECIAL_RETURN';
}

// The offer with one specific fare chosen: priced at that fare for every
// passenger, and carrying only that fare so it can't be changed afterwards.
export function pinFare(offer: FlightOffer, fare: FareOption): FlightOffer {
  return {
    ...offer,
    selectedFareId: fare.fareId,
    refundable: fare.refundable,
    totalAmount: fare.bookingTotalAmount || offer.totalAmount,
    fares: [fare],
  };
}

// Caps the special-return cross-matching, cheapest first.
const MAX_SPECIAL_RETURN_PACKAGES = 150;

export function buildRoundTripPackages(
  wholeTripOffers: FlightOffer[],
  onwardOffers: FlightOffer[],
  returnOffers: FlightOffer[]
): CombinedRoundTripOffer[] {
  const packages: CombinedRoundTripOffer[] = wholeTripOffers.map((offer) => ({
    id: offer.offerId,
    onward: offer,
    returnOffer: null,
    totalAmount: offer.totalAmount,
    currencyCode: offer.currencyCode,
  }));

  const returnFaresBySri = new Map<string, { offer: FlightOffer; fare: FareOption }[]>();
  for (const offer of returnOffers) {
    for (const fare of offer.fares ?? []) {
      if (!fare.specialReturnId) continue;
      const list = returnFaresBySri.get(fare.specialReturnId) ?? [];
      list.push({ offer, fare });
      returnFaresBySri.set(fare.specialReturnId, list);
    }
  }

  const pairs: CombinedRoundTripOffer[] = [];
  for (const onward of onwardOffers) {
    for (const onwardFare of onward.fares ?? []) {
      for (const sri of onwardFare.matchingSpecialReturnIds ?? []) {
        for (const match of returnFaresBySri.get(sri) ?? []) {
          if (match.offer.supplierCode !== onward.supplierCode) continue;
          const pinnedOnward = pinFare(onward, onwardFare);
          const pinnedReturn = pinFare(match.offer, match.fare);
          pairs.push({
            id: `${onward.offerId}:${onwardFare.fareId}_${match.offer.offerId}:${match.fare.fareId}`,
            onward: pinnedOnward,
            returnOffer: pinnedReturn,
            totalAmount: pinnedOnward.totalAmount + pinnedReturn.totalAmount,
            currencyCode: onward.currencyCode,
          });
        }
      }
    }
  }
  pairs.sort((a, b) => a.totalAmount - b.totalAmount);

  return [...packages, ...pairs.slice(0, MAX_SPECIAL_RETURN_PACKAGES)];
}

function getCombinedDurationMinutes(pair: CombinedRoundTripOffer): number {
  return getTotalDurationMinutes(pair.onward) + (pair.returnOffer ? getTotalDurationMinutes(pair.returnOffer) : 0);
}

export interface FeaturedCombined {
  best: CombinedRoundTripOffer | null;
  fastest: CombinedRoundTripOffer | null;
  cheapest: CombinedRoundTripOffer | null;
  rest: CombinedRoundTripOffer[];
}

// Same 50/50 price+duration scoring as pickFeaturedFlights, applied to
// combined pairs instead of single offers.
export function pickFeaturedCombined(pairs: CombinedRoundTripOffer[]): FeaturedCombined {
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

export type SortOptionId =
  | 'priceLowToHigh'
  | 'priceHighToLow'
  | 'pricePerPerson'
  | 'best'
  | 'totalJourneyTime'
  | 'departureTime'
  | 'arrivalTime';

export const SORT_OPTIONS: { id: SortOptionId; title: string; description: string }[] = [
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

export function sortOffers(offers: FlightOffer[], sortId: SortOptionId | null, passengerCount: number): FlightOffer[] {
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

export type TimeBucketId = 'before6am' | 'morning' | 'afternoon' | 'after6pm';

export const TIME_BUCKETS: { id: TimeBucketId; label: string; matchesHour: (hour: number) => boolean }[] = [
  { id: 'before6am', label: 'Before 6AM', matchesHour: (h) => h < 6 },
  { id: 'morning', label: '6AM-12 Noon', matchesHour: (h) => h >= 6 && h < 12 },
  { id: 'afternoon', label: '12 Noon-6 PM', matchesHour: (h) => h >= 12 && h < 18 },
  { id: 'after6pm', label: 'After 6PM', matchesHour: (h) => h >= 18 },
];

// Cheapest price among offers whose departure/arrival hour falls in this
// bucket — matches Figma showing a price under each time-of-day option.
export function cheapestInBucket(offers: FlightOffer[], bucket: TimeBucketId, field: 'departure' | 'arrival'): number | null {
  const matching = offers.filter((o) => {
    const iso = field === 'departure' ? o.segments[0].departureDateTime : o.segments[o.segments.length - 1].arrivalDateTime;
    const hour = new Date(iso).getHours();
    return TIME_BUCKETS.find((b) => b.id === bucket)?.matchesHour(hour) ?? false;
  });
  if (matching.length === 0) return null;
  return Math.min(...matching.map((o) => o.totalAmount));
}

export interface TimeSelection {
  departure: TimeBucketId | null;
  arrival: TimeBucketId | null;
}

export type StopBucketId = 'nonstop' | 'onestop' | 'threeplus';

export const STOP_BUCKETS: { id: StopBucketId; label: string; matches: (stopCount: number) => boolean }[] = [
  { id: 'nonstop', label: 'Non Stop', matches: (s) => s === 0 },
  { id: 'onestop', label: '1 Stop', matches: (s) => s === 1 },
  // Matches Figma exactly — it jumps from "1 Stop" straight to "3+ Stop",
  // with no "2 Stop" bucket of its own.
  { id: 'threeplus', label: '3+ Stop', matches: (s) => s >= 3 },
];

export function offerMatchesAnyStopBucket(offer: FlightOffer, buckets: Set<StopBucketId>): boolean {
  if (buckets.size === 0) return true;
  const stopCount = offer.segments.length - 1;
  return STOP_BUCKETS.some((b) => buckets.has(b.id) && b.matches(stopCount));
}

export function cheapestForStopBucket(offers: FlightOffer[], bucket: StopBucketId): number | null {
  const def = STOP_BUCKETS.find((b) => b.id === bucket)!;
  const matching = offers.filter((o) => def.matches(o.segments.length - 1));
  return matching.length === 0 ? null : Math.min(...matching.map((o) => o.totalAmount));
}

export interface CombinedFilterState {
  stops: Set<StopBucketId>;
  hideNonRefundable: boolean;
  cabinCheckinBaggage: boolean;
  airlines: Set<string>;
  layoverCities: Set<string>;
  time: TimeSelection;
  priceMax: number | null;
  durationMax: number | null;
}

export function applyCombinedFilters(
  offers: FlightOffer[],
  state: CombinedFilterState,
  cityForCode: CityForCode
): FlightOffer[] {
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
      (o) => state.layoverCities.size === 0 || getLayoverCities(o, cityForCode).some((city) => state.layoverCities.has(city))
    )
    .filter((o) => state.priceMax === null || o.totalAmount <= state.priceMax)
    .filter((o) => state.durationMax === null || getTotalDurationMinutes(o) <= state.durationMax);
}

// A whole-trip offer (one supplier price for outbound + return) split into one
// offer per trip using each segment's tripIndex, so its card shows DEL-DXB and
// DXB-DEL rather than a single DEL-DEL journey. Returns [] when the offer has
// no trip boundaries (e.g. Flyshop, which doesn't report them).
export function splitOfferByTrip(offer: FlightOffer): FlightOffer[] {
  const trips = new Map<number, FlightOfferSegment[]>();
  for (const segment of offer.segments) {
    const tripIndex = segment.tripIndex ?? 0;
    trips.set(tripIndex, [...(trips.get(tripIndex) ?? []), segment]);
  }
  if (trips.size < 2) {
    return [];
  }
  return [...trips.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, segments]) => ({ ...offer, segments }));
}

// Splits a multi-city "Combine Flights" offer's flat, concatenated segment
// list back into one group per requested leg. Flyshop bundles every leg into
// a single priced offer (Booking_Type=2), so there's no per-leg boundary in
// the data itself — this recovers it by matching each segment's destination
// against the request's own leg destinations, in order, so a leg with its
// own intermediate stop still ends up as one group.
export function splitSegmentsByLegs(
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
export function airlinesForSegments(segments: FlightOfferSegment[]): string {
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

// A fare selection is local to one leg (one offer) — a round-trip view keeps
// one of these per leg so picking Economy for the return doesn't reset an
// already-chosen Business tier for the onward.
export interface FareSelection {
  tier: CabinTierId | null;
  fareId: string | null;
}

// The fares a leg's picker offers: just the pinned fare for a package leg,
// otherwise every fare bookable on its own.
export function selectableFares(offer: FlightOffer): FareOption[] {
  const fares = offer.fares ?? [];
  if (offer.selectedFareId) return fares;
  const standalone = fares.filter(isStandaloneFare);
  return standalone.length > 0 ? standalone : fares;
}

export function cheapestFareSelection(offer: FlightOffer | null): FareSelection {
  const cheapest = offer ? [...selectableFares(offer)].sort((a, b) => a.totalAmount - b.totalAmount)[0] : undefined;
  return { tier: cheapest ? cabinTierForFare(cheapest) : null, fareId: cheapest?.fareId ?? null };
}

export function resolveSelectedFare(offer: FlightOffer | null, selection: FareSelection): FareOption | undefined {
  if (!offer) return undefined;
  const inTier = selectableFares(offer)
    .filter((f) => cabinTierForFare(f) === selection.tier)
    .sort((a, b) => a.totalAmount - b.totalAmount);
  return inTier.find((f) => f.fareId === selection.fareId) ?? inTier[0];
}

export const EMPTY_COMBINED_FILTERS: CombinedFilterState = {
  stops: new Set(),
  hideNonRefundable: false,
  cabinCheckinBaggage: false,
  airlines: new Set(),
  layoverCities: new Set(),
  time: { departure: null, arrival: null },
  priceMax: null,
  durationMax: null,
};

// The filters a result list starts from (and returns to on a view/leg change):
// empty, except the search form's "Non stop flight only" choice.
export function initialFilters(summary: FlightSearchSummary | null): CombinedFilterState {
  return summary?.nonStopOnly ? { ...EMPTY_COMBINED_FILTERS, stops: new Set(['nonstop']) } : EMPTY_COMBINED_FILTERS;
}
