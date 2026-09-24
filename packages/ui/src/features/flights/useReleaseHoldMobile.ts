import { useMutation } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export interface ReleaseHoldRequest {
  bookingRefNo: string;
  airlinePnr: string;
}

export interface ReleaseHoldResponse {
  success: boolean;
}

// Releases a Flyshop Block_Ticket hold via Air_ReleasePNR — used when a hold was
// placed but the customer backs out or payment fails/is cancelled before the
// booking completes, so the seat isn't held against them for no reason.
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
