# Fullstack Specification: StudioFlow — The One-Person Back Office

**Status:** PENDING APPROVAL  
**Target Persona:** Solo Freelance Designers, Creative Directors & Solo Consultants (1–5 person teams)  
**Deliverable Modality:** Fullstack Web Application (React + Vite + Tailwind CSS + Node.js Express API + Dual-Mode Persistence)  
**Architecture Document:** `docs/spec/one-person-backoffice-fullstack-spec.md`

---

## Assumptions

1. **Architecture:** Dedicated Node.js Express backend API server running on port 3001, consumed by a Vite React frontend on port 5173 via development proxy (`/api` -> `http://localhost:3001`).
2. **Persistence Strategy:** The backend uses a resilient Dual-Mode persistence layer: persistent local file store (`server/data/db.json`) out of the box, with automatic sync to Supabase PostgreSQL when credentials exist. Judges and evaluators experience 100% functional data persistence without requiring manual database setup.
3. **UI Philosophy:** Complete removal of vanity marketing/landing page fluff (3D galaxy canvas, infinite marquee, design dogma accordions, scroll rulers) in favor of a high-density, pure **Operational Cockpit**.
4. **Payment Simulation:** Client portal payment processing simulates instant clearing (Card / UPI / Bank Transfer), directly updating invoice status to `paid`, crediting studio liquid reserves, and appending an entry to the transaction audit ledger.
5. **Human-in-the-Loop Communication:** WhatsApp follow-ups generate verified `https://wa.me/{phone}?text=...` deep links with 4 emotional cadences (Polite, Due Today, Firm, Urgent) and clipboard fallbacks, keeping the owner in complete control.

---

## 1. Objective

Micro-businesses and freelance designers fail not from a lack of clients, but because client money arrives late while fixed studio bills (rent, software, contractor payouts) arrive on time. Existing accounting software is bloated with double-entry ledgers, while informal WhatsApp chats and spreadsheets leave invoices untracked and unpaid.

**StudioFlow** provides a dedicated, fullstack operations cockpit and client pay portal that:
1. **Eliminates invoice creation friction** through 5-second natural language ingestion (e.g. *"Billed Nike brand sprint $3,500 due next Friday"*) and 1-click service presets.
2. **Accelerates collections** via a public-facing **Interactive Client Pay Portal** (`/pay/:id` / modal) where clients view itemized breakdowns, download printable PDFs, and click **"Pay Now"** (simulated instant settlement) or **"Request Extension"**.
3. **Automates debt chasing** with pre-drafted WhatsApp follow-up cadences and split-payment (50/50) restructuring agreements.
4. **Predicts cash deficits 30–90 days ahead** via a server-side forecasting engine that adjusts due dates based on client payment behavior ($DueDate + \Delta$).
5. **Executes emergency triage** on a "Bad Day" when multiple clients default simultaneously, generating a 3-tier recovery playbook (fast-cash discounts, milestone splits, non-critical SaaS deferral).

---

## 2. Tech Stack

- **Backend Runtime & Framework:** Node.js (v20+ / v24+), Express 4.x, CORS, dotenv
- **Frontend Framework:** React 18.3, Vite 6.x
- **Styling & UI:** Tailwind CSS 3.4, Lucide React Icons
- **Data Persistence:** Local JSON file database (`server/data/db.json`) + Optional Supabase PostgreSQL (`@supabase/supabase-js`)
- **Dev Tooling:** `concurrently` (runs API and Vite simultaneously in `npm run dev`)

---

## 3. Commands

```bash
# Install dependencies (both client & server)
npm install

# Start both backend API (port 3001) and frontend (port 5173) concurrently
npm run dev

# Start backend server only
npm run server

# Start frontend client only
npm run client

# Production build of frontend
npm run build

# Preview production build
npm run preview
```

---

## 4. Project Structure

