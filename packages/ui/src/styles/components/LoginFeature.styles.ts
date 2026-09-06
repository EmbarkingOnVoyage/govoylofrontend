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
  // Full-screen white page per the Figma "Welcome" mobile design — no
  // backdrop/modal card. Content sits pinned toward the bottom half of the
  // screen, matching the large empty top area in the design.
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  titleBlock: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#182339',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
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
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#182339',
  },
  inputFieldError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  primaryButton: {
    width: "100%",
    height: 44,
    backgroundColor: "#7C1AEE",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CEAAFF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ECEEF3',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#4C5973',
  },
  socialRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#CCD3E0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  guestLink: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  guestLinkText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#7C1AEE',
  },
  footerText: {
    fontSize: 13,
    color: '#4C5973',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
    color: '#4C5973',
    fontWeight: '500',
  },
};

// ==========================================
// 3. WEB EXPORT (Tailwind Classes Strings)
// ==========================================

export const web: ILoginWebStyles = {
  backdrop: "fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm p-4",
  container: "relative w-full max-w-[430px] bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center border border-gray-100",
  closeButton: "absolute top-5 right-6 text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light outline-none cursor-pointer",
  logoWrapper: "w-11 h-11 bg-[#7F1DFF] text-white rounded-xl flex items-center justify-center mb-4 shadow-md",
  logoText: "text-xl text-white",
  title: "text-2xl font-bold text-gray-900 mb-6 tracking-tight text-center subpixel-antialiased",
  formWrapper: "w-full",
  inputWrapper: "w-full mb-4",
  inputField: (hasError: boolean): string => `
    w-full px-4 py-3.5 rounded-xl border text-base outline-none transition-all duration-200 text-gray-900 placeholder-gray-400
    ${hasError
      ? "border-red-500 bg-red-50/30 focus:ring-1 focus:ring-red-500"
      : "border-gray-200 bg-gray-50/50 focus:border-purple-600 focus:bg-white"
    }
  `.replace(/\s+/g, ' ').trim(),
  inputFieldError: "border-red-500 bg-red-50/30",
  inputErrorMessage: "text-red-500 text-xs mt-1.5 ml-1 font-medium text-left block w-full",
  primaryButton: "w-full h-[54px] bg-[#7F1DFF] hover:bg-[#6A16D9] text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-purple-100 active:scale-[0.99] flex items-center justify-center text-base cursor-pointer mt-4",
  disabledButton: "bg-[#CCCCCC] opacity-60 cursor-not-allowed active:scale-100 shadow-none",
  primaryButtonText: "text-white text-base font-bold",
  dividerLineWrapper: "w-full flex items-center my-6",
  dividerLine: "flex-1 h-[1px] bg-gray-100",
  dividerText: "px-4 text-xs text-gray-400 font-normal tracking-wide uppercase",
  socialRow: "w-full flex justify-between mb-8",
  socialButton: "flex-1 flex items-center justify-center h-12 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-700 rounded-xl transition-all duration-200 border border-gray-200 mx-1 active:scale-[0.97] cursor-pointer",
  socialIcon: "w-6 h-6 object-contain",
  footerText: "text-xs text-gray-400 text-center leading-relaxed max-w-[290px] font-normal",
  footerLink: "underline cursor-pointer hover:text-purple-600 font-medium transition-colors"
};
