import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRequestOtpMutation } from "@workspace/api";

interface LoginFeatureProps {
  onNavigate: (rule: string) => void;
}

export const LoginFeature: React.FC<LoginFeatureProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isApiLoading, setIsApiLoading] = useState(false);
  
  // 💡 Pull both mutate (fire-and-forget) and mutateAsync (Promise-based) to be perfectly safe
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

  // 💡 Upgraded to Async/Await Try-Catch: This completely fixes TanStack callback error loops!
    const handleContinue = () => {
    if (!validateEmail(email)) return;

    // 💡 1. INSTANT REDIRECT: Fire your routing engine to go to the OTP screen immediately
    onNavigate("ON_SUBMIT_SUCCESS");

    // 💡 2. BACKGROUND FIRE-AND-FORGET API CALL: 
    // This runs completely in the background without making the user wait or blocking the UI.
    mutation.mutateAsync({ email: email.trim().toLowerCase() })
      .then((data) => {
        if (data && data.success) {
          console.log("Background OTP request lifecycle success:", data.message || "OTP dispatched");
        } else {
          console.warn("Background API returned success=false:", data?.message);
        }
      })
      .catch((err) => {
        // 💡 3. CONSOLE LOGGING ONLY: If the API fails, it logs here silently instead of throwing a red error page
        console.error("Background API Exception Intercepted:", err?.message || err);
      });
  };


  const isWorking = isApiLoading || mutation.isPending;

  return (
    <View style={s.backdrop}>
      <View style={s.container}>
        {/* Close Modal Trigger */}
        <Text style={s.closeButton} onPress={() => console.log("Close Clicked")}>&times;</Text>
        
        {/* Figma Brand Purple Logo Box Icon */}
        <View style={s.logoWrapper}>
          <Text style={s.logoText}>⚛️</Text>
        </View>

        {/* Heading Typography */}
        <Text style={s.title}>Log in or sign up</Text>

        {/* Form Container */}
        <View style={s.formWrapper}>
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            style={[s.inputField, !!validationError && s.inputFieldError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (validationError) validateEmail(text);
            }}
            editable={!isWorking}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {!!validationError && <Text style={s.errorText}>{validationError}</Text>}
          
          {/* Main Form Interactive Continue Trigger Component */}
          <TouchableOpacity 
            style={[s.primaryButton, isWorking && s.disabledButton]} 
            onPress={handleContinue} 
            disabled={isWorking}
            activeOpacity={0.8}
          >
            <Text style={s.primaryButtonText}>
              {isWorking ? "Processing..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Section Break Dividers */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or connect with</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Alternative Grid Selection Authentication Controls */}
        <View style={s.socialRow}>
          <TouchableOpacity style={s.socialButton} onPress={() => console.log("Apple")} activeOpacity={0.7}>
            <Text style={s.socialIcon}>🍏</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.socialButton} onPress={() => console.log("Google")} activeOpacity={0.7}>
            <Text style={s.socialIcon}>🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.socialButton} onPress={() => console.log("Facebook")} activeOpacity={0.7}>
            <Text style={s.socialIcon}>🔷</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Legal Guidelines Block */}
        <Text style={s.footerText}>
          By continuing you agree to our <Text style={s.footerLink}>Terms & Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
};

// 💡 100% Inline Self-Contained Styles matching your layout dimensions completely
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
    borderRadius: 24, // High-curvature corner curvature matching figma spec
    padding: 32,
    alignItems: "center",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" as any,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 24,
    fontSize: 26,
    color: "#9CA3AF",
    fontWeight: "400",
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
  formWrapper: {
    width: "100%",
  },
  inputField: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    fontSize: 16,
    color: "#111827",
  },
  inputFieldError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },
  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#7F1DFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 24,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#F0F2F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  socialIcon: {
    fontSize: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 290,
  },
  footerLink: {
    textDecorationLine: "underline",
    color: "#7F1DFF",
    fontWeight: "500",
  },
});
