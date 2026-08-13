import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
// 💡 Note: Replace this hook with your project's actual verify hook if named differently
// e.g., import { useVerifyOtpMutation } from "@workspace/api";
import { useMutation } from "@tanstack/react-query"; 
import { authContextCache } from "./authContextCache";

interface OtpFeatureProps {
  onNavigate: (rule: string) => void;
}

export const OtpFeature: React.FC<OtpFeatureProps> = ({ onNavigate }) => {
  // Array representing the 6 individual code digit slots
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(54); // Synchronized directly with your Figma image text

  const userEmail = authContextCache.getEmail();

  // 💡 References array to allow programmatic jumping between input boxes
  const inputRefs = useRef<any[]>([]);

  // Simple countdown effect matching your figma subtext rules
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle mock/simulated verification call (replace with your formal hook registration layer)
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("http://localhost:5037/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code }),
      });
      if (!response.ok) throw new Error("Incorrect activation code parsed.");
      return await response.json();
    }
  });

  const handleChangeText = (text: string, index: number) => {
    // Sanitize down to strict numerical input parameters only
    const cleanText = text.replace(/[^0-9]/g, "");
    if (!cleanText) return;

    const newOtp = [...otp];
    // Keep only the last typed character in case of double clicks
    newOtp[index] = cleanText.substring(cleanText.length - 1);
    setOtp(newOtp);
    setErrorMessage(""); // Flush old runtime validation notices

    // Auto-focus next input field if typing moving forward
    if (index < 5 && newOtp[index] !== "") {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Dynamic backspace detection to move focus backward smoothly
    if (e.nativeEvent.key === "Backspace") {
      const newOtp = [...otp];
      
      if (newOtp[index] !== "") {
        newOtp[index] = ""; // Delete current character
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = ""; // Delete previous field value
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus(); // Shift keyboard focus backwards
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
      // Execute backend API validation systematically
      const result = await verifyMutation.mutateAsync(fullCode);

      if (result && result.success) {
        // Success -> Route engine advances straight to your next landing location (Search)
        onNavigate("ON_OTP_VERIFIED");
      } else {
        setErrorMessage(result?.message || "Invalid OTP code provided. Please try again.");
      }
    } catch (err: any) {
      // Fallback logging exception rules matching project specs
      console.error("Intercepted verification API exception:", err);
      setErrorMessage(err?.message || "Verification failed. Check network stability.");
    }
  };

  const isWorking = verifyMutation.isPending;

  return (
    <View style={s.backdrop}>
      <View style={s.container}>
        {/* Header Navigation Actions */}
        <Text style={s.backArrow} onPress={() => onNavigate("ON_BACK_TO_LOGIN")}>&larr;</Text>
        <Text style={s.closeButton} onPress={() => console.log("Close Clicked")}>&times;</Text>
        
        {/* Figma Logo Accent Wrap */}
        <View style={s.logoWrapper}>
          <Text style={s.logoText}>⚛️</Text>
        </View>

        <Text style={s.title}>Log in or sign up</Text>

        <View style={s.contentWrapper}>
          <Text style={s.headingText}>Verify your email address</Text>
          
          {/* Static mockup email variable - replace text string dynamically if parsing variables */}
          <Text style={s.subText}>
            we sent a 6-digit code to <Text style={s.emailHighlight}>{userEmail}</Text>. please enter code to continue.
          </Text>

          {/* Grid Hosting the 6 Numeric Boxes */}
          <View style={s.otpGrid}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                style={[s.otpInput, digit !== "" && s.otpInputFilled, !!errorMessage && s.otpInputError]}
                maxLength={2} // Allows override interception tricks to catch character changes safely
                value={digit}
                onChangeText={(text) => handleChangeText(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                editable={!isWorking}
                placeholder="-"
                placeholderTextColor="#D1D5DB"
                autoFocus={i === 0} // Trigger layout attention to field index zero upon creation
              />
            ))}
          </View>

          {!!errorMessage && <Text style={s.errorText}>{errorMessage}</Text>}

          {/* Verification Button Layer */}
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

          {/* Timers/Spam Layout Labels */}
          <Text style={s.spamText}>
            Didn't receive an email? please check your spam folder or request another code in{" "}
            <Text style={s.timerHighlight}>{countdown} seconds</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
};

// 💡 Complete self-contained styling schema derived directly from your layout specs
const s = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(107, 114, 128, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    position: "relative",
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" as any,
  },
  backArrow: {
    position: "absolute",
    top: 20,
    left: 24,
    fontSize: 22,
    color: "#111827",
    cursor: "pointer" as any,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 24,
    fontSize: 26,
    color: "#111827",
    fontWeight: "400",
    cursor: "pointer" as any,
  },
  logoWrapper: {
    width: 44,
    height: 44,
    backgroundColor: "#7F1DFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  headingText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#111827",
  },
  otpGrid: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#A9B6CE", // Muted light blue border token from image
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  otpInputFilled: {
    borderColor: "#7F1DFF",
    backgroundColor: "#F9F5FF",
  },
  otpInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 12,
    fontWeight: "500",
    alignSelf: "flex-start",
  },
  submitButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#CEAAFF", // Specific design alpha-purple token color from figma container button
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  spamText: {
    fontSize: 12,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  timerHighlight: {
    fontWeight: "500",
    color: "#111827",
  },
});
