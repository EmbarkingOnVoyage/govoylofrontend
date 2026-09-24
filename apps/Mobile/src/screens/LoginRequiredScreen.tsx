import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LockKeyhole } from 'lucide-react-native';

interface LoginRequiredScreenProps {
  title: string;
  onSignIn: () => void;
}

// Shown in place of a tab's real content when a guest (no session) taps a
// tab that requires an authenticated account.
export const LoginRequiredScreen: React.FC<LoginRequiredScreenProps> = ({ title, onSignIn }) => (
  <View style={styles.screen}>
    <View style={styles.iconBadge}>
      <LockKeyhole size={28} color="#7C1AEE" strokeWidth={2} />
    </View>
    <Text style={styles.heading}>Sign in to continue</Text>
    <Text style={styles.subtext}>Create an account or sign in to access {title}.</Text>
    <TouchableOpacity style={styles.signInButton} onPress={onSignIn} activeOpacity={0.8}>
      <Text style={styles.signInButtonText}>Sign in</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#182339',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#4C5973',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    height: 44,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
