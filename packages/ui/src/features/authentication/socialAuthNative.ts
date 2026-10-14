import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import { AccessToken, LoginManager, Settings } from "react-native-fbsdk-next";
import { FACEBOOK_APP_ID, GOOGLE_WEB_CLIENT_ID, SocialSignInCancelled } from "./socialAuth";

// App halves of social sign-in (Android / iOS): get the provider's token,
// nothing more. The web app stubs both SDKs out (apps/Web/vite.config.ts).

let googleConfigured = false;

// Google's native account picker. The ID token is issued for the *web* client
// id — that's the audience the backend checks; the Android client (package
// name + signing-key SHA-1) only has to exist in the same Google Cloud project.
export async function googleIdTokenNative(): Promise<string> {
  if (!googleConfigured) {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
    googleConfigured = true;
  }
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) throw new SocialSignInCancelled();
    const idToken = response.data.idToken;
    // Forget the choice so the next tap shows the account picker again.
    await GoogleSignin.signOut().catch(() => {});
    if (!idToken) throw new Error("Google didn't return a sign-in token. Please try again.");
    return idToken;
  } catch (err) {
    if (err instanceof SocialSignInCancelled) throw err;
    if (isErrorWithCode(err)) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS) throw new SocialSignInCancelled();
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play services are needed to sign in with Google.");
      }
    }
    throw new Error("We couldn't sign you in with Google. Please try again.");
  }
}

let facebookInitialised = false;

// Facebook's login (its app when installed, else a browser sheet). The SDK's
// automatic start-up is off in the Android manifest so a build without an app
// id never crashes; it's started here on first use instead.
export async function facebookAccessTokenNative(): Promise<string> {
  if (!facebookInitialised) {
    Settings.setAppID(FACEBOOK_APP_ID);
    Settings.initializeSDK();
    facebookInitialised = true;
  }
  // A previous Facebook session would skip the dialog; always ask.
  LoginManager.logOut();
  const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);
  if (result.isCancelled) throw new SocialSignInCancelled();
  const current = await AccessToken.getCurrentAccessToken();
  if (!current?.accessToken) throw new Error("Facebook didn't return a sign-in token. Please try again.");
  return current.accessToken;
}
