import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useMutation } from "@tanstack/react-query"; 
import { authContextCache } from "./authContextCache";
// 🔑 IMPORT CENTRALIZED BEST-PRACTICE STYLES
import { OtpMobileStyles as s } from "@workspace/ui";

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

  const handleChangeText = (text: string, index: number) => {
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

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
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

  const handleVerify = async () => {
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
    <View style={s.backdrop}>
      <View style={s.container}>
        <Text style={s.backArrow} onPress={() => onNavigate("ON_BACK_TO_LOGIN")}>&larr;</Text>
        <Text style={s.closeButton} onPress={() => console.log("Close Clicked")}>&times;</Text>
        
        <View style={s.logoWrapper}>
          <Text style={s.logoText}>⚛️</Text>
        </View>

        <Text style={s.title}>Log in or sign up</Text>

        <View style={s.contentWrapper}>
          <Text style={s.headingText}>Verify your email address</Text>
          
          <Text style={s.subText}>
            we sent a 6-digit code to <Text style={s.emailHighlight}>{userEmail}</Text>. please enter code to continue.
          </Text>

          <View style={s.otpGrid}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                style={[s.otpInput, digit !== "" && s.otpInputFilled, !!errorMessage && s.otpInputError]}
                maxLength={2}
                value={digit}
                onChangeText={(text) => handleChangeText(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                editable={!isWorking}
                placeholder="-"
                placeholderTextColor="#D1D5DB"
                autoFocus={i === 0}
              />
            ))}
          </View>

          {!!errorMessage && <Text style={s.errorText}>{errorMessage}</Text>}

          <TouchableOpacity 
            style={[s.submitButton, isWorking && s.disabledButton]} 
            onPress={handleVerify}
            disabled={isWorking}
            activeOpacity={0.8}
          >
            <Text style={s.submitButtonText}>
              {isWorking ? "Verifying..." : "Verify email"}
            </Text>
          </TouchableOpacity>

          <Text style={s.spamText}>
            Didn't receive an email? please check your spam folder or request another code in{" "}
            <Text style={s.timerHighlight}>{countdown} seconds</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
};
