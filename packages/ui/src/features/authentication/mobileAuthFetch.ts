import { authContextCache } from "./authContextCache";

// Mobile has no AuthProvider/useAuth() context (that's web-only) — it keeps
// its session in the plain authContextCache singleton instead, so this is a
// minimal stand-in for web's authFetch: attach the bearer token, no
// auto-refresh-on-401 yet (the mobile app doesn't have that flow built).
export async function mobileAuthFetch(url: string, options: RequestInit = {}) {
  const token = authContextCache.getAccessToken();
  const headers = {
    ...(options.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}
