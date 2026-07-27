import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, BookingDashboard } from '@workspace/ui';
import { ErrorBoundary } from '@workspace/core';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Contract Violation: Root container element "#root" not found in DOM.');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    {/* Corrected: Map contextName precisely to catch tracking metrics */}
    <ErrorBoundary contextName="WEB-APP-SHELL">
      {/* Corrected: Use default theme tokens without injecting unsupported platform props */}
      <AppProvider>
        <BookingDashboard />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