```
Codebenders/
├── server/
│   ├── index.js              # Express app entry point, middleware, route registration
│   ├── store.js              # Unified persistence layer (file-backed JSON + Supabase sync)
│   ├── data/
│   │   └── db.json           # Active persistent database store (seeded on first run)
│   ├── engine/
│   │   ├── forecast.js       # 30-90 day rolling cash forecasting & deficit detection
│   │   └── nlp.js            # Natural language prompt to invoice parser
│   └── routes/
│       ├── invoices.js       # CRUD, aging cohorts, mark-paid, 50/50 split
│       ├── portal.js         # Public client invoice portal, instant pay, extension requests
│       ├── forecast.js       # Dynamic forecasting & scenario calculation endpoint
│       ├── triage.js         # "Bad Day" multi-default liquidity recovery protocol
│       ├── outflows.js       # Recurring studio bills & flexible expense toggles
│       ├── profile.js        # Cash balance, safety buffer, studio profile & demo reset
│       └── ai.js             # NLP invoice parsing endpoint
├── src/
│   ├── App.jsx               # Refactored Pure Operational Cockpit UI
│   ├── main.jsx              # React DOM entry point
│   ├── index.css             # Tailwind base styles, scrollbars, and print layout styles
│   ├── components/
│   │   ├── Navbar.jsx        # Studio header, cash balance, runway days, API status badge
│   │   ├── AgingDashboard.jsx# Accounts Receivable aging radar ("Who owes me, how much, since when?")
│   │   ├── DebtorCard.jsx    # Individual invoice card with WhatsApp, Pay Portal, and Split triggers
│   │   ├── ClientPortalModal.jsx # Interactive Client Pay Portal & Printable PDF View
│   │   ├── InvoiceModal.jsx  # Standard invoice creation modal
│   │   ├── QuickInputBar.jsx # 5-second NLP prompt bar & quick service presets
│   │   ├── CashForecastChart.jsx # Interactive SVG 30-90 day cash curve with deficit zones
│   │   ├── WhatIfSimulator.jsx   # Interactive scenario sliders (+N days delay, Capex)
│   │   ├── BadDayTriageModal.jsx # 3-tier emergency liquidity recovery protocol modal
│   │   ├── OutflowsManager.jsx   # Studio recurring bills & subscription ledger
│   │   └── WhatsAppModal.jsx     # Pre-drafted 4-cadence WhatsApp follow-up generator
│   ├── lib/
│   │   ├── api.js            # REST API client connecting frontend to /api backend
│   │   ├── dataService.js    # Resilient data service (calls /api, fallback to local cache)
│   │   ├── forecastEngine.js # Client-side reactive helper for instant 60fps slider drags
│   │   └── dateUtils.js      # Date formatting and day diff calculations
│   └── data/
│       └── mockDesignerData.js # Client-side seed fallback
├── docs/
│   ├── Problem Statement 1  Small Business Operations.pdf
│   ├── ideas/
│   │   └── studioflow-operations-cockpit.md # One-pager from ideation session
│   └── spec/
│       └── one-person-backoffice-fullstack-spec.md # This specification
├── tasks/
│   ├── plan.md               # Phased implementation plan
│   └── todo.md               # Atomic task checklist
└── package.json              # Project dependencies and concurrent run scripts
```

---

## 5. API Contract Specifications

### 5.1 Profile & Status
- `GET /api/health`: Healthcheck, returns server uptime and database record counts.
- `GET /api/profile`: Returns `{ id, business_name, owner_name, currency, starting_cash, safety_buffer }`.
- `PATCH /api/profile`: Updates cash balance or safety buffer.
- `POST /api/profile/reset-demo`: Resets persistent database to pristine designer seed data.

### 5.2 Invoices & Accounts Receivable
- `GET /api/invoices`: Returns list of all invoices + calculated AR summary:
  - `total_owed`: Sum of unpaid invoices.
  - `overdue_amount`: Sum of overdue invoices.
  - `cohorts`: `{ current: [], grace: [], overdue_30: [], severe_60: [] }`.
  - `average_dso`: Average days sales outstanding.
