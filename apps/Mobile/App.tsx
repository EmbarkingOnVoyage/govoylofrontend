import { useState } from 'react';
import { useFonts } from 'expo-font';
import { AppProvider, LoginMobileFeature, OtpMobileFeature, authContextCache } from '@workspace/ui';
import { useFlowNavigation, NavigationRule } from '@workspace/core';
import { SafeAreaView } from 'react-native';
import { LandingScreen } from './src/screens/LandingScreen';
import { TabShell } from './src/navigation/TabShell';
import { applyInterFont, INTER_FONTS } from './src/theme/interFont';
import { useHardwareBack } from './src/navigation/useHardwareBack';

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

  // Android back at the shell level: sign-in steps go back one step, and a
  // guest on Home returns to the welcome screen. A signed-in user on Home (or
  // anyone on the welcome screen) gets Android's default, which closes the app.
  useHardwareBack(() => {
    if (currentScreen !== 'Landing') {
      handleNavigate('ON_BACK');
      return true;
    }
    if (isGuest && !isLoggedIn) {
      setIsGuest(false);
      return true;
    }
    return false;
  });

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
