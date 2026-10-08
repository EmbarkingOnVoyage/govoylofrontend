import { describe, test, expect } from 'vitest';
import type { FareOption, FlightOffer, FlightSearchSummary } from '../useSearchFlightsMobile';
import {
  EMPTY_COMBINED_FILTERS,
  applyCombinedFilters,
  baggagePieces,
  buildRoundTripPackages,
  cabinTierForFare,
  cheapestFareSelection,
  fareDisplayName,
  formatPrice,
  hasCheckInBaggage,
  getLayoverCities,
  initialFilters,
  isStandaloneFare,
  pickFeaturedFlights,
  pinFare,
  resolveSelectedFare,
  selectableFares,
  sortOffers,
  splitOfferByTrip,
  splitSegmentsByLegs,
} from './flightResults';

const cityForCode = (code: string) => ({ DXB: 'Dubai', BOM: 'Mumbai' }[code] ?? code);

function fare(overrides: Partial<FareOption> = {}): FareOption {
  return {
    fareId: 'F1',
    refundable: true,
    totalAmount: 5000,
    currencyCode: 'INR',
    checkInBaggage: '15 KG',
    handBaggage: '7 KG',
    bookingTotalAmount: 5000,
    fareIdentifier: 'PUBLISHED',
    specialReturnId: null,
    matchingSpecialReturnIds: [],
    ...overrides,
  };
}

function offer(id: string, overrides: Partial<FlightOffer> = {}, stops: string[] = []): FlightOffer {
  const route = ['DEL', ...stops, 'BOM'];
  return {
    offerId: id,
    airlineCode: '6E',
    airlineName: 'IndiGo',
    refundable: true,
    isLowCostCarrier: true,
    segments: route.slice(0, -1).map((origin, i) => ({
      origin,
      destination: route[i + 1],
      airlineCode: '6E',
      airlineName: 'IndiGo',
      flightNumber: `${100 + i}`,
      departureDateTime: '2026-11-20T08:00:00',
      arrivalDateTime: '2026-11-20T10:00:00',
      duration: '02:00',
    })),
    totalAmount: 5000,
    currencyCode: 'INR',
    seatsAvailable: 9,
    fares: [fare()],
    tripLegIndex: 0,
    supplierCode: 'tripjack',
    ...overrides,
  };
}

describe('fares', () => {
  test('a special-return fare is never standalone', () => {
    expect(isStandaloneFare(fare())).toBe(true);
    expect(isStandaloneFare(fare({ fareIdentifier: 'SPECIAL_RETURN' }))).toBe(false);
  });

  test('pinFare prices the offer at that fare and keeps only it', () => {
    const chosen = fare({ fareId: 'F2', bookingTotalAmount: 7200, refundable: false });
    const pinned = pinFare(offer('A', { fares: [fare(), chosen] }), chosen);
    expect(pinned.selectedFareId).toBe('F2');
    expect(pinned.totalAmount).toBe(7200);
    expect(pinned.refundable).toBe(false);
    expect(pinned.fares).toEqual([chosen]);
  });

  test('cabin tiers follow the checked-baggage allowance', () => {
    expect(cabinTierForFare(fare({ checkInBaggage: '15 KG' }))).toBe('economy');
    expect(cabinTierForFare(fare({ checkInBaggage: '30 KG (2 pcs)' }))).toBe('premium');
    expect(cabinTierForFare(fare({ checkInBaggage: '40 KG (2 pcs)' }))).toBe('business');
  });

  test('the fare picker hides special-return fares and defaults to the cheapest', () => {
    const cheap = fare({ fareId: 'cheap', totalAmount: 4000 });
    const special = fare({ fareId: 'sr', totalAmount: 3000, fareIdentifier: 'SPECIAL_RETURN' });
    const o = offer('A', { fares: [fare(), cheap, special] });
    expect(selectableFares(o).map((f) => f.fareId)).toEqual(['F1', 'cheap']);
    const selection = cheapestFareSelection(o);
    expect(selection).toEqual({ tier: 'economy', fareId: 'cheap' });
    expect(resolveSelectedFare(o, selection)?.fareId).toBe('cheap');
  });
});

