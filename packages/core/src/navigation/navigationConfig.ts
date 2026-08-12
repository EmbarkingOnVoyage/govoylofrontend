// 1. Explicit Screen Enumeration (C#-like Type Union)
export type AppScreen = 'Landing' | 'SignIn' | 'SignUp' | 'SearchWidget' | 'BookingDashboard' | 'OTP' | 'Search' | 'Profile' | 'Settings' | 'Help' | 'Feedback' | 'Notifications' | 'TermsAndConditions' | 'PrivacyPolicy' | 'AboutUs' | 'ContactUs' | 'FAQ' | 'Support' | 'Dashboard' | 'Reports' | 'Analytics' | 'UserManagement' | 'AdminPanel' | 'Billing' | 'Subscription' | 'PaymentMethods' | 'Invoices' | 'TransactionHistory' | 'ActivityLog' | 'SystemSettings' | 'Integrations' | 'APIKeys' | 'Webhooks';

// 2. Strict Intent Triggers (Your NavigationRule Enum equivalent)
export type NavigationRule = 'ON_CONTINUE' | 'ON_SIGN_IN_PRESS' | 'ON_SEARCH_SUBMIT' | 'ON_BACK' | 'ON_SUBMIT_SUCCESS';

// 3. The Centralized Flow Map Matrix Contract
export const NAVIGATION_FLOW_ENGINE: Record<AppScreen, Partial<Record<NavigationRule, AppScreen>>> = {
  Landing: {
    ON_CONTINUE: 'SearchWidget',
    ON_SIGN_IN_PRESS: 'SignIn',
  },
  SearchWidget: {
    ON_SEARCH_SUBMIT: 'BookingDashboard',
    ON_BACK: 'Landing',
  },
  SignIn: {
    ON_BACK: 'Landing',
    ON_SUBMIT_SUCCESS: "OTP",

  },
  SignUp: {
    ON_BACK: 'Landing',
  },
  BookingDashboard: {
    ON_BACK: 'SearchWidget',
  },
   OTP: {
    transitions: {
      // This will handle your next step when the OTP code is correct
      ON_OTP_VERIFIED: "Search" 
    }
  }
};
