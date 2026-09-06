import { Platform } from 'react-native';

// The backend runs on the developer's machine and is only reachable as
// "localhost" from a browser or the iOS simulator (both share the host's
// network stack). The Android emulator's "localhost" refers to the emulator
// itself, not the host — 10.0.2.2 is the documented alias Google provides
// for reaching the host machine from inside it. A physical device needs the
// host's real LAN IP instead of either (set EXPO_PUBLIC_API_HOST to that IP,
// e.g. "192.168.1.23", when running on a physical device).
//
// The HTTPS endpoint uses a self-signed local dev certificate that a browser
// or the iOS simulator already trusts, but the Android network stack (and a
// physical device, of either OS) has no way to trust — every request would
// fail with a generic "Network request failed". Program.cs exposes a second,
// plain-HTTP listener on port 5080 (exempted from the app's HTTPS-redirect
// middleware) for exactly these two cases.
const LAN_HOST = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_HOST : undefined;

export const AUTH_BASE_URL = LAN_HOST
  ? `http://${LAN_HOST}:5080`
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:5080'
    : 'https://localhost:5037';
