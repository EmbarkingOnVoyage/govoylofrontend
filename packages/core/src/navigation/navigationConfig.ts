// packages/core/src/navigation/navigationConfig.ts

export type AppScreen = 'Landing' | 'SignIn' | 'SignUp' | 'SearchWidget' | 'BookingDashboard' | 'OTP' | 'Search' | 'Profile' | 'Settings' | 'Help' | 'Feedback' | 'Notifications' | 'TermsAndConditions' | 'PrivacyPolicy' | 'AboutUs' | 'ContactUs' | 'FAQ' | 'Support' | 'Dashboard' | 'Reports' | 'Analytics' | 'UserManagement' | 'AdminPanel' | 'Billing' | 'Subscription' | 'PaymentMethods' | 'Invoices' | 'TransactionHistory' | 'ActivityLog' | 'SystemSettings' | 'Integrations' | 'APIKeys' | 'Webhooks';

export type NavigationRule = 
  | 'ON_CONTINUE' 
  | 'ON_SIGN_IN_PRESS' 
  | 'ON_SEARCH_SUBMIT' 
  | 'ON_BACK' 
  | 'ON_SUBMIT_SUCCESS' 
  | 'ON_OTP_VERIFIED' 
  | 'ON_BACK_TO_LOGIN'
  | 'ON_NAVIGATE_TO_PROFILE'  
  | 'ON_NAVIGATE_TO_SIGN_IN'; 

// 3. The Centralized Flow Map Matrix Contract
export const NAVIGATION_FLOW_ENGINE: Record<AppScreen, Partial<Record<NavigationRule, AppScreen>>> = {
  Landing: {
    ON_CONTINUE: 'SearchWidget',
    ON_SIGN_IN_PRESS: 'SignIn',
    ON_NAVIGATE_TO_SIGN_IN: 'SignIn',
  },
  SearchWidget: {
    ON_SEARCH_SUBMIT: 'BookingDashboard',
    ON_BACK: 'Landing',
  },
  SignIn: {
    ON_BACK: 'Landing',
    ON_SUBMIT_SUCCESS: "OTP",
    ON_NAVIGATE_TO_PROFILE: 'Profile',
    ON_NAVIGATE_TO_SIGN_IN: 'SignIn',
  },
  SignUp: {
    ON_BACK: 'Landing',
  },
  BookingDashboard: {
    ON_BACK: 'SearchWidget',
  },
  // 💡 FIXED: Removed the invalid "transitions" wrapper. 
  // Configured as a flat matrix object matching your strict matrix contract parameters
  OTP: {
    ON_OTP_VERIFIED: "Landing",
    ON_BACK_TO_LOGIN: "SignIn",
    ON_NAVIGATE_TO_PROFILE: 'Profile',
    ON_NAVIGATE_TO_SIGN_IN: 'SignIn',
  },
  
  // Fill empty structural definitions for other types to satisfy the strict 'Record<AppScreen, ...>' constraint
  Search: {
    ON_NAVIGATE_TO_PROFILE: 'Profile',
    ON_NAVIGATE_TO_SIGN_IN: 'SignIn',
  }, 
  Profile: {
    ON_NAVIGATE_TO_SIGN_IN: 'SignIn',
  }, 
  
  Settings: {}, Help: {}, Feedback: {}, Notifications: {},
  TermsAndConditions: {}, PrivacyPolicy: {}, AboutUs: {}, ContactUs: {}, FAQ: {},
  Support: {}, Dashboard: {}, Reports: {}, Analytics: {}, UserManagement: {},
  AdminPanel: {}, Billing: {}, Subscription: {}, PaymentMethods: {}, Invoices: {},
  TransactionHistory: {}, ActivityLog: {}, SystemSettings: {}, Integrations: {},
  APIKeys: {}, Webhooks: {}
};

// Screens with a real, routable page on the Web app. Only these get a URL —
// the many placeholder AppScreen entries above have no component yet, so
// they're intentionally left out of this map rather than given a fake route.
// SearchWidget is deliberately excluded: it (via Calendar) imports a
// native-only date-picker package that Vite cannot bundle for web today.
export const SCREEN_TO_PATH: Partial<Record<AppScreen, string>> = {
  Landing: '/',
  SignIn: '/signin',
  OTP: '/otp',
  BookingDashboard: '/booking-dashboard',
  Search: '/search',
  Profile: '/profile',
};

export const PATH_TO_SCREEN: Record<string, AppScreen> = Object.fromEntries(
  Object.entries(SCREEN_TO_PATH).map(([screen, path]) => [path, screen as AppScreen])
);
