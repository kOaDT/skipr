# Skipr

Offline-first marine navigation mobile app built with Expo SDK 55, React Native, and MapLibre.

## Prerequisites

- Node.js ^20.19.4, ^22.13.0, ^24.3.0, or ^25.0.0
- A development build (Expo Go is NOT supported due to MapLibre native modules)

## Getting started

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS (requires dev client build)
npx expo run:ios

# Run on Android (requires dev client build)
npx expo run:android
```

## Environment variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_CDN_BASE_URL` | CDN base URL for map tiles and manifests |

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run lint` | Run ESLint on `src/` |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Run Prettier on `src/` |
| `npm test` | Run Jest tests |
| `npm run typecheck` | Run TypeScript type checking |

## Project structure

```
src/
  app/            - Expo Router file-based routes
  features/       - Feature modules (map, zones, weather, sensors, alerts, onboarding, settings)
  components/     - Shared UI components
  stores/         - Zustand stores
  hooks/          - Shared custom hooks
  utils/          - Shared utilities
  constants/      - Design tokens, configuration
  types/          - Shared TypeScript types
assets/
  images/         - App icons, splash screen
  map-styles/     - MapLibre nautical styles
```

Each feature follows the structure: `components/`, `hooks/`, `utils/`, `index.ts` (public barrel export).

## Architecture conventions

- **Named exports only** (no default exports except Expo Router routes)
- **TypeScript strict mode** with no implicit `any`
- **Feature isolation** enforced by `eslint-plugin-boundaries`
- **Pre-commit hooks** via Husky + lint-staged (ESLint + Prettier on staged files)

## Tech stack

| Component | Version |
|-----------|---------|
| Expo SDK | 55 |
| React Native | 0.83 |
| MapLibre RN | 10.4.2 |
| NativeWind | 4.x (Tailwind CSS v3) |
| Zustand | 5.x |
