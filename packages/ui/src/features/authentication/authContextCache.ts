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

// A guest checkout's token (see setGuestSession): never refreshed. On the web
// it's kept in sessionStorage so a refresh mid-checkout keeps the guest (and
// the travellers they added); it ends with the tab. React Native has no
// sessionStorage, so there it's memory-only.
const GUEST_STORAGE_KEY = "govoylo_guest_session";

function guestStore(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

function forgetGuest() {
  try {
    guestStore()?.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clean up.
  }
}

let guestSession = false;
if (!sessionCache) {
  try {
    const guestToken = guestStore()?.getItem(GUEST_STORAGE_KEY);
    if (guestToken) {
      sessionCache = { accessToken: guestToken, refreshToken: "" };
      guestSession = true;
    }
  } catch {
    // Storage unavailable — the guest gives their contact again.
  }
}

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
    forgetGuest();
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
    try {
      guestStore()?.setItem(GUEST_STORAGE_KEY, accessToken);
    } catch {
      // Storage unavailable — the guest session lasts until a refresh.
    }
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
  // Signed in with a real account (not a guest checkout).
  hasAccount(): boolean {
    return sessionCache !== null && !guestSession;
  },
  clearSession() {
    const hadSession = sessionCache !== null;
    sessionCache = null;
    guestSession = false;
    forgetGuest();
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
