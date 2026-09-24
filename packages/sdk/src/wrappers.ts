/**
 * Typed re-exports for values whose original declarations don't survive the
 * .d.ts bundling step cleanly (class/function components rendering
 * `react-native` primitives, `Component<Props, State>` subclasses, generics,
 * and modules with sibling relative imports). Letting the bundler trace and
 * flatten those across the `@workspace/*` package boundary is unreliable in
 * practice — it silently leaves some of them pointing at module paths that
 * don't exist for an external consumer. Declaring the shapes locally and
 * re-typing the imported value sidesteps that: only these local interfaces
 * need to round-trip through the bundler, and they only reference `react` /
 * `react-native` types, which the consumer already has as peer dependencies.
 */
import type { ComponentType, ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ThemeMode } from '@workspace/ui/src/theme/tokens';

import { AppProvider as AppProviderImpl } from '@workspace/ui/src/components/AppProvider';
import { Button as ButtonImpl } from '@workspace/ui/src/components/Button';
import { Input as InputImpl } from '@workspace/ui/src/components/Input';
import { Card as CardImpl } from '@workspace/ui/src/components/Card';
import { Text as TextImpl } from '@workspace/ui/src/components/Text';
import { AutoCompleteDropdown as AutoCompleteDropdownImpl } from '@workspace/ui/src/components/AutoCompleteDropdown';
import { ErrorBoundary as ErrorBoundaryImpl } from '@workspace/core/src/ErrorBoundary';
import { useFlowNavigation as useFlowNavigationImpl } from '@workspace/core/src/navigation/useFlowNavigation';
import type { AppScreen, NavigationRule } from '@workspace/core/src/navigation/navigationConfig';

export interface IAppProviderProps {
  children: ReactNode;
  contextName?: string;
}
export const AppProvider: ComponentType<IAppProviderProps> = AppProviderImpl;

export interface IButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'social';
  disabled?: boolean;
  mode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
}
export const Button: ComponentType<IButtonProps> = ButtonImpl;

export interface IInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  mode?: ThemeMode;
}
export const Input: ComponentType<IInputProps> = InputImpl;

export interface ICardProps {
  children: ReactNode;
  mode?: ThemeMode;
  style?: ViewStyle;
}
export const Card: ComponentType<ICardProps> = CardImpl;

export interface ITextProps {
  children: ReactNode;
  variant?: 'title' | 'heading' | 'body' | 'caption';
  weight?: 'regular' | 'medium' | 'bold';
  mode?: ThemeMode;
  style?: TextStyle;
}
export const Text: ComponentType<ITextProps> = TextImpl;

export interface AutoCompleteDropdownProps<T> {
  data: T[];
  placeholder?: string;
  onSelect: (item: T) => void;
  labelExtractor: (item: T) => string;
  keyExtractor: (item: T) => string;
}
export const AutoCompleteDropdown = AutoCompleteDropdownImpl as <T>(
  props: AutoCompleteDropdownProps<T>,
) => JSX.Element;

export interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  contextName?: string;
}
export const ErrorBoundary: ComponentType<IErrorBoundaryProps> = ErrorBoundaryImpl;

// `useFlowNavigation`'s own module resolves `AppScreen`/`NavigationRule` via a
// sibling relative import (`./navigationConfig`), which the .d.ts bundler
// can't map back to the already-inlined `navigationConfig` module re-exported
// from `index.ts` — it ends up as a dangling relative import in the published
// types. Re-typing the value locally against the same (directly imported,
// non-relative) types sidesteps that, same as the components above.
export const useFlowNavigation: (initialScreen?: AppScreen) => {
  currentScreen: AppScreen;
  navigateByRule: (rule: NavigationRule) => void;
} = useFlowNavigationImpl;
