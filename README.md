# Shopboard Admin

A responsive React operations console for store owners. The application is backed entirely by live API data—there are no hard-coded KPIs or chart series.

## Product surface

- Secure sign-up/sign-in and protected application routes
- Live dashboard with revenue, orders, profit, inventory value, fulfilment mix, 14-day trend, recent orders, and low-stock watchlist
- Searchable, paginated order management with controlled status transitions
- Product catalogue with pricing, cost, reorder thresholds, low/out-of-stock filters, edits, stock adjustments, and archival
- Multi-line order creation using authoritative inventory price and stock data
- Persisted operational task board
- Responsive desktop/mobile navigation, loading/empty/error states, and accessible form/table controls

## Stack

- React 18, React Router, Material UI, Recharts, and Axios
- Vite for development/production builds and Vitest + Testing Library for tests
- Nginx production container with SPA route fallback

## Local setup

Start the API first, then:

```bash
cp .env.example .env
npm ci
npm run dev
```

Open `http://localhost:3000`.

`VITE_API_URL` must include the `/api` prefix, for example:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

For a production build, environment values are injected at build time.

## Quality commands

```bash
npm test
npm run build
npm run check
npm run audit
```

## Docker

Build the frontend against the deployed API URL:

```bash
docker build --build-arg VITE_API_URL=https://api.example.com/api -t shopboard-admin .
docker run --rm -p 8080:80 shopboard-admin
```

Nginx serves the built SPA and routes browser refreshes back to `index.html`.

## Backend contract

The application expects consistent API responses:

- item: `{ "data": { ... } }`
- collection: `{ "data": [...], "pagination": { ... } }`
- error: `{ "message": "...", "code": "..." }`

Authentication uses `Authorization: Bearer <token>` and an expired session is cleared centrally by the API client.
