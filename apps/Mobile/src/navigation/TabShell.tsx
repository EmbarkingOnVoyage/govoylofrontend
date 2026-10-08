import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { TAB_ICON_SVG } from '../components/figmaIcons';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { PersonalDetailsScreen } from '../screens/profile/PersonalDetailsScreen';
import { CoTravellerScreen } from '../screens/profile/CoTravellerScreen';
import { CoTravellerFormScreen } from '../screens/profile/CoTravellerFormScreen';
import { PlaceholderScreen } from '../screens/profile/PlaceholderScreen';
import { PreferencesScreen } from '../screens/profile/PreferencesScreen';
import { LoginRequiredScreen } from '../screens/LoginRequiredScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { FlightSearchFormScreen } from '../screens/flights/FlightSearchFormScreen';
import { FlightResultsScreen } from '../screens/flights/FlightResultsScreen';
import { TravelerDetailsScreen } from '../screens/flights/TravelerDetailsScreen';
import { MyTripsScreen } from '../screens/flights/MyTripsScreen';
import type { FlightOffer, FlightSearchSummary, PassengerCounts } from '@workspace/ui';

type TabKey = 'Home' | 'Deals' | 'MyTrips' | 'Profile';

// The Home tab has its own internal stack (buttons -> flight search -> flight
// results -> traveller details -> add/edit a traveller), separate from the
// bottom-tab selection, mirroring the Profile tab's sub-stack pattern below.
type HomeStackScreen = 'Buttons' | 'FlightSearch' | 'FlightResults' | 'TravelerDetails' | 'AddTraveler';

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

const TABS: { key: TabKey; label: string }[] = [
  { key: 'Home', label: 'Home' },
  { key: 'Deals', label: 'Deals' },
  { key: 'MyTrips', label: 'My trips' },
  { key: 'Profile', label: 'Profile' },
];

const PLACEHOLDER_TITLES: Partial<Record<ProfileStackScreen, string>> = {
  PaymentMethods: 'Payment methods',
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
  const [flightSearchSummary, setFlightSearchSummary] = useState<FlightSearchSummary | null>(null);
  // The leg(s) already reviewed and chosen when Continue was tapped on the
  // fare-review modal's last step — Traveller details reads these, not the
  // full flightOffers list.
  const [travelerLegs, setTravelerLegs] = useState<FlightOffer[]>([]);
  const [travelerLegLabels, setTravelerLegLabels] = useState<string[] | undefined>(undefined);
  const [travelerPassengerCounts, setTravelerPassengerCounts] = useState<PassengerCounts>({
    adult: 1,
    child: 0,
    infant: 0,
  });

  const renderHomeStack = () => {
    switch (homeScreen) {
      case 'FlightSearch':
        return (
          <FlightSearchFormScreen
            onBack={() => setHomeScreen('Buttons')}
            onResults={(offers, summary) => {
              setFlightOffers(offers);
              setFlightSearchSummary(summary);
              setHomeScreen('FlightResults');
            }}
          />
        );
      case 'FlightResults':
        return (
          <FlightResultsScreen
            offers={flightOffers}
            summary={flightSearchSummary}
            onBack={() => setHomeScreen('FlightSearch')}
            onContinueToTravelerDetails={(legs, legLabels, passengerCounts) => {
              setTravelerLegs(legs);
              setTravelerLegLabels(legLabels);
              setTravelerPassengerCounts(passengerCounts);
              setHomeScreen('TravelerDetails');
            }}
          />
        );
      case 'TravelerDetails':
        return (
          <TravelerDetailsScreen
            legs={travelerLegs}
            legLabels={travelerLegLabels}
            passengerCounts={travelerPassengerCounts}
            onBack={() => setHomeScreen('FlightResults')}
            onAddTraveler={() => {
              setEditingTravellerId(null);
              setHomeScreen('AddTraveler');
            }}
            onEditTraveler={(id) => {
              setEditingTravellerId(id);
              setHomeScreen('AddTraveler');
            }}
          />
        );
      case 'AddTraveler':
        return (
          <CoTravellerFormScreen
            travellerId={editingTravellerId}
            onDone={() => setHomeScreen('TravelerDetails')}
          />
        );
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
      case 'CustomizationPreferences':
        return <PreferencesScreen title="Customization preferences" onBack={() => setProfileScreen('Hub')} />;
      case 'PrivacyDataManagement':
        return <PreferencesScreen title="Privacy and data management" onBack={() => setProfileScreen('Hub')} />;
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
        return (
          <MyTripsScreen
            onExploreTrips={() => {
              setHomeScreen('FlightSearch');
              setActiveTab('Home');
            }}
          />
        );
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
                <SvgXml
                  xml={TAB_ICON_SVG[tab.key].replace(/COLOR/g, isActive ? '#7C1AEE' : '#3E4B64')}
                  width={20}
                  height={20}
                />
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
  // Figma tab bar: 1pt #CCD3E0 rule, 20pt glyphs 10pt below it, 13/16
  // Medium labels 2pt under the glyph.
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#CCD3E0',
    paddingTop: 9,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2.2 },
  tabLabel: { fontSize: 13, lineHeight: 16, fontWeight: '500', color: '#3E4B64' },
  tabLabelActive: { color: '#6A16CB' },
});
