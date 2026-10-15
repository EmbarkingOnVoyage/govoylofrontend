// GoVoylo's convenience fee, shown before booking. Mirrors the backend's
// ConvenienceFeeCalculator; the server recalculates it at booking time and its
// figure (CreateBookingResponse.convenienceFee) is what gets charged.
import type { FlightOffer, PassengerCounts, TripType } from '../useSearchFlightsMobile';
import { bookedFare, legDiscount } from './booking';

export interface ConvenienceFeeTripRate {
  tripType: TripType;
  // % of what the adults and children pay per journey (base fare before the
  // commission discount + taxes; add-ons excluded): the first fullRateJourneys journeys at
  // firstJourneyPercent, every further one at extraJourneyPercent.
  firstJourneyPercent: number;
  extraJourneyPercent: number;
  // Most one passenger pays for the whole trip; null = no cap.
  maxFeePerPax: number | null;
  fullRateJourneys?: number;
  // Whether the group factor (paxBands) applies.
  applyPaxBands?: boolean;
}

export interface ConvenienceFeePaxBand {
  // From this many chargeable passengers (adults + children) the fee is × factor.
  minPax: number;
  factor: number;
}

export interface ConvenienceFeeRules {
  tripRates: ConvenienceFeeTripRate[];
  paxBands: ConvenienceFeePaxBand[];
}

// What the adults and children pay for one journey together (infants are never
// charged the fee).
export interface JourneyFare {
  chargeableAmount: number;
}

export function calculateConvenienceFee(
  rules: ConvenienceFeeRules,
  tripType: TripType,
  journeys: JourneyFare[],
  adultCount: number,
  childCount: number
): number {
  const rate = rules.tripRates.find((r) => r.tripType.toLowerCase() === tripType.toLowerCase());
  const chargeablePax = adultCount + childCount;
  if (!rate || chargeablePax <= 0 || journeys.length === 0) return 0;

  const factor =
    rate.applyPaxBands === false
      ? 1
      : [...rules.paxBands].sort((a, b) => b.minPax - a.minPax).find((b) => b.minPax <= chargeablePax)?.factor ?? 1;
  const fullRateJourneys = Math.max(1, rate.fullRateJourneys ?? 1);

  let total =
    journeys.reduce(
      (sum, journey, index) =>
        sum +
        (journey.chargeableAmount *
          (index < fullRateJourneys ? rate.firstJourneyPercent : rate.extraJourneyPercent)) /
          100,
      0
    ) * factor;
  if (rate.maxFeePerPax != null) total = Math.min(total, rate.maxFeePerPax * chargeablePax);
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

// The journeys of the legs being booked: one per leg, or one per trip of a
// whole-trip offer (its amount split evenly, as the backend does). A leg's
// amount is its adults' and children's fares before the discount (base +
// taxes); add-ons don't count.
export function journeysFor(legs: FlightOffer[], passengerCounts: PassengerCounts): JourneyFare[] {
  return legs.flatMap((leg) => {
    const fare = bookedFare(leg);
    const fares = fare?.adultListFare
      ? passengerCounts.adult * fare.adultListFare + passengerCounts.child * (fare.childListFare ?? fare.adultListFare)
      // An older API without list fares: the whole booking before the discount.
      : leg.totalAmount + legDiscount(leg);
    const tripCount = Math.max(1, new Set(leg.segments.map((s) => s.tripIndex ?? 0)).size);
    return Array.from({ length: tripCount }, () => ({ chargeableAmount: fares / tripCount }));
  });
}

// The fee for booking these legs. searchTripType is the
// search's own trip type; like the backend, two journeys are a round trip only
// when the search was one, and any other multi-journey booking is multi-city.
export function convenienceFeeFor(
  rules: ConvenienceFeeRules | undefined,
  legs: FlightOffer[],
  passengerCounts: PassengerCounts,
  searchTripType: TripType | undefined
): number {
  if (!rules) return 0;
  const journeys = journeysFor(legs, passengerCounts);
  const tripType: TripType =
    journeys.length === 1
      ? 'OneWay'
      : journeys.length === 2 && searchTripType === 'RoundTrip'
        ? 'RoundTrip'
        : 'MultiCity';
  return calculateConvenienceFee(rules, tripType, journeys, passengerCounts.adult, passengerCounts.child);
}