describe('filters', () => {
  const nonStop = offer('nonstop', { totalAmount: 6000 });
  const oneStop = offer('onestop', { totalAmount: 4000, refundable: false, airlineName: 'Air India' }, ['DXB']);

  test('layover cities come from the app-provided lookup', () => {
    expect(getLayoverCities(oneStop, cityForCode)).toEqual(['Dubai']);
  });

  test('stops, refundability, airline and layover filters combine', () => {
    const all = [nonStop, oneStop];
    expect(applyCombinedFilters(all, EMPTY_COMBINED_FILTERS, cityForCode)).toHaveLength(2);
    expect(applyCombinedFilters(all, { ...EMPTY_COMBINED_FILTERS, stops: new Set(['nonstop']) }, cityForCode)).toEqual([nonStop]);
    expect(applyCombinedFilters(all, { ...EMPTY_COMBINED_FILTERS, hideNonRefundable: true }, cityForCode)).toEqual([nonStop]);
    expect(applyCombinedFilters(all, { ...EMPTY_COMBINED_FILTERS, airlines: new Set(['Air India']) }, cityForCode)).toEqual([oneStop]);
    expect(applyCombinedFilters(all, { ...EMPTY_COMBINED_FILTERS, layoverCities: new Set(['Dubai']) }, cityForCode)).toEqual([oneStop]);
    expect(applyCombinedFilters(all, { ...EMPTY_COMBINED_FILTERS, priceMax: 5000 }, cityForCode)).toEqual([oneStop]);
  });

  test('the search form\'s non-stop choice starts the stops filter', () => {
    const summary = { nonStopOnly: true } as FlightSearchSummary;
    expect([...initialFilters(summary).stops]).toEqual(['nonstop']);
    expect(initialFilters(null).stops.size).toBe(0);
  });
});

describe('ordering', () => {
  const cheap = offer('cheap', { totalAmount: 3000 }, ['DXB']);
  const fast = offer('fast', { totalAmount: 9000 });
  const middle = offer('middle', { totalAmount: 5000 });

  test('featured picks are three different flights', () => {
    const { best, fastest, cheapest, rest } = pickFeaturedFlights([cheap, fast, middle]);
    expect(cheapest?.offerId).toBe('cheap');
    expect(fastest?.offerId).toBe('fast');
    expect(best?.offerId).toBe('middle');
    expect(rest).toEqual([]);
  });

  test('sorting by price and by journey time', () => {
    expect(sortOffers([fast, cheap, middle], 'priceLowToHigh', 1).map((o) => o.offerId)).toEqual(['cheap', 'middle', 'fast']);
    expect(sortOffers([cheap, fast], 'totalJourneyTime', 1)[0].offerId).toBe('fast');
    expect(sortOffers([fast, cheap], null, 1).map((o) => o.offerId)).toEqual(['fast', 'cheap']);
  });
});

describe('round trips and multi-city', () => {
  test('special-return fares pair only within the same supplier', () => {
    const onward = offer('on', { fares: [fare({ fareId: 'o1', matchingSpecialReturnIds: ['SR1'], bookingTotalAmount: 4000 })] });
    const back = offer('back', { tripLegIndex: 1, fares: [fare({ fareId: 'r1', specialReturnId: 'SR1', bookingTotalAmount: 3500 })] });
    const otherSupplier = offer('other', { tripLegIndex: 1, supplierCode: 'flyshop', fares: [fare({ fareId: 'r2', specialReturnId: 'SR1' })] });

    const packages = buildRoundTripPackages([], [onward], [back, otherSupplier]);
    expect(packages).toHaveLength(1);
    expect(packages[0].totalAmount).toBe(7500);
    expect(packages[0].onward.selectedFareId).toBe('o1');
    expect(packages[0].returnOffer?.selectedFareId).toBe('r1');
  });

  test('a whole-trip offer splits by tripIndex', () => {
    const whole = offer('whole');
    whole.segments = [
      { ...whole.segments[0], tripIndex: 0 },
      { ...whole.segments[0], origin: 'BOM', destination: 'DEL', tripIndex: 1 },
    ];
    expect(splitOfferByTrip(whole).map((o) => o.segments.length)).toEqual([1, 1]);
    expect(splitOfferByTrip(offer('single'))).toEqual([]);
  });

  test('a bundled multi-city offer splits back into its requested legs', () => {
    const bundle = offer('bundle', {}, ['DXB', 'BOM', 'GOI']);
    // DEL-DXB, DXB-BOM | BOM-GOI, GOI-BOM
    const groups = splitSegmentsByLegs(bundle.segments, [
      { origin: 'DEL', destination: 'BOM', travelDate: '' },
      { origin: 'BOM', destination: 'BOM', travelDate: '' },
    ]);
    expect(groups.map((g) => g.map((s) => s.destination))).toEqual([['DXB', 'BOM'], ['GOI', 'BOM']]);
  });
});

