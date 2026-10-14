import { describe, test, expect } from 'vitest';
import type { FareOption, FlightOffer } from '../useSearchFlightsMobile';
import type { Traveler } from '../../profile/useTravellersMobile';
import { buildBookingLegs, buildBookingTravelers, legBaseFare, legDiscount, legListAmount, tripFareRows } from './booking';
import { offerListAmount } from './flightResults';
import { GSTIN_PATTERN, checkTravelerAge } from './travellers';

const fare = (overrides: Partial<FareOption>): FareOption => ({
  fareId: 'F1',
  refundable: true,
  totalAmount: 3000,
  currencyCode: 'INR',
  checkInBaggage: '15 KG',
  handBaggage: '7 KG',
  bookingTotalAmount: 3089,
  fareIdentifier: 'PUBLISHED',
  specialReturnId: null,
  matchingSpecialReturnIds: [],
  bookingBaseAmount: 3000,
  ...overrides,
});

const leg = (overrides: Partial<FlightOffer>): FlightOffer => ({
  offerId: 'O1',
  airlineCode: 'AI',
  airlineName: 'Air India',
  refundable: true,
  isLowCostCarrier: false,
  segments: [],
  totalAmount: 3089,
  currencyCode: 'INR',
  seatsAvailable: 9,
  fares: [fare({})],
  tripLegIndex: 0,
  supplierCode: 'tripjack',
  ...overrides,
});

const traveler = (id: string, overrides: Partial<Traveler> = {}): Traveler => ({
  id,
  travelerType: 'adult',
  firstName: 'Asha',
  lastName: 'Rao',
  dateOfBirth: '1990-05-01',
  gender: 'Female',
  autoAddTravelInsurance: false,
  ...overrides,
});

describe('hold request', () => {
  test('legs carry the picked fare, its fare type and each traveller add-on by pax id', () => {
    const offer = leg({
      selectedFareId: 'F2',
      fares: [fare({ fareId: 'F2', fareIdentifier: 'OFFER_FARE_WITH_PNR' })],
    });
    const travellers = [traveler('t1'), traveler('t2', { firstName: 'Ravi', gender: 'Male' })];
    const legs = buildBookingLegs(
      [offer],
      [{ legIndex: 0, category: 'seat', travelerId: 't2', ssrKey: 'SEAT-12A', label: '12A', amount: 350 }],
      travellers
    );
    expect(legs).toEqual([
      { offerId: 'O1', fareId: 'F2', fareType: 'OFFER_FARE_WITH_PNR', selectedSsrs: [{ paxId: 2, ssrKey: 'SEAT-12A' }] },
    ]);
  });

  test('travellers get 1-based pax ids, titles and the type they fly as', () => {
    const result = buildBookingTravelers([traveler('t1'), traveler('t2', { gender: 'Male' })], (t) =>
      t.id === 't2' ? 'child' : 'adult'
    );
    expect(result.map((t) => [t.paxId, t.title, t.paxType, t.savedTravelerId])).toEqual([
      [1, 'Ms', 'Adult', 't1'],
      [2, 'Mr', 'Child', 't2'],
    ]);
  });

  test('base fare comes from the booked fare, or 0 when not split', () => {
    expect(legBaseFare(leg({}))).toBe(3000);
    expect(legBaseFare(leg({ fares: [fare({ bookingBaseAmount: undefined })] }))).toBe(0);
  });
});

describe('traveller rules', () => {
  test('passenger type follows age on the travel dates', () => {
    expect(checkTravelerAge(traveler('a', { dateOfBirth: '2025-12-01' }), '2026-11-28T09:00', '2026-11-28T09:00').type).toBe('infant');
    expect(checkTravelerAge(traveler('c', { dateOfBirth: '2018-01-01' }), '2026-11-28T09:00', '2026-11-28T09:00').type).toBe('child');
    expect(checkTravelerAge(traveler('b', { dateOfBirth: '2027-01-01' }), '2026-11-28T09:00', undefined).blocked).toBe(true);
  });

  test('GSTIN format', () => {
    expect(GSTIN_PATTERN.test('27AAPFU0939F1ZV')).toBe(true);
    expect(GSTIN_PATTERN.test('27AAPFU0939F1Z')).toBe(false);
  });
});

describe('commission discount', () => {
  // ₹7,297 fare for one adult, ₹500 commission, all of it given back.
  const discounted = leg({
    totalAmount: 7297,
    discountAmount: 500,
    fares: [fare({ bookingTotalAmount: 7297, bookingBaseAmount: 5500, bookingListAmount: 7797, bookingDiscountAmount: 500, bookingCommissionAmount: 500 })],
  });

  test('the base fare includes the commission and the discount comes off', () => {
    expect(legBaseFare(discounted)).toBe(6000);
    expect(legDiscount(discounted)).toBe(500);
    expect(legListAmount(discounted)).toBe(7797);
    expect(offerListAmount(discounted)).toBe(7797);
  });

  test('a fare without commission is shown as before', () => {
    const plain = leg({ fares: [fare({})] });
    expect(legBaseFare(plain)).toBe(3000);
    expect(legDiscount(plain)).toBe(0);
    expect(legListAmount(plain)).toBe(3089);
  });

  test('trip details add up to what was paid', () => {
    const rows = tripFareRows({
      booking: { commissionAmount: 500, discountAmount: 500, convenienceFee: 73 } as any,
      supplierDetailsAvailable: true,
      segments: [],
      passengers: [],
      baseFare: 5500,
      taxesAndFees: 1797,
      totalPaid: 7970,
    });
    expect(rows.baseFare).toBe(6000);
    expect(rows.addOns).toBe(600);
    expect(rows.discount).toBe(500);
    expect(rows.baseFare! + rows.taxesAndFees! + rows.addOns + rows.convenienceFee - rows.discount).toBe(7970);
  });
});
