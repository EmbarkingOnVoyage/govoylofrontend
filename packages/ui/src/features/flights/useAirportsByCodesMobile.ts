import { useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";
import type { AirportResult } from "./useAirportsMobile";

// Batched code->airport lookup, used by the results screen to resolve every
// airport code appearing across a set of flight offers (origins,
// destinations, layover stops) in one logical fetch. There's no batch
// endpoint on the backend, only GET /api/v1/airports/{iata} for a single
// code, so this fires one request per distinct code in parallel — typically
// a handful per search-results screen — under a single React Query cache
// entry. A code the master dataset doesn't have (404) is dropped rather than
// failing the whole batch; callers already fall back to showing the raw code
// for anything not in the resolved map.
export function useAirportsByCodesMobile(codes: string[]) {
  const sortedCodes = [...new Set(codes)].sort();

  return useQuery({
    queryKey: ["airports", "byCodes", sortedCodes],
    queryFn: async (): Promise<AirportResult[]> => {
      const results = await Promise.all(
        sortedCodes.map(async (code) => {
          const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/airports/${code}`);
          if (!response.ok) {
            return null;
          }
          return (await response.json()) as AirportResult;
        })
      );

      return results.filter((a): a is AirportResult => a !== null);
    },
    enabled: sortedCodes.length > 0,
    staleTime: Infinity,
  });
}
