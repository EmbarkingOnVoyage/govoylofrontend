import { useMutation, useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

// SsrType codes as returned by Flyshop's Air_GetSSR/Air_GetSeatMap (see
// FLIGHT_ANCILLARIES_SCOPE.MD in the backend repo for the full enum).
export const SSR_TYPE_BAGGAGE = 0;
export const SSR_TYPE_MEALS = 1;
export const SSR_TYPE_COMPLIMENTARY_MEALS = 2;
export const SSR_TYPE_SEAT = 3;

// SSR_Status: 0-ISLE/1-AVAILABLE/2-BLOCKED/3-BOOKED — meaningful for seats;
// baggage/meal options always come back as 0.
export const SSR_STATUS_AVAILABLE = 1;

export interface AncillaryOption {
  ssrType: number;
  ssrTypeName: string;
  ssrTypeDesc: string;
  ssrCode: string | null;
  ssrKey: string;
  ssrStatus: number;
  legIndex: number;
  segmentId: number;
  segmentWise: boolean;
  totalAmount: number;
  currencyCode: string;
  applicablePaxTypes: number[];
}

export interface FlightAncillariesResponse {
  options: AncillaryOption[];
}

// A trip booked as separate leg offers (domestic return / multi-city) passes every
// leg's offerId, in order, as itineraryOfferIds: Tripjack can only price its legs
// together, so the backend reprices the whole itinerary and returns this leg's part.
function itineraryQuery(itineraryOfferIds: string[] | undefined): string {
  if (!itineraryOfferIds || itineraryOfferIds.length < 2) {
    return "";
  }
  return "?" + itineraryOfferIds.map((id) => `itinerary=${encodeURIComponent(id)}`).join("&");
}

export function useFlightAncillariesMobile(offerId: string | undefined, itineraryOfferIds?: string[]) {
  return useQuery({
    queryKey: ["flight-ancillaries", offerId, itineraryOfferIds?.join(",")],
    enabled: !!offerId,
    queryFn: async (): Promise<FlightAncillariesResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/flights/offers/${offerId}/ancillaries${itineraryQuery(itineraryOfferIds)}`);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Failed to load add-on options.");
      }

      return response.json();
    },
  });
}

export interface SeatMapTraveler {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  paxType: string;
}

export interface SeatMapRow {
  seats: AncillaryOption[];
}

export interface SeatMapSegment {
  legIndex: number;
  rows: SeatMapRow[];
}

export interface SeatMapResponse {
  segments: SeatMapSegment[];
}

export function useSeatMapMobile(offerId: string | undefined, itineraryOfferIds?: string[]) {
  return useMutation({
    mutationFn: async (travelers: SeatMapTraveler[]): Promise<SeatMapResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/flights/offers/${offerId}/seatmap${itineraryQuery(itineraryOfferIds)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(travelers),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Failed to load seat map.");
      }

      return response.json();
    },
  });
}
