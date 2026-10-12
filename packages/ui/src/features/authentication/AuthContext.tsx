import React, { createContext, useCallback, useContext, useState } from "react";
import { AUTH_BASE_URL } from "@workspace/api";
import { authContextCache } from "./authContextCache";
import { clearAppQueryCache } from "../../components/AppProvider";

type AuthModalStep = "signin" | "otp" | "guest";

interface AuthContextValue {
  // Signed in with an account. A guest checkout doesn't count (see isGuest).
  isLoggedIn: boolean;
  // Booking as a guest: a checkout-only token from "Continue as guest".
  isGuest: boolean;
  // Call once the guest token is stored (useStartGuestSessionMobile).
  enterGuest: () => void;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isModalOpen: boolean;
  modalStep: AuthModalStep;
  openLogin: () => void;
  // The sign-in modal on a booking page: also offers "Continue as guest".
  openCheckoutLogin: () => void;
  // Whether the open modal offers the guest option.
  allowGuest: boolean;
  goToGuestStep: () => void;
  closeModal: () => void;
  goToOtpStep: () => void;
  backToSignIn: () => void;
  // Attaches the current access token to a request; on a 401, transparently
  // uses the refresh token to get a new access/refresh pair (access tokens
  // are short-lived — 15 min — so this keeps a session alive without forcing
  // a re-login), then retries the request once. Logs out if the refresh
  // token itself is invalid/expired, since there's no way to recover.
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => authContextCache.hasAccount());
  const [isGuest, setIsGuest] = useState(() => authContextCache.isGuestSession());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<AuthModalStep>("signin");
  const [allowGuest, setAllowGuest] = useState(false);

  const login = useCallback((accessToken: string, refreshToken: string) => {
    // A guest signing in (their checkout moves into the account server-side)
    // mustn't keep seeing the guest's cached travellers and trips.
    const switching = authContextCache.isGuestSession();
    authContextCache.setSession(accessToken, refreshToken);
    if (switching) clearAppQueryCache();
    setIsLoggedIn(true);
    setIsGuest(false);
  }, []);

  const logout = useCallback(() => {
    authContextCache.clearSession();
    clearAppQueryCache();
    setIsLoggedIn(false);
    setIsGuest(false);
  }, []);

  const enterGuest = useCallback(() => {
    clearAppQueryCache();
    setIsGuest(authContextCache.isGuestSession());
  }, []);

  const openLogin = useCallback(() => {
    setModalStep("signin");
    setAllowGuest(false);
    setIsModalOpen(true);
  }, []);

  const openCheckoutLogin = useCallback(() => {
    setModalStep("signin");
    setAllowGuest(true);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const goToOtpStep = useCallback(() => setModalStep("otp"), []);
  const backToSignIn = useCallback(() => setModalStep("signin"), []);
  const goToGuestStep = useCallback(() => setModalStep("guest"), []);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const withAuthHeader = (token: string | null) => ({
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
      });

      let response = await fetch(url, withAuthHeader(authContextCache.getAccessToken()));

      if (response.status === 401) {
        const refreshToken = authContextCache.getRefreshToken();

        if (!refreshToken) {
          logout();
          return response;
        }

        try {
          const refreshResponse = await fetch(`${AUTH_BASE_URL}/api/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            logout();
            return response;
          }

          const refreshed = await refreshResponse.json();
          login(refreshed.accessToken, refreshed.refreshToken);
          response = await fetch(url, withAuthHeader(refreshed.accessToken));
        } catch {
          logout();
        }
      }

      return response;
    },
    [login, logout]
  );

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isGuest,
        enterGuest,
        login,
        logout,
        isModalOpen,
        modalStep,
        openLogin,
        openCheckoutLogin,
        allowGuest,
        goToGuestStep,
        closeModal,
        goToOtpStep,
        backToSignIn,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
