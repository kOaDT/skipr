# Contributing to Skipr

Thank you for your interest in contributing to Skipr! This guide will help you get set up and familiar with our conventions.

## Development Setup

### Prerequisites

- Node.js 22.x (recommended for Expo SDK 55)
- npm
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
git clone https://github.com/kOaDT/skipr.git
cd skipr
npm install
```

### Running the App

Skipr requires a **development build** — it does not work with Expo Go because MapLibre is a native module.

```bash
# Build and run the dev client
npx expo run:ios      # or npx expo run:android

# Start the dev server (after initial build)
npx expo start --dev-client
```

### Environment Variables

```bash
cp .env.example .env
```

See `.env.example` for the list of available variables.

## Code Conventions

### Project Structure

The codebase uses a **feature-based structure** under `src/features/`:

```
src/features/{name}/
  components/    - Feature-specific components
  hooks/         - Feature-specific hooks
  index.ts       - Public barrel export
```

### Rules

| Convention | Rule |
|-----------|------|
| Exports | Named exports only — never use `export default` (except Expo Router routes) |
| Feature imports | `import { X } from '@/features/map';` — never import from internal paths |
| Store imports | `import { useSettingsStore } from '@/stores';` — never import from the file directly |
| TypeScript | Strict mode, no `any`, use `type` instead of `interface` |
| Path aliases | `@/` points to `src/` |
| Tests | Co-located with the code (`Component.test.tsx` next to `Component.tsx`) |

### Known Limitations

- **Expo Go is not supported** — MapLibre GL Native requires a dev client build
- ESLint v9 flat config is used — see `eslint.config.mjs`

## Testing

Before submitting a PR, make sure all three checks pass:

```bash
npm run test        # Run Jest tests
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript type checking
```

## Pull Request Process

1. Create a feature branch from `main`
2. Write your code following the conventions above
3. Commit in English using conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
4. Open a PR using the provided template
5. Wait for CI checks to pass (lint, typecheck, tests)
6. Request a review

## Good First Issues

Look for issues labeled **`good first issue`** — these are scoped tasks suitable for newcomers. Good first contributions include:

- Documentation improvements
- Adding tests for existing components
- Small UI fixes or enhancements
- Accessibility improvements
