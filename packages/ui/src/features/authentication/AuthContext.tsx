import React, { createContext, useCallback, useContext, useState } from "react";
import { authContextCache } from "./authContextCache";

type AuthModalStep = "signin" | "otp";

interface AuthContextValue {
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isModalOpen: boolean;
  modalStep: AuthModalStep;
  openLogin: () => void;
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

const AUTH_BASE_URL = "https://localhost:5037";

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => authContextCache.isLoggedIn());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<AuthModalStep>("signin");

  const login = useCallback((accessToken: string, refreshToken: string) => {
    authContextCache.setSession(accessToken, refreshToken);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    authContextCache.clearSession();
    setIsLoggedIn(false);
  }, []);

  const openLogin = useCallback(() => {
    setModalStep("signin");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const goToOtpStep = useCallback(() => setModalStep("otp"), []);
  const backToSignIn = useCallback(() => setModalStep("signin"), []);

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
        login,
        logout,
        isModalOpen,
        modalStep,
        openLogin,
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
