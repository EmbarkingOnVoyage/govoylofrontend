import { describe, test, expect } from 'vitest';
import type { TripBooking, TripBookingLeg } from '../useMyTripsMobile';
import {
  STATUS_ID_HELD,
  STATUS_ID_TICKETED,
  STATUS_ID_TICKETING,
  canCancel,
  eTicketUnavailableReason,
  formatCurrency,
  matchesSearch,
  routeTitle,
  statusDisplay,
  tripTab,
} from './myTrips';

function leg(overrides: Partial<TripBookingLeg> = {}): TripBookingLeg {
  return {
    legIndex: 0,
    origin: 'DEL',
    destination: 'BOM',
    travelDate: '2099-11-21T00:00:00',
    airlineCode: 'AI',
    airlineName: 'Air India',
    flightNumber: '2678',
    airlinePnr: 'ABC123',
    crsPnr: null,
    isCancelled: false,
    ...overrides,
  } as TripBookingLeg;
}

function booking(overrides: Partial<TripBooking> = {}): TripBooking {
  return {
    id: 'b1',
    supplierCode: 'tripjack',
    bookingRefNo: 'TJS105803131398',
    airlinePnr: 'ABC123',
    crsPnr: null,
    statusId: STATUS_ID_TICKETED,
    localStatus: 'Active',
    totalAmount: 1589,
    currencyCode: 'INR',
    passengerNames: 'Asha Rao, Ravi Rao',
    createdAt: '2026-10-06T10:00:00',
    cancellationType: null,
    cancelCode: null,
    legs: [leg()],
    cancelledAt: null,
    refundAmount: null,
    ...overrides,
  } as TripBooking;
}

describe('my trips helpers', () => {
  test('route titles for one-way, return and combined-return bookings', () => {
    expect(routeTitle(booking())).toBe('DEL → BOM');
    expect(routeTitle(booking({ legs: [leg(), leg({ legIndex: 1, origin: 'BOM', destination: 'DEL' })] }))).toBe('DEL ⇄ BOM');
    expect(routeTitle(booking({ legs: [leg({ destination: 'DEL' })] }))).toBe('DEL · Round trip');
  });

  test('e-ticket is only available once ticketed', () => {
    expect(eTicketUnavailableReason(booking())).toBeNull();
    expect(eTicketUnavailableReason(booking({ statusId: STATUS_ID_HELD }))).toContain('on hold');
    expect(eTicketUnavailableReason(booking({ statusId: STATUS_ID_TICKETING }))).toContain('still issuing');
  });

  test('tabs and status: upcoming, completed, cancelled, expired hold', () => {
    expect(tripTab(booking())).toBe('Upcoming');
    expect(tripTab(booking({ legs: [leg({ travelDate: '2020-01-01T00:00:00' })] }))).toBe('Completed');
    expect(tripTab(booking({ localStatus: 'Cancelled' }))).toBe('Cancelled');
    const expiredHold = booking({ statusId: STATUS_ID_HELD, legs: [leg({ travelDate: '2020-01-01T00:00:00' })] });
    expect(tripTab(expiredHold)).toBe('Cancelled');
    expect(statusDisplay(expiredHold).label).toBe('Expired');
    expect(statusDisplay(booking()).label).toBe('Confirmed');
  });

  test('only an upcoming, active booking with a PNR can be cancelled', () => {
    expect(canCancel(booking())).toBe(true);
    expect(canCancel(booking({ airlinePnr: null }))).toBe(false);
    expect(canCancel(booking({ statusId: STATUS_ID_TICKETING }))).toBe(false);
  });

  test('search matches reference, PNR, passenger and flight number', () => {
    expect(matchesSearch(booking(), 'tjs1058')).toBe(true);
    expect(matchesSearch(booking(), 'ravi')).toBe(true);
    expect(matchesSearch(booking(), 'AI2678')).toBe(true);
    expect(matchesSearch(booking(), 'GOI')).toBe(false);
  });

  test('rupee amounts use Indian grouping, paise only when present', () => {
    expect(formatCurrency(123456, 'INR')).toBe('₹1,23,456');
    expect(formatCurrency(123456.4, 'INR')).toBe('₹1,23,456.40');
  });
});
