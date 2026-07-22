import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { logger } from './logger';

export interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // Allows developers to pass a custom error look if wanted
  contextName?: string; // Pinpoints which feature or domain crashed
}

interface IErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  public state: IErrorBoundaryState = {
    hasError: false
  };

  // Triggered automatically by React when a child runtime lifecycle component crashes
  public static getDerivedStateFromError(_: Error): IErrorBoundaryState {
    return { hasError: true };
  }

  // Automated Instrumentation Hook: Developers don't need to write manual logs
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(
      `Unhandled UI Crash captured inside component framework layout tree`,
      this.props.contextName || 'UNCAUGHT-UI-BOUNDARY',
      error
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Elegant baseline cross-platform production backup screen layout
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>
            Our engineering tracking systems have recorded this event. Please restart the view session.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.exports = {
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#DA1E28',
    marginBottom: 8
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#525252',
    textAlign: 'center' as const,
    lineHeight: 20
  }
};
