# Numeria

Numeria is an offline-friendly, mobile-first mathematics adventure prototype built with Vite and vanilla JavaScript.

## Run locally

```sh
npm install
npm run dev
```

Requires Node.js 20.19+ or 22.12+.

The map currently contains five worlds and ten stages per world. Progress is stored locally in the browser. Each stage serves five short questions with supportive feedback and an explanation; worlds and stages unlock in order.

## Firebase setup for student accounts

Student accounts use a username and a six-digit PIN; no email address is requested. Firebase Authentication stores a synthetic, non-deliverable email identifier derived from the username. A forgotten PIN cannot be recovered by email and needs an administrator reset.

1. Create a Firebase Web app and enable Email/Password in Authentication.
2. Create the Firestore database and publish `firestore.rules`.
3. Copy `.env.example` to `.env.local` and fill in the Firebase web app values.
4. Restart Vite after changing environment values.

Do not put service-account credentials in this frontend. Firestore rules restrict each student document to that account's authenticated UID.

## Current scope

- Working world map and sequential stage unlocks
- Five-question practice loop with supportive feedback
- Local star and completion progress
- Basic installable/offline app shell
- Username + PIN account screen and per-account Firestore progress sync (requires Firebase project configuration)
- Global leaderboard showing the 20 highest star totals for signed-in student accounts (requires publishing the updated Firestore rules)

Teacher tools, tournament mode, consent flow, and validated pre/post assessment are not implemented yet. Leaderboard stars are client-reported and are not independently validated, so they should not be used as evidence of learning. Question generation and level calibration need review with teachers and children before using the scores as evidence of learning.
