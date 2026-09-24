import { useQuery } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { mobileAuthFetch } from "../authentication/mobileAuthFetch";

export interface FareRule {
  segmentId: string;
  fareRuleName: string;
  // Already HTML-stripped server-side — Flyshop returns this as a full XHTML
  // document wrapping what's usually one short paragraph of real content.
  fareRuleDesc: string;
}

export interface LegFareRules {
  offerId: string;
  rules: FareRule[];
}

export interface FareRulesResponse {
  legs: LegFareRules[];
}

// A POST because the backend needs the full list of offerIds in the body (one
// per leg for round-trip/multi-city), not because this has a side effect —
// still modeled as a query since it's just fetching data for the modal.
export function useFareRulesMobile(offerIds: string[]) {
  return useQuery({
    queryKey: ["fare-rules", ...offerIds],
    enabled: offerIds.length > 0,
    queryFn: async (): Promise<FareRulesResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/flights/fare-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerIds),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message || "Failed to load fare rules.");
      }

      return response.json();
    },
  });
}
