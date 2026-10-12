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
  // Solid once every digit is in; pale while the code is incomplete.
  submitButtonReady: string;
  submitButtonIncomplete: string;
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
    paddingBottom: 36,
  },
  contentWrapper: {
    width: "100%",
  },
  headingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#182339",
    lineHeight: 32,
    marginBottom: 8.7,
  },
  subText: {
    fontSize: 13,
    color: "#4C5973",
    lineHeight: 16,
    marginBottom: 24,
  },
  emailHighlight: {
    color: "#182339",
  },
  otpGrid: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  otpInput: {
    width: 47,
    height: 47,
    borderWidth: 1.5,
    borderColor: "#7C8CAD",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    paddingVertical: 0,
    fontSize: 24,
    fontWeight: "500",
    color: "#182339",
  },
  otpInputFilled: {
    borderColor: "#182339",
  },
  otpInputError: {
    borderColor: "#E83838",
    backgroundColor: "#FFF5F5",
    color: "#E83838",
  },
  errorText: {
    color: "#E83838",
    fontSize: 13,
    lineHeight: 16,
    marginTop: -4.3,
    marginBottom: 11.3,
    alignSelf: "flex-start",
  },
  submitButton: {
    width: "100%",
    height: 44,
    backgroundColor: "#7C1AEE",
    borderRadius: 12,
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
    lineHeight: 20,
  },
  spamText: {
    fontSize: 13,
    color: "#4C5973",
    lineHeight: 16,
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
  // Web Dev "Login web" (verify step): 440px card, content in a 343px column.
  backdrop: "fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,35,57,0.4)] p-4 font-['Inter',sans-serif]",
  container: "relative w-full max-w-[440px] bg-white rounded-2xl px-12 pt-[37px] pb-8 flex flex-col items-center shadow-[0px_60px_40px_rgba(79,94,113,0.05),0px_40px_30px_rgba(79,94,113,0.08),0px_24px_24px_rgba(79,94,113,0.14),0px_5px_16px_rgba(79,94,113,0.15),0px_2px_6px_-1px_rgba(79,94,113,0.14),0px_-1px_2px_-1px_rgba(79,94,113,0.15)]",
  backArrow: "absolute top-[21px] left-[21px] w-5 h-5 flex items-center justify-center text-black cursor-pointer outline-none",
  closeButton: "absolute top-4 right-4 w-5 h-5 flex items-center justify-center text-black cursor-pointer outline-none",
  logoWrapper: "w-8 h-8 rounded-full overflow-hidden shrink-0",
  logoText: "h-8 w-auto max-w-none",
  title: "mt-[6px] text-[24px] leading-[30px] font-bold text-[#182339] text-center",
  contentWrapper: "w-full mt-[38px] flex flex-col items-start",
  headingText: "text-[24px] leading-[30px] font-bold text-[#182339]",
  subText: "mt-[7.5px] text-[13px] leading-4 text-[#4C5973]",
  emailHighlight: "font-medium text-[#182339]",
  otpGrid: "w-full mt-[26px] flex justify-between",
  otpInput: (isFilled: boolean, hasError: boolean): string => `
    w-[47px] h-[47px] rounded-xl border-[1.5px] text-center text-[24px] font-semibold outline-none bg-white placeholder:text-[#B3B3B3]
    ${hasError
      ? "border-[#E53935] bg-[#FFF5F5] text-[#E53935]"
      : isFilled
        ? "border-[#182339] text-[#182339]"
        : "border-[#7C8CAD] text-[#182339] focus:border-[#7C1AEE]"
    }
  `.replace(/\s+/g, ' ').trim(),
  errorText: "mt-2 self-start text-[13px] leading-4 text-[#E53935]",
  submitButton: "w-full h-11 mt-3 rounded-xl flex items-center justify-center cursor-pointer",
  submitButtonReady: "bg-[#7C1AEE] hover:bg-[#6A16D9]",
  submitButtonIncomplete: "bg-[#CEAAFF]",
  disabledButton: "opacity-60 cursor-not-allowed",
  submitButtonText: "text-white text-[15px] leading-5 font-medium",
  spamText: "mt-6 self-start text-[13px] leading-4 text-[#4C5973]",
  timerHighlight: "text-[#4C5973]"
};
