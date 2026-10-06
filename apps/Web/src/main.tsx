/// <reference types="vite/client" />

import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  AppProvider,
  AuthProvider,
  AuthModal,
  LoginWebFeature,
  OtpWebFeature,
  ProfileStep1,
  BookingDashboard,
  DashboardLayout,
  FlightSearchFormWeb,
  decodeFlightSearch,
  encodeFlightSearch,
  flightSearchQueryKey,
} from "@workspace/ui";
import { ErrorBoundary, NavigationRule } from "@workspace/core";
import { useWebFlowNavigation } from "./navigation/useWebFlowNavigation";
import { RequireAuth } from "./routes/RequireAuth";
import { FlightResultsRoute } from "./routes/FlightResultsRoute";
import { FlightReviewRoute, BookingConfirmedRoute } from "./routes/FlightReviewRoute";

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

const MyTripsPlaceholder: React.FC = () => <div>My Trips page not built yet.</div>;

const AppWorkflowRouter: React.FC = () => {
  const { navigateByRule } = useWebFlowNavigation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryClient = useQueryClient();

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
            <FlightSearchFormWeb
              // "Modify search" comes back here with the search in the URL.
              key={search}
              initialSummary={decodeFlightSearch(search)}
              onNavigate={onNavigateLoose}
              onResults={(response, summary) => {
                // Seed the results page's query so it doesn't search twice.
                queryClient.setQueryData(flightSearchQueryKey(summary.request), response);
                navigate(`/flights/results?${encodeFlightSearch(summary)}`);
              }}
            />
          }
        />
        <Route path="/signin" element={<LoginWebFeature onNavigate={onNavigateLoose} />} />
        <Route path="/otp" element={<OtpWebFeature onNavigate={onNavigateLoose} />} />
        <Route path="/booking-dashboard" element={<BookingDashboard />} />
        <Route path="/search" element={<Navigate to="/" replace />} />
        <Route
          path="/flights/results"
          element={
            <DashboardLayout showSidebar={false} variant="wide" onNavigate={onNavigateLoose}>
              <FlightResultsRoute />
            </DashboardLayout>
          }
        />
        <Route
          path="/flights/review"
          element={
            <DashboardLayout showSidebar={false} variant="wide" onNavigate={onNavigateLoose}>
              <RequireAuth>
                <FlightReviewRoute />
              </RequireAuth>
            </DashboardLayout>
          }
        />
        <Route
          path="/flights/booked"
          element={
            <DashboardLayout showSidebar={false} variant="wide" onNavigate={onNavigateLoose}>
              <RequireAuth>
                <BookingConfirmedRoute />
              </RequireAuth>
            </DashboardLayout>
          }
        />
        <Route
          path="/my-trips"
          element={
            <DashboardLayout showSidebar={false} onNavigate={onNavigateLoose}>
              <RequireAuth>
                <MyTripsPlaceholder />
              </RequireAuth>
            </DashboardLayout>
          }
        />
        <Route
          path="/my-trips/:tripBookingId"
          element={
            <DashboardLayout showSidebar={false} onNavigate={onNavigateLoose}>
              <RequireAuth>
                <MyTripsPlaceholder />
              </RequireAuth>
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
