# Glame Back Office

React/Vite back-office for Glame financial reporting. It is intentionally a
separate frontend project from the Supabase Edge Functions backend.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

`VITE_API_BASE_URL` must point to the Edge Function API base URL, ending in
`/functions/v1/api`. The committed default points to the Glame development
project.

Use an account with the `admin` or `accountant` role. The access token is held in memory only:
it is never written to `localStorage` or `sessionStorage`, and is discarded on
page reload, browser close, or sign-out. Sign-out also asks the API to revoke
the current session. The app currently calls the following reporting endpoints:

- `GET /admin/reports/transactions`
- `GET /admin/reports/payouts`
- `GET /admin/reports/artists`
- `GET /admin/reports/{transactions|payouts}/export?format=csv|xlsx`

The API, rather than the browser, applies the allowed columns, report filters,
role check, pagination and export audit log. The frontend routes each allowed
role through its own layout, which currently shares the same reporting UI.
