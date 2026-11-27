# Publish Numeria with Cloudflare Pages

## 1. Connect the repository

In Cloudflare, open **Workers & Pages → Create application → Pages → Import an existing Git repository**, then select `r1enc/Numeria`.

## 2. Set the build options

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build` |
| Build output directory | `dist` |

Keep the framework preset as Vite if Cloudflare asks for one. The repository pins Node.js in `.nvmrc`.

## 3. Configure Firebase (optional)

Guest play works without Firebase. To enable student sign-in, cloud progress sync, and the global leaderboard, copy the `VITE_FIREBASE_*` values from the Firebase web app into the Pages **Build → Environment variables** settings for both Production and Preview as needed. Publish the updated rules in `firestore.rules` to the matching Firebase project; the leaderboard will not load until those rules are published.

Do not add `.env.local`, Firebase service-account credentials, or other private credentials to Git.

## 4. Deploy and open on a phone

Start the first deployment. Cloudflare will provide a `*.pages.dev` URL; open that URL on a phone to use Numeria. New commits pushed to `main` trigger production deployments, while other branches can be used for previews.

## Verify locally before pushing

```sh
npm ci
npm run build
npm run preview
```
