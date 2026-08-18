import { ViewStyle, TextStyle } from "react-native";

// ==========================================
// 1. TYPE DEFINITIONS (INTERFACES)
// ==========================================

export interface ILoginMobileStyles {
  backdrop: ViewStyle;
  container: ViewStyle;
  closeButton: TextStyle;
  logoWrapper: ViewStyle;
  logoText: TextStyle;
  title: TextStyle;
  formWrapper: ViewStyle;
  inputField: ViewStyle;
  inputFieldError: ViewStyle;
  errorText: TextStyle;
  submitButtonMargin: ViewStyle;
  dividerRow: ViewStyle;
  dividerLine: ViewStyle;
  dividerText: TextStyle;
  socialRow: ViewStyle;
  socialFlexItem: ViewStyle;
  footerText: TextStyle;
  footerLink: TextStyle;
}

export interface ILoginWebStyles {
  backdrop: string;
  container: string;
  closeButton: string;
  logoWrapper: string;
  title: string;
  inputWrapper: string;
  inputField: (hasError: boolean) => string;
  inputErrorMessage: string;
  continueButton: string;
  dividerLineWrapper: string;
  dividerLine: string;
  dividerText: string;
  socialRow: string;
  socialButton: string;
  footerText: string;
  footerLink: string;
}

// ==========================================
// 2. MOBILE EXPORT (React Native Objects)
// ==========================================

export const mobile: ILoginMobileStyles = {
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(107, 114, 128, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 999,
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' as any, 
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    fontSize: 26,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  logoWrapper: {
    width: 44,
    height: 44,
    backgroundColor: '#7F1DFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  formWrapper: {
    width: '100%',
  },
  inputField: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
  inputFieldError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  submitButtonMargin: {
    marginTop: 12,
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
    backgroundColor: '#F3F4F6',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  socialFlexItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  footerLink: {
    textDecorationLine: 'underline',
    color: '#7F1DFF',
    fontWeight: '500',
  },
};

// ==========================================
// 3. WEB EXPORT (Tailwind Classes Strings)
// ==========================================

export const web: ILoginWebStyles = {
  backdrop: "fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm p-4",
  container: "relative w-full max-w-[430px] bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center border border-gray-100",
  closeButton: "absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors text-xl font-medium outline-none",
  logoWrapper: "w-10 h-10 bg-[#7F1DFF] text-white rounded-xl flex items-center justify-center mb-4 text-xl shadow-md shadow-purple-200",
  title: "text-2xl font-bold text-gray-900 mb-6 tracking-tight text-center",
  inputWrapper: "w-full mb-4",
  inputField: (hasError: boolean): string => `
    w-full px-4 py-3 rounded-lg border text-base outline-none transition-all duration-200 text-gray-800 placeholder-gray-400
    ${hasError 
      ? "border-red-500 bg-red-50/10 focus:ring-1 focus:ring-red-500" 
      : "border-gray-200 bg-gray-50/30 focus:border-purple-600 focus:bg-white"
    }
  `.replace(/\s+/g, ' ').trim(), 
  inputErrorMessage: "text-red-500 text-xs mt-1 ml-1 font-medium",
  continueButton: "w-full py-3.5 bg-[#7F1DFF] hover:bg-[#6A16D9] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-purple-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-base",
  dividerLineWrapper: "w-full flex items-center my-6",
  dividerLine: "flex-1 h-[1px] bg-gray-100",
  dividerText: "px-4 text-xs text-gray-400 font-normal tracking-wide uppercase",
  socialRow: "w-full grid grid-cols-3 gap-3 mb-8",
  socialButton: "flex items-center justify-center py-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-700 rounded-xl transition-all duration-200 text-xl border border-gray-100 active:scale-[0.97]",
  footerText: "text-[12px] text-gray-400 text-center leading-relaxed max-w-[290px] font-normal",
  footerLink: "underline cursor-pointer hover:text-purple-600 font-medium transition-colors"
};
