import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { House, Percent, Briefcase, UserRound } from 'lucide-react-native';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { PersonalDetailsScreen } from '../screens/profile/PersonalDetailsScreen';
import { CoTravellerScreen } from '../screens/profile/CoTravellerScreen';
import { CoTravellerFormScreen } from '../screens/profile/CoTravellerFormScreen';
import { PlaceholderScreen } from '../screens/profile/PlaceholderScreen';
import { LoginRequiredScreen } from '../screens/LoginRequiredScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { FlightSearchFormScreen } from '../screens/flights/FlightSearchFormScreen';
import { FlightResultsScreen } from '../screens/flights/FlightResultsScreen';
import type { FlightOffer } from '@workspace/ui';

type TabKey = 'Home' | 'Deals' | 'MyTrips' | 'Profile';

// The Home tab has its own internal stack (buttons -> flight search -> flight
// results), separate from the bottom-tab selection, mirroring the Profile
// tab's sub-stack pattern below.
type HomeStackScreen = 'Buttons' | 'FlightSearch' | 'FlightResults';

// The Profile tab has its own internal stack (hub -> Personal details -> ...)
// separate from the bottom-tab selection, since navigating into a profile
// sub-page shouldn't change which tab is highlighted.
type ProfileStackScreen =
  | 'Hub'
  | 'PersonalDetails'
  | 'CoTraveller'
  | 'CoTravellerForm'
  | 'CustomizationPreferences'
  | 'PaymentMethods'
  | 'PrivacyDataManagement'
  | 'Bookings'
  | 'Saved'
  | 'ShareFeedback';

const TABS: { key: TabKey; label: string; Icon: typeof House }[] = [
  { key: 'Home', label: 'Home', Icon: House },
  { key: 'Deals', label: 'Deals', Icon: Percent },
  { key: 'MyTrips', label: 'My trips', Icon: Briefcase },
  { key: 'Profile', label: 'Profile', Icon: UserRound },
];

const PLACEHOLDER_TITLES: Partial<Record<ProfileStackScreen, string>> = {
  CustomizationPreferences: 'Customization preferences',
  PaymentMethods: 'Payment methods',
  PrivacyDataManagement: 'Privacy & data management',
  Bookings: 'Bookings',
  Saved: 'Saved',
  ShareFeedback: 'Share your feedback',
};

interface TabShellProps {
  onSignOut: () => void;
  isGuest: boolean;
  onRequireLogin: () => void;
}

const TAB_LABELS: Record<TabKey, string> = {
  Home: 'Home',
  Deals: 'Deals',
  MyTrips: 'My trips',
  Profile: 'Profile',
};

// Guests can browse Home/Deals/My trips freely; only Profile needs a real account.
const GUEST_RESTRICTED_TABS: TabKey[] = ['Profile'];

export const TabShell: React.FC<TabShellProps> = ({ onSignOut, isGuest, onRequireLogin }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [profileScreen, setProfileScreen] = useState<ProfileStackScreen>('Hub');
  const [editingTravellerId, setEditingTravellerId] = useState<string | null>(null);
  const [homeScreen, setHomeScreen] = useState<HomeStackScreen>('Buttons');
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);

  const renderHomeStack = () => {
    switch (homeScreen) {
      case 'FlightSearch':
        return (
          <FlightSearchFormScreen
            onBack={() => setHomeScreen('Buttons')}
            onResults={(offers) => {
              setFlightOffers(offers);
              setHomeScreen('FlightResults');
            }}
          />
        );
      case 'FlightResults':
        return <FlightResultsScreen offers={flightOffers} onBack={() => setHomeScreen('FlightSearch')} />;
      case 'Buttons':
      default:
        return (
          <HomeScreen
            onSelectFlightsAndHotels={() => {}}
            onSelectHotels={() => {}}
            onSelectFlights={() => setHomeScreen('FlightSearch')}
          />
        );
    }
  };

  const renderProfileStack = () => {
    switch (profileScreen) {
      case 'PersonalDetails':
        return <PersonalDetailsScreen onBack={() => setProfileScreen('Hub')} />;
      case 'CoTraveller':
        return (
          <CoTravellerScreen
            onBack={() => setProfileScreen('Hub')}
            onAdd={() => {
              setEditingTravellerId(null);
              setProfileScreen('CoTravellerForm');
            }}
            onEdit={(id) => {
              setEditingTravellerId(id);
              setProfileScreen('CoTravellerForm');
            }}
          />
        );
      case 'CoTravellerForm':
        return (
          <CoTravellerFormScreen
            travellerId={editingTravellerId}
            onDone={() => setProfileScreen('CoTraveller')}
          />
        );
      case 'Hub':
        return (
          <ProfileScreen
            onNavigate={(screen) => setProfileScreen(screen as ProfileStackScreen)}
            onSignOut={onSignOut}
          />
        );
      default: {
        const title = PLACEHOLDER_TITLES[profileScreen] ?? profileScreen;
        return <PlaceholderScreen title={title} onBack={() => setProfileScreen('Hub')} />;
      }
    }
  };

  const renderTabContent = () => {
    if (isGuest && GUEST_RESTRICTED_TABS.includes(activeTab)) {
      return <LoginRequiredScreen title={TAB_LABELS[activeTab]} onSignIn={onRequireLogin} />;
    }

    switch (activeTab) {
      case 'Profile':
        return renderProfileStack();
      case 'Home':
        return renderHomeStack();
      case 'Deals':
        return <PlaceholderScreen title="Deals" onBack={() => {}} />;
      case 'MyTrips':
        return <PlaceholderScreen title="My trips" onBack={() => {}} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderTabContent()}</View>
      <SafeAreaView style={styles.tabBarSafeArea}>
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <tab.Icon size={22} color={isActive ? '#7C1AEE' : '#3E4B64'} strokeWidth={2} />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1 },
  tabBarSafeArea: { backgroundColor: '#FFFFFF' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 13, fontWeight: '500', color: '#3E4B64' },
  tabLabelActive: { color: '#7C1AEE' },
});
