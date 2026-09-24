# goVoylo Frontend — Architecture & Mobile Readiness

This document explains how the codebase is actually wired together today, and answers the practical question: **is this already a mobile app, or does it need to be "converted"?**

Short answer: **it's already a mobile app.** `apps/Mobile` is a real Expo/React Native project that runs on iOS and Android today. The repo is a cross-platform monorepo where web and mobile share ~90% of their code (UI, business logic, API layer, navigation) through workspace packages. What's missing isn't a mobile port — it's finishing/wiring work and store-release plumbing. Details and a concrete punch list are below.

---

## 1. High-level shape

This is an **npm-workspaces monorepo** (root `package.json` workspaces: `apps/*`, `packages/*`) orchestrated by **Turborepo** (`turbo.json`, scripts `dev` / `build` / `test`).

```
govoylofrontend/
├── apps/
│   ├── Mobile/     ← Expo (React Native) app — THE mobile app
│   └── Web/        ← Vite + React app — uses react-native-web
├── packages/
│   ├── ui/         ← shared components, screens/features, theme, styles
│   ├── core/       ← ErrorBoundary, logger, navigation state machine
│   ├── api/        ← fetch client, zod schemas, react-query hooks
│   ├── state/       ← (stub) zustand-style store, not wired up
│   └── auth/        ← (empty placeholder, no real code yet)
├── index.ts        ← Expo entry point at the ROOT (registers apps/Mobile/App.tsx)
├── app.json        ← Expo config used when running Expo from the repo root
├── db.json         ← static mock data (locations/flights)
└── tailwind.config.js / vite.config.ts (Web only)
```

There are effectively **two ways to boot the mobile app**:
- From the **repo root**: `index.ts` → `registerRootComponent(App)` where `App` is imported from `apps/Mobile/App.tsx`, using the root `app.json`. This is what `expo start` at the root would use.
- From **`apps/Mobile/`** directly: it has its own `package.json` (`expo start`, `expo start --android`, `expo start --ios`), its own `index.js`, and its own `app.json`.

Both point at the same `App.tsx`, so this isn't two apps — just two valid entry points into one Expo project (root-level and package-level). Worth being intentional about which one is canonical (see Gaps).

---

## 2. Tech stack

| Layer | Web (`apps/Web`) | Mobile (`apps/Mobile`) |
|---|---|---|
| Framework | React 18 + Vite | React Native 0.76 (Expo SDK 52) |
| Rendering | `react-native-web` aliases `react-native` → DOM | Native (iOS/Android) via Expo |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + shared RN `StyleSheet` tokens | RN `StyleSheet` objects from `@workspace/ui` |
| Navigation | Hand-rolled state machine (`useFlowNavigation`) | Same state machine, not yet fully wired (see Gaps) |
| Data fetching | `@tanstack/react-query` + custom fetch client | Same (shared package) |
| Validation | `zod` | `zod` |
| Testing | Vitest + Testing Library | none configured at the app level (packages have Vitest) |

Both apps consume the **same** `@workspace/ui`, `@workspace/core`, `@workspace/api` packages — there is no fork of business logic between platforms.

