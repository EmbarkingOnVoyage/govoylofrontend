import { AUTH_BASE_URL } from "@workspace/api";

// "Continue with Google / Facebook / Apple" — shared by the web and mobile login
// screens. Each platform gets a token from the provider (see socialAuth.web.ts
// and socialAuth.native.ts), then exchanges it here for our own session, same
// as an email-OTP login.
export type SocialProvider = "google" | "facebook" | "apple";

// Inlined at build time (Expo: EXPO_PUBLIC_*, web: VITE_* mapped in vite.config.ts).
// Empty means that provider isn't set up yet and its button says so.
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
export const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";

// Closing the provider's window or tapping Cancel — not an error to show.
export class SocialSignInCancelled extends Error {
  constructor() {
    super("Sign-in cancelled.");
  }
}

export function socialProviderReady(provider: SocialProvider): boolean {
  if (provider === "google") return !!GOOGLE_WEB_CLIENT_ID;
  if (provider === "facebook") return !!FACEBOOK_APP_ID;
  return false;
}

export function socialUnavailableMessage(provider: SocialProvider): string {
  const name = provider === "google" ? "Google" : provider === "facebook" ? "Facebook" : "Apple";
  return `Sign in with ${name} is coming soon. Please continue with your email.`;
}

export async function exchangeSocialToken(
  provider: SocialProvider,
  token: string,
  names?: { firstName?: string | null; lastName?: string | null }
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, token, firstName: names?.firstName ?? null, lastName: names?.lastName ?? null }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.accessToken) {
    throw new Error(result?.error?.message || "We couldn't sign you in. Please try again.");
  }
  return { accessToken: result.accessToken, refreshToken: result.refreshToken };
}
