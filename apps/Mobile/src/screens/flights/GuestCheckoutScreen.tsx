import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useStartGuestSessionMobile } from '@workspace/ui';
import { styles } from '../profile/PersonalDetailsScreen.styles';
import { useHardwareBack } from '../../navigation/useHardwareBack';

interface GuestCheckoutScreenProps {
  onBack: () => void;
  // The guest session is started: carry on to Traveller Details.
  onContinue: () => void;
  onSignIn: () => void;
}

// A guest's contact for the booking, asked once before Traveller Details. The
// e-ticket goes to this email, and signing in with it later shows the trip and
// its travellers in the account.
export const GuestCheckoutScreen: React.FC<GuestCheckoutScreenProps> = ({ onBack, onContinue, onSignIn }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const startGuestSession = useStartGuestSessionMobile();

  useHardwareBack(() => onBack());

  const handleContinue = async () => {
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    try {
      await startGuestSession.mutateAsync({ email: trimmedEmail, phone: trimmedPhone });
      onContinue();
    } catch (err: any) {
      setError(err?.message || 'Could not continue as a guest. Please try again.');
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#7C1AEE', '#7C1AEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={20} color="#ECEEF3" strokeWidth={1.2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Continue as guest</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionHeading, styles.firstSectionHeading]}>Contact details</Text>
        <Text style={styles.panNote}>
          Your e-ticket will be sent to this email. Sign in later with the same email to see this trip and your
          travellers in your account.
        </Text>

        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            placeholderTextColor="#697691"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Mobile number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            placeholderTextColor="#697691"
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        {!!error && <Text style={[styles.saveFeedback, styles.saveError]}>{error}</Text>}

        <TouchableOpacity
          style={[styles.saveButton, startGuestSession.isPending && styles.saveButtonDisabled]}
          onPress={handleContinue}
          disabled={startGuestSession.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{startGuestSession.isPending ? 'Please wait...' : 'Continue'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
          <Text style={[styles.panNote, { textAlign: 'center', color: '#7C1AEE', marginTop: 16 }]}>
            Have an account? Sign in instead
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
