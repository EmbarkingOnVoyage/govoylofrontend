import { AUTH_BASE_URL } from "@workspace/api";
import { authContextCache } from "./authContextCache";

function withAuthHeader(options: RequestInit, token: string | null): RequestInit {
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

// Access tokens are short-lived (15 min server-side — see Jwt:ExpiryMinutes)
// and this module tracks no expiry itself, so the server's own 401 is the
// first sign one died. Concurrent callers must share one in-flight refresh:
// the server's refresh token is single-use (rotated on every call), so a
// second caller refreshing with the same token the first one already spent
// would itself get rejected as invalid.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = authContextCache.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${AUTH_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;

    const refreshed = await response.json();
    if (!refreshed?.accessToken || !refreshed?.refreshToken) return false;

    authContextCache.setSession(refreshed.accessToken, refreshed.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// Mobile has no AuthProvider/useAuth() context (that's web-only) — it keeps
// its session in the plain authContextCache singleton instead, so this is a
// minimal stand-in for web's authFetch: attach the bearer token, and on a
// 401, refresh once and retry rather than surfacing a confusing generic
// failure for what's really just a stale token.
export async function mobileAuthFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, withAuthHeader(options, authContextCache.getAccessToken()));

  if (response.status !== 401 || !authContextCache.getRefreshToken()) {
    return response;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;
  if (!refreshed) {
    // The refresh token itself is invalid/expired — nothing left to recover
    // with, so drop the session rather than let every request keep retrying.
    authContextCache.clearSession();
    return response;
  }

  return fetch(url, withAuthHeader(options, authContextCache.getAccessToken()));
}
