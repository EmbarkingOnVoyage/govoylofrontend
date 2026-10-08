import React from 'react';
import { View, Text, Image, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import {
  UserRound,
  Users,
  UserCog,
  CreditCard,
  UserLock,
  Ticket,
  Heart,
  MessageSquare,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { useCustomerProfileMobile, AUTH_BASE_URL } from '@workspace/ui';
import { styles } from './ProfileScreen.styles';
// global.d.ts types *.png as string; Metro hands RN an asset id (number).
import bannerBackgroundSrc from '../../assets/images/profile-banner-bg.png';

// Gradient, glow and plane photo rendered from the Figma "Profile" frame.
const bannerBackground = bannerBackgroundSrc as unknown as number;

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
}

const MENU_ITEMS = [
  { key: 'PersonalDetails', label: 'Personal details', Icon: UserRound },
  { key: 'CoTraveller', label: 'Co-Traveller', Icon: Users },
  { key: 'CustomizationPreferences', label: 'Customization preferences', Icon: UserCog },
  { key: 'PaymentMethods', label: 'Payment methods', Icon: CreditCard },
  { key: 'PrivacyDataManagement', label: 'Privacy & data management', Icon: UserLock },
  { key: 'Bookings', label: 'Bookings', Icon: Ticket },
  { key: 'Saved', label: 'Saved', Icon: Heart },
];

function getInitials(firstName?: string, lastName?: string): string {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`;
  return initials || '?';
}

const VerifiedMark = () => (
  <View style={styles.verifiedMark}>
    <Check size={10} color="#FFFFFF" strokeWidth={2} />
  </View>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onSignOut }) => {
  const { data: profile } = useCustomerProfileMobile();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={bannerBackground}
          resizeMode="stretch"
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          <View style={styles.avatarWrapper}>
            {profile?.profileImageUrl ? (
              <Image
                source={{ uri: `${AUTH_BASE_URL}${profile.profileImageUrl}` }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {getInitials(profile?.firstName, profile?.lastName)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.bannerMeta}>
            <View style={styles.bannerRow}>
              <Text style={styles.bannerEmail} numberOfLines={1}>
                {profile?.email || '—'}
              </Text>
              {!!profile?.email && <VerifiedMark />}
            </View>
            <View style={styles.bannerRow}>
              <Text style={styles.bannerPhone}>{profile?.phone || '—'}</Text>
              {!!profile?.phone && <VerifiedMark />}
            </View>
          </View>
        </ImageBackground>

        <Text style={styles.sectionTitle}>My Account</Text>
        {MENU_ITEMS.map((item) => (
          <React.Fragment key={item.key}>
            <TouchableOpacity style={styles.listItem} onPress={() => onNavigate(item.key)}>
              <item.Icon size={20} color="#182339" strokeWidth={1.25} />
              <Text style={styles.listItemLabel}>{item.label}</Text>
              <ChevronRight size={20} color="#3E4B64" strokeWidth={2} />
            </TouchableOpacity>
          </React.Fragment>
        ))}

        <Text style={styles.domainText}>govoylo.com</Text>
        <TouchableOpacity style={styles.listItem} onPress={() => onNavigate('ShareFeedback')}>
          <MessageSquare size={20} color="#182339" strokeWidth={1.25} />
          <Text style={styles.listItemLabel}>Share your feedback</Text>
          <ChevronRight size={20} color="#3E4B64" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={onSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
