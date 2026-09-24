import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { authContextCache } from "../authentication/authContextCache";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export interface Traveler {
  id: string;
  travelerType: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string | null;
  nationality?: string | null;
  city?: string | null;
  state?: string | null;
  autoAddTravelInsurance: boolean;
}

export interface TravelerPassport {
  id: string;
  maskedPassportNumber: string;
  issuingCountry: string;
  expiryDate: string;
}

export interface TravelerDetail extends Traveler {
  passport?: TravelerPassport | null;
}

export interface TravelerPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender?: string;
  nationality?: string;
  city?: string;
  state?: string;
  autoAddTravelInsurance: boolean;
  passportNumber?: string;
  passportIssuingCountry?: string;
  passportExpiryDate?: string | null;
}

const TRAVELLERS_URL = `${AUTH_BASE_URL}/api/v1/travellers`;

export function useTravellersMobile() {
  return useQuery({
    queryKey: ["travellers"],
    queryFn: async (): Promise<Traveler[]> => {
      const response = await mobileAuthFetch(TRAVELLERS_URL);
      if (!response.ok) {
        throw new Error("Failed to load co-travellers.");
      }
      return response.json();
    },
    enabled: authContextCache.isLoggedIn(),
  });
}

export function useTravellerDetailMobile(id: string | null) {
  return useQuery({
    queryKey: ["travellers", id],
    queryFn: async (): Promise<TravelerDetail> => {
      const response = await mobileAuthFetch(`${TRAVELLERS_URL}/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load traveller details.");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

async function sendJson(url: string, method: string, body: unknown) {
  const response = await mobileAuthFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message || "Failed to save co-traveller.");
  }

  return response.status === 204 ? null : response.json().catch(() => null);
}

export function useSaveTravellerMobile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id?: string; hasExistingPassport: boolean; payload: TravelerPayload }) => {
      const { id, hasExistingPassport, payload } = params;

      const travelerBody = {
        travelerType: "adult",
        firstName: payload.firstName,
        lastName: payload.lastName,
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        nationality: payload.nationality,
        city: payload.city,
        state: payload.state,
        autoAddTravelInsurance: payload.autoAddTravelInsurance,
      };

      let travelerId = id;
      if (travelerId) {
        await sendJson(`${TRAVELLERS_URL}/${travelerId}`, "PUT", travelerBody);
      } else {
        const created = await sendJson(TRAVELLERS_URL, "POST", travelerBody);
        travelerId = created?.id;
      }

      if (payload.passportNumber && travelerId) {
        const passportBody = {
          passportNumber: payload.passportNumber,
          issuingCountry: payload.passportIssuingCountry,
          expiryDate: payload.passportExpiryDate,
        };
        await sendJson(
          `${TRAVELLERS_URL}/${travelerId}/passport`,
          hasExistingPassport ? "PUT" : "POST",
          passportBody
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travellers"] });
    },
  });
}

export function useDeleteTravellerMobile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await mobileAuthFetch(`${TRAVELLERS_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to remove co-traveller.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travellers"] });
    },
  });
}
