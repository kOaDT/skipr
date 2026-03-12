# Skipr - Work In Progress

[![CI](https://github.com/kOaDT/skipr/actions/workflows/ci.yml/badge.svg)](https://github.com/kOaDT/skipr/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Open-source marine navigation app built with React Native and Expo. Skipr displays nautical charts with S-52 styling, providing sailors with a free and modern charting tool on mobile.

## Features

- Interactive full-screen nautical chart powered by MapLibre GL Native
- S-52 nautical chart style with depth colors and maritime icons
- Layer toggle for depth areas and land visibility
- Offline-first architecture designed for use at sea

## Screenshots

<!-- Add screenshots here when available -->

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Expo](https://expo.dev) | SDK 55 | Development platform |
| [React Native](https://reactnative.dev) | 0.83 | Mobile framework |
| [MapLibre GL Native](https://maplibre.org) | 10.x | Map rendering engine |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [Zustand](https://zustand.docs.pmnd.rs) | 5.x | State management |
| [NativeWind](https://www.nativewind.dev) | 4.x | Tailwind CSS for React Native |

## Getting Started

```bash
git clone https://github.com/kOaDT/skipr.git
npm install
npx expo run:ios    # or npx expo run:android
```

> **Note:** Skipr requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/) — it does **not** work with Expo Go because MapLibre is a native module. The third command builds and launches the dev client. For subsequent runs, use `npx expo start --dev-client`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup instructions and code conventions.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