describe('display helpers', () => {
  test('prices use Indian grouping and show paise only when present', () => {
    expect(formatPrice(123456, 'INR')).toBe('₹1,23,456');
    expect(formatPrice(1588.5, 'INR')).toBe('₹1,588.50');
    expect(formatPrice(99, 'USD')).toBe('USD 99');
  });

  test('fare names follow the e-ticket labels', () => {
    expect(fareDisplayName(fare({ fareIdentifier: 'PUBLISHED' }))).toBe('Regular Fare');
    expect(fareDisplayName(fare({ fareIdentifier: null }))).toBe('Regular Fare');
    expect(fareDisplayName(fare({ fareIdentifier: 'OFFER_FARE_WITH_PNR' }))).toBe('Offer Fare');
    expect(fareDisplayName(fare({ fareIdentifier: 'SME_FARE' }))).toBe('Sme Fare');
    expect(fareDisplayName(fare({ fareIdentifier: 'CORPORATE' }))).toBe('Corporate Fare');
  });

  test('the check-in baggage filter needs a non-zero allowance', () => {
    expect(hasCheckInBaggage(offer('a', { fares: [fare({ checkInBaggage: '15 KG' })] }))).toBe(true);
    expect(hasCheckInBaggage(offer('b', { fares: [fare({ checkInBaggage: '0 KG' })] }))).toBe(false);
    expect(hasCheckInBaggage(offer('c', { fares: [fare({ checkInBaggage: null })] }))).toBe(false);
  });

  test('baggage texts are read as a number of pieces', () => {
    // Formats seen in UAT search results.
    expect(baggagePieces('30 Kg (2 pcs)')).toBe(2);
    expect(baggagePieces('40 Kg (2 pcs)')).toBe(2);
    expect(baggagePieces('12 Kg (1 pc)')).toBe(1);
    expect(baggagePieces('15 Kg (01 Piece only)')).toBe(1);
    expect(baggagePieces('1 Piece, 7 Kilogram each')).toBe(1);
    expect(baggagePieces('15 Kg')).toBe(1);
    expect(baggagePieces('30KG')).toBe(1);
    expect(baggagePieces('0 KG')).toBe(0);
    expect(baggagePieces('NIL')).toBe(0);
    expect(baggagePieces(null)).toBe(0);
  });

  test('the bag steppers keep offers whose fare allows that many pieces', () => {
    const oneBag = offer('one', { fares: [fare({ checkInBaggage: '15 Kg', handBaggage: '7 Kg' })] });
    const twoBags = offer('two', {
      fares: [fare({ checkInBaggage: '15 Kg' }), fare({ checkInBaggage: '30 Kg (2 pcs)', handBaggage: '12 Kg (1 pc)' })],
    });
    const none = offer('none', { fares: [fare({ checkInBaggage: '0 KG', handBaggage: null })] });
    const ids = (state: Partial<typeof EMPTY_COMBINED_FILTERS>) =>
      applyCombinedFilters([oneBag, twoBags, none], { ...EMPTY_COMBINED_FILTERS, ...state }, () => '').map((o) => o.offerId);
    expect(ids({ checkedBags: 1 })).toEqual(['one', 'two']);
    expect(ids({ checkedBags: 2 })).toEqual(['two']);
    expect(ids({ cabinBags: 1 })).toEqual(['one', 'two']);
    expect(ids({})).toEqual(['one', 'two', 'none']);
  });
});
