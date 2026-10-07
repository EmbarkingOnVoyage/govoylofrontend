import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, MoveRight, Sparkles } from 'lucide-react-native';
import { styles } from './LandingScreen.styles';
import { NavigationRule } from '@workspace/core';
// global.d.ts types image imports as string; Metro hands RN an asset id.
import backgroundSrc from '../assets/images/onboarding-bg.jpg';

const background = backgroundSrc as unknown as number;

// The Figma frame is 375pt wide; the photo is placed relative to that width
// (rendered 375 x 1084 so taller phones still show sky, never empty space).
const FRAME_WIDTH = 375;
const BACKGROUND_HEIGHT = 1084;

interface ILandingScreenProps {
  onNavigate: (rule: NavigationRule) => void;
  onLoginPress: () => void;
  onGetStartedPress: () => void;
  onGuestPress: () => void;
}

const PERKS = ['3 perfect options. No more endless scrolling', 'Zero platform markups or sneaky fees', 'Instant trip rescue'];

export const LandingScreen: React.FC<ILandingScreenProps> = ({ onNavigate, onGuestPress }) => {
  const { width } = useWindowDimensions();
  const scale = width / FRAME_WIDTH;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Image
        source={background}
        style={[styles.background, { width, height: BACKGROUND_HEIGHT * scale }]}
        resizeMode="stretch"
      />
      {/* Figma overlay: linear from 20% #666666 at (78, -399.5) to black at
          (187.5, 794) in the 375 x 770 frame. */}
      <LinearGradient
        colors={['rgba(102,102,102,0.2)', '#000000']}
        start={{ x: 78 / FRAME_WIDTH, y: -399.5 / 770 }}
        end={{ x: 187.5 / FRAME_WIDTH, y: 794 / 770 }}
        style={styles.overlay}
      />

      <View style={styles.container}>
        <View style={styles.badge}>
          <Sparkles size={13} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.badgeText}>AI TRAVEL COMPANION</Text>
        </View>
        <Text style={styles.heroText}>Travel with someone who always has your back</Text>
        <Text style={styles.subHeroText}>
          From the first search to your safe return, we navigate the noise so you can just enjoy the trip
        </Text>

        <View style={styles.perksContainer}>
          {PERKS.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <View style={styles.checkmarkBadge}>
                <Check size={12} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => onNavigate('ON_SIGN_IN_PRESS')} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onGuestPress} style={styles.guestLink} activeOpacity={0.7}>
          <Text style={styles.guestLinkText}>Continue as guest</Text>
          <MoveRight size={20} color="#7C1AEE" strokeWidth={1.2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
