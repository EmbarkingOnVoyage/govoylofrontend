govoylofrontend
├── app.json
├── apps
│   ├── Mobile
│   │   ├── App.tsx
│   │   ├── MobileTest.txt
│   │   ├── app.json
│   │   ├── index.js
│   │   ├── package.json
│   │   ├── src
│   │   │   └── screens
│   │   │       ├── LandingScreen.styles.ts
│   │   │       └── LandingScreen.tsx
│   │   └── tsconfig.json
│   └── Web
│       ├── index.html
│       ├── package.json
│       ├── src
│       │   ├── main.test.tsx
│       │   └── main.tsx
│       └── vite.config.ts
├── architecture.md
├── assets
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── apple-logo.png
│   ├── facebook-logo.png
│   ├── favicon.png
│   ├── google-logo.png
│   ├── icon.png
│   ├── index.ts
│   └── splash-icon.png
├── db.json
├── index.ts
├── package-lock.json
├── package.json
├── packages
│   ├── api
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── client.test.ts
│   │   │   ├── client.ts
│   │   │   ├── hooks
│   │   │   │   ├── index.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useBookings.ts
│   │   │   │   └── useLocations.ts
│   │   │   ├── index.ts
│   │   │   └── models
│   │   │       ├── auth.schema.ts
│   │   │       ├── booking.schema.ts
│   │   │       └── location.schema.ts
│   │   └── tsconfig.json
│   ├── auth
│   │   └── Test1.txt
│   ├── core
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── ErrorBoundary.test.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── index.ts
│   │   │   ├── logger.test.ts
│   │   │   ├── logger.ts
│   │   │   └── navigation
│   │   │       ├── navigationConfig.ts
│   │   │       └── useFlowNavigation.ts
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   ├── state
│   │   └── src
│   │       └── store
│   │           └── useSearchStore.ts
│   └── ui
│       ├── package.json
│       ├── src
│       │   ├── assets
│       │   │   ├── images
│       │   │   │   └── bg-balloon.png
│       │   │   └── index.ts
│       │   ├── components
│       │   │   ├── AppProvider.tsx
│       │   │   ├── AutoCompleteDropdown.test.tsx
│       │   │   ├── AutoCompleteDropdown.tsx
│       │   │   ├── Button.test.tsx
│       │   │   ├── Button.tsx
│       │   │   ├── Card.test.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.test.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Text.test.tsx
│       │   │   └── Text.tsx
│       │   ├── features
│       │   │   ├── authentication
│       │   │   │   ├── LoginFeature.tsx
│       │   │   │   ├── LoginFeature.web.tsx
│       │   │   │   ├── OtpFeature.tsx
│       │   │   │   ├── OtpFeature.web.tsx
│       │   │   │   └── authContextCache.ts
│       │   │   └── bookings
│       │   │       ├── BookingDashboard.test.tsx
│       │   │       ├── BookingDashboard.tsx
│       │   │       ├── components
│       │   │       │   ├── Calendar.test.tsx
│       │   │       │   ├── Calendar.tsx
│       │   │       │   ├── Checkbox.tsx
│       │   │       │   ├── ResultsList.tsx
│       │   │       │   ├── SearchWidget.test.tsx
│       │   │       │   ├── SearchWidget.tsx
│       │   │       │   ├── flightcard.tsx
│       │   │       │   └── styles.ts
│       │   │       ├── services
│       │   │       │   └── flightService.ts
│       │   │       └── types.ts
│       │   ├── images.d.ts
│       │   ├── index.test.ts
│       │   ├── index.ts
│       │   ├── styles
│       │   │   ├── base
│       │   │   │   ├── BaseButton.styles.ts
│       │   │   │   └── BaseInput.styles.ts
│       │   │   └── components
│       │   │       ├── AutoCompleteDropdown.styles.ts
│       │   │       ├── LoginFeature.styles.ts
│       │   │       ├── OtpFeature.styles.ts
│       │   │       └── SearchWidget.styles.ts
│       │   └── theme
│       │       ├── tokens.test.ts
│       │       └── tokens.ts
│       ├── tsconfig.json
│       └── vitest.config.ts
├── tsconfig.base.json
├── tsconfig.json
└── turbo.json