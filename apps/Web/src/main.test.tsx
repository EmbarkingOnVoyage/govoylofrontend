// @vitest-environment jsdom
import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Mock out external state managers to cleanly control their return configurations.
// NAVIGATION_FLOW_ENGINE/SCREEN_TO_PATH/PATH_TO_SCREEN are plain static data, so they're
// passed through for real via importOriginal rather than re-declared here.
vi.mock('@workspace/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@workspace/core')>();
  return {
    ...actual,
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('@workspace/ui', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AuthModal: () => null,
  BaseLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
  LoginWebFeature: () => <div data-testid="login-feature">Login Form Mock</div>,
  OtpWebFeature: () => <div>OTP Form Mock</div>,
  LoginMobileFeature: () => <div data-testid="login-feature">Login Form Mock</div>,
  OtpMobileFeature: () => <div>OTP Form Mock</div>,
  ProfileStep1: () => <div>Profile Mock</div>,
  BookingDashboard: () => <div>Booking Dashboard Mock</div>,
}));

// 🔑 Tiny utility to pause execution briefly, letting React complete its initial rendering cycle
const flushReactRenderQueue = () => new Promise((resolve) => setTimeout(resolve, 50));

describe('Web App Shell Boot Strategy', () => {
  let rootElement: HTMLDivElement | null = null;

  beforeEach(() => {
    // Clear the Node module cache completely so import('./main') triggers fresh execution
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_PREVIEW_TARGET', 'web');

    // Construct a fresh target DOM node container prior to each run
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  });

  afterEach(() => {
    // Tear down DOM layout configurations cleanly to maintain state isolation safely
    if (rootElement && rootElement.parentNode === document.body) {
      document.body.removeChild(rootElement);
    }
    rootElement = null;
    vi.unstubAllEnvs();
  });

  test('should verify environment DOM integration contract exists', () => {
    const targetContainer = document.getElementById('root');
    expect(targetContainer).not.toBeNull();
    expect(targetContainer?.id).toBe('root');
  });

  test('should assert critical system workflows boot cleanly in default view layouts', async () => {
    // Execute a fresh import of the file module layout
    await import('./main');

    // 🔑 Pause for a split second to let React mount and paint the default route inside #root
    await flushReactRenderQueue();

    // The default route ("/") renders a plain header/background shell — guests
    // should never be forced into sign-in just by loading the app.
    expect(rootElement?.innerHTML).toContain('data-testid="dashboard-layout"');
  });

  test('should catch contract violations if the DOM root node element is missing', async () => {
    // Remove the anchor node element ahead of executing the execution pipeline
    if (rootElement && rootElement.parentNode === document.body) {
      document.body.removeChild(rootElement);
    }

    // Assert that loading the module throws the strict error handler validation check
    await expect(import('./main')).rejects.toThrowError(
      'Contract Violation: Root container element "#root" not found in DOM.'
    );
  });
});
