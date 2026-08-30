# @govoylo/mobile-sdk

A publishable SDK that exposes goVoylo's shared design system, navigation
state machine, and API client, so they can be embedded in a React Native /
Expo app outside this monorepo.

It re-exports a curated public surface from the internal `@workspace/ui`,
`@workspace/core`, and `@workspace/api` workspace packages (see
[architecture.md](../../architecture.md) for how those are structured).
Those workspace packages are `private` and only resolvable inside this repo
— `tsup` bundles their code directly into this package's `dist/` output at
build time, so an external consumer never needs to resolve `@workspace/*`
themselves.

## What's included

- **Design system**: `AppProvider`, `Button`, `Input`, `Card`, `Text`,
  `AutoCompleteDropdown`, `getThemeStyles`, `GlobalDesignTokens`
- **Core primitives**: `ErrorBoundary`, `logger`, `useFlowNavigation`,
  `NAVIGATION_FLOW_ENGINE`
- **API client**: `createRequest`, `ApiNetworkError`, `ApiValidationError`,
  `useLoginMutation`, `useRequestOtpMutation`, `useBookings`, `useLocations`

Feature screens (`LoginFeature`, `OtpFeature`, `BookingDashboard`, etc.) are
intentionally **not** re-exported — those are goVoylo's own app screens, not
generic SDK surface. Add them here explicitly if a consuming app needs them.

## Build

```bash
npm run build --workspace=@govoylo/mobile-sdk
```

This produces `dist/index.js` (CJS), `dist/index.mjs` (ESM), and
`dist/index.d.ts` (types). `react`, `react-native`, `react-native-web`,
`@tanstack/react-query`, and `zod` are left as externals — consumers must
provide their own copies (declared as `peerDependencies`).

## Consuming it (once published)

```bash
npm install @govoylo/mobile-sdk react react-native @tanstack/react-query zod
```

```tsx
import { AppProvider, Button, useLoginMutation } from '@govoylo/mobile-sdk';

export default function App() {
  return (
    <AppProvider contextName="EXTERNAL-APP">
      <Button label="Sign in" variant="primary" onPress={() => {}} />
    </AppProvider>
  );
}
```

## Publishing

This package ships as `"private": true` on purpose, so a stray
`npm publish` (or an automated one) can't push it to the public registry by
accident. To actually publish:

1. Bump `version` in `package.json` (semver).
2. Remove `"private": true` from `package.json`.
3. `npm run build --workspace=@govoylo/mobile-sdk`
4. `npm publish --workspace=@govoylo/mobile-sdk` (requires npm registry auth
   and org access for the `@govoylo` scope).

Re-add `"private": true` afterward if you want to keep guarding against
accidental publishes between releases.

## Implementation notes / known rough edges

- **`src/wrappers.ts`**: a handful of exports (`AppProvider`, `Button`,
  `Input`, `Card`, `Text`, `AutoCompleteDropdown`, `ErrorBoundary`,
  `useFlowNavigation`) hand-declare their prop/return types locally instead
  of letting the `.d.ts` bundler trace them from `@workspace/ui` /
  `@workspace/core`. Those source files are class components, generic
  components, or import a sibling module relatively — combinations that
  `rollup-plugin-dts` doesn't reliably flatten across a workspace-package
  boundary; left alone, it silently emitted a `.d.ts` with a handful of
  imports still pointing at `@workspace/...` paths, which don't exist for
  an external installer. If you change one of those components' props in
  `@workspace/ui`/`@workspace/core`, update the matching interface in
  `wrappers.ts` too — nothing enforces they stay in sync automatically.
- **Bundle size**: `dist/` currently includes a ~400KB `bg-balloon.png`. It's
  pulled in transitively because `Button.tsx` (in `@workspace/ui`) imports
  from its own package's barrel `../index` rather than `../theme/tokens`
  directly, and that barrel re-exports the asset module. Harmless, but worth
  fixing upstream in `@workspace/ui` if bundle size matters before publishing.
