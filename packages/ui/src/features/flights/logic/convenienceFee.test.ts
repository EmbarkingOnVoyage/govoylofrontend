import { describe, test, expect } from 'vitest';
import type { FareOption, FlightOffer } from '../useSearchFlightsMobile';
import { calculateConvenienceFee, convenienceFeeFor, type ConvenienceFeeRules } from './convenienceFee';

// The rules the backend seeds (AddConvenienceFee migration).
const rules: ConvenienceFeeRules = {
  tripRates: [
    { tripType: 'OneWay', firstJourneyPercent: 1, extraJourneyPercent: 1, maxFeePerPax: null },
    { tripType: 'RoundTrip', firstJourneyPercent: 0.8, extraJourneyPercent: 0.8, maxFeePerPax: null },
    { tripType: 'MultiCity', firstJourneyPercent: 1, extraJourneyPercent: 0.75, maxFeePerPax: null },
  ],
  paxBands: [
    { minPax: 1, factor: 1 },
    { minPax: 3, factor: 0.85 },
    { minPax: 6, factor: 0.75 },
  ],
};

const journey = (adult: number, child = adult) => ({ adultBaseFare: adult, childBaseFare: child });

function leg(adultBaseFare: number, tripIndexes: number[] = [0]): FlightOffer {
  const fare: FareOption = {
    fareId: 'F1',
    refundable: true,
    totalAmount: adultBaseFare + 1000,
    currencyCode: 'INR',
    checkInBaggage: '15 KG',
    handBaggage: '7 KG',
    bookingTotalAmount: adultBaseFare + 1000,
    fareIdentifier: 'PUBLISHED',
    specialReturnId: null,
    matchingSpecialReturnIds: [],
    adultBaseFare,
    childBaseFare: adultBaseFare,
  };
  return {
    offerId: `O${adultBaseFare}`,
    airlineCode: '6E',
    airlineName: 'IndiGo',
    refundable: true,
    isLowCostCarrier: true,
    segments: tripIndexes.map((tripIndex) => ({
      origin: 'DEL',
      destination: 'BOM',
      airlineCode: '6E',
      airlineName: 'IndiGo',
      flightNumber: '100',
      departureDateTime: '2026-11-20T08:00:00',
      arrivalDateTime: '2026-11-20T10:00:00',
      duration: '02:00',
      tripIndex,
    })),
    totalAmount: adultBaseFare + 1000,
    currencyCode: 'INR',
    seatsAvailable: 9,
    fares: [fare],
    tripLegIndex: 0,
    supplierCode: 'tripjack',
  } as FlightOffer;
}

const pax = (adult: number, child = 0, infant = 0) => ({ adult, child, infant });

describe('convenience fee', () => {
  test('one way is 1% of the base fare', () => {
    expect(calculateConvenienceFee(rules, 'OneWay', [journey(5000)], 1, 0)).toBe(50);
  });

  test('round trip is 0.8% of each journey', () => {
    expect(calculateConvenienceFee(rules, 'RoundTrip', [journey(5000), journey(4000)], 1, 0)).toBe(72);
  });

  test('multi-city is 1% of the first journey and 0.75% of each extra one', () => {
    expect(calculateConvenienceFee(rules, 'MultiCity', [journey(5000), journey(4000), journey(3000)], 1, 0)).toBe(102.5);
  });

  test.each([
    [1, 50],
    [2, 100],
    [3, 127.5],
    [5, 212.5],
    [6, 225],
    [9, 337.5],
  ])('%i adults taper to %d', (adults, expected) => {
    expect(calculateConvenienceFee(rules, 'OneWay', [journey(5000)], adults, 0)).toBe(expected);
  });

  test('children pay on their own base fare and count towards the band; infants are free', () => {
    expect(calculateConvenienceFee(rules, 'OneWay', [journey(5000, 3000)], 2, 1)).toBe(110.5);
    expect(calculateConvenienceFee(rules, 'OneWay', [journey(5000)], 0, 0)).toBe(0);
  });

  test('a per-passenger cap applies when set', () => {
    const capped: ConvenienceFeeRules = {
      ...rules,
      tripRates: [{ tripType: 'MultiCity', firstJourneyPercent: 1, extraJourneyPercent: 0.75, maxFeePerPax: 80 }],
    };
    expect(calculateConvenienceFee(capped, 'MultiCity', [journey(5000), journey(4000), journey(3000)], 2, 0)).toBe(160);
  });

  test('rounds to 2 decimals', () => {
    expect(calculateConvenienceFee(rules, 'OneWay', [journey(6247.37)], 1, 0)).toBe(62.47);
  });

  test('trip type follows the journeys booked, like the backend', () => {
    // Two one-way legs from a round-trip search.
    expect(convenienceFeeFor(rules, [leg(5000), leg(4000)], pax(1), 'RoundTrip')).toBe(72);
    // Two legs searched one at a time (multi-city).
    expect(convenienceFeeFor(rules, [leg(5000), leg(4000)], pax(1), 'OneWay')).toBe(80);
    // A whole-trip round-trip offer: its base fare is split across its two trips.
    expect(convenienceFeeFor(rules, [leg(10000, [0, 1])], pax(1), 'RoundTrip')).toBe(80);
    // Infants never count.
    expect(convenienceFeeFor(rules, [leg(5000)], pax(1, 0, 1), 'OneWay')).toBe(50);
    expect(convenienceFeeFor(undefined, [leg(5000)], pax(1), 'OneWay')).toBe(0);
  });
});
