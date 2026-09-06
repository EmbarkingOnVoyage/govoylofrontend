import { ViewStyle, TextStyle } from "react-native";

// ==========================================
// 1. TYPE DEFINITIONS (INTERFACES)
// ==========================================

export interface IOtpMobileStyles {
  screen: ViewStyle;
  container: ViewStyle;
  contentWrapper: ViewStyle;
  headingText: TextStyle;
  subText: TextStyle;
  emailHighlight: TextStyle;
  otpGrid: ViewStyle;
  otpInput: TextStyle;
  otpInputFilled: TextStyle;
  otpInputError: TextStyle;
  errorText: TextStyle;
  submitButton: ViewStyle;
  disabledButton: ViewStyle;
  submitButtonText: TextStyle;
  spamText: TextStyle;
  timerHighlight: TextStyle;
}

export interface IOtpWebStyles {
  backdrop: string;
  container: string;
  backArrow: string;
  closeButton: string;
  logoWrapper: string;
  logoText: string;
  title: string;
  contentWrapper: string;
  headingText: string;
  subText: string;
  emailHighlight: string;
  otpGrid: string;
  otpInput: (isFilled: boolean, hasError: boolean) => string; // Dynamic generator
  errorText: string;
  submitButton: string;
  disabledButton: string;
  submitButtonText: string;
  spamText: string;
  timerHighlight: string;
}

// ==========================================
// 2. MOBILE EXPORT (React Native Objects)
// ==========================================

export const mobile: IOtpMobileStyles = {
  // Full-screen white page per the Figma "Phone OTP" mobile design — no
  // backdrop/modal card, no header/logo/back controls (none exist in the
  // design; the OS back gesture/button is the only way back).
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "flex-end",
    paddingBottom: 24,
  },
  contentWrapper: {
    width: "100%",
  },
  headingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#182339",
    lineHeight: 32,
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: "#4C5973",
    lineHeight: 20,
    marginBottom: 24,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#182339",
  },
  otpGrid: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpInput: {
    width: 47,
    height: 47,
    borderWidth: 1.5,
    borderColor: "#7C8CAD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#182339",
  },
  otpInputFilled: {
    borderColor: "#182339",
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
    height: 44,
    backgroundColor: "#7C1AEE",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  // Applied on top of submitButton while the 6-digit code isn't complete yet
  // — matches the design's lighter "not ready to submit" state.
  disabledButton: {
    backgroundColor: "#CEAAFF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  spamText: {
    fontSize: 13,
    color: "#4C5973",
    lineHeight: 18,
  },
  timerHighlight: {
    fontWeight: "500",
    color: "#182339",
  },
};

// ==========================================
// 3. WEB EXPORT (Tailwind Classes Strings)
// ==========================================

export const web: IOtpWebStyles = {
  backdrop: "fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm p-4",
  container: "relative w-full max-w-[430px] bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center border border-gray-100",
  backArrow: "absolute top-5 left-6 text-gray-800 hover:text-gray-600 transition-colors text-xl cursor-pointer outline-none",
  closeButton: "absolute top-5 right-6 text-gray-800 hover:text-gray-600 transition-colors text-2xl font-light cursor-pointer outline-none",
  logoWrapper: "w-11 h-11 bg-[#7F1DFF] text-white rounded-xl flex items-center justify-center mb-4 shadow-md",
  logoText: "text-xl text-white",
  title: "text-2xl font-bold text-gray-900 mb-6 tracking-tight text-center subpixel-antialiased",
  contentWrapper: "w-full flex flex-col items-center",
  headingText: "text-xl font-bold text-gray-900 text-center mb-2 subpixel-antialiased",
  subText: "text-sm text-gray-500 text-center leading-relaxed mb-6 px-2",
  emailHighlight: "font-semibold text-gray-900",
  otpGrid: "flex w-full justify-between gap-2 mb-4",
  otpInput: (isFilled: boolean, hasError: boolean): string => `
    w-12 h-12 border rounded-xl text-center text-lg font-semibold text-gray-900 outline-none transition-all duration-200
    ${hasError 
      ? "border-red-500 bg-red-50/30 focus:ring-1 focus:ring-red-500" 
      : isFilled 
        ? "border-[#7F1DFF] bg-[#F9F5FF] focus:border-[#7F1DFF]" 
        : "border-[#A9B6CE] bg-white focus:border-[#7F1DFF] focus:ring-1 focus:ring-purple-200"
    }
  `.replace(/\s+/g, ' ').trim(),
  errorText: "text-red-500 text-xs font-medium self-start mb-3 ml-1",
  submitButton: "w-full h-[54px] bg-[#CEAAFF] hover:bg-[#bfa2f0] text-white font-semibold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center text-base cursor-pointer mb-6 active:scale-[0.99]",
  disabledButton: "bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed active:scale-100 shadow-none",
  submitButtonText: "text-white text-base font-semibold",
  spamText: "text-xs text-gray-500 text-center leading-relaxed px-3",
  timerHighlight: "font-medium text-gray-900"
};
