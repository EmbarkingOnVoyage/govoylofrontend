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
  flightNumber: string;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string;
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
}

export interface FlightSearchResponse {
  offers: FlightOffer[];
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
