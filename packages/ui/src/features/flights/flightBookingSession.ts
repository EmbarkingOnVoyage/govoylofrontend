import type { FlightOffer, FlightSearchSummary, PassengerCounts } from "./useSearchFlightsMobile";
import type { Traveler } from "../profile/useTravellersMobile";
import type { AddOnSelection } from "./logic/booking";
import type { PaxType } from "./logic/travellers";

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
  // Filled by Traveller details (web), read by the Payment step.
  checkout?: FlightCheckoutDetails;
}

// Who is flying and how to reach them, plus the extras and GST details —
// everything the hold request needs besides the legs.
export interface FlightCheckoutDetails {
  // Booking order: adults, then children, then infants.
  travellers: Traveler[];
  // The type each traveller flies as on these dates.
  paxTypes: Record<string, PaxType>;
  email: string;
  mobile: string;
  addOns: AddOnSelection[];
  gst?: { number: string; holderName: string; address: string };
}
