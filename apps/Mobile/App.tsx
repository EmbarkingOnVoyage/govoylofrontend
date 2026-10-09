import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { AppProvider, LoginMobileFeature, OtpMobileFeature, authContextCache, clearAppQueryCache } from '@workspace/ui';
import { useFlowNavigation, NavigationRule } from '@workspace/core';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LandingScreen } from './src/screens/LandingScreen';
import { TabShell } from './src/navigation/TabShell';
import { applyInterFont, INTER_FONTS } from './src/theme/interFont';
import { useHardwareBack } from './src/navigation/useHardwareBack';
import { secureSessionStorage } from './src/auth/secureSessionStorage';

// Every screen renders in Inter, the design's typeface (see interFont.ts).
applyInterFont();

// Keep the signed-in session across app restarts (see secureSessionStorage.ts).
authContextCache.useSessionStorage(secureSessionStorage);

export default function App() {
  const { currentScreen, navigateByRule } = useFlowNavigation('Landing');
  const [isLoggedIn, setIsLoggedIn] = useState(() => authContextCache.isLoggedIn());
  const [isGuest, setIsGuest] = useState(false);
  const [fontsLoaded] = useFonts(INTER_FONTS);
  // Restoring the saved session takes one keystore read; until then we don't
  // know whether to show the welcome screen or go straight to Home.
  const [sessionRestored, setSessionRestored] = useState(false);

  useEffect(() => {
    let active = true;
    authContextCache.hydrate().then((loggedIn) => {
      if (!active) return;
      setIsLoggedIn(loggedIn);
      setSessionRestored(true);
    });
    // A refresh token the server rejects (e.g. 30 days unused) ends the
    // session; leave the signed-in screens instead of failing every request.
    const unsubscribe = authContextCache.onSessionCleared(() => {
      setIsLoggedIn(false);
      setIsGuest(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleNavigate = (rule: NavigationRule) => {
    if (rule === 'ON_OTP_VERIFIED') {
      // Nothing cached from a guest checkout (or a previous account) carries over.
      clearAppQueryCache();
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
    clearAppQueryCache();
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
  if (!fontsLoaded || !sessionRestored) {
    return null;
  }

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
