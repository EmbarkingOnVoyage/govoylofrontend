// The web build never signs in through the native Google / Facebook SDKs (it
// uses popups — packages/ui/src/features/authentication/socialAuth.web.ts), but
// the shared package also exports the mobile login screen, which imports them.
// vite.config.ts points both packages here so no native code is bundled.
const unavailable = () => {
  throw new Error("Native social sign-in isn't available on the web.");
};

export const GoogleSignin = {
  configure: () => {},
  hasPlayServices: unavailable,
  signIn: unavailable,
  signOut: async () => {},
};
export const statusCodes = { SIGN_IN_CANCELLED: "", IN_PROGRESS: "", PLAY_SERVICES_NOT_AVAILABLE: "" };
export const isErrorWithCode = () => false;
export const isSuccessResponse = () => false;

export const Settings = { setAppID: () => {}, initializeSDK: () => {} };
export const LoginManager = { logOut: () => {}, logInWithPermissions: unavailable };
export const AccessToken = { getCurrentAccessToken: async () => null };
