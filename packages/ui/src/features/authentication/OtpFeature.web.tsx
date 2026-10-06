import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from '../../components/layout/Layout'; 
import { useMutation } from "@tanstack/react-query"; 
import { AUTH_BASE_URL, useRequestOtpMutation } from "@workspace/api";
import { authContextCache } from "./authContextCache";
import { useAuth } from "./AuthContext";
// 🔑 IMPORT CENTRALIZED BEST-PRACTICE STYLES
import { OtpWebStyles as s } from "@workspace/ui";

interface OtpFeatureProps {
  onNavigate: (rule: string) => void;
  variant?: "page" | "modal";
  onCloseModal?: () => void;
}

const RESEND_WAIT_SECONDS = 54;

export const OtpFeature: React.FC<OtpFeatureProps> = ({ onNavigate, variant = "page", onCloseModal }) => {
  const { login } = useAuth();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(RESEND_WAIT_SECONDS);
  const resendMutation = useRequestOtpMutation();

  const userEmail = authContextCache.getEmail();
  const inputRefs = useRef<any[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(`${AUTH_BASE_URL}/api/auth/login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          verificationToken: authContextCache.getVerificationToken(),
          otp: code,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Incorrect activation code parsed.");
      }
      login(result.accessToken, result.refreshToken);
      return { success: true, message: result.message };
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const text = e.target.value;
    const cleanText = text.replace(/[^0-9]/g, "");
    if (!cleanText) return;

    const newOtp = [...otp];
    newOtp[index] = cleanText.substring(cleanText.length - 1);
    setOtp(newOtp);
    setErrorMessage("");

    if (index < 5 && newOtp[index] !== "") {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      
      if (newOtp[index] !== "") {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    if (fullCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit confirmation code.");
      return;
    }
    setErrorMessage("");

    try {
      const result = await verifyMutation.mutateAsync(fullCode);
      if (result && result.success) {
        onNavigate("ON_OTP_VERIFIED");
      } else {
        setErrorMessage(result?.message || "Invalid OTP code provided. Please try again.");
      }
    } catch (err: any) {
      console.error("Intercepted verification API exception:", err);
      setErrorMessage(err?.message || "Verification failed. Check network stability.");
    }
  };

  const isWorking = verifyMutation.isPending;

  // Sends a fresh code (which replaces the previous one) once the countdown has
  // run out, then restarts the countdown.
  const handleResend = async () => {
    if (!userEmail || resendMutation.isPending) return;
    setErrorMessage("");
    try {
      const data = await resendMutation.mutateAsync({ email: userEmail });
      if (data && data.verificationToken) {
        authContextCache.setVerificationToken(data.verificationToken);
      }
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setCountdown(RESEND_WAIT_SECONDS);
    } catch (err: any) {
      setErrorMessage(err?.message || "Couldn't send a new code. Please try again.");
    }
  };

  const content = (
      <div className={s.container}>
        <button className={s.backArrow} onClick={() => onNavigate("ON_BACK_TO_LOGIN")}>&larr;</button>
        <button
          className={s.closeButton}
          onClick={() => (onCloseModal ? onCloseModal() : console.log("Close Clicked"))}
        >&times;</button>

        <div className={s.logoWrapper}>
          <span className={s.logoText}>⚛️</span>
        </div>

        <h2 className={s.title}>Log in or sign up</h2>

        <div className={s.contentWrapper}>
          <h3 className={s.headingText}>Verify your email address</h3>
          
          <p className={s.subText}>
            we sent a 6-digit code to <span className={s.emailHighlight}>{userEmail}</span>. please enter code to continue.
          </p>

          <form onSubmit={handleVerify} className="w-full flex flex-col items-center">
            <div className={s.otpGrid}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  ref={(el) => (inputRefs.current[i] = el)}
                  className={s.otpInput(digit !== "", !!errorMessage)} // 🔑 Dynamic function call
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  disabled={isWorking}
                  placeholder="-"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {!!errorMessage && <span className={s.errorText}>{errorMessage}</span>}

            <button 
              type="submit"
              className={`${s.submitButton} ${isWorking ? s.disabledButton : ""}`} 
              disabled={isWorking}
            >
              <span className={s.submitButtonText}>
                {isWorking ? "Verifying..." : "Verify email"}
              </span>
            </button>
          </form>

          {countdown > 0 ? (
            <p className={s.spamText}>
              Didn't receive an email? please check your spam folder or request another code in{" "}
              <span className={s.timerHighlight}>{countdown} seconds</span>.
            </p>
          ) : (
            <p className={s.spamText}>
              Didn't receive an email? please check your spam folder or{" "}
              <button type="button" className={s.timerHighlight} onClick={handleResend} disabled={resendMutation.isPending}>
                {resendMutation.isPending ? "sending a new code..." : "resend the code"}
              </button>
              .
            </p>
          )}
        </div>
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
