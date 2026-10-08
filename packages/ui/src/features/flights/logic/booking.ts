// Building the hold request (POST /api/v1/flights/bookings) from the chosen
// legs, travellers and add-ons — the same rules as the mobile Traveller
// Details screen's Pay flow.
import type { FlightOffer } from '../useSearchFlightsMobile';
import type { BookingLegRequest, BookingTravelerRequest } from '../useCreateBookingMobile';
import type { Traveler } from '../../profile/useTravellersMobile';
import { PAX_API_TYPES, type PaxType } from './travellers';

export type AddOnCategory = 'baggage' | 'seat' | 'meal';

// One traveller's add-on on one leg (seats: one per flight segment).
export interface AddOnSelection {
  legIndex: number;
  category: AddOnCategory;
  travelerId: string;
  ssrKey: string;
  label: string;
  amount: number;
}

// Supplier passenger ids are 1-based, in booking order (adults, children, infants).
export function paxIdsFor(travelers: Traveler[]): Map<string, number> {
  return new Map(travelers.map((t, index) => [t.id, index + 1]));
}

export function buildBookingTravelers(
  travelers: Traveler[],
  paxTypeOf: (traveler: Traveler) => PaxType
): BookingTravelerRequest[] {
  const paxIds = paxIdsFor(travelers);
  return travelers.map((t) => ({
    paxId: paxIds.get(t.id) ?? 0,
    title: t.gender === 'Female' ? 'Ms' : 'Mr',
    firstName: t.firstName,
    lastName: t.lastName,
    gender: t.gender === 'Female' ? 'Female' : 'Male',
    // The type they fly as on these dates, which can differ from the saved one.
    paxType: PAX_API_TYPES[paxTypeOf(t)],
    dateOfBirth: t.dateOfBirth || undefined,
    savedTravelerId: t.id,
  }));
}

export function buildBookingLegs(
  legs: FlightOffer[],
  addOns: AddOnSelection[],
  travelers: Traveler[]
): BookingLegRequest[] {
  const paxIds = paxIdsFor(travelers);
  return legs.map((leg, legIndex) => ({
    offerId: leg.offerId,
    fareId: leg.selectedFareId,
    fareType: bookedFare(leg)?.fareIdentifier ?? undefined,
    selectedSsrs: addOns
      .filter((s) => s.legIndex === legIndex)
      .map((s) => ({ paxId: paxIds.get(s.travelerId) ?? 0, ssrKey: s.ssrKey })),
  }));
}

// The fare being booked on a leg: the one picked, else the offer's own.
export function bookedFare(leg: FlightOffer) {
  return (
    leg.fares.find((f) => f.fareId === leg.selectedFareId) ??
    leg.fares.find((f) => Math.round(f.bookingTotalAmount) === Math.round(leg.totalAmount))
  );
}

// A leg's base fare for every passenger — 0 when the supplier didn't split
// base and taxes.
export function legBaseFare(leg: FlightOffer): number {
  return bookedFare(leg)?.bookingBaseAmount ?? 0;
}

export const ADD_ON_LABELS: Record<AddOnCategory, string> = {
  seat: 'Seats',
  meal: 'Meals',
  baggage: 'Extra baggage',
};
