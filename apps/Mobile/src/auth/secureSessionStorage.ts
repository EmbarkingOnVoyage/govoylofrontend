import * as SecureStore from 'expo-secure-store';
import type { SessionStorageAdapter } from '@workspace/ui';

// The signed-in session in the OS keystore (Android Keystore / iOS Keychain),
// so the app opens signed in next time. The two tokens are separate entries:
// SecureStore values should stay under ~2 KB each, and a JWT alone can get close.
const ACCESS_TOKEN_KEY = 'govoylo.accessToken';
const REFRESH_TOKEN_KEY = 'govoylo.refreshToken';

export const secureSessionStorage: SessionStorageAdapter = {
  async load() {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },
  async save(session) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);
  },
  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
