/**
 * @govoylo/mobile-sdk
 *
 * Public, publishable entry point for embedding goVoylo's shared design
 * system, navigation state machine, and API client in external React
 * Native / Expo apps. This package bundles the internal `@workspace/ui`,
 * `@workspace/core`, and `@workspace/api` workspace packages at build time
 * (see tsup.config.ts), so consumers only need the peer dependencies
 * declared in package.json — not the private workspace packages themselves.
 *
 * Each export below is imported from its concrete source file (not the
 * workspace package's own barrel `index.ts`) so the type bundler can
 * resolve every symbol to exactly one module — barrel `export *` files
 * with overlapping names are ambiguous for that step.
 */

export const SDK_VERSION = '0.1.0';

// ---------------------------------------------------------------------------
// Design system — base components + theme tokens
// ---------------------------------------------------------------------------
export {
  AppProvider,
  type IAppProviderProps,
  Button,
  type IButtonProps,
  Input,
  type IInputProps,
  Card,
  type ICardProps,
  Text,
  type ITextProps,
  AutoCompleteDropdown,
  type AutoCompleteDropdownProps,
} from './wrappers';
export {
  getThemeStyles,
  tokens as GlobalDesignTokens,
  type ThemeMode,
  type ThemeStyles,
  type IThemeTokens,
  type IThemeColors,
} from '@workspace/ui/src/theme/tokens';

// ---------------------------------------------------------------------------
// Cross-platform primitives — error handling, logging, navigation
// ---------------------------------------------------------------------------
export { ErrorBoundary, type IErrorBoundaryProps } from './wrappers';
export { logger, type LogLevel, type ILogEvent } from '@workspace/core/src/logger';
export { useFlowNavigation } from './wrappers';
export {
  NAVIGATION_FLOW_ENGINE,
  type AppScreen,
  type NavigationRule,
} from '@workspace/core/src/navigation/navigationConfig';

// ---------------------------------------------------------------------------
// API client — network engine, hooks, and validation contracts
// ---------------------------------------------------------------------------
export {
  createRequest,
  ApiNetworkError,
  ApiValidationError,
  type IRequestConfig,
} from '@workspace/api/src/client';
export { useLoginMutation, useRequestOtpMutation } from '@workspace/api/src/hooks/useAuth';
export { useBookings } from '@workspace/api/src/hooks/useBookings';
export { useLocations } from '@workspace/api/src/hooks/useLocations';
