import { useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export interface Holiday {
  date: string; // ISO date
  name: string;
}

export interface HolidaysResponse {
  holidays: Holiday[];
}

// country defaults to India for now — once geo-location picks the user's
// actual country, pass that ISO-3166 code through instead.
export function useHolidaysMobile(year: number, country: string = "IN") {
  return useQuery({
    queryKey: ["holidays", country, year],
    queryFn: async (): Promise<HolidaysResponse> => {
      const query = new URLSearchParams({ year: String(year), country });
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/holidays?${query}`);

      if (!response.ok) {
        throw new Error("Failed to load holidays.");
      }

      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
