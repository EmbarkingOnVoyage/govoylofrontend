import { useMutation } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export type TripType = "OneWay" | "RoundTrip" | "MultiCity";
export type CabinClass = "Economy" | "PremiumEconomy" | "Business" | "First";

export interface FlightSearchSegment {
  origin: string;
  destination: string;
  travelDate: string;
}

export interface FlightSearchRequest {
  tripType: TripType;
  cabinClass: CabinClass;
  segments: FlightSearchSegment[];
  adultCount: number;
  childCount: number;
  infantCount: number;
}

// How many of each passenger type the search was for — Traveller Details
// asks for exactly this many travellers of each type.
export interface PassengerCounts {
  adult: number;
  child: number;
  infant: number;
}

export interface FlightOfferSegment {
  origin: string;
  destination: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string;
  // Which trip of a whole-trip offer (e.g. a Tripjack international return)
  // this segment belongs to: 0 outbound, 1 return, ... Always 0 otherwise.
  tripIndex?: number;
}

export interface FareOption {
  fareId: string;
  refundable: boolean;
  // Per adult — the fare picker's "/adult" figure.
  totalAmount: number;
  currencyCode: string;
  checkInBaggage: string | null;
  handBaggage: string | null;
  // This fare for every searched passenger.
  bookingTotalAmount: number;
  // Supplier fare type, e.g. "PUBLISHED" / "SPECIAL_RETURN".
  fareIdentifier: string | null;
  // Supplier special-return pairing: a fare is only bookable on a round trip
  // with an other-leg fare whose specialReturnId is in its
  // matchingSpecialReturnIds.
  specialReturnId: string | null;
  matchingSpecialReturnIds: string[];
}

export interface FlightOffer {
  offerId: string;
  airlineCode: string;
  airlineName: string;
  refundable: boolean;
  isLowCostCarrier: boolean;
  segments: FlightOfferSegment[];
  totalAmount: number;
  currencyCode: string;
  seatsAvailable: number;
  fares: FareOption[];
  // Index into the search request's segments this offer satisfies: 0 for a
  // one-way/onward leg, 1 for a round-trip return leg. Lets the UI split a
  // round-trip response into its two legs instead of one flat list.
  tripLegIndex: number;
  // "flyshop" / "tripjack" — which supplier this offer came from. Both
  // suppliers' prices are merged into one result set, so this is the only
  // thing that distinguishes them.
  supplierCode: string;
  // Set when a specific fare (not the default) is chosen for this leg — the
  // fare picker's choice, or the matched fare of a supplier package. totalAmount
  // and fares then reflect that fare; the booking sends it as the leg's fareId.
  selectedFareId?: string;
}

export interface FlightSearchResponse {
  offers: FlightOffer[];
}

// Search context the results screen needs to render its header (route, dates,
// passenger/cabin summary) and to re-run the search when the user picks a
// different date from the fare strip — captured at search time since the
// results screen itself only receives the offers, not the request that
// produced them. `request` is the exact payload that produced the current
// offers, so re-searching only needs to patch its first segment's date.
export interface FlightSearchSummary {
  request: FlightSearchRequest;
  originCode: string;
  destinationCode: string;
  departureDate: string;
  returnDate?: string;
  passengerCount: number;
  cabinClass: CabinClass;
  // The search form's "Non stop flight only" switch — applied on the results
  // screen as its starting stops filter (the search itself returns every flight).
  nonStopOnly?: boolean;
}

export function useSearchFlightsMobile() {
  return useMutation({
    mutationFn: async (request: FlightSearchRequest): Promise<FlightSearchResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/flights/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Failed to search flights.");
      }

      return response.json();
    },
  });
}
