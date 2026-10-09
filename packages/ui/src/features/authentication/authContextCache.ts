/**
 * Simple, high-speed shared memory cache to pass data between auth screens
 * without breaking strict navigation engine contracts.
 */
let savedEmailCache = "user@email.com";
let savedVerificationTokenCache = "";

const SESSION_STORAGE_KEY = "govoylo_auth_session";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

// Where the signed-in session survives an app restart. The web default keeps it
// in localStorage; the mobile app plugs in the OS keystore (expo-secure-store)
// with useSessionStorage + hydrate, since React Native has no localStorage.
export interface SessionStorageAdapter {
  load(): Promise<AuthSession | null> | AuthSession | null;
  save(session: AuthSession): Promise<void> | void;
  clear(): Promise<void> | void;
}

const localStorageAdapter: SessionStorageAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  },
  save(session) {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable (private browsing, disabled, etc.) — stay memory-only for this session.
    }
  },
  clear() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Storage unavailable — nothing to clean up.
    }
  },
};

let storage: SessionStorageAdapter = localStorageAdapter;

function loadSync(): AuthSession | null {
  const loaded = storage.load();
  return loaded instanceof Promise ? null : loaded;
}

let sessionCache: AuthSession | null = loadSync();

// A guest checkout's token (see setGuestSession): memory-only, never refreshed.
let guestSession = false;

// Told when the session ends (sign out, or a refresh token the server rejects),
// so the app can leave the signed-in screens.
const sessionClearedListeners = new Set<() => void>();

function persist(write: () => Promise<void> | void) {
  try {
    const result = write();
    if (result instanceof Promise) {
      result.catch(() => {
        // Couldn't persist — the session still works until the app closes.
      });
    }
  } catch {
    // Same as above.
  }
}

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
  // Swap where the session is persisted; call hydrate() afterwards to read it.
  useSessionStorage(adapter: SessionStorageAdapter) {
    storage = adapter;
  },
  // Restores the session saved by a previous app run. Never throws: an
  // unreadable store just means signing in again.
  async hydrate(): Promise<boolean> {
    try {
      const saved = await storage.load();
      if (saved?.accessToken && saved?.refreshToken) {
        sessionCache = saved;
      }
    } catch {
      // Keep whatever is in memory.
    }
    return sessionCache !== null;
  },
  setSession(accessToken: string, refreshToken: string) {
    guestSession = false;
    sessionCache = { accessToken, refreshToken };
    const session = sessionCache;
    persist(() => storage.save(session));
  },
  // Guest checkout: lets a guest book without an account. Not persisted — the
  // guest starts over after an app restart — and there's no refresh token, so
  // an expired one just fails its request instead of ending a session.
  setGuestSession(accessToken: string) {
    guestSession = true;
    sessionCache = { accessToken, refreshToken: "" };
  },
  isGuestSession(): boolean {
    return guestSession && sessionCache !== null;
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
    const hadSession = sessionCache !== null;
    sessionCache = null;
    guestSession = false;
    persist(() => storage.clear());
    if (hadSession) {
      sessionClearedListeners.forEach((listener) => listener());
    }
  },
  // Returns an unsubscribe function.
  onSessionCleared(listener: () => void): () => void {
    sessionClearedListeners.add(listener);
    return () => {
      sessionClearedListeners.delete(listener);
    };
  },
};
