import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { authContextCache } from "../authentication/authContextCache";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export interface TripBookingLeg {
  legIndex: number;
  origin: string;
  destination: string;
  travelDate: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  airlinePnr: string | null;
  crsPnr: string | null;
  // True once this leg was cancelled on its own (the rest of the booking stands).
  isCancelled: boolean;
}

// statusId: the supplier's status at booking time (11-Success/22-Failed/33-Block/
// 44-Ticketing in progress).
// localStatus: this app's own lifecycle tracking (Active/Cancelled/Released),
// which is what the UI should actually key off of for what to show/allow.
export interface TripBooking {
  id: string;
  supplierCode: string;
  bookingRefNo: string;
  airlinePnr: string | null;
  crsPnr: string | null;
  statusId: string;
  localStatus: "Active" | "Cancelled" | "Released";
  totalAmount: number;
  currencyCode: string;
  passengerNames: string;
  createdAt: string;
  // Only set once localStatus is "Cancelled" — a Released hold has neither.
  cancellationType: number | null;
  cancelCode: string | null;
  legs: TripBookingLeg[];
  cancelledAt: string | null;
  // What the supplier said it will refund once cancelled; null if it didn't say.
  refundAmount: number | null;
}

// legIndex: which leg of the booking the flight belongs to (0 outbound, 1 return).
export interface TripBookingSegment {
  legIndex: number;
  origin: string;
  destination: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departureDateTime: string;
  arrivalDateTime: string;
  durationMinutes: number;
}

export interface TripBookingPassenger {
  title: string;
  firstName: string;
  lastName: string;
  paxType: "Adult" | "Child" | "Infant";
}

// supplierDetailsAvailable is false when the supplier couldn't be reached — the
// lists are then empty and the screen falls back to the booking's own legs and
// passenger names.
export interface TripBookingDetails {
  booking: TripBooking;
  supplierDetailsAvailable: boolean;
  segments: TripBookingSegment[];
  passengers: TripBookingPassenger[];
  baseFare: number | null;
  taxesAndFees: number | null;
  totalPaid: number;
}

export type CancellationQuoteVariant = "FreeCancellation" | "NonRefundable" | "PartialRefund" | "Estimated";

export interface CancellationQuote {
  amountPaid: number;
  cancellationCharges: number;
  refundAmount: number;
  baseFare: number | null;
  taxesAndFees: number | null;
  // The supplier can't quote before cancelling, so the fee is estimated from its
  // fare rules and the final refund is confirmed afterwards.
  isEstimate: boolean;
  variant: CancellationQuoteVariant;
  currencyCode: string;
}

export interface CancelTripBookingRequest {
  tripBookingId: string;
  // Both optional — omit for the ordinary cancel button (defaults to a customer-
  // initiated Normal Cancel on the backend). Supply to request a specific
  // Air_TicketCancellation type, e.g. 1-Full Refund or 2-No Show.
  cancellationType?: number;
  cancelCode?: string;
  // Omit to cancel every leg.
  legIndex?: number;
}

export interface CancelTripBookingResponse {
  success: boolean;
  localStatus: string;
  refundAmount: number | null;
}

const MY_BOOKINGS_URL = `${AUTH_BASE_URL}/api/v1/flights/mybookings`;

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const errorBody = await response.json().catch(() => null);
  return errorBody?.error?.message || fallback;
}

// The booking's e-ticket PDF (the same one emailed after ticketing). Only a
// ticketed booking has one; anything else comes back as an error message.
export async function fetchETicketPdfMobile(tripBookingId: string): Promise<Blob> {
  const response = await mobileAuthFetch(`${MY_BOOKINGS_URL}/${tripBookingId}/eticket`);
  if (!response.ok) {
    throw new Error(await errorMessage(response, "Couldn't download the e-ticket right now."));
  }
  return response.blob();
}

export function useMyTripsMobile() {
  return useQuery({
    queryKey: ["my-trips"],
    queryFn: async (): Promise<TripBooking[]> => {
      const response = await mobileAuthFetch(MY_BOOKINGS_URL);
      if (!response.ok) {
        throw new Error("Failed to load your trips.");
      }
      return response.json();
    },
    enabled: authContextCache.isLoggedIn(),
  });
}

export function useTripBookingDetailsMobile(tripBookingId: string | undefined) {
  return useQuery({
    queryKey: ["my-trip-details", tripBookingId],
    enabled: !!tripBookingId && authContextCache.isLoggedIn(),
    queryFn: async (): Promise<TripBookingDetails> => {
      const response = await mobileAuthFetch(`${MY_BOOKINGS_URL}/${tripBookingId}`);
      if (!response.ok) {
        throw new Error(await errorMessage(response, "Failed to load this booking."));
      }
      return response.json();
    },
  });
}

// Read-only — nothing is cancelled. Not cached: the airline's fee can change by the minute.
export function useCancellationQuoteMobile(tripBookingId: string | undefined, enabled: boolean, legIndex?: number) {
  return useQuery({
    queryKey: ["my-trip-cancellation-quote", tripBookingId, legIndex ?? null],
    enabled: enabled && !!tripBookingId,
    gcTime: 0,
    retry: false,
    queryFn: async (): Promise<CancellationQuote> => {
      const query = legIndex === undefined ? "" : `?legIndex=${legIndex}`;
      const response = await mobileAuthFetch(`${MY_BOOKINGS_URL}/${tripBookingId}/cancellation-quote${query}`);
      if (!response.ok) {
        throw new Error(await errorMessage(response, "Couldn't get the refund amount right now."));
      }
      return response.json();
    },
  });
}

export function useCancelTripBookingMobile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripBookingId,
      cancellationType,
      cancelCode,
      legIndex,
    }: CancelTripBookingRequest): Promise<CancelTripBookingResponse> => {
      const response = await mobileAuthFetch(`${MY_BOOKINGS_URL}/${tripBookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancellationType: cancellationType ?? null,
          cancelCode: cancelCode ?? null,
          legIndex: legIndex ?? null,
        }),
      });
      if (!response.ok) {
        throw new Error(await errorMessage(response, "Failed to cancel this booking."));
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      queryClient.invalidateQueries({ queryKey: ["my-trip-details", variables.tripBookingId] });
    },
  });
}
