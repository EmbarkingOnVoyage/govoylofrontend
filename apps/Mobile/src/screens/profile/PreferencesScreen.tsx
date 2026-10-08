import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { SelectField } from '../../components/SelectField';
import { styles } from './PersonalDetailsScreen.styles';

// Currency and language choices from the Figma "Customization preferences" and
// "Privacy and data management" frames. Only INR / English are offered for now,
// so the selection is kept on screen and not saved to the profile.
const CURRENCY_OPTIONS = ['RS Indian Rupee'];
const LANGUAGE_OPTIONS = ['🇮🇳  English (Indian)'];

interface PreferencesScreenProps {
  title: string;
  onBack: () => void;
}

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ title, onBack }) => {
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#7C1AEE', '#7C1AEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={20} color="#ECEEF3" strokeWidth={1.2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.preferencesContent}>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Currency</Text>
          <SelectField value={currency} options={CURRENCY_OPTIONS} onSelect={setCurrency} title="Select currency" />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Language</Text>
          <SelectField value={language} options={LANGUAGE_OPTIONS} onSelect={setLanguage} title="Select language" />
        </View>
      </View>
    </View>
  );
};
