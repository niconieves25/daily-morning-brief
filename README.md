# The Morning

An interactive daily brief prototype: a small puzzle opens the page, a new line sculpture appears each day, and a constellation runs through the reading experience.

## Expo app

The new universal app lives in [`apps/the-morning`](apps/the-morning). It runs on iOS, Android, and the web from one codebase. The first vertical slice includes a date-based cipher (sum on even dates, sequence on odd dates), an animated unlock, sample brief, two authored artworks, date-generated fallback line art, and local name/topic preferences. The puzzle can be skipped. Account connections and live news are not active yet.

Use Node 24.3 or newer in the supported Node 24 line, then:

```sh
cd apps/the-morning
npm install
npx expo start --web
```

For native development, run `npx expo start` and use a compatible simulator or development build. The app's current content is sample data, so it can be shown without connecting any personal account.

The web demo below remains available as a design reference while the Expo app grows.

## Run the shareable demo

```sh
npm install
python3 -m http.server 8765
```

Open `http://localhost:8765/`. The demo uses sample content and lets you save a name and topics in your browser. No account or connection to email, calendar, or live news is active yet.

The original personal brief is intentionally excluded from this public repository. `index.html` is the public-safe demo entry point.

## Project design skills

Codex uses `ui-ux-pro-max` and `impeccable` from `.agents/skills/` for UI and UX work in this project. The installed skill files stay local; `skills-lock.json` records their sources. After cloning the repository, run `npx skills experimental_install` to restore them. Codex discovers the skills on the next turn.

## Public code and private issues

This repository is the public code and sample demo. Nico's actual dated briefs, including calendar and email details, live in the separate private `niconieves25/nico-morning-brief-private` repository and the local `personal-brief/` folder. That folder is ignored here so personal HTML cannot be added to this public repository by an ordinary `git add`. The private repository has its own `index.html`, dated issue files, assets, and update script. GitHub Pages is not enabled for the private issues.

## What works today

- A daily puzzle with keyboard controls, hints, feedback, and a reduced motion path.
- A dated artwork and matching motion after the puzzle is solved.
- Local preferences for name and topics in the demo.
- A responsive opening and brief layout.

## Product direction

The next version needs a server to generate a brief for each person. A profile would hold their name, time zone, topics, chosen sources, and delivery time. Source adapters would collect news feeds and optional calendar and email signals. A daily job would rank and summarize those inputs into a stable brief record, then the current interface would render that record.

Google Calendar and Gmail connections should use server-side OAuth with the narrowest read-only scopes needed. Tokens belong in server-side encrypted storage, never in the browser bundle or Git. Google requires additional verification for some public apps that request sensitive or restricted scopes, so Calendar is the simpler first connection; Gmail needs a separate product and privacy review. See Google's [web-server OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server), [Calendar scopes](https://developers.google.com/workspace/calendar/api/auth), and [restricted-scope verification guide](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification).

The first product test is a shareable web link from Expo. Watch whether people finish the brief and come back for several mornings before building account and email integrations. Keep the puzzle optional while measuring whether it helps or slows them down. Start live content with chosen topics and curated news feeds; add Calendar after that. Gmail should follow only if users clearly want it enough to justify its setup and privacy requirements.

## Repository status

The public demo is stored at https://github.com/niconieves25/daily-morning-brief. Personal issues are stored separately in a private GitHub repository. Keep the excluded personal brief and any future `.env` files out of this public repository.
