import { useState } from 'react';
import { AppProvider, LoginMobileFeature, OtpMobileFeature, authContextCache } from '@workspace/ui';
import { useFlowNavigation, NavigationRule } from '@workspace/core';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LandingScreen } from './src/screens/LandingScreen';
import { TabShell } from './src/navigation/TabShell';

export default function App() {
  const { currentScreen, navigateByRule } = useFlowNavigation('Landing');
  const [isLoggedIn, setIsLoggedIn] = useState(() => authContextCache.isLoggedIn());
  const [isGuest, setIsGuest] = useState(false);

  const handleNavigate = (rule: NavigationRule) => {
    if (rule === 'ON_OTP_VERIFIED') {
      setIsLoggedIn(true);
      setIsGuest(false);
    }
    navigateByRule(rule);
  };

  const handleSignOut = () => {
    authContextCache.clearSession();
    setIsLoggedIn(false);
    setIsGuest(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SignIn':
        return <LoginMobileFeature onNavigate={handleNavigate} />;
      case 'OTP':
        return <OtpMobileFeature onNavigate={handleNavigate} />;
      case 'Landing':
      default:
        if (isLoggedIn || isGuest) {
          return (
            <TabShell
              onSignOut={handleSignOut}
              isGuest={isGuest}
              onRequireLogin={() => handleNavigate('ON_SIGN_IN_PRESS')}
            />
          );
        }
        return (
          <LandingScreen
            onNavigate={handleNavigate}
            onGetStartedPress={() => handleNavigate('ON_CONTINUE')}
            onLoginPress={() => handleNavigate('ON_SIGN_IN_PRESS')}
            onGuestPress={() => setIsGuest(true)}
          />
        );
    }
  };

  return (
    <AppProvider contextName="MOBILE-APP-SHELL">
      {/* react-native's SafeAreaView only pads on iOS; this one also keeps content clear
          of the status and navigation bars on Android 15+, where apps draw edge-to-edge. */}
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {renderScreen()}
        </SafeAreaView>
      </SafeAreaProvider>
    </AppProvider>
  );
}
