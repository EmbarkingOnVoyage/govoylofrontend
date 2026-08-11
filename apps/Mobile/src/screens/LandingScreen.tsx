import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import the cross-platform gradient primitive
import { CoreImages } from '@workspace/ui'; 
import { styles } from './LandingScreen.styles'; 
import { NavigationRule } from '@workspace/core';

interface ILandingScreenProps {
  onNavigate: (rule: NavigationRule) => void;
}

export const LandingScreen: React.FC<ILandingScreenProps> = ({ onNavigate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  async function Continue() {
    setIsProcessing(true);
    try {
      // Developers can write any complex parallel data-gathering code here cleanly
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate async network call
      
      // RUNTIME NAVIGATION EXECUTION:
      // System automatically evaluates if ON_SEARCH_SUBMIT is allowed from here!
      onNavigate('ON_CONTINUE'); 
      
    } catch (error) {
      console.error("Process failed", error);
    } finally {
      setIsProcessing(false);
    }
  }
  async function onSignInPress() {
    setIsProcessing(true);
    try {
      // Developers can write any complex parallel data-gathering code here cleanly
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate async network call
      
      // RUNTIME NAVIGATION EXECUTION:
      // System automatically evaluates if ON_CONTINUE is allowed from here!
      onNavigate('ON_CONTINUE'); 
      
    } catch (error) {
      console.error("Process failed", error);
    } finally {
      setIsProcessing(false);
    }
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
                <Text style={styles.checkmarkIcon}>✓</Text>
                <Text style={styles.perkText}>3 perfect options. No more endless scrolling</Text>
              </View>
              <View style={styles.perkRow}>
                <Text style={styles.checkmarkIcon}>✓</Text>
                <Text style={styles.perkText}>Zero platform markups or sneaky fees</Text>
              </View>
              <View style={styles.perkRow}>
                <Text style={styles.checkmarkIcon}>✓</Text>
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

              <TouchableOpacity onPress={onSignInPress} style={styles.inlineLink}>
                <Text style={styles.footerLinkText}>
                  Already with us ? <Text style={styles.highlightText}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};
