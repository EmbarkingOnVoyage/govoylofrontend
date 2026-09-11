import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

interface PlaceholderScreenProps {
  title: string;
  onBack: () => void;
}

// Matches the same "coming soon" convention already used by the web app's
// ProfileStep1 for any tab that doesn't have a built-out screen yet.
export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, onBack }) => (
  <View style={styles.screen}>
    <LinearGradient colors={['#6A16CB', '#350B65']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
    <View style={styles.content}>
      <Text style={styles.text}>Component for "{title}" view coming soon!</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 96,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { fontSize: 15, color: '#4C5973', textAlign: 'center' },
});
