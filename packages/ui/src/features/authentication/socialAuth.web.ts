import { FACEBOOK_APP_ID, GOOGLE_WEB_CLIENT_ID, SocialSignInCancelled } from "./socialAuth";

// Browser halves of social sign-in: get the provider's token, nothing more.

function randomString(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Google: OpenID Connect in a popup (response_type=id_token). The popup lands on
// /auth/callback.html, which posts the token back here. The custom button in
// the design rules out Google's own rendered button.
export function googleIdTokenWeb(): Promise<string> {
  const state = randomString();
  const params = new URLSearchParams({
    client_id: GOOGLE_WEB_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/callback.html`,
    response_type: "id_token",
    scope: "openid email profile",
    nonce: randomString(),
    state,
    prompt: "select_account",
  });
  const width = 480;
  const height = 620;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    "govoylo-google",
    `width=${width},height=${height},left=${left},top=${top}`
  );
  if (!popup) {
    return Promise.reject(new Error("Please allow pop-ups for GoVoylo to sign in with Google."));
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(closedTimer);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "govoylo-oauth") return;
      finish();
      if (event.data.state !== state) reject(new Error("Sign-in didn't complete. Please try again."));
      else if (event.data.error === "access_denied") reject(new SocialSignInCancelled());
      else if (!event.data.idToken) reject(new Error("Sign-in didn't complete. Please try again."));
      else resolve(event.data.idToken);
    };
    // Closed without signing in.
    const closedTimer = window.setInterval(() => {
      if (popup.closed) {
        finish();
        reject(new SocialSignInCancelled());
      }
    }, 500);
    window.addEventListener("message", onMessage);
  });
}

// Facebook: the JS SDK's login dialog, which returns a user access token.
interface FacebookSdk {
  init(options: { appId: string; version: string; xfbml?: boolean; cookie?: boolean }): void;
  login(
    callback: (response: { status: string; authResponse?: { accessToken: string } | null }) => void,
    options: { scope: string }
  ): void;
}

let facebookSdk: Promise<FacebookSdk> | null = null;
let facebookReady: FacebookSdk | null = null;

// Called when the login screen opens: FB.login has to run straight from the
// click (no await before it) or the browser blocks Facebook's popup.
export function loadFacebookSdk(): Promise<FacebookSdk> {
  if (!facebookSdk) {
    facebookSdk = new Promise<FacebookSdk>((resolve, reject) => {
      const w = window as unknown as { FB?: FacebookSdk };
      if (w.FB) {
        facebookReady = w.FB;
        resolve(w.FB);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (!w.FB) {
          reject(new Error("Couldn't load Facebook sign-in."));
          return;
        }
        w.FB.init({ appId: FACEBOOK_APP_ID, version: "v21.0", xfbml: false, cookie: false });
        facebookReady = w.FB;
        resolve(w.FB);
      };
      script.onerror = () => {
        facebookSdk = null;
        reject(new Error("Couldn't load Facebook sign-in. Check your connection and try again."));
      };
      document.head.appendChild(script);
    });
  }
  return facebookSdk;
}

export function facebookAccessTokenWeb(): Promise<string> {
  const login = (FB: FacebookSdk) =>
    new Promise<string>((resolve, reject) => {
      FB.login(
        (response) => {
          if (response.status === "connected" && response.authResponse?.accessToken) resolve(response.authResponse.accessToken);
          else reject(new SocialSignInCancelled());
        },
        { scope: "public_profile,email" }
      );
    });
  // Already loaded: log in synchronously, inside the click.
  return facebookReady ? login(facebookReady) : loadFacebookSdk().then(login);
}
