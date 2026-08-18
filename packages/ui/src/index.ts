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
export * from './features/authentication/LoginFeature';
export * from './features/authentication/OtpFeature';

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
