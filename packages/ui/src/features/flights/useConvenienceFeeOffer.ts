import { useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

// Launch offer: a signed-in customer's first paid booking has no convenience fee
// until the date the server sets. True only when the server says so — guests and
// signed-out visitors (enabled = false) always see the fee. Refetched on every
// screen visit, so a booking just paid for ends it straight away.
export function useConvenienceFeeOffer(enabled: boolean): boolean {
  const { data } = useQuery({
    queryKey: ["convenience-fee-offer"],
    queryFn: async (): Promise<{ firstBookingFree: boolean; validUntil: string | null }> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/pricing/convenience-fee-offer`);
      if (!response.ok) return { firstBookingFree: false, validUntil: null };
      return response.json();
    },
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
  return enabled && !!data?.firstBookingFree;
}
