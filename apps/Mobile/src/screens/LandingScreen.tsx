import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import the cross-platform gradient primitive
import { Check, ArrowRight } from 'lucide-react-native';
import { CoreImages } from '@workspace/ui';
import { styles } from './LandingScreen.styles';
import { NavigationRule } from '@workspace/core';

interface ILandingScreenProps {
  onNavigate: (rule: NavigationRule) => void;
  onLoginPress: () => void;
  onGetStartedPress: () => void;
  onGuestPress: () => void;
}

export const LandingScreen: React.FC<ILandingScreenProps> = ({ onNavigate, onGuestPress }) => {
  function Continue() {
    onNavigate('ON_SIGN_IN_PRESS');
  }
  return (
    <ImageBackground 
      source={CoreImages.onboardingBackground} 
      style={styles.screenBackground}
      resizeMode="cover"
    >
      {/* 
        Contract Enforcement: The LinearGradient layer handles the dark fade.
        It starts transparent at the top (0.0) and transitions to solid dark blue at the bottom (1.0).
      */}
      <LinearGradient
        colors={['transparent', 'rgba(15, 15, 26, 0.5)', '#0F0F1A', '#0F0F1A']}
        locations={[0.0, 0.35, 0.65, 1.0]}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeAreaRoot}>
          <StatusBar barStyle="light-content" />
          <View style={styles.container}>
            
            {/* Top Section: Badges and Core Headings */}
            <View style={styles.headerVisualBlock}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>✨ AI TRAVEL COMPANION</Text>
              </View>
              <Text style={styles.heroText}>
                Travel with someone who always has your back
              </Text>
              <Text style={styles.subHeroText}>
                From the first search to your safe return, we navigate the noise so you can just enjoy the trip.
              </Text>
            </View>

            {/* Middle Section: Clean Bullet Checklist */}
            <View style={styles.perksContainer}>
              <View style={styles.perkRow}>
                <View style={styles.checkmarkBadge}>
                  <Check size={13} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.perkText}>3 perfect options. No more endless scrolling</Text>
              </View>
              <View style={styles.perkRow}>
                <View style={styles.checkmarkBadge}>
                  <Check size={13} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.perkText}>Zero platform markups or sneaky fees</Text>
              </View>
              <View style={styles.perkRow}>
                <View style={styles.checkmarkBadge}>
                  <Check size={13} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.perkText}>Instant trip rescue</Text>
              </View>
            </View>

            {/* Bottom Section: Primary CTA Capsule and Auth Redirection Link */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={Continue}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onGuestPress} style={styles.guestLink} activeOpacity={0.7}>
                <Text style={styles.guestLinkText}>Continue as guest</Text>
                <ArrowRight size={15} color="#A78BFA" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};
