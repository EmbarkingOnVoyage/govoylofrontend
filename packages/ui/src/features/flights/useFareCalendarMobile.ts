import { useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export interface FareCalendarDay {
  date: string;
  amount: number;
  currencyCode: string;
}

export interface FareCalendarResponse {
  days: FareCalendarDay[];
}

export interface FareCalendarParams {
  origin: string;
  destination: string;
  month: number; // 1-12
  year: number;
}

export function useFareCalendarMobile(params: FareCalendarParams | null) {
  return useQuery({
    queryKey: ["fare-calendar", params?.origin, params?.destination, params?.month, params?.year],
    enabled: !!params,
    queryFn: async (): Promise<FareCalendarResponse> => {
      const { origin, destination, month, year } = params!;
      const query = new URLSearchParams({
        origin,
        destination,
        month: String(month),
        year: String(year),
      });
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/flights/fare-calendar?${query}`);

      if (!response.ok) {
        throw new Error("Failed to load fare calendar.");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
