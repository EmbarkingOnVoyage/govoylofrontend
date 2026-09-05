/**
 * Simple, high-speed shared memory cache to pass data between auth screens
 * without breaking strict navigation engine contracts.
 */
let savedEmailCache = "user@email.com";
let savedVerificationTokenCache = "";

const SESSION_STORAGE_KEY = "govoylo_auth_session";

interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

let sessionCache: AuthSession | null = loadSession();

export const authContextCache = {
  setEmail(email: string) {
    savedEmailCache = email;
  },
  getEmail(): string {
    return savedEmailCache;
  },
  setVerificationToken(token: string) {
    savedVerificationTokenCache = token;
  },
  getVerificationToken(): string {
    return savedVerificationTokenCache;
  },
  setSession(accessToken: string, refreshToken: string) {
    sessionCache = { accessToken, refreshToken };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionCache));
    } catch {
      // Storage unavailable (private browsing, disabled, etc.) — stay memory-only for this session.
    }
  },
  getAccessToken(): string | null {
    return sessionCache?.accessToken ?? null;
  },
  getRefreshToken(): string | null {
    return sessionCache?.refreshToken ?? null;
  },
  isLoggedIn(): boolean {
    return sessionCache !== null;
  },
  clearSession() {
    sessionCache = null;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Storage unavailable — nothing to clean up.
    }
  }
};
