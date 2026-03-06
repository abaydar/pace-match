# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npx expo start       # Start dev server (opens options for iOS/Android/web)
npx expo start --ios      # Start on iOS simulator
npx expo start --android  # Start on Android emulator
npx expo start --web      # Start on web
npm run lint         # Run ESLint
```

There is no test suite configured yet.

## Environment

Requires `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local` for authentication to work.

## Architecture

This is an **Expo Router** app (file-based routing) with **Clerk** for authentication.

### Routing

`app/_layout.tsx` is the root layout. It wraps the entire app in:
1. `ThemeProvider` (from React Navigation) — adapts to system light/dark mode
2. `ClerkProvider` — provides auth context throughout the app

The Stack navigator registers three screens: `index`, `login`, and `signup`.

### Auth Flow

- `app/login.tsx` — email/password sign-in via `useSignIn()`, supports MFA via email code, and OAuth (Google/Apple)
- `app/signup.tsx` — email/password registration via `useSignUp()`, triggers email verification code flow, and OAuth
- Both pages redirect to `"/"` on successful auth via `router.replace("/")`
- `app/index.tsx` is the landing page (currently a placeholder)

### Theming

`app/hooks/useTheme.tsx` exports `useTheme()` — reads `useColorScheme()` and returns a typed color object (`background`, `text`, `inputBackground`, `placeholder`, `button`, `buttonText`). Use this hook in all screens/components instead of hardcoding colors.

### Shared Components

Located in `app/components/`:
- `Button` — wraps `Pressable` with press/disabled opacity states; accepts `style` and `textStyle` overrides
- `Input` — wraps `TextInput` with consistent padding/border-radius
- `OAuthButton` — composes `Button` for Google/Apple OAuth actions

### Styling Convention

Inline styles are spread with theme colors from `useTheme()`. There is also `app/styles/login.ts` with a `StyleSheet` for login-related layout (partially superseded by inline styles in the current screens).

### Config

- `app.json`: scheme is `pacematch`, typed routes and React Compiler experimental features are enabled
- EAS project ID: `618c8ec0-9fdc-437e-9f16-240dde8610a5`
