import React, { useState } from "react";
import { useRequestOtpMutation } from "@workspace/api";
import { LoginWebStyles as s } from "@workspace/ui"; 
import { authContextCache } from "./authContextCache";
import { LOGO_ASSETS } from "../../assets";

interface LoginFeatureProps {
  onNavigate: (rule: string) => void;
}

export const LoginFeature: React.FC<LoginFeatureProps> = ({ onNavigate }) => {
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
        if (data && data.success) {
          console.log("Background Web OTP dispatched:", data.message);
        }
      })
      .catch((err) => {
        console.error("Background Web API Exception:", err?.message);
      });
  };

  const isWorking = isApiLoading || mutation.isPending;
  const SOCIAL_LOGIN_PROVIDERS = [
    { id: "apple", onPress: () => alert("Apple Popup") },
    { id: "google", onPress: () => alert("Google Popup") },
    { id: "facebook", onPress: () => alert("Facebook Popup") },
  ];

  return (
    <div className={s.backdrop}>
      <div className={s.container}>
        {/* Close Modal Trigger */}
        <button className={s.closeButton} onClick={() => console.log("Close Clicked")}>
          &times;
        </button>
        <div className={s.logoWrapper}>
          <span className={s.logoText}>⚛️</span>
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
              className={s.socialButton}
              onClick={() => alert(`${provider.onPress} Popup`)}
            >
              <img
                src={LOGO_ASSETS[provider.id]} alt={provider.id}
                className={s.socialIcon}
              />
            </button>
          ))}
        </div>

        {/* Privacy Legal Guidelines Block */}
        <p className={s.footerText}>
          By continuing you agree to our{" "}
          <span className={s.footerLink}>Terms & Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