- `POST /api/invoices`: Creates a new invoice with auto-generated invoice number (`INV-YYYY-XXX`).
- `PATCH /api/invoices/:id/paid`: Marks invoice as paid with timestamp, credits `starting_cash`, logs audit transaction.
- `POST /api/invoices/:id/split`: Splits invoice into two 50% tranches (Tranche 1 due today, Tranche 2 due in +15 days).
- `DELETE /api/invoices/:id`: Deletes an invoice.

### 5.3 Public Client Pay Portal
- `GET /api/portal/:id`: Returns public-safe invoice representation (no admin credentials required):
  - Client name, project title, items list, amount, issue date, due date, payment status, studio name.
- `POST /api/portal/:id/pay`: Simulates client payment via Card, UPI, or Bank Transfer:
  - Updates invoice status to `paid`.
  - Appends to `transactions` log.
  - Credits studio liquid cash reserves.
  - Returns `{ success: true, new_balance: ..., invoice: ... }`.
- `POST /api/portal/:id/extension`: Client submits a payment extension request (e.g. +7 or +14 days with reason):
  - Updates `due_date` to extended date.
  - Sets invoice note: `"Extension requested by client: [reason]"`.

### 5.4 30–90 Day Forecasting & Scenarios
- `POST /api/forecast`:
  - Request body: `{ horizonDays, scenarios: { acmeDelayDays, macbookCapex, badDayActive, deferFlexibleBills } }`.
  - Computes daily rolling balance incorporating behavioral client delay adjustments ($DueDate + \Delta$).
  - Returns: `{ dailyPoints, safetyBuffer, minBalance, deficitInfo: { hasDeficit, dateStr, shortfallAmount, primaryAction, recommendedSteps } }`.

### 5.5 "Bad Day" Crisis Triage
- `POST /api/triage/bad-day`:
  - Simulates 30-day payment defaults across all pending clients.
  - Calculates immediate shortfall before upcoming fixed bills (rent, software, taxes).
  - Returns prioritized 3-tier action roadmap:
    - Tier 1: 5% fast-cash WhatsApp discounts on small balances.
    - Tier 2: 50% milestone split agreement for anchor client.
    - Tier 3: 1-click deferral of flexible subscriptions.

### 5.6 Natural Language Processing
- `POST /api/ai/parse-invoice`:
  - Request body: `{ prompt }` (e.g. *"Billed Nike brand sprint $3,500 due next Friday"*).
  - Returns: `{ client, amount, dueDate, projectTitle, items }`.

---

## 6. Code Style & Conventions

- **Module Format:** ES Modules (`import`/`export`) across both client and server (`"type": "module"`).
- **Backend Architecture:** Separation of concerns: `server/index.js` (Express plumbing) -> `server/routes/` (HTTP validation & response) -> `server/store.js` (Persistence) & `server/engine/` (Pure deterministic business algorithms).
- **Error Handling:** Standardized API error responses `{ error: string, details?: any }` with appropriate HTTP status codes (400 for invalid inputs, 404 for not found, 500 for internal errors).
- **Frontend Code:** Functional React with hooks (`useState`, `useEffect`, `useMemo`), Tailwind CSS utility classes, Lucide icons.
- **Example API Route Handler Style:**
```javascript
// Example: server/routes/invoices.js
router.patch('/:id/paid', (req, res) => {
  try {
    const { id } = req.params;
    const { paid_date } = req.body;
    const result = store.markInvoicePaid(id, paid_date);
    if (!result) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.json(result);
  } catch (err) {
    console.error('Error settling invoice:', err);
    return res.status(500).json({ error: 'Internal server error settling invoice' });
  }
});
```

---

## 7. Testing Strategy

