import React from 'react';
import { AppProvider, BookingDashboard } from '@workspace/ui';

export default function App() {
  return (
    <AppProvider contextName="WEB-APP-PRODUCTION">
      {/* 
        This renders your unified dashboard layout directly inside HTML.
        React Native Web automatically transforms the internal native views 
        into clean, zero-bloat browser divs and spans!
      */}
      <BookingDashboard />
    </AppProvider>
  );
}
