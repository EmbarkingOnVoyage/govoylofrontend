import { Platform } from 'react-native';

// The backend runs on the developer's machine and is only reachable as
// "localhost" from a browser or the iOS simulator (both share the host's
// network stack). The Android emulator's "localhost" refers to the emulator
// itself, not the host — 10.0.2.2 is the documented alias Google provides
// for reaching the host machine from inside it. A physical device needs the
// host's real LAN IP instead of either (set EXPO_PUBLIC_API_HOST to that IP,
// e.g. "192.168.1.23", when running on a physical device).
const LAN_HOST = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_HOST : undefined;

export const AUTH_BASE_URL = LAN_HOST
  ? `https://${LAN_HOST}:5037`
  : Platform.OS === 'android'
    ? 'https://10.0.2.2:5037'
    : 'https://localhost:5037';
