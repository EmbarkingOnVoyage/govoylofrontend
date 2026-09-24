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
//
// EXPO_PUBLIC_ variables are replaced with their literal value as plain text
// at bundle time — by the time this code runs, `process.env.EXPO_PUBLIC_X`
// has already become a hardcoded string (or is simply absent if unset). A
// `typeof process !== 'undefined'` guard around it is misleading: that check
// runs for real at runtime against whatever `process` global (if any) the JS
// engine provides, unrelated to whether the substitution happened, and can
// discard an already-inlined value. Reference the variables directly instead.
const LAN_HOST = process.env.EXPO_PUBLIC_API_HOST;

// A standalone build handed to someone outside the dev network (an EAS-built
// APK, a TestFlight build) can't reach 10.0.2.2/localhost at all — it needs a
// real, publicly reachable server URL baked in at build time instead. Set
// EXPO_PUBLIC_API_BASE_URL (a full URL, e.g. the UAT App Service) per EAS
// build profile in eas.json for this case; it takes priority over everything
// else here.
const REMOTE_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const AUTH_BASE_URL = REMOTE_BASE_URL
  ? REMOTE_BASE_URL
  : LAN_HOST
    ? `http://${LAN_HOST}:5080`
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:5080'
      : 'https://localhost:5037';
