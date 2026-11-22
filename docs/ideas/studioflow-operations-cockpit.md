# StudioFlow: The Zero-Friction One-Person Operations Cockpit

## Problem Statement
How might we give solo creative consultants and micro-business owners a working back office that eliminates invoice creation friction, accelerates payment collection via WhatsApp-linked client portals, and provides prescriptive cash survival playbooks before upcoming bills trigger a liquidity crisis?

## Recommended Direction
Eliminate all marketing/landing page fluff (cosmic galaxy canvases, marquee banners, artistic dogma). Replace them with a dedicated fullstack **Operational Cockpit** powered by a dedicated Node.js/Express backend API server and a focused, high-density React UI:

1. **Dedicated Node/Express Backend (`server/`):**
   - RESTful API endpoints for Invoices, Clients, Outflows, Cash Forecasting, What-If Simulations, and Bad Day Triage.
   - Public Client Portal API (`/api/portal/:id`) enabling end-to-end invoice viewing, extension requests, and instant client payments (`/api/portal/:id/pay`).
   - Server-side NLP invoice parsing endpoint (`/api/ai/parse-invoice`).
   - Resilient data store with automatic persistence and zero-config guest fallback.

2. **Top-Level Health Bar & Runway Telemetry:**
   - Real-time liquid cash balance, calculated runway (days), monthly burn, and buffer health with 1-click "Bad Day" simulation.

3. **Zero-Friction Inflow Bar:**
   - 5-second invoice creation via plain English command (e.g., *"Billed Nike brand sprint $3,500 due next Friday"*) or 1-click service presets.

4. **Interactive Client Pay Portal:**
   - A dedicated client-facing view for every invoice featuring itemized breakdowns, printable PDF layout, and live "Pay Now" action that credits cash reserves in real time.

5. **Behavioral Aging AR Radar:**
   - Debtor cohorts (Current, Grace, Overdue, Critical) answering *"Who owes me, how much, and since when?"* with 1-click contextual WhatsApp escalation cadences and split-payment agreements.

6. **Prescriptive 30–90 Day Cash Horizon:**
   - Dynamic SVG projection showing exact deficit dates, shortfall amounts, and prescriptive next actions when "what-if" delays occur.

7. **"Bad Day" Liquidity Triage Command Center:**
   - A structured 3-tier emergency protocol to recover cash when multiple clients default before rent day:
     - Tier 1: 5% fast-cash WhatsApp discounts on small balances.
     - Tier 2: 50% split-payment request for anchor clients.
     - Tier 3: 1-click deferral of flexible SaaS overhead.

## Key Assumptions to Validate
- [ ] Solo owners will enter invoices consistently if entry takes < 5 seconds without multi-page forms.
- [ ] Clients pay faster when given a clean interactive web link with a 1-click "Pay Now" button vs a raw PDF attachment.
- [ ] Contextual WhatsApp reminder templates (polite -> firm -> urgent) overcome the emotional hesitation of debt collection.
- [ ] Server-side forecasting with behavioral payment lag ($DueDate + \Delta$) provides realistic runway projections.

## MVP Scope

### IN SCOPE
- **Fullstack Node.js / Express Backend Server:**
  - `GET /api/invoices`, `POST /api/invoices`, `PATCH /api/invoices/:id/paid`, `POST /api/invoices/:id/split`
  - `GET /api/portal/:id`, `POST /api/portal/:id/pay`, `POST /api/portal/:id/extension`
  - `POST /api/forecast` (calculates 30/60/90-day trajectory with scenarios)
  - `POST /api/triage/bad-day` (computes multi-default liquidity deficit and 3-tier recovery plan)
  - `POST /api/ai/parse-invoice` (natural language prompt parser)
  - `GET /api/outflows`, `POST /api/outflows`, `DELETE /api/outflows/:id`
  - `GET /api/profile`, `PATCH /api/profile`, `POST /api/profile/reset-demo`
- **Pure Cockpit UI:** Clean, high-density operations workspace replacing landing page fluff.
- **Client Pay Portal Modal & Shareable Link:** Interactive client invoice viewer with live "Pay Now" simulation and printable PDF layout.
- **WhatsApp Escalation Cadences:** Friendly, Due Today, Firm, and Urgent pre-drafted messages with working `wa.me` deep links.
- **Interactive What-If Simulation:** Sliders to model client payment delays and instant shortfall alerts with prescriptive action triggers.
- **Dual-Mode Persistence:** Works seamlessly with Supabase or built-in backend JSON persistence.

### NOT DOING (and Why)
- **3D Galaxy Canvas / Marquee / Landing Page Sections:** Distracts from product utility and creates the impression of a fake mock marketing site.
- **Complex Double-Entry General Ledger:** Overkill for solo businesses and violates simplicity.
- **External Bank Account OAuth (Plaid/Yodlee):** Unnecessary friction for hackathon deliverable; local backend persistence + Supabase fallback is reliable and zero-friction.

## Open Questions
- How to ensure the app works in both local development and production deployments?
  - Solution: Vite config proxies `/api` to Express in development; in production or standalone, the client can talk to the backend port or use bundled static routes.
