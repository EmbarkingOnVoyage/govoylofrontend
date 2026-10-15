import { Alert } from 'react-native';

// "Coming soon" for features that aren't built yet.
export function showComingSoon(feature: string): void {
  Alert.alert('Coming soon', `${feature} will be available shortly.`);
}
