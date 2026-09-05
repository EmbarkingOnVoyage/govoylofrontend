import { useQuery } from "@tanstack/react-query";
import { authContextCache } from "../authentication/authContextCache";
import { useAuth } from "../authentication/AuthContext";

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

async function fetchCustomerProfile(): Promise<CustomerProfile> {
  const response = await fetch("https://localhost:5037/api/v1/customer/profile", {
    headers: {
      Authorization: `Bearer ${authContextCache.getAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load profile details.");
  }

  return response.json();
}

export function useCustomerProfile() {
  const { isLoggedIn } = useAuth();

  return useQuery({
    queryKey: ["customer-profile"],
    queryFn: fetchCustomerProfile,
    enabled: isLoggedIn,
  });
}
