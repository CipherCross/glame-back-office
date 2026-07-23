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

Use an account with the `admin` role. The app stores only the access token in
browser local storage and calls the following admin-only endpoints:

- `GET /admin/reports/transactions`
- `GET /admin/reports/payouts`
- `GET /admin/reports/artists`
- `GET /admin/reports/{transactions|payouts}/export?format=csv|xlsx`

The API, rather than the browser, applies the allowed columns, report filters,
role check, pagination and export audit log.
