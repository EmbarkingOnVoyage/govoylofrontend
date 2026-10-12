// packages/ui/src/styles/components/LoginFeature.styles.ts
import { ViewStyle, TextStyle, ImageStyle } from "react-native";

// ==========================================
// 1. TYPE DEFINITIONS (INTERFACES)
// ==========================================

export interface ILoginMobileStyles {
  screen: ViewStyle;
  container: ViewStyle;
  titleBlock: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  formWrapper: ViewStyle;
  inputWrapper: ViewStyle;
  inputField: TextStyle;
  inputFieldError: ViewStyle;
  errorText: TextStyle;
  primaryButton: ViewStyle;       // Added
  disabledButton: ViewStyle;      // Added
  primaryButtonText: TextStyle;   // Added
  dividerRow: ViewStyle;
  dividerLine: ViewStyle;
  dividerText: TextStyle;
  socialRow: ViewStyle;
  socialButton: ViewStyle;         // Added
  socialIcon: ImageStyle;          // Added
  guestLink: ViewStyle;
  guestLinkText: TextStyle;
  footerText: TextStyle;
  footerLink: TextStyle;
}

export interface ILoginWebStyles {
  backdrop: string;
  container: string;
  closeButton: string;
  logoWrapper: string;
  logoText: string;               // Added 
  title: string;
  formWrapper: string;            // Added 
  inputWrapper: string;            // Added, 
  inputField: (hasError: boolean) => string;
  inputFieldError: string;        // Added 
  inputErrorMessage: string;
  primaryButton: string;          // Added to match mobile
  disabledButton: string;         // Added to match mobile
  primaryButtonText: string;      // Added to match mobile
  dividerLineWrapper: string;
  dividerLine: string;
  dividerText: string;
  socialRow: string;
  socialButton: string;           // Added to match mobile
  socialIcon: string;             // Added to match mobile
  footerText: string;
  footerLink: string;
}

// ==========================================
// 2. MOBILE EXPORT (React Native Objects)
// ==========================================

export const mobile: ILoginMobileStyles = {
  // Measured from the Figma "Welcome" frame (Phone Dev): content is anchored to
  // the bottom with the exact gaps between Figma's boxes.
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'flex-end',
    paddingBottom: 37,
  },
  titleBlock: {
    marginBottom: 25,
    gap: 7,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#182339',
    lineHeight: 32,
  },
  subtitle: {
    maxWidth: 343,
    fontSize: 15,
    color: '#4C5973',
    lineHeight: 20,
  },
  formWrapper: {
    width: '100%',
    gap: 12,
  },
  inputWrapper: {},
  inputField: {
    width: '100%',
    height: 44,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#182339',
  },
  inputFieldError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -6,
    marginLeft: 4,
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#7C1AEE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CEAAFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D7DCE7',
  },
  dividerText: {
    paddingHorizontal: 5.5,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: '#697691',
  },
  socialRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 23,
  },
  socialButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#CCD3E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  guestLink: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8.6,
    height: 44,
    marginBottom: 26,
  },
  guestLinkText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#7C1AEE',
  },
  footerText: {
    fontSize: 13,
    color: '#4C5973',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: '#7C1AEE',
  },
};

// ==========================================
// 3. WEB EXPORT (Tailwind Classes Strings)
// ==========================================

export const web: ILoginWebStyles = {
  // Web Dev "Login web": 440px card, 16px radius, 32px padding, Inter.
  backdrop: "fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,35,57,0.4)] p-4 font-['Inter',sans-serif]",
  container: "relative w-full max-w-[440px] bg-white rounded-2xl px-8 pt-8 pb-[34px] flex flex-col items-center shadow-[0px_60px_40px_rgba(79,94,113,0.05),0px_40px_30px_rgba(79,94,113,0.08),0px_24px_24px_rgba(79,94,113,0.14),0px_5px_16px_rgba(79,94,113,0.15),0px_2px_6px_-1px_rgba(79,94,113,0.14),0px_-1px_2px_-1px_rgba(79,94,113,0.15)]",
  closeButton: "absolute top-4 right-4 w-5 h-5 flex items-center justify-center text-black cursor-pointer outline-none",
  logoWrapper: "w-8 h-8 rounded-full overflow-hidden shrink-0",
  logoText: "h-8 w-auto max-w-none",
  title: "mt-[6px] text-[24px] leading-[30px] font-bold text-[#182339] text-center",
  formWrapper: "w-full mt-[38px]",
  inputWrapper: "w-full",
  inputField: (hasError: boolean): string => `
    w-full h-11 pl-[13px] pr-3 rounded-xl border bg-white text-[16px] leading-5 outline-none text-[#182339] placeholder:text-[#99A6C0]
    ${hasError ? "border-[#C5001F]" : "border-[#ADB8CD] focus:border-[#7C1AEE]"}
  `.replace(/\s+/g, ' ').trim(),
  inputFieldError: "border-[#C5001F]",
  inputErrorMessage: "text-[#C5001F] text-[12px] leading-4 mt-1.5 text-left block w-full",
  primaryButton: "w-full h-11 mt-3 bg-[#7C1AEE] hover:bg-[#6A16D9] rounded-xl flex items-center justify-center cursor-pointer",
  disabledButton: "opacity-60 cursor-not-allowed",
  primaryButtonText: "text-white text-[15px] leading-5 font-medium",
  dividerLineWrapper: "w-full h-4 mt-6 flex items-center gap-[5px]",
  dividerLine: "flex-1 h-px bg-[#D7DCE7]",
  dividerText: "text-[13px] leading-4 font-medium text-[#697691]",
  socialRow: "w-full mt-6 flex gap-3",
  socialButton: "flex-1 h-11 flex items-center justify-center rounded-lg bg-[#CCD3E0] hover:bg-[#BFC7D6] cursor-pointer",
  socialIcon: "w-5 h-5 object-contain",
  footerText: "mt-[37px] max-w-[300px] text-[13px] leading-4 text-[#4C5973] text-center",
  footerLink: "font-medium text-[#182339] cursor-pointer"
};
