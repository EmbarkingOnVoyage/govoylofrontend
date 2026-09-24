import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { authContextCache } from "../authentication/authContextCache";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";
import type { CustomerProfile, UpdateProfilePayload } from "./useCustomerProfile";

export type { CustomerProfile, UpdateProfilePayload } from "./useCustomerProfile";

export function useCustomerProfileMobile() {
  return useQuery({
    queryKey: ["customer-profile"],
    queryFn: async (): Promise<CustomerProfile> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/customer/profile`);

      if (!response.ok) {
        throw new Error("Failed to load profile details.");
      }

      return response.json();
    },
    enabled: authContextCache.isLoggedIn(),
  });
}

async function postJson(url: string, body: unknown) {
  const response = await mobileAuthFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message || "Failed to save profile details.");
  }

  return response.json();
}

export function useUpdateCustomerProfileMobile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      await postJson(`${AUTH_BASE_URL}/api/v1/customer/profile`, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
      });

      await postJson(`${AUTH_BASE_URL}/api/v1/customer/profile/details`, {
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        nationality: payload.nationality,
        maritalStatus: payload.maritalStatus,
        anniversary: payload.anniversary,
        cityOfResidence: payload.cityOfResidence,
        state: payload.state,
        passportNumber: payload.passportNumber,
        passportExpiryDate: payload.passportExpiryDate,
        passportIssuingCountry: payload.passportIssuingCountry,
        panCardNumber: payload.panCardNumber,
        autoAddTravelInsurance: payload.autoAddTravelInsurance,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
    },
  });
}
