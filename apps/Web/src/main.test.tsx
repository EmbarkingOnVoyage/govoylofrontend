// @vitest-environment jsdom
import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Mock out external state managers to cleanly control their return configurations
vi.mock('@workspace/core', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useFlowNavigation: vi.fn(() => ({
    currentScreen: 'SignIn',
    navigateByRule: vi.fn(),
  })),
}));

vi.mock('@workspace/ui', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  BaseLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LoginWebFeature: () => <div data-testid="login-feature">Login Form Mock</div>,
  OtpWebFeature: () => <div>OTP Form Mock</div>,
  LoginMobileFeature: () => <div data-testid="login-feature">Login Form Mock</div>,
  OtpMobileFeature: () => <div>OTP Form Mock</div>,
}));

vi.mock('mobile-app/src/screens/LandingScreen', () => ({
  LandingScreen: () => <div>Landing Mobile Screen Mock</div>,
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
    
    // 🔑 Pause for a split second to let React mount and paint your LoginFeature component inside #root
    await flushReactRenderQueue();
    
    // Check our newly added anchor wrapper element node
    expect(rootElement?.innerHTML).toContain('data-testid="login-feature"');
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
