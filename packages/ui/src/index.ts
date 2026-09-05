export const UI_VERSION = "1.0.0";
export * from './theme/tokens';
export * from './components/Button';
export * from './components/Input';
export * from './components/Card';
export * from './components/Text';
export * from './components/AppProvider';
export * from './components/AutoCompleteDropdown';

// Export domain features
export * from './features/bookings/BookingDashboard';
// NOTE: SearchWidget is intentionally not exported/routed yet — it (via its
// Calendar sub-component) imports @react-native-community/datetimepicker,
// a native-only package with Flow syntax that Vite cannot bundle for web.
// Needs a web-compatible date picker before it can be wired into apps/Web.
export { LoginFeature as LoginMobileFeature } from './features/authentication/LoginFeature';
export { LoginFeature as LoginWebFeature } from './features/authentication/LoginFeature.web';
export { OtpFeature as OtpMobileFeature } from './features/authentication/OtpFeature';
export { OtpFeature as OtpWebFeature } from './features/authentication/OtpFeature.web';
export { ProfileStep1 } from './features/profile/ProfileStep1';

// Export mobile-specific styles
export * from './assets/index';

// ============================================================================
// 🎨 1. GLOBAL THEMES & DESIGN TOKENS
// ============================================================================
export { 
  getThemeStyles, 
  tokens as GlobalDesignTokens,
  type ThemeMode, 
  type ThemeStyles,
  type IThemeTokens,
  type IThemeColors
} from './theme/tokens';

// ============================================================================
// 🏗️ 2. BASE COMPONENTS LAYOUTS
// ============================================================================
export { 
  defaultButtonStyles as BaseButtonMobileStyles,
  loginButtonStyles as BaseButtonLoginPlaceholderStyles,
  getDynamicContainerStyle as getButtonDynamicContainerStyle,
  getDynamicTextStyle as getButtonDynamicTextStyle,
  type IButtonStyles
} from './styles/base/BaseButton.styles';

export { 
  getSharedInputProperties as getBaseInputMobileProperties,
  type IControlStyles as IBaseInputStyles
} from './styles/base/BaseInput.styles';

// ============================================================================
// 🧩 3. FEATURE-SPECIFIC COMPONENTS LAYOUTS
// ============================================================================
export { 
  styles as AutoCompleteMobileStyles,
  getAutoCompleteDropdownStyles,
  type IAutoCompleteStyles
} from './styles/components/AutoCompleteDropdown.styles';

export { 
  styles as SearchWidgetMobileStyles,
  getSearchWidgetStyles,
  type IWidgetStyles as ISearchWidgetStyles
} from './styles/components/SearchWidget.styles';

// ============================================================================
// 🔑 4. HYBRID MULTI-PLATFORM LAYOUTS
// ============================================================================
export { 
  web as LoginWebStyles, 
  mobile as LoginMobileStyles,
  type ILoginWebStyles,
  type ILoginMobileStyles
} from './styles/components/LoginFeature.styles';

// Add these directly to your packages/ui/src/index.ts file:

export { 
  web as OtpWebStyles, 
  mobile as OtpMobileStyles,
  type IOtpWebStyles,
  type IOtpMobileStyles
} from './styles/components/OtpFeature.styles';

export { profileStyles } from './styles/components/ProfileStep1.styles';


