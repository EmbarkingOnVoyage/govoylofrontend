import { useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

// Matches GoVoylo.Application/Features/Airports/Dtos/AirportDto.cs exactly.
export interface AirportResult {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  isPopular: boolean;
}

// Search-as-you-type for the origin/destination picker, backed by the real
// GET /api/v1/airports/search?q=... endpoint (GoVoylo.Api/Controllers/AirportsController.cs).
// The caller is responsible for debouncing `query` before it changes — this
// hook just maps the (already-debounced) query straight to a query key, so
// React Query's own dedup/cache takes care of the rest. The backend's own
// validator requires 2+ characters, so this mirrors that client-side to
// avoid a wasted request per keystroke below that length.
export function useAirportsMobile(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["airports", "search", trimmed],
    queryFn: async (): Promise<AirportResult[]> => {
      const params = new URLSearchParams({ q: trimmed });
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/airports/search?${params}`);

      if (!response.ok) {
        throw new Error("Failed to search airports.");
      }

      return response.json();
    },
    enabled: trimmed.length >= 2,
    staleTime: 30 * 60 * 1000,
  });
}
