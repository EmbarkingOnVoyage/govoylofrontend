import { useState } from 'react';
import { useFonts } from 'expo-font';
import { AppProvider, LoginMobileFeature, OtpMobileFeature, authContextCache } from '@workspace/ui';
import { useFlowNavigation, NavigationRule } from '@workspace/core';
import { SafeAreaView } from 'react-native';
import { LandingScreen } from './src/screens/LandingScreen';
import { TabShell } from './src/navigation/TabShell';
import { applyInterFont, INTER_FONTS } from './src/theme/interFont';

// Every screen renders in Inter, the design's typeface (see interFont.ts).
applyInterFont();

export default function App() {
  const { currentScreen, navigateByRule } = useFlowNavigation('Landing');
  const [isLoggedIn, setIsLoggedIn] = useState(() => authContextCache.isLoggedIn());
  const [isGuest, setIsGuest] = useState(false);
  const [fontsLoaded] = useFonts(INTER_FONTS);

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

  // Bundled fonts load in a few ms; rendering first would flash the system font.
  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProvider contextName="MOBILE-APP-SHELL">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {renderScreen()}
      </SafeAreaView>
    </AppProvider>
  );
}
