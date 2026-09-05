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
}

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
