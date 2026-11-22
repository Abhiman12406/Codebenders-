# StudioFlow — The One-Person Back Office

StudioFlow is a cash-flow and receivables tool for a solo freelance designer. It shows AR aging ("who owes me, how much, since when"), sends WhatsApp follow-ups, forecasts cash 30–90 days ahead with What-If sliders, offers a Bad Day crisis triage, turns natural-language sentences into draft invoices, tracks outflows (bills), and optionally syncs data to Supabase.

## Architecture

**Frontend** — Vite + React 18.

- Entry chain: `index.html` → `src/main.jsx` → `src/App.jsx`.
- UI components live in `src/components/`.
- `src/lib/api.js` is the fetch wrapper for the `/api` backend.
- `src/lib/dataService.js` is offline-first. It tries the API first, then Supabase if it is configured, then falls back to localStorage keys prefixed `studioflow_*`.
- `src/lib/forecastEngine.js` is a client-side forecast. It sits alongside the server forecast in `server/engine/forecast.js`.

**Backend** — Express 5.

- `server/index.js` creates the Express app and mounts the routers from `server/routes/` under `/api`.
- Engines live in `server/engine/`: `forecast.js` (cash forecast) and `nlp.js` (invoice text parsing).
- `server/store.js` is the persistence layer. It reads and writes `server/data/db.json` synchronously and reseeds the file with demo data if it is missing.

## Startup

```bash
npm install
npm run dev
```

`npm run dev` starts **both** servers via `concurrently`:

- the Express API on port **3001** (override with the `PORT` environment variable), and
- the Vite dev server on its default port **5173**.

Vite proxies `/api` requests to `http://localhost:3001`. When the API is reachable, the UI shows the badge **"🟢 API Connected (Port 3001)"**.

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the test suite via `node server/test-api.js`. |
| `npm run build` | Builds the frontend into `dist/`. |
| `npm run preview` | Serves the built `dist/` bundle locally. |
| `node server/index.js` | Runs the Express API alone on port 3001. |
| `node server/test-api.js` | Runs the backend integration tests (8 checks). |

## API endpoints

All routes are under `/api`.

| METHOD | path | purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check for the API badge. |
| GET | `/api/invoices` | List invoices. |
| GET | `/api/invoices/:id` | Get one invoice. |
| POST | `/api/invoices` | Create an invoice. |
| PATCH | `/api/invoices/:id` | Update an invoice. |
| DELETE | `/api/invoices/:id` | Delete an invoice. |
| POST | `/api/portal/:id/pay` | Record a client payment. Returns **409** if the invoice is already paid. |
| GET | `/api/forecast?horizonDays=N` | Cash forecast. `horizonDays` ranges from 1 to 365; default is 30. |
| GET | `/api/triage` | Bad Day triage data. |
| GET | `/api/outflows` | List outflows (bills). |
| POST | `/api/outflows` | Create an outflow. |
| PUT | `/api/outflows/:id` | Update an outflow. |
| DELETE | `/api/outflows/:id` | Delete an outflow. |
| GET | `/api/profile` | Get the profile. |
| PUT | `/api/profile` | Update the profile. |
| POST | `/api/ai/parse` | Parse a natural-language invoice sentence into a draft. |

## Testing and verification

```bash
npm test
npm run build
```

`node server/test-api.js` runs 8 PASS checks against the API:

1. health
2. invoices list
3. portal payment
4. forecast
5. triage
6. outflows
7. profile
8. NLP parse

`npm run build` confirms the frontend production bundle compiles into `dist/`.

## Environment variables

The app reads two variables (names confirmed in `src/lib/supabaseClient.js`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set them in a `.env` file at the project root, or in your hosting dashboard. If they are missing, the app runs in **Guest Demo Mode** and stores data in localStorage. Nothing crashes.

## Supabase setup

1. Create a project in Supabase.
2. Copy the project URL and the anon key into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Enable Email auth in the Supabase dashboard.
4. Create the data tables used by `src/lib/dataService.js`: `profiles`, `clients`, `invoices`, `bills`, `follow_ups`.

The table schema is not included in this repository (there is no SQL file), so you must create these tables in Supabase yourself.

## Deploy

> **Caveat:** Vercel and Netlify static hosting serve only the `dist/` folder. They do **not** run the Express API. Either host the backend (`server/index.js`) separately and point the app at it, or deploy the frontend alone and accept fallback mode (localStorage / Supabase only).

### Vercel

1. Import the repository in Vercel.
2. Set the framework preset to **Vite**.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.

### Netlify

1. Set the build command to `npm run build`.
2. Set the publish directory to `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.

**Single-page app note:** the app does not use client-side routing, so no rewrite rule is needed.

## 3-minute hackathon judge script

A timed walkthrough for judges (about 0:00–3:00).

1. **0:00–0:20 — Header telemetry.** Point to the header telemetry bar and the navbar cash balance and reserves.
2. **0:20–0:50 — Aging AR Radar.** Show the receivables aging: who owes money, how much, and since when.
3. **0:50–1:20 — View as Client.** Open the "View as Client" portal and pay an open invoice. Return to the navbar and show the cash balance has updated.
4. **1:20–1:45 — Quick Inflow NLP bar.** In the input bar, type the sample prompt `Billed Nike brand design $3,200 due next Friday` and confirm the draft invoice.
5. **1:45–2:15 — Bad Day triage.** Click **BAD DAY** and walk through the triage modal's three tiers.
6. **2:15–2:35 — 30–90 day horizon with What-If sliders.** Switch the forecast horizon between 30 and 90 days. Drag the Acme Studios late-payment slider past day 15 and show the deficit alert.
7. **2:35–2:50 — Outflows ledger.** Open the outflows ledger and toggle a bill to Flexible.
8. **2:50–3:00 — API health badge.** Point to **"🟢 API Connected (Port 3001)"** to show the backend is live. If it is not shown, the app is running in fallback mode.

### Alternative pitch outline

The earlier walkthrough is kept for reference:

1. **Overview.** Point to the navbar reserves and the runway badge. Then show AR aging: "who owes me, how much, since when."
2. **Quick ingest.** In the input bar, type "Billed Nike brand design $3,200 due next Friday". Confirm the draft.
3. **What-If.** Drag the Acme Studios late-payment slider past day 15. Show the deficit alert.
4. **Bad Day.** Click BAD DAY. Walk through the triage modal's three tiers.
5. **Outflows and Auth.** Toggle a bill to Flexible. Then show the Guest Demo or Supabase Cloud status in the navbar, and click Reset Demo Data.
