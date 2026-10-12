import React, { useState } from "react";
import { X } from "lucide-react";
import govoyloLogo from "../../assets/images/govoylo-logo.svg";
import { LoginWebStyles as s } from "@workspace/ui";
import { useStartGuestSessionMobile } from "./useStartGuestSessionMobile";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

// "Continue as guest" in the sign-in modal (booking pages only): the contact
// for this booking. The backend makes a guest for the checkout; the e-ticket
// goes to this email, and signing in with it later moves the trip and its
// travellers into the account — same as the mobile app's guest checkout.
export const GuestCheckoutFeature: React.FC<{
  onStarted: () => void;
  onSignIn: () => void;
  onCloseModal: () => void;
}> = ({ onStarted, onSignIn, onCloseModal }) => {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<{ email?: string; mobile?: string; form?: string }>({});
  const startGuestSession = useStartGuestSessionMobile();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const next: typeof errors = {};
    if (!EMAIL_PATTERN.test(trimmedEmail)) next.email = "Please enter a valid email address.";
    if (!MOBILE_PATTERN.test(mobile)) next.mobile = "Please enter a valid 10-digit mobile number.";
    setErrors(next);
    if (next.email || next.mobile) return;
    try {
      await startGuestSession.mutateAsync({ email: trimmedEmail, phone: mobile });
      onStarted();
    } catch (err) {
      setErrors({ form: (err as Error)?.message || "Could not continue as a guest. Please try again." });
    }
  };

  const busy = startGuestSession.isPending;

  return (
    <div className={s.container}>
      <button type="button" className={s.closeButton} onClick={onCloseModal} aria-label="Close">
        <X size={20} strokeWidth={2} />
      </button>
      <div className={s.logoWrapper}>
        <img src={govoyloLogo} alt="goVoylo" className={s.logoText} />
      </div>
      <h2 className={s.title}>Continue as guest</h2>
      <p className={s.noteText}>
        Your e-ticket will be sent to this email. Sign in later with the same email to see this trip and your
        travellers in your account.
      </p>

      <form onSubmit={handleContinue} className="w-full mt-6 flex flex-col gap-4" noValidate>
        <div className={s.inputWrapper}>
          <label htmlFor="guest-email" className={s.fieldLabel}>
            Email address
          </label>
          <input
            id="guest-email"
            type="email"
            placeholder="name@example.com"
            className={s.inputField(!!errors.email)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            autoCapitalize="none"
            autoComplete="email"
          />
          {!!errors.email && <span className={s.inputErrorMessage}>{errors.email}</span>}
        </div>

        <div className={s.inputWrapper}>
          <label htmlFor="guest-mobile" className={s.fieldLabel}>
            Mobile number
          </label>
          <div className="flex gap-2">
            <span className="h-11 px-3 shrink-0 rounded-xl border border-[#ADB8CD] flex items-center text-[16px] leading-5 text-[#182339]">
              +91
            </span>
            <input
              id="guest-mobile"
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              className={s.inputField(!!errors.mobile)}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              disabled={busy}
              autoComplete="tel-national"
            />
          </div>
          {!!errors.mobile && <span className={s.inputErrorMessage}>{errors.mobile}</span>}
        </div>

        {!!errors.form && <span className={s.inputErrorMessage}>{errors.form}</span>}

        <button type="submit" className={`${s.primaryButton} !mt-1 ${busy ? s.disabledButton : ""}`} disabled={busy}>
          <span className={s.primaryButtonText}>{busy ? "Please wait..." : "Continue"}</span>
        </button>
      </form>

      <button type="button" className={s.linkButton} onClick={onSignIn} disabled={busy}>
        Have an account? Log in instead
      </button>
    </div>
  );
};
