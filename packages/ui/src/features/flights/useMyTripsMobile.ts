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
}

// statusId: Flyshop's own status at booking time (11-Success/22-Failed/33-Block).
// localStatus: this app's own lifecycle tracking (Active/Cancelled/Released),
// which is what the UI should actually key off of for what to show/allow.
export interface TripBooking {
  id: string;
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
}

export interface CancelTripBookingRequest {
  tripBookingId: string;
  // Both optional — omit for the ordinary cancel button (defaults to a customer-
  // initiated Normal Cancel on the backend). Supply to request a specific
  // Air_TicketCancellation type, e.g. 1-Full Refund or 2-No Show.
  cancellationType?: number;
  cancelCode?: string;
}

const MY_BOOKINGS_URL = `${AUTH_BASE_URL}/api/v1/flights/mybookings`;

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

export function useCancelTripBookingMobile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripBookingId,
      cancellationType,
      cancelCode,
    }: CancelTripBookingRequest): Promise<{ success: boolean; localStatus: string }> => {
      const response = await mobileAuthFetch(`${MY_BOOKINGS_URL}/${tripBookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationType: cancellationType ?? null, cancelCode: cancelCode ?? null }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Failed to cancel this booking.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
    },
  });
}
