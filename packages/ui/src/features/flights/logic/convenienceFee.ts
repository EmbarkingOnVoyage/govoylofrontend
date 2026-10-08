// GoVoylo's convenience fee, shown before booking. Mirrors the backend's
// ConvenienceFeeCalculator; the server recalculates it at booking time and its
// figure (CreateBookingResponse.convenienceFee) is what gets charged.
import type { FlightOffer, PassengerCounts, TripType } from '../useSearchFlightsMobile';
import { bookedFare } from './booking';

export interface ConvenienceFeeTripRate {
  tripType: TripType;
  // % of each chargeable passenger's base fare: the first journey, then each further one.
  firstJourneyPercent: number;
  extraJourneyPercent: number;
  // Most one passenger pays for the whole trip; null = no cap.
  maxFeePerPax: number | null;
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

// One journey's base fare for one adult and one child.
export interface JourneyBaseFare {
  adultBaseFare: number;
  childBaseFare: number;
}

export function calculateConvenienceFee(
  rules: ConvenienceFeeRules,
  tripType: TripType,
  journeys: JourneyBaseFare[],
  adultCount: number,
  childCount: number
): number {
  const rate = rules.tripRates.find((r) => r.tripType.toLowerCase() === tripType.toLowerCase());
  const chargeablePax = adultCount + childCount;
  if (!rate || chargeablePax <= 0 || journeys.length === 0) return 0;

  const factor =
    [...rules.paxBands].sort((a, b) => b.minPax - a.minPax).find((b) => b.minPax <= chargeablePax)?.factor ?? 1;

  const perPax = (baseFare: (j: JourneyBaseFare) => number) => {
    const fee =
      journeys.reduce(
        (sum, journey, index) =>
          sum + (baseFare(journey) * (index === 0 ? rate.firstJourneyPercent : rate.extraJourneyPercent)) / 100,
        0
      ) * factor;
    return rate.maxFeePerPax != null ? Math.min(fee, rate.maxFeePerPax) : fee;
  };

  const total = perPax((j) => j.adultBaseFare) * adultCount + perPax((j) => j.childBaseFare) * childCount;
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

// The journeys of the legs being booked: one per leg, or one per trip of a
// whole-trip offer (its base fare split evenly, as the backend does).
export function journeysFor(legs: FlightOffer[]): JourneyBaseFare[] {
  return legs.flatMap((leg) => {
    const fare = bookedFare(leg);
    const tripCount = Math.max(1, new Set(leg.segments.map((s) => s.tripIndex ?? 0)).size);
    return Array.from({ length: tripCount }, () => ({
      adultBaseFare: (fare?.adultBaseFare ?? 0) / tripCount,
      childBaseFare: (fare?.childBaseFare ?? 0) / tripCount,
    }));
  });
}

// The fee for booking these legs. searchTripType is the search's own trip
// type; like the backend, two journeys are a round trip only when the search
// was one, and any other multi-journey booking is multi-city.
export function convenienceFeeFor(
  rules: ConvenienceFeeRules | undefined,
  legs: FlightOffer[],
  passengerCounts: PassengerCounts,
  searchTripType: TripType | undefined
): number {
  if (!rules) return 0;
  const journeys = journeysFor(legs);
  const tripType: TripType =
    journeys.length === 1
      ? 'OneWay'
      : journeys.length === 2 && searchTripType === 'RoundTrip'
        ? 'RoundTrip'
        : 'MultiCity';
  return calculateConvenienceFee(rules, tripType, journeys, passengerCounts.adult, passengerCounts.child);
}