1. **API Integration Tests:** Automated script in `server/test-api.js` testing:
   - Healthcheck responds with 200.
   - Creating an invoice persists and appears in `GET /api/invoices`.
   - Client Portal `POST /api/portal/:id/pay` transitions invoice status to `paid` and increments cash balance.
   - `POST /api/forecast` accurately returns rolling daily points and deficit alerts.
   - `POST /api/ai/parse-invoice` extracts correct client, amount, and dates.
2. **Frontend Build & Lint:** `npm run build` compiles Vite bundle without syntax errors or unhandled imports.
3. **End-to-End Operational Verification:**
   - Run `npm run dev`.
   - Enter plain English invoice in QuickInputBar -> invoice created via backend.
   - Click "View Client Portal" on an invoice -> Portal modal opens -> Click "Pay Now" -> Invoice marks paid and top-bar cash balance immediately updates.
   - Drag "What-If" slider -> Deficit banner fires with prescriptive actions.
   - Click "🚨 Simulate Bad Day" -> Triage modal calculates shortfall and displays 3-tier recovery options.

---

## 8. Boundaries

- **Always Do:**
  - Verify every changed line traces directly to solving the core small business operations problem.
  - Ensure zero runtime crashes if external keys are missing (resilient JSON fallback).
  - Keep communication assisted and human-in-the-loop (never autonomously spam clients via WhatsApp without user confirmation).
  - Verify the production build (`npm run build`) succeeds before concluding.
- **Ask First:**
  - Introducing heavy third-party UI libraries or external relational database requirements that break zero-config judging.
  - Altering core data contracts in `db.json`.
- **Never Do:**
  - Re-introduce landing page marketing fluff (galaxy animations, marquee slogans, artistic dogma).
  - Hardcode mock data directly into UI components without passing through the data service/backend store.
  - Commit secrets or API keys to the repository.

---

## 9. Success Criteria

1. **Dedicated Backend API Server Running:**
   - Express server running on port 3001 serving `/api/invoices`, `/api/portal/:id`, `/api/forecast`, `/api/triage`, `/api/outflows`, `/api/profile`, and `/api/ai/parse-invoice`.
   - `npm run dev` boots both backend and frontend concurrently with zero manual port configuration.
2. **Working Invoicing & Client Pay Portal Flow:**
   - Owner creates invoice (via modal or 5-second NLP bar).
   - Owner can open **Client Pay Portal** (or share link).
   - In the Portal, the client can view line items, download printable PDF, or click **"Pay Now"**.
   - Clicking "Pay Now" immediately settles the invoice and updates the studio's cash reserves in real time.
3. **Accounts Receivable Aging Radar:**
   - Dashboard answers *"Who owes me, how much, and since when?"* segmented into Current, Grace, 30d Overdue, and 60d+ Critical cohorts.
   - Direct 1-click WhatsApp follow-ups with 4 emotional cadences (`wa.me` links).
   - Direct 1-click 50/50 split payment restructuring.
4. **Predictive 30–90 Day Cash Forecasting & What-If Simulator:**
   - Visual SVG cash trajectory showing rolling daily balance.
   - Interactive sliders to model anchor client paying 15–45 days late or hardware capex.
   - Dynamic deficit alert triggering when cash falls below buffer with prescriptive recovery steps.
5. **"Bad Day" Liquidity Crisis Protocol:**
   - Dedicated emergency protocol simulating simultaneous client defaults.
   - Calculates exact shortfall before rent day and presents 3-tier action plan.
6. **Zero-Fluff High-Density Cockpit:**
   - Completely free of 3D galaxy canvas, marquee banners, and landing page dogma.

---

## 10. Open Questions for Human Review

1. **Client Portal Route vs Modal:** Currently, we propose providing both: an interactive in-app modal ("View as Client") for instant hackathon demonstration, plus support for simulated `/pay/:id` deep link preview. Does this meet your expectations for demonstrating the client experience?
2. **Approval to Proceed:** Do you approve this specification so we can move to Phase 2 (Implementation Plan) and Phase 3 (Tasks)?
