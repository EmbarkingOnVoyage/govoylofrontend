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

// One time band of a structured fare rule (Tripjack): applies from startHours
// to endHours before departure. airlineFee is per passenger; null means the
// airline sets it at the time ("Airline policy"). transactionFee is the
// supplier's own fee on top.
export interface FareRulePolicy {
  // The supplier's "DEL-BOM" key — one offer can carry several.
  route: string;
  type: "Cancellation" | "DateChange" | "NoShow";
  startHours: number | null;
  endHours: number | null;
  airlineFee: number | null;
  transactionFee: number | null;
  info: string | null;
}

// policies is empty for free-text-only suppliers (Flyshop), whose rules carry the text.
export interface LegFareRules {
  offerId: string;
  rules: FareRule[];
  policies: FareRulePolicy[];
}

export interface FareRulesResponse {
  legs: LegFareRules[];
}

// A POST because the backend needs the full list of offerIds in the body (one
// per leg for round-trip/multi-city), not because this has a side effect —
// still modeled as a query since it's just fetching data for the modal.
// fareIds: the fare picked for each offer, same order (empty = the offer's
// default fare), so the rules shown are for the fare being booked.
export function useFareRulesMobile(offerIds: string[], fareIds?: string[]) {
  const fareQuery =
    fareIds && fareIds.some((id) => !!id)
      ? "?" + fareIds.map((id) => `fareIds=${encodeURIComponent(id ?? "")}`).join("&")
      : "";
  return useQuery({
    queryKey: ["fare-rules", ...offerIds, fareQuery],
    enabled: offerIds.length > 0,
    queryFn: async (): Promise<FareRulesResponse> => {
      const response = await mobileAuthFetch(`${AUTH_BASE_URL}/api/v1/flights/fare-rules${fareQuery}`, {
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
