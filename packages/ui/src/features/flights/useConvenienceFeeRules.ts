import { useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import type { ConvenienceFeeRules } from "./logic/convenienceFee";

// Public — guests see the fee before signing in. Rules change rarely, so they're
// kept for 10 minutes (the backend caches them for the same time).
export function useConvenienceFeeRules() {
  return useQuery({
    queryKey: ["convenience-fee-rules"],
    queryFn: async (): Promise<ConvenienceFeeRules> => {
      const response = await fetch(`${AUTH_BASE_URL}/api/v1/pricing/convenience-fee-rules`);
      if (!response.ok) {
        throw new Error("Failed to load the convenience fee.");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}
