import { useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { useAuth } from "../authentication/AuthContext";
import type { FareCalendarParams, FareCalendarResponse } from "./useFareCalendarMobile";

export function useFareCalendarWeb(params: FareCalendarParams | null) {
  const { authFetch } = useAuth();

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
      const response = await authFetch(`${AUTH_BASE_URL}/api/v1/flights/fare-calendar?${query}`);

      if (!response.ok) {
        throw new Error("Failed to load fare calendar.");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
