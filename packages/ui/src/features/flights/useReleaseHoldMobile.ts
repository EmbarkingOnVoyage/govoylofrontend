import { useMutation } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export interface ReleaseHoldRequest {
  bookingRefNo: string;
  // Null for a hold with no airline PNR (Flyshop direct temp booking, a fare
  // the supplier can't hold): the server just marks the booking released.
  airlinePnr: string | null;
}

export interface ReleaseHoldResponse {
  success: boolean;
}

// Gives up a hold when the customer backs out or payment fails/is cancelled
// before the booking completes: the server releases it with the supplier (when
// there's a PNR) and marks the booking Released, so the seat isn't held against
// them and My Trips doesn't keep showing it as on hold.
export function useReleaseHoldMobile() {
  return useMutation({
    mutationFn: async (request: ReleaseHoldRequest): Promise<ReleaseHoldResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/flights/bookings/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Could not release the held flight.");
      }

      return response.json();
    },
  });
}
