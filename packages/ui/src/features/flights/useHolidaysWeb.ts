import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../authentication/AuthContext";
import type { HolidaysResponse } from "./useHolidaysMobile";

const BASE_URL = "https://localhost:5037";

// country defaults to India for now — once geo-location picks the user's
// actual country, pass that ISO-3166 code through instead.
export function useHolidaysWeb(year: number, country: string = "IN") {
  const { authFetch } = useAuth();

  return useQuery({
    queryKey: ["holidays", country, year],
    queryFn: async (): Promise<HolidaysResponse> => {
      const query = new URLSearchParams({ year: String(year), country });
      const response = await authFetch(`${BASE_URL}/api/v1/holidays?${query}`);

      if (!response.ok) {
        throw new Error("Failed to load holidays.");
      }

      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
