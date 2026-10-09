import { useMutation } from "@tanstack/react-query";
import { AUTH_BASE_URL } from "@workspace/api";
import { authContextCache } from "./authContextCache";

export interface GuestSessionPayload {
  email: string;
  phone: string;
}

// "Continue as guest" at checkout: the backend creates a guest for this
// checkout and returns a token for booking and paying. Signing in later with
// the same email moves the booking and travellers into that account.
export function useStartGuestSessionMobile() {
  return useMutation({
    mutationFn: async (payload: GuestSessionPayload) => {
      const response = await fetch(`${AUTH_BASE_URL}/api/auth/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.accessToken) {
        throw new Error(body?.error?.message || "Could not continue as a guest. Please try again.");
      }
      authContextCache.setGuestSession(body.accessToken);
      return body as { id: string; accessToken: string };
    },
  });
}
