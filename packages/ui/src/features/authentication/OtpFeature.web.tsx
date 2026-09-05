import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from '../../components/layout/Layout'; 
import { useMutation } from "@tanstack/react-query"; 
import { authContextCache } from "./authContextCache";
// 🔑 IMPORT CENTRALIZED BEST-PRACTICE STYLES
import { OtpWebStyles as s } from "@workspace/ui";

interface OtpFeatureProps {
  onNavigate: (rule: string) => void;
}

export const OtpFeature: React.FC<OtpFeatureProps> = ({ onNavigate }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(54);

  const userEmail = authContextCache.getEmail();
  const inputRefs = useRef<any[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("https://localhost:5037/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          verificationToken: authContextCache.getVerificationToken(),
          otp: code,
        }),
      });
      if (!response.ok) throw new Error("Incorrect activation code parsed.");
      const result = await response.json();
      return { success: result.isVerified, message: result.message };
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

  return (
    <DashboardLayout showSidebar={false} onNavigate={onNavigate}>
      <div className={s.container}>
        <button className={s.backArrow} onClick={() => onNavigate("ON_BACK_TO_LOGIN")}>&larr;</button>
        <button className={s.closeButton} onClick={() => console.log("Close Clicked")}>&times;</button>
        
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

          <p className={s.spamText}>
            Didn't receive an email? please check your spam folder or request another code in{" "}
            <span className={s.timerHighlight}>{countdown} seconds</span>.
          </p>
        </div>
      </div>
      </DashboardLayout>
  );
};
