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
  // A non-default fare of this offer to book (FlightOffer.selectedFareId).
  fareId?: string;
  // The booked fare's supplier fare type (FareOption.fareIdentifier, e.g.
  // "PUBLISHED"), printed on the e-ticket.
  fareType?: string;
}

export interface BookingTravelerRequest {
  paxId: number;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  paxType: string;
  // Optional for Adult/Child, but required by Flyshop for Infant — and, per a
  // live "Passenger DOB required" rejection, effectively required whenever a
  // non-Adult traveller is present at all. Always send it when the saved
  // traveller profile has one.
  dateOfBirth?: string;
  // The saved traveller's id. The travellers API only ever returns a passport
  // number masked, so the backend looks up and fills the passport on file
  // from this id instead (needed for international bookings).
  savedTravelerId?: string;
}

export interface CreateBookingRequest {
  legs: BookingLegRequest[];
  travelers: BookingTravelerRequest[];
  passengerMobile: string;
  passengerEmail: string;
  // Optional GST invoice details — send all three or none.
  gstNumber?: string;
  gstHolderName?: string;
  gstAddress?: string;
}

export interface CreateBookingResponse {
  bookingRefNo: string;
  statusId: string;
  airlineCode: string | null;
  airlinePnr: string | null;
  crsPnr: string | null;
  recordLocator: string | null;
  failureRemark: string | null;
  // What the supplier will actually charge (all passengers + add-ons), when it
  // confirms an amount at booking time — fares can change after search. Null
  // means charge the searched price.
  confirmedTotalAmount?: number | null;
  // GoVoylo's convenience fee as the server calculated it, charged on top of
  // the fare total — this, not the app's own estimate, is what gets charged.
  convenienceFee?: number;
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
