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

## Notes

This is a client-side prototype. Data is stored only in the current browser; groups are not synchronized between people or devices. The starter group cover photos load from Unsplash.
