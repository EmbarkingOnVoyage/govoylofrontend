import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import { logger } from './logger';

// A malicious mock component designed to simulate a production runtime crash
function FlawedComponent() {
  throw new Error('Explosive runtime render crash');
  return <div />;
}

describe('Cross-Platform UI Error Boundary Engine', () => {
  test('should isolate a component crash, call the logging engine, and display the fallback UI screen layout safely', () => {
    // Intercept console errors to keep the terminal pipeline clean during expected failures
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const loggerSpy = vi.spyOn(logger, 'error');

    const { getByText } = render(
      <ErrorBoundary contextName="TEST-CRASH-SUITE">
        <FlawedComponent />
      </ErrorBoundary>
    );

    // 1. Verify the fallback UI is elegantly rendered to the user
    expect(getByText('Something went wrong')).toBeTruthy();

    // 2. Assert that the automated instrumentation caught the crash without manual developer wrappers
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unhandled UI Crash captured'),
      'TEST-CRASH-SUITE',
      expect.any(Error)
    );
  });
});
