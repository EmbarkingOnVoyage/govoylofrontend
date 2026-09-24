import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../authentication/AuthContext";

export const BASE_URL = "https://localhost:5037";

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImageUrl: string | null;
  status: string;
  profileCompletionPercentage: number;
  createdAt: string;
  gender: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  maritalStatus: string | null;
  anniversary: string | null;
  cityOfResidence: string | null;
  state: string | null;
  maskedPassportNumber: string | null;
  passportExpiryDate: string | null;
  passportIssuingCountry: string | null;
  maskedPanCardNumber: string | null;
  autoAddTravelInsurance: boolean;
}

export function useCustomerProfile() {
  const { isLoggedIn, authFetch } = useAuth();

  return useQuery({
    queryKey: ["customer-profile"],
    queryFn: async (): Promise<CustomerProfile> => {
      const response = await authFetch(`${BASE_URL}/api/v1/customer/profile`);

      if (!response.ok) {
        throw new Error("Failed to load profile details.");
      }

      return response.json();
    },
    enabled: isLoggedIn,
  });
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
  nationality: string;
  maritalStatus: string;
  anniversary: string | null;
  cityOfResidence: string;
  state: string;
  autoAddTravelInsurance: boolean;
  // Undefined/omitted means "leave unchanged" — the backend only ever hands the
  // client a masked passport/PAN number, so these are only included when the
  // user has actually typed a new value (see PersonalDetailsContent).
  passportNumber?: string;
  passportExpiryDate?: string | null;
  passportIssuingCountry?: string;
  panCardNumber?: string;
}

async function postJson(url: string, authFetch: ReturnType<typeof useAuth>["authFetch"], body: unknown) {
  const response = await authFetch(url, {
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

export function useUpdateCustomerProfile() {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      await postJson(`${BASE_URL}/api/v1/customer/profile`, authFetch, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
      });

      await postJson(`${BASE_URL}/api/v1/customer/profile/details`, authFetch, {
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
