import { describe, test, expect } from 'vitest';
import type { FareOption, FlightOffer } from '../useSearchFlightsMobile';
import type { AddOnSelection } from './booking';
import { calculateConvenienceFee, convenienceFeeFor, type ConvenienceFeeRules } from './convenienceFee';

// The rules the backend seeds (ConvenienceFeeOnFarePlusAddOns migration).
const rules: ConvenienceFeeRules = {
  tripRates: [
    { tripType: 'OneWay', firstJourneyPercent: 2.64, extraJourneyPercent: 2.64, maxFeePerPax: null, fullRateJourneys: 1, applyPaxBands: true },
    { tripType: 'RoundTrip', firstJourneyPercent: 2.64, extraJourneyPercent: 2.64, maxFeePerPax: null, fullRateJourneys: 2, applyPaxBands: true },
    { tripType: 'MultiCity', firstJourneyPercent: 2.64, extraJourneyPercent: 1.98, maxFeePerPax: null, fullRateJourneys: 2, applyPaxBands: false },
  ],
  paxBands: [
    { minPax: 1, factor: 1 },
    { minPax: 3, factor: 0.85 },
    { minPax: 6, factor: 0.75 },
  ],
};

// Every passenger pays 10,000 per journey, so 2.64% is 264 a passenger.
const journeys = (count: number, pax: number) => Array.from({ length: count }, () => ({ chargeableAmount: 10_000 * pax }));

function leg(adultListFare: number, tripIndexes: number[] = [0], childListFare = adultListFare): FlightOffer {
  const fare: FareOption = {
    fareId: 'F1',
    refundable: true,
    totalAmount: adultListFare - 500,
    currencyCode: 'INR',
    checkInBaggage: '15 KG',
    handBaggage: '7 KG',
    bookingTotalAmount: adultListFare - 500,
    fareIdentifier: 'PUBLISHED',
    specialReturnId: null,
    matchingSpecialReturnIds: [],
    adultListFare,
    childListFare,
  };
  return {
    offerId: `O${adultListFare}`,
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
    totalAmount: adultListFare - 500,
    currencyCode: 'INR',
    seatsAvailable: 9,
    fares: [fare],
    tripLegIndex: 0,
    supplierCode: 'flyshop',
  } as FlightOffer;
}

const addOn = (legIndex: number, amount: number): AddOnSelection => ({
  legIndex,
  category: 'baggage',
  travelerId: 'T1',
  ssrKey: `K${legIndex}${amount}`,
  label: 'Extra bag',
  amount,
});

describe('calculateConvenienceFee', () => {
  test.each([
    [1, 264],
    [2, 528],
    [3, 673.2], // 0.85 x (3 x 264)
    [5, 1122], // 0.85 x (5 x 264)
    [7, 1386], // 0.75 x (7 x 264)
  ])('one way, %i passengers', (pax, expected) => {
    expect(calculateConvenienceFee(rules, 'OneWay', journeys(1, pax), pax, 0)).toBe(expected);
  });

  test.each([
    [2, 1056], // 2 x (2 x 264)
    [3, 1346.4], // 2 x (0.85 x (3 x 264))
    [7, 2772], // 2 x (0.75 x (7 x 264))
  ])('round trip, %i passengers', (pax, expected) => {
    expect(calculateConvenienceFee(rules, 'RoundTrip', journeys(2, pax), pax, 0)).toBe(expected);
  });

  test.each([
    [2, 2, 1056], // 2 x (2 x 264)
    [3, 2, 1452], // 2 x (2 x 264) + 1 x (0.75 x (2 x 264))
    [5, 3, 3366], // 2 x (3 x 264) + 3 x (0.75 x (3 x 264)), no group factor
    [7, 5, 7590], // 2 x (5 x 264) + 5 x (0.75 x (5 x 264))
  ])('multi-city, %i legs, %i passengers', (legs, pax, expected) => {
    expect(calculateConvenienceFee(rules, 'MultiCity', journeys(legs, pax), pax, 0)).toBe(expected);
  });
});

describe('convenienceFeeFor', () => {
  test('takes the fare before the discount plus the add-ons', () => {
    // 2.64% x (6,747 + 1,000 bag)
    expect(convenienceFeeFor(rules, [leg(6747)], { adult: 1, child: 0, infant: 0 }, 'OneWay', [addOn(0, 1000)])).toBe(
      204.52
    );
  });

  test('children pay on the child fare; infants pay nothing and are not counted', () => {
    // 2.64% x (2 x 6,000 + 1 x 4,000) x 0.85 (3 passengers)
    expect(convenienceFeeFor(rules, [leg(6000, [0], 4000)], { adult: 2, child: 1, infant: 1 }, 'OneWay')).toBe(359.04);
  });

  test("a round trip's add-ons count on their own leg", () => {
    // 2.64% x (5,000 + 500) + 2.64% x 4,000
    expect(
      convenienceFeeFor(rules, [leg(5000), leg(4000)], { adult: 1, child: 0, infant: 0 }, 'RoundTrip', [addOn(0, 500)])
    ).toBe(250.8);
  });

  test('a whole-trip offer is split evenly into its trips', () => {
    // One offer, two trips: 2 x 2.64% x 4,500
    expect(convenienceFeeFor(rules, [leg(9000, [0, 1])], { adult: 1, child: 0, infant: 0 }, 'RoundTrip')).toBe(237.6);
  });

  test('no rules yet, no fee', () => {
    expect(convenienceFeeFor(undefined, [leg(5000)], { adult: 1, child: 0, infant: 0 }, 'OneWay')).toBe(0);
  });
});
