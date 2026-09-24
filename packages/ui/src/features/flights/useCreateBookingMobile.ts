import { useMutation } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

// Air_Ticketing's own docs: Status_Id 22 is the only documented failure code —
// everything else (11-Success, 33-Block) means the hold went through.
export const BOOKING_STATUS_FAILED = "22";

export interface BookingSsrSelectionRequest {
  paxId: number;
  ssrKey: string;
}

export interface BookingLegRequest {
  offerId: string;
  selectedSsrs: BookingSsrSelectionRequest[];
}

export interface BookingTravelerRequest {
  paxId: number;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  paxType: string;
}

export interface CreateBookingRequest {
  legs: BookingLegRequest[];
  travelers: BookingTravelerRequest[];
  passengerMobile: string;
  passengerEmail: string;
}

export interface CreateBookingResponse {
  bookingRefNo: string;
  statusId: string;
  airlineCode: string | null;
  airlinePnr: string | null;
  recordLocator: string | null;
  failureRemark: string | null;
}

// Places a Flyshop Block_Ticket hold (a reversible hold, not a final purchase
// — see FLIGHT_ANCILLARIES_SCOPE.MD in the backend repo) across every leg,
// with each leg's selected baggage/seat/meal SSR keys attached per traveller.
export function useCreateBookingMobile() {
  return useMutation({
    mutationFn: async (request: CreateBookingRequest): Promise<CreateBookingResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/flights/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Could not hold your flight. Please try again.");
      }

      return response.json();
    },
  });
}
