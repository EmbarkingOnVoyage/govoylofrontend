import { AppProvider, LoginMobileFeature, OtpMobileFeature } from '@workspace/ui';
import { useFlowNavigation } from '@workspace/core';
import { SafeAreaView } from 'react-native';
import { LandingScreen } from './src/screens/LandingScreen';

export default function App() {
  const { currentScreen, navigateByRule } = useFlowNavigation('Landing');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SignIn':
        return <LoginMobileFeature onNavigate={navigateByRule} />;
      case 'OTP':
        return <OtpMobileFeature onNavigate={navigateByRule} />;
      case 'Landing':
      default:
        return (
          <LandingScreen
            onNavigate={navigateByRule}
            onGetStartedPress={() => navigateByRule('ON_CONTINUE')}
            onLoginPress={() => navigateByRule('ON_SIGN_IN_PRESS')}
          />
        );
    }
  };

  return (
    <AppProvider contextName="MOBILE-APP-SHELL">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {renderScreen()}
      </SafeAreaView>
    </AppProvider>
  );
}
