import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useRequestOtpMutation } from "@workspace/api";
import { LoginMobileStyles as s } from "@workspace/ui";
import { authContextCache } from "./authContextCache";
import { LOGO_ASSETS } from "../../assets";

interface LoginFeatureProps {
  onNavigate: (rule: string) => void;
}

export const LoginFeature: React.FC<LoginFeatureProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

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

  const handleContinue = () => {
    if (!validateEmail(email)) return;
    authContextCache.setEmail(email.trim().toLowerCase());
    onNavigate("ON_SUBMIT_SUCCESS");

    mutation
      .mutateAsync({ email: email.trim().toLowerCase() })
      .then((data) => {
        if (data && data.verificationToken) {
          authContextCache.setVerificationToken(data.verificationToken);
        }
      })
      .catch((err) => {
        console.error("Mobile send-otp request failed:", err?.message);
      });
  };

  const isWorking = mutation.isPending;
  const SOCIAL_LOGIN_PROVIDERS = [
    { id: "apple", onPress: () => {} },
    { id: "google", onPress: () => {} },
    { id: "facebook", onPress: () => {} },
  ];

  return (
    <View style={s.screen}>
      <View style={s.container}>
        <View style={s.titleBlock}>
          <Text style={s.title}>Welcome to your travel co-pilot</Text>
          <Text style={s.subtitle}>
            Log in or sign up to start the planning without the hassle
          </Text>
        </View>

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

          <TouchableOpacity
            style={[s.primaryButton, isWorking && s.disabledButton]}
            onPress={handleContinue}
            disabled={isWorking}
            activeOpacity={0.8}
          >
            <Text style={s.primaryButtonText}>
              {isWorking ? "Sending..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or connect with</Text>
          <View style={s.dividerLine} />
        </View>

        <View style={s.socialRow}>
          {SOCIAL_LOGIN_PROVIDERS.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={s.socialButton}
              onPress={provider.onPress}
              activeOpacity={0.7}
            >
              <Image source={LOGO_ASSETS[provider.id]} style={s.socialIcon as any} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={s.guestLink}
          onPress={() => onNavigate("ON_CONTINUE_AS_GUEST")}
        >
          <Text style={s.guestLinkText}>Continue as guest →</Text>
        </TouchableOpacity>

        <Text style={s.footerText}>
          By continuing you agree to our <Text style={s.footerLink}>Terms & Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
};
