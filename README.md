# Shopboard Admin

Responsive operations console for store owners, backed entirely by live API data.

## Product surface

- Secure signup/sign-in with short-lived, memory-only access tokens and rotating HttpOnly refresh sessions
- Email OTP password recovery
- Revenue, order, profit, inventory-value, fulfilment, trend, recent-order, and low-stock analytics
- Searchable and paginated orders with controlled status progression
- Catalogue pricing, cost, reorder thresholds, filters, editing, stock adjustments, and archival
- Multi-line order creation from authoritative inventory pricing and availability
- Product and order CSV templates, atomic uploads, and CSV exports
- One-click realistic sample workspace for empty accounts
- Persisted operational task board
- Password-protected data reset and permanent account deletion in a dedicated danger zone
- Daily/weekly email report surface shown as paused; no schedules or report sends run yet
- Responsive desktop/mobile navigation and explicit loading, empty, success, and error states

## Stack

- React 18, React Router, Material UI, Recharts, and Axios
- Vite for development and production builds
- Vitest and Testing Library for tests
- Netlify static hosting plus a same-origin backend proxy Function

## Local development

Start the backend on port 5000, then:

```bash
cp .env.example .env
npm ci
npm run dev
```

Open `http://localhost:3000`. Vite proxies `/api/*` to `http://127.0.0.1:5000`, so the default `VITE_API_URL=/api` works locally and in production.

## Netlify deployment

This repository includes [`netlify.toml`](./netlify.toml) and [`netlify/functions/backend-proxy.js`](./netlify/functions/backend-proxy.js).

In the frontend Netlify site:

1. Set this repository directory as the site base.
2. Set `VITE_API_URL=/api`.
3. Set `BACKEND_SERVICE_URL` to the backend Netlify site origin, for example `https://shopboard-api.netlify.app`—do not add `/api` unless you intentionally want to; both forms are supported. The old `REACT_APP_BACKEND_BASE_URL` is accepted temporarily as a fallback.
4. Deploy. `/api/*` goes to the proxy Function and all other unknown paths fall back to the React application.

The proxy is important: the browser talks only to the frontend origin, allowing the backend's secure refresh cookie to remain first-party. The Function forwards authorization, upload bodies, downloads, and `Set-Cookie` headers to/from the backend service.

Node 22.22.2 is pinned in `netlify.toml` because Vite 8 and its build toolchain do not run on the Node 18 default used by older Netlify sites.

## CSV workflow

Open **Data & account** from the sidebar.

- Download the product or order sample before preparing a file.
- Import products before orders because order rows resolve existing SKUs.
- Reuse an `order_reference` across rows to create a multi-line order.
- Imports are all-or-nothing and limited to 2 MB and 500 rows.
- Export current products and orders as CSV copies for analysis or migration. Order status history is not a full database restore format.

## Authentication behavior

The access token is held only in JavaScript memory. On a page refresh, the application uses the secure HttpOnly cookie to rotate the refresh session and obtain a new short-lived token. Nothing sensitive is stored in `localStorage`.

Password recovery uses a six-digit OTP that expires after 10 minutes. A successful reset revokes all existing sessions.

## Quality commands

```bash
npm test
npm run build
npm run check
npm run audit
```

## Docker

The existing Nginx image remains available when hosting outside Netlify:

```bash
docker build --build-arg VITE_API_URL=https://api.example.com/api -t shopboard-admin .
docker run --rm -p 8080:80 shopboard-admin
```

For cross-origin deployments, configure backend CORS and cookie policy carefully. The checked-in Netlify proxy is the preferred deployment route.
