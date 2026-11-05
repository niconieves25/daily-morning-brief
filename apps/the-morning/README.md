# The Morning — Expo prototype

A universal iOS, Android, and web app for a personal daily brief. The current prototype has a short date-based puzzle, an animated reveal, daily line artwork, a sample brief, and local name/topic settings.

## Run

Use Node 24.3+ in the Node 24 line.

```sh
npm install
npx expo start --web
```

For native development, use `npx expo start` with a compatible simulator or development build. To generate a static web site:

```sh
npx expo export --platform web
```

The output is in `dist/`.

## Current limits

The three brief notes are samples. Calendar, email, and live news are not connected. Two dates have authored artwork; other dates use a generated line study. The puzzle alternates between sum and sequence rules. Preferences stay on this device through AsyncStorage.

The repository root README contains the product plan and notes on future account integrations.
