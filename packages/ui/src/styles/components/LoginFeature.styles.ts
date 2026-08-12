/**
 * Strict Component Layout Style Tokens for LoginFeature
 * Path: packages/ui/src/styles/components/LoginFeature.styles.ts
 */

export const loginStyles = {
  // Modal Backdrop Overlay Layout
  backdrop: "fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-sm p-4",
  
  // Center Box White Card Container
  container: "relative w-full max-w-[430px] bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center border border-gray-100",
  
  // Close Box "X" Layout
  closeButton: "absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors text-xl font-medium outline-none",
  
  // App Visual Header Branding Logo Container
  logoWrapper: "w-10 h-10 bg-[#7F1DFF] text-white rounded-xl flex items-center justify-center mb-4 text-xl shadow-md shadow-purple-200",
  
  // Main Title Typography
  title: "text-2xl font-bold text-gray-900 mb-6 tracking-tight text-center",
  
  // Input Element Wrapper & State Variant Evaluator
  inputWrapper: "w-full mb-4",
  inputField: (hasError: boolean) => `
    w-full px-4 py-3 rounded-lg border text-base outline-none transition-all duration-200 text-gray-800 placeholder-gray-400
    ${hasError 
      ? "border-red-500 bg-red-50/10 focus:ring-1 focus:ring-red-500" 
      : "border-gray-200 bg-gray-50/30 focus:border-purple-600 focus:bg-white"
    }
  `,
  inputErrorMessage: "text-red-500 text-xs mt-1 ml-1 font-medium",
  
  // Primary Interactive Actions
  continueButton: "w-full py-3.5 bg-[#7F1DFF] hover:bg-[#6A16D9] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-purple-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-base",
  
  // Middle Layout Content Dividers
  dividerLineWrapper: "w-full flex items-center my-6",
  dividerLine: "flex-1 h-[1px] bg-gray-100",
  dividerText: "px-4 text-xs text-gray-400 font-normal tracking-wide uppercase",
  
  // Alternative Connection Row
  socialRow: "w-full grid grid-cols-3 gap-3 mb-8",
  socialButton: "flex items-center justify-center py-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-700 rounded-xl transition-all duration-200 text-xl border border-gray-100 active:scale-[0.97]",
  
  // Legal Footer Subtext
  footerText: "text-[12px] text-gray-400 text-center leading-relaxed max-w-[290px] font-normal",
  footerLink: "underline cursor-pointer hover:text-purple-600 font-medium transition-colors"
};
