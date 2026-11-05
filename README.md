# The Morning

An interactive daily brief prototype: a small puzzle opens the page, a new line sculpture appears each day, and a constellation runs through the reading experience.

## Run the shareable demo

```sh
npm install
python3 -m http.server 8765
```

Open `http://localhost:8765/`. The demo uses sample content and lets you save a name and topics in your browser. No account or connection to email, calendar, or live news is active yet.

The original personal brief is intentionally excluded from Git. `index.html` is the public-safe demo entry point.

## What works today

- A daily puzzle with keyboard controls, hints, feedback, and a reduced motion path.
- A dated artwork and matching motion after the puzzle is solved.
- Local preferences for name and topics in the demo.
- A responsive opening and brief layout.

## Product direction

The next version needs a server to generate a brief for each person. A profile would hold their name, time zone, topics, chosen sources, and delivery time. Source adapters would collect news feeds and optional calendar and email signals. A daily job would rank and summarize those inputs into a stable brief record, then the current interface would render that record.

Google Calendar and Gmail connections should use server-side OAuth with the narrowest read-only scopes needed. Tokens belong in server-side encrypted storage, never in the browser bundle or Git. Google requires additional verification for some public apps that request sensitive or restricted scopes, so Calendar is the simpler first connection; Gmail needs a separate product and privacy review. See Google's [web-server OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server), [Calendar scopes](https://developers.google.com/workspace/calendar/api/auth), and [restricted-scope verification guide](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification).

## Repository status

This folder can be a local Git repository. Creating a remote GitHub repository requires signing in to GitHub first. Keep the excluded personal brief and any future `.env` files out of a public repository.
