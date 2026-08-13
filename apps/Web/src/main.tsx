/// <reference types="vite/client" />
import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider, BookingDashboard, LoginFeature, OtpFeature } from "@workspace/ui";
import { ErrorBoundary, useFlowNavigation } from "@workspace/core"; // Added useFlowNavigation contract

// Mobile Screen Preview View
import { LandingScreen } from "mobile-app/src/screens/LandingScreen";

// 1. Contract Enforcement: Read Vite's custom environment variable mode flag
const isMobilePreviewMode = import.meta.env.VITE_PREVIEW_TARGET === "mobile";

// 1. Contract Enforcement: Suppress platform-specific mobile warnings in the browser console
if (process.env.NODE_ENV === "development") {
  const originalWarn = console.warn;

  console.warn = (...args) => {
    // If the warning contains the word 'LinearGradient', silence it
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("LinearGradient")
    ) {
      return;
    }
    // Allow all other useful development system warnings to pass through untouched
    originalWarn(...args);
  };
}
const SCREENS: Record<string, React.FC<{ onNavigate: (rule: any) => void }>> = {
  Landing: ({ onNavigate }) => (
    <LandingScreen
      onNavigate={onNavigate}
      onLoginPress={() => onNavigate('ON_SIGN_IN_PRESS')}
      onGetStartedPress={() => onNavigate('ON_CONTINUE')}
    />
  ),
  SignIn: ({ onNavigate }) => (
    <LoginFeature onNavigate={onNavigate} />
  ),
  OTP: ({ onNavigate }) => (
  <OtpFeature onNavigate={onNavigate} />
),
  Search: () => <div>Search Screen Component Placeholder</div>,
};
const AppWorkflowRouter: React.FC = () => {
  // If we are testing mobile flows, boot the state machine at 'Landing'; otherwise go straight to the dashboard features
  const { currentScreen, navigateByRule } = useFlowNavigation(
    isMobilePreviewMode ? "Landing" : "SignIn",
  );
  const ActiveComponent = SCREENS[currentScreen];
   if (!ActiveComponent) {
    throw new Error(
      `CRITICAL FACTORY ERROR: Screen state "${currentScreen}" is not registered to render on the Web target architecture.`
    );
  }

  // Instantiates the resolved view and injects the rule router driver contract down to the page layer
  return <ActiveComponent onNavigate={navigateByRule} />;

};
const container = document.getElementById("root");
if (!container) {
  throw new Error(
    'Contract Violation: Root container element "#root" not found in DOM.',
  );
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary contextName="WEB-APP-SHELL">
      <AppProvider>
        {/* Render our configuration-controlled workflow manager */}
        <AppWorkflowRouter />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
