import type { FlightOffer, FlightSearchSummary, PassengerCounts } from "./useSearchFlightsMobile";

// What the flights results step hands to Traveller details: the search it
// came from and one chosen offer per leg, each pinned to its picked fare
// (see pinFare in logic/flightResults). Stored with useBookingSession("flights").
export interface FlightBookingSelection {
  summary: FlightSearchSummary;
  legs: FlightOffer[];
  // "Onward"/"Return" or "Flight 1", "Flight 2", ... for a multi-leg trip.
  legLabels?: string[];
  passengerCounts: PassengerCounts;
  // ISO time the fares were picked, so a stale selection can be re-searched.
  selectedAt: string;
}
