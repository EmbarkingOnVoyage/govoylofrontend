import React from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
// Uses our shared UI tokens and atomic primitives perfectly
import { Text, Card, Button, getThemeStyles } from '@workspace/ui';

interface ILandingScreenProps {
  onGetStarted: () => void;
  onLoginPress: () => void;
}

export function LandingScreen({ onGetStarted, onLoginPress }: ILandingScreenProps) {
  // Pull our global design standards contract
  const theme = getThemeStyles('light');

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  };

  const heroSectionStyle: ViewStyle = {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  };

  const buttonGroupStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  };

  return (
    <ScrollView style={containerStyle}>
      {/* Hero Brand Block Layout */}
      <View style={heroSectionStyle}>
        <Text variant="title" weight="bold" style={{ textAlign: 'center', marginBottom: theme.spacing.sm }}>
          Welcome to Govoylo Mobile
        </Text>
        <Text variant="body" style={{ textAlign: 'center', color: theme.colors.textMuted }}>
          Your enterprise booking engine, built native and optimized down to the last kilobyte.
        </Text>
      </View>

      {/* Feature Highlighting Container */}
      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text variant="heading" weight="bold" style={{ marginBottom: theme.spacing.xs }}>
          📱 100% Native Output
        </Text>
        <Text variant="body" style={{ color: theme.colors.textMuted }}>
          Compiled straight into clean Swift and Kotlin structures to ensure blazing-fast execution.
        </Text>
      </Card>

      {/* Action Composition */}
      <View style={buttonGroupStyle}>
        <Button label="Get Started" variant="primary" onPress={onGetStarted} />
        <Button label="Sign In" variant="secondary" onPress={onLoginPress} />
      </View>
    </ScrollView>
  );
}
