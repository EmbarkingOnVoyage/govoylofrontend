/// <reference types="vite/client" />

import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, AuthProvider, AuthModal, LoginWebFeature, OtpWebFeature, ProfileStep1, BookingDashboard, DashboardLayout } from "@workspace/ui";
import { ErrorBoundary, NavigationRule } from "@workspace/core";
import { useWebFlowNavigation } from "./navigation/useWebFlowNavigation";

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

const AppWorkflowRouter: React.FC = () => {
  const { navigateByRule } = useWebFlowNavigation();

  // Several screen components still type their onNavigate prop as a plain
  // (rule: string) => void rather than the NavigationRule union. navigateByRule
  // already guards against unmapped rules at runtime (see useWebFlowNavigation),
  // so this cast just restores the type-erased shape those components expect.
  const onNavigateLoose = (rule: string) => navigateByRule(rule as NavigationRule);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardLayout showSidebar={false} onNavigate={onNavigateLoose}>
              <div />
            </DashboardLayout>
          }
        />
        <Route path="/signin" element={<LoginWebFeature onNavigate={onNavigateLoose} />} />
        <Route path="/otp" element={<OtpWebFeature onNavigate={onNavigateLoose} />} />
        <Route path="/booking-dashboard" element={<BookingDashboard />} />
        <Route
          path="/search"
          element={
            <DashboardLayout showSidebar={false} onNavigate={onNavigateLoose}>
              <div>Search Screen Component Placeholder</div>
            </DashboardLayout>
          }
        />
        <Route path="/profile" element={<ProfileStep1 onNavigate={onNavigateLoose} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthModal />
    </>
  );
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
        <AuthProvider>
          <BrowserRouter>
            <AppWorkflowRouter />
          </BrowserRouter>
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
