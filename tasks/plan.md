# Technical Implementation Plan: StudioFlow Fullstack Operations Cockpit

**Spec Reference:** `docs/spec/one-person-backoffice-fullstack-spec.md`  
**Goal:** Deliver a working fullstack back office with a dedicated Node.js Express backend API, interactive Client Pay Portal, and a focused, zero-fluff Operational Cockpit for freelance designers and solo business owners.

---

## 1. Architectural Strategy & Slicing

The system is decomposed into 5 progressive, independently testable phases:

```
Phase 1: Backend API Server & Persistence Layer
  │ (Express REST API, JSON Store + Supabase sync, routes for invoices, portal, forecast, triage)
  ▼
Phase 2: Fullstack Wireup & Development Tooling
  │ (Vite proxy configuration, concurrent dev scripts, frontend API client with resilient fallback)
  ▼
Phase 3: Interactive Client Pay Portal & Settlement Engine
  │ (Client-facing invoice view, instant simulated payment, printable PDF layout, extension requests)
  ▼
Phase 4: Operational Cockpit Refactor (Purging Landing Page Fluff)
  │ (Strip 3D galaxy canvas, marquee, dogma accordions; assemble high-density operational cockpit)
  ▼
Phase 5: Automated Verification & Production Readiness
  │ (API test script, end-to-end user journey verification, zero-warning production build)
```

---

## 2. Implementation Phases & Checkpoints

### Phase 1: Backend API Server & Persistence Layer
- **Goal:** Complete the Node.js Express API server on port 3001 serving all business logic endpoints.
- **Components:**
  - `server/index.js`: Express app initialization, CORS, JSON parsing, error handler.
  - `server/routes/invoices.js`: Invoices list, AR aging cohorts, invoice creation, payment settlement, 50/50 split.
  - `server/routes/portal.js`: Public-facing client invoice endpoints (`GET /api/portal/:id`, `POST /api/portal/:id/pay`, `POST /api/portal/:id/extension`).
  - `server/routes/forecast.js`: Dynamic 30–90 day cash forecasting endpoint.
  - `server/routes/triage.js`: "Bad Day" multi-default liquidity deficit and 3-tier action plan endpoint.
  - `server/routes/outflows.js`: Recurring bills ledger & flexible expense toggles.
  - `server/routes/profile.js`: Cash balance, safety buffer, profile settings, and demo data reset.
  - `server/routes/ai.js`: Server-side natural language invoice parsing.
- **Verification Checkpoint 1:** Standalone server boots via `node server/index.js`, responds to `GET /api/health`, and automated test script validates all endpoints with code 0.

### Phase 2: Fullstack Wireup & Development Tooling
- **Goal:** Connect the Vite React frontend to the Express backend with unified tooling.
- **Components:**
  - `vite.config.js`: Configure development proxy (`/api` -> `http://localhost:3001`).
  - `package.json`: Add concurrent dev runner (`"dev": "concurrently -n \"API,WEB\" -c \"cyan,magenta\" \"node server/index.js\" \"vite\""`).
  - `src/lib/api.js`: Unified HTTP client for all backend endpoints.
  - `src/lib/dataService.js`: Hybrid data service directing reads and writes through `/api` with seamless fallback to localStorage.
- **Verification Checkpoint 2:** Running `npm run dev` boots both servers, and frontend successfully loads profile and invoice data from the backend.

### Phase 3: Interactive Client Pay Portal & Settlement Engine
- **Goal:** Provide a client-facing invoice portal that solves the "money arrives late" bottleneck.
- **Components:**
  - `src/components/ClientPortalModal.jsx`: Client invoice view with studio branding, project deliverables, line items, and issue/due dates.
  - **Instant Payment Simulator:** "Pay Now" button with Card / UPI / ACH simulation that calls `POST /api/portal/:id/pay`, transitions invoice status to `paid`, and immediately credits studio cash reserves.
  - **Printable PDF Layout:** CSS `@media print` styling allowing 1-click clean invoice printing or saving as PDF.
  - **Extension Request:** "Request 7-day Extension" button that updates invoice due date and logs reason.
- **Verification Checkpoint 3:** Clicking "View as Client" on an overdue invoice opens the portal, clicking "Pay Now" settles the invoice, and the top navbar cash balance reflects the new funds immediately.

### Phase 4: Operational Cockpit Refactor (Purging Landing Page Fluff)
- **Goal:** Eliminate cosmetic landing page elements and replace with a focused, high-density operations cockpit.
- **Deletions / Removals:**
  - Remove imports and JSX for `OrbitalGalaxyBackground`, `InfiniteMarquee`, `HorizontalAccordions`, `ArtCraftPrinciples`, `HeroWordmark`, and `RightScrollRuler`.
- **New / Refactored Sections in `src/App.jsx`:**
  - **Studio Telemetry Header:** Cash balance, calculated runway (days), buffer health, backend status (`🟢 API Connected (Port 3001)`), "New Invoice" CTA, and "🚨 Bad Day Crisis" trigger.
  - **Prescriptive Action Queue:** Prominent banner surfacing immediate actions (e.g. *"⚠️ Cash Deficit Alert: -$420 on Dec 9. Action: Chase Acme or pause flexible subscriptions"*).
  - **Quick Inflow Bar:** Plain language command execution + 1-click design service presets.
  - **Accounts Receivable Aging Radar:** Visual debtor cards with direct triggers:
    - "View Client Portal / Pay Link"
    - "Chase on WhatsApp" (4 pre-drafted emotional cadences)
    - "Mark Paid"
    - "Split 50/50"
  - **Cash Horizon Radar:** Rolling 30/60/90-day curve with interactive What-If sliders.
  - **Committed Outflows Ledger:** Fixed bills and flexible expense deferral controls.
- **Verification Checkpoint 4:** Visual inspection confirms zero marketing fluff; all screen real estate is dedicated to daily operational workflows.

### Phase 5: Automated Verification & Production Readiness
- **Goal:** Rigorous test execution, error-free production build, and updated documentation.
- **Components:**
  - `server/test-api.js`: Complete integration test script verifying all backend endpoints.
  - `npm run build`: Production bundle compilation with zero errors.
  - `README.md`: Updated setup guide and hackathon judge evaluation walkthrough.
- **Verification Checkpoint 5:** `npm test` / API test suite passes 100%, `npm run build` succeeds, and app runs cleanly in preview.

---

## 3. Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Port Conflicts during judging** | Medium | Backend defaults to 3001, falls back to `process.env.PORT`. Vite proxy dynamically targets backend. |
| **Missing external database keys** | High | Backend includes self-contained file persistence (`server/data/db.json`) initialized with rich seed data; works 100% offline. |
| **Broken imports after deleting landing page components** | Medium | Systematically check and remove all unused imports in `src/App.jsx`. |
| **State desynchronization between portal payment and cockpit** | Medium | Backend returns updated studio cash balance on `POST /api/portal/:id/pay`; cockpit state refreshes seamlessly. |