> Per `AGENTS.md`: this project pins **Expo SDK 52**, and the note "Expo HAS CHANGED" is a reminder to check the SDK‑52‑specific docs (https://docs.expo.dev/versions/v52.0.0/... — the AGENTS.md link says v57.0.0, but `package.json` pins `expo: ~52.0.0`; double‑check which SDK you're actually targeting before relying on newer‑SDK‑only APIs — see Gaps §6.1).

---

## 3. The cross-platform mechanism (the important part)

This monorepo achieves "write once, run on web + mobile" using two standard React Native techniques, both already in place:

### 3.1 Platform-specific file extensions
Files are duplicated with a `.web.tsx` suffix when platform behavior truly diverges (auth screens use browser-style `<div>`/layout wrappers on web vs `<View>`/`TouchableOpacity` on native):

```
packages/ui/src/features/authentication/
├── LoginFeature.tsx       ← native (React Native primitives)
└── LoginFeature.web.tsx   ← web (DOM layout via components/layout/Layout)
```

Both are exported explicitly under different names from `packages/ui/src/index.ts`:
```ts
export { LoginFeature as LoginMobileFeature } from './features/authentication/LoginFeature';
export { LoginFeature as LoginWebFeature } from './features/authentication/LoginFeature.web';
```
This is a **manual** version of what Metro/RN's bundler resolver would normally do automatically via the `.web.tsx` convention — on the web side Vite doesn't understand that convention natively, so the split is done by explicit dual-export instead of relying on automatic resolution. That's a reasonable, if slightly manual, choice.

### 3.2 `react-native` → `react-native-web` aliasing
`apps/Web/vite.config.ts` aliases the `react-native` import to `react-native-web`:
```ts
resolve: { alias: { 'react-native': 'react-native-web', ... } }
```
This means any shared component written with `View`, `Text`, `TouchableOpacity`, `StyleSheet`, etc. (the RN primitives) renders correctly in the browser too, without a rewrite. This is exactly the same trick Expo's own web target uses under the hood.

### 3.3 Shared navigation as a state machine, not a router
`packages/core/src/navigation/navigationConfig.ts` defines a flow graph (`AppScreen` × `NavigationRule` → next `AppScreen`), and `useFlowNavigation.ts` is a tiny reducer-like hook (a history stack) that walks that graph. It throws hard if you try an unregistered transition — a deliberate "fail loud" contract.

Both apps *can* use this identically:
- `apps/Web/src/main.tsx` does use it (`AppWorkflowRouter` + a `SCREENS` map keyed by `AppScreen`).
- `apps/Mobile/App.tsx` does **not** use it yet — it just renders `LandingScreen` directly and stubs navigation with `Alert.alert(...)` (see Gaps §6.2).

This is intentionally not React Navigation / Expo Router — it's a custom, serializable state machine that works identically on both platforms since it has zero platform-specific code. That's a legitimate lightweight approach for a small number of screens, but it doesn't give you native deep linking, native back-gesture integration, or stack transition animations "for free" — see §7.

---

## 4. Shared packages breakdown

| Package | Real workspace package? | Contents | Consumed by |
|---|---|---|---|
| `@workspace/ui` | ✅ (`package.json` present) | Design tokens, base components (Button/Input/Card/Text/AutoCompleteDropdown), feature screens (auth, bookings, profile), platform-specific styles | Web + Mobile |
| `@workspace/core` | ✅ | `ErrorBoundary`, `logger`, navigation state machine | Web + Mobile |
| `@workspace/api` | ✅ | `createRequest` fetch wrapper with Zod-validated responses, `ApiNetworkError`/`ApiValidationError`, react-query hooks (`useAuth`, `useBookings`, `useLocations`) | Web + Mobile |
| `state` | ❌ no `package.json` | `useSearchStore.ts` (a single store file) | **Nothing imports it today** — dead code |
| `auth` | ❌ no `package.json`, essentially empty | one placeholder `.txt` file | **Not a real package yet** |
| `@govoylo/mobile-sdk` | ✅ | A **publishable** package (see [packages/sdk/README.md](packages/sdk/README.md)) that bundles a curated subset of `@workspace/ui`/`@workspace/core`/`@workspace/api` — components, theme, navigation hook, API client/hooks — into a self-contained `dist/` (via `tsup`), so an external app can `npm install` it without needing the private `@workspace/*` packages. Ships `"private": true` until someone deliberately publishes it. | External consumers only (not used by `apps/Web` or `apps/Mobile`) |

`@workspace/api`'s `createRequest` hits `https://govoylo.com` by default (hardcoded `DEFAULT_BASE_URL`) — there's no per-environment override (dev/staging/prod) wired through Expo config or Vite env vars yet.

`db.json` at the repo root looks like a `json-server`-style local mock dataset (flights/locations) — there's no visible script wiring it up (no `json-server` dependency in `package.json`), so it currently reads as an unused fixture rather than a working local API.

---

## 5. Is the mobile app "already there"? — Yes, with caveats

**What already works today, unmodified:**
- `apps/Mobile` is a genuine Expo-managed React Native app (no ejection, no custom native code needed for the two native modules it uses: `@react-native-community/datetimepicker` and `expo-linear-gradient`, both Expo-Go-compatible).
- `expo start` / `expo start --android` / `expo start --ios` (from `apps/Mobile`) will run it on a simulator, a real device via Expo Go, or a dev client.
- It renders a real, styled screen (`LandingScreen`) using the same design tokens and component library the web app uses.
- Android adaptive icons, iOS tablet support, and app metadata are already configured in `app.json`.

**What's not finished (this is "the rest of the app," not "porting to mobile"):**
1. Only the landing screen is wired into `apps/Mobile/App.tsx`. Sign-in, OTP, search, and booking-dashboard screens all exist in `@workspace/ui` (used by the web app's `AppWorkflowRouter`) but aren't yet connected to real navigation on mobile — currently `onNavigate`/`onLoginPress`/`onGetStartedPress` just fire `Alert.alert(...)` stubs.
2. No production navigation library. The custom `useFlowNavigation` state machine works for prototyping but doesn't give native stack transitions, gesture-based back navigation, deep links, or tab bars — all things you'll want once there's more than a handful of linear screens.
3. No `eas.json` / EAS Build configuration — needed to produce signed store binaries (see §7).
4. No environment-based API base URL (dev vs prod) for the mobile client.

None of this is "converting a web app to mobile" work — the mobile app already exists structurally. It's finishing the screen flow and adding release tooling.

---

## 6. Gaps / issues found while reading the code

These are worth fixing regardless of the mobile-readiness question:

1. **`apps/Web/package.json` depends on `"mobile": "*"`, but the actual workspace package is named `mobile-app`** (see `apps/Mobile/package.json`). npm workspaces auto-symlinks packages by their real name, so `apps/Web/src/main.tsx`'s import from `"mobile-app/src/screens/LandingScreen"` happens to work — but the declared `"mobile": "*"` dependency resolves to an unrelated package published on the public npm registry called `mobile` (confirmed present at `node_modules/mobile`, a 2-file no-op package). This is a latent footgun: an `npm install` could silently start resolving to a real external package with that name. **Fix:** remove `"mobile": "*"` and either declare `"mobile-app": "*"` explicitly or keep relying on the implicit workspace symlink (fine either way, but the stray dependency should go).
2. **`packages/state` and `packages/auth` aren't real workspace packages** (no `package.json`), so `useSearchStore` is currently unreachable/dead code and `auth` is an empty shell. If auth/state logic is meant to be shared like `ui`/`core`/`api`, they need a `package.json` (`name`, `main`, `types`) to be resolvable as `@workspace/state` / `@workspace/auth`.
3. **`apps/Mobile/App.tsx`** has ~50 lines of commented-out prior implementation left in place — worth deleting once the new `LandingScreen` flow is confirmed as the direction.
4. **Two Expo entry points** (root `index.ts`+`app.json` vs `apps/Mobile/index.js`+`app.json`) point at the same `App.tsx`. Decide which is canonical for `expo start` / EAS builds to avoid config drift between the two `app.json` files (they're already slightly different — root's `plugins` includes `@react-native-community/datetimepicker`, Mobile's includes `expo-asset`).
5. **Stray placeholder files**: `apps/Mobile/MobileTest.txt` and `packages/auth/Test1.txt` are empty scratch files — harmless, but likely safe to delete.
6. **SDK version mismatch in docs**: `AGENTS.md` points at Expo v57 docs, but `package.json` pins `expo: ~52.0.0`. Worth reconciling so nobody writes SDK-57-only code against a 52 project (or bumps the project to 57 if that's the real target).

---

## 7. Path to a store-ready mobile app

Given the app already runs in Expo, "shipping to the App Store / Play Store" is a packaging/config exercise, not a rewrite:

1. **Finish the screen flow on mobile** — mirror `apps/Web/src/main.tsx`'s `AppWorkflowRouter`/`SCREENS` pattern inside `apps/Mobile/App.tsx`, using the `*MobileFeature` exports (`LoginMobileFeature`, `OtpMobileFeature`, `ProfileStep1`, `BookingDashboard`) already exported from `@workspace/ui`, driven by the existing `useFlowNavigation` hook from `@workspace/core`.
2. **(Recommended before it grows further) Introduce a real navigator** — `expo-router` (file-based, integrates cleanly with Expo) or `@react-navigation/native` (stack/tab navigators) — to get native transitions, hardware back-button handling, and deep linking. The current state-machine hook can stay as the *business rule* layer (which screen legally follows which) while the navigator handles the *rendering/transition* layer.
3. **Environment config** — move `DEFAULT_BASE_URL` in `packages/api/src/client.ts` to read from `expo-constants`/`app.config.ts` `extra` fields (mobile) and Vite `import.meta.env` (web), so dev/staging/prod point at different APIs.
4. **Add EAS tooling**: `eas.json` with `development`/`preview`/`production` build profiles, then:
   - `eas build --platform ios` / `--platform android` for signed binaries.
   - `eas submit` to push to App Store Connect / Google Play Console.
   - Requires an Apple Developer account (iOS) and a Google Play Console account (Android), plus bundle identifiers/package names added to `app.json` (`ios.bundleIdentifier`, `android.package`) — not present yet.
5. **App Store assets** — splash screen config, privacy policy URL, permission usage strings (none of the current native modules need runtime permissions, so this is light for now).
6. **Testing on device** — install Expo Go (SDK 52 compatible build) or build a custom dev client (`eas build --profile development`) if/when a native module outside the Expo Go SDK is added.

None of this requires touching the web app or the shared packages beyond the environment-config change in `@workspace/api`.

---

## 8. Summary

- This **is** a single cross-platform codebase: one set of shared components/screens/logic (`packages/ui`, `packages/core`, `packages/api`), consumed by both a Vite web app and an Expo mobile app, using the standard `react-native-web` + `.web.tsx` split pattern.
- The mobile app is not a future task — it **runs today** via Expo. What remains is (a) wiring the already-built auth/booking/profile screens into mobile navigation the way the web app already does, (b) a couple of workspace/package hygiene fixes (§6), and (c) EAS build/submit setup for actual store releases (§7).
