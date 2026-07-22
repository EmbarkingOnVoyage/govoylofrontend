import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@workspace/core';

// Create a highly optimized, single-instance global memory cache database manager
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false, // Prevents aggressive background battery drain on mobile
    },
  },
});

interface IAppProviderProps {
  children: React.ReactNode;
  contextName?: string;
}

/**
 * Universal App Architecture Context Bootstrap Wrapper
 * Injects global memory handling and automatic crash instrumentation
 */
export function AppProvider({ children, contextName = 'APP-ROOT' }: IAppProviderProps) {
  return (
    <ErrorBoundary contextName={contextName}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
