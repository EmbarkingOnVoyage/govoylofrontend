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

export interface FlightOfferSegment {
  origin: string;
  destination: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string;
}

export interface FareOption {
  fareId: string;
  refundable: boolean;
  totalAmount: number;
  currencyCode: string;
  checkInBaggage: string | null;
  handBaggage: string | null;
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
