import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
} from 'lucide-react-native';
import { useCustomerProfileMobile, AUTH_BASE_URL } from '@workspace/ui';
import { styles } from './ProfileScreen.styles';

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

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, onSignOut }) => {
  const { data: profile } = useCustomerProfileMobile();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#6A16CB', '#350B65']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
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
            </View>
            <Text style={styles.bannerPhone}>{profile?.phone || '—'}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>My Account</Text>
        {MENU_ITEMS.map((item, index) => (
          <React.Fragment key={item.key}>
            <TouchableOpacity style={styles.listItem} onPress={() => onNavigate(item.key)}>
              <item.Icon size={20} color="#182339" strokeWidth={2} />
              <Text style={styles.listItemLabel}>{item.label}</Text>
              <ChevronRight size={18} color="#7C8CAD" strokeWidth={2} />
            </TouchableOpacity>
            {index < MENU_ITEMS.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}

        <Text style={styles.domainText}>govoylo.com</Text>
        <TouchableOpacity style={styles.listItem} onPress={() => onNavigate('ShareFeedback')}>
          <MessageSquare size={20} color="#182339" strokeWidth={2} />
          <Text style={styles.listItemLabel}>Share your feedback</Text>
          <ChevronRight size={18} color="#7C8CAD" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={onSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
