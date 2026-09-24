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
  statusId: string;
  localStatus: "Active" | "Cancelled" | "Released";
  totalAmount: number;
  currencyCode: string;
  passengerNames: string;
  createdAt: string;
  legs: TripBookingLeg[];
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
    mutationFn: async (tripBookingId: string): Promise<{ success: boolean; localStatus: string }> => {
      const response = await mobileAuthFetch(`${MY_BOOKINGS_URL}/${tripBookingId}/cancel`, {
        method: "POST",
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
