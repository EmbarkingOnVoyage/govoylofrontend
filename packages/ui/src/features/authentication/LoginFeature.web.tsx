import { X } from "lucide-react";
import govoyloLogo from "../../assets/images/govoylo-logo.svg";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from '../../components/layout/Layout'; 
import { useRequestOtpMutation } from "@workspace/api";
import { LoginWebStyles as s } from "@workspace/ui"; 
import { authContextCache } from "./authContextCache";
import { useAuth } from "./AuthContext";
import {
  FACEBOOK_APP_ID,
  SocialProvider,
  SocialSignInCancelled,
  exchangeSocialToken,
  socialProviderReady,
  socialUnavailableMessage,
} from "./socialAuth";
import { facebookAccessTokenWeb, googleIdTokenWeb, loadFacebookSdk } from "./socialAuth.web";
import { LOGO_ASSETS } from "../../assets";

interface LoginFeatureProps {
  onNavigate: (rule: string) => void;
  variant?: "page" | "modal";
  onCloseModal?: () => void;
  // Booking pages: offer checking out without an account.
  onContinueAsGuest?: () => void;
}

export const LoginFeature: React.FC<LoginFeatureProps> = ({ onNavigate, variant = "page", onCloseModal, onContinueAsGuest }) => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isApiLoading, setIsApiLoading] = useState(false);

  const mutation = useRequestOtpMutation();

  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setValidationError("Email address is required.");
      return false;
    }
    if (!emailRegex.test(val)) {
      setValidationError("Please enter a valid email address.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault(); // Stop standard browser form reloads
    if (!validateEmail(email)) return;
    
    authContextCache.setEmail(email.trim().toLowerCase());
    onNavigate("ON_SUBMIT_SUCCESS");

    mutation
      .mutateAsync({ email: email.trim().toLowerCase() })
      .then((data) => {
        if (data && data.verificationToken) {
          authContextCache.setVerificationToken(data.verificationToken);
          console.log("Background Web OTP dispatched:", data.message);
        }
      })
      .catch((err) => {
        console.error("Background Web API Exception:", err?.message);
      });
  };

  const isWorking = isApiLoading || mutation.isPending;
  const { login } = useAuth();
  const [socialBusy, setSocialBusy] = useState<SocialProvider | null>(null);
  const [socialError, setSocialError] = useState("");

  // Facebook's SDK has to be loaded before the click (see loadFacebookSdk).
  useEffect(() => {
    if (FACEBOOK_APP_ID) loadFacebookSdk().catch(() => {});
  }, []);

  // The provider's popup has to open straight from the click, so the token
  // request starts before any await.
  const handleSocial = (provider: SocialProvider) => {
    if (socialBusy) return;
    setSocialError("");
    if (!socialProviderReady(provider)) {
      setSocialError(socialUnavailableMessage(provider));
      return;
    }
    const providerToken = provider === "google" ? googleIdTokenWeb() : facebookAccessTokenWeb();
    setSocialBusy(provider);
    providerToken
      .then((token) => exchangeSocialToken(provider, token))
      .then(({ accessToken, refreshToken }) => {
        login(accessToken, refreshToken);
        onNavigate("ON_OTP_VERIFIED");
      })
      .catch((err) => {
        if (!(err instanceof SocialSignInCancelled)) setSocialError(err?.message || "We couldn't sign you in. Please try again.");
      })
      .finally(() => setSocialBusy(null));
  };
  const SOCIAL_LOGIN_PROVIDERS: { id: SocialProvider; label: string }[] = [
    { id: "apple", label: "Continue with Apple" },
    { id: "google", label: "Continue with Google" },
    { id: "facebook", label: "Continue with Facebook" },
  ];

  const content = (
      <div className={s.container}>
        {/* Close Modal Trigger */}
        <button
          className={s.closeButton}
          onClick={() => (onCloseModal ? onCloseModal() : console.log("Close Clicked"))}
        >
          <X size={20} strokeWidth={2} />
        </button>
        <div className={s.logoWrapper}>
          <img src={govoyloLogo} alt="goVoylo" className={s.logoText} />
        </div>
        {/* Heading Typography */}
        <h2 className={s.title}>Log in or sign up</h2>

        {/* Form Container */}
        <form onSubmit={handleContinue} className={s.formWrapper}>
          <div className={s.inputWrapper}>
            <input
              type="email"
              placeholder="Email address"
              className={s.inputField(!!validationError)} // 🔑 Passes error state dynamically to Tailwind builder
              value={email}
              onChange={(e) => {
                const text = e.target.value;
                setEmail(text);
                if (validationError) validateEmail(text);
              }}
              disabled={isWorking}
              autoCapitalize="none"
            />
            {!!validationError && (
              <span className={s.inputErrorMessage}>{validationError}</span>
            )}
          </div>

          {/* Main Form Interactive Continue Trigger Component */}
          <button
            type="submit"
            className={`${s.primaryButton} ${isWorking ? s.disabledButton : ""}`}
            disabled={isWorking}
          >
            <span className={s.primaryButtonText}>
              {isWorking ? "Processing..." : "Continue"}
            </span>
          </button>
        </form>

        {onContinueAsGuest && (
          <button type="button" className={s.secondaryButton} onClick={onContinueAsGuest} disabled={isWorking}>
            Continue as guest
          </button>
        )}

        {/* Content Section Break Dividers */}
        <div className={s.dividerLineWrapper}>
          <div className={s.dividerLine} />
          <span className={s.dividerText}>or connect with</span>
          <div className={s.dividerLine} />
        </div>

        {/* Alternative Grid Selection Authentication Controls */}
        <div className={s.socialRow}>
          {SOCIAL_LOGIN_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={`${s.socialButton} ${socialBusy && socialBusy !== provider.id ? "opacity-50" : ""}`}
              onClick={() => handleSocial(provider.id)}
              disabled={!!socialBusy}
              aria-label={provider.label}
              title={provider.label}
            >
              <img
                src={LOGO_ASSETS[provider.id]} alt={provider.id}
                className={s.socialIcon}
              />
            </button>
          ))}
        </div>
        {!!socialError && (
          <span role="alert" className={`${s.inputErrorMessage} block text-center mt-2`}>{socialError}</span>
        )}

        {/* Privacy Legal Guidelines Block */}
        <p className={s.footerText}>
          By continuing you agree to our{" "}
          <span className={s.footerLink}>Terms & Privacy Policy</span>.
        </p>
      </div>
  );

  return variant === "modal" ? (
    content
  ) : (
    <DashboardLayout showSidebar={false} onNavigate={onNavigate}>
      {content}
    </DashboardLayout>
  );
};
