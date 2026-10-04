# tandem

A mobile-first shared-expense app prototype. Create trip, home, and event groups; add members by email; record expenses; choose equal, exact, percentage, shares, or adjusted splits; attach a receipt image and note; and move expenses between groups. Demo groups and expenses persist in this browser's local storage.

## Run locally

Requires Node.js and npm.

```sh
npm install
npm run dev
```

Build the production bundle with `npm run build`.

## Google sign-in

Google sign-in uses Firebase Authentication. Create a Firebase web app, enable Google as a sign-in provider, copy `.env.example` to `.env`, and fill in its Firebase values. The app stays usable in local demo mode without credentials.

## Google Drive storage

Groups and expenses are cached in the browser and automatically synced to a visible `Tandem Expenses` folder in Google Drive after you connect it in Settings.

1. In the Google Cloud project used by Firebase, enable the Google Drive API.
2. In Google Auth Platform, configure the OAuth consent screen. If the app is in Testing mode, add the Google account you will use as a test user.
3. In Firebase Console, enable Google under Authentication > Sign-in method and add your local app host to Authorized domains.
4. Start Tandem, open Settings, and choose **Connect Google Drive folder**.
5. Approve Google Drive file access. Tandem creates or connects to `Tandem Expenses` and stores its data in `tandem-data.json` inside that folder.

After clearing browser data, reconnect the same Google account and folder; Tandem loads the existing data and resumes syncing. Changes sync automatically while the folder is connected. OAuth access tokens are kept in memory only, so reconnect after reloading the app.

## Notes

This is a client-side prototype. Google Drive folder storage syncs changes, but simultaneous edits from multiple devices are not merged. The starter group cover photos load from Unsplash.

## Code modules

- `src/modules/auth`: Firebase sign-in and sign-out.
- `src/modules/expenses`: expense list, editor, and detail.
- `src/modules/groups`: group list, editor, and detail.
- `src/modules/settings`: account, appearance, currency, and Drive folder settings.
- `src/modules/shared`: models, seed data, and formatting/storage utilities.
- `src/modules/storage`: Google Drive folder creation and data sync.
