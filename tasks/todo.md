# Task Checklist: StudioFlow Fullstack Operations Cockpit

## Phase 1: Backend API Server & Persistence Layer

- [x] **Task 1.1: Build Express Route Modules**
  - Acceptance: Implement `invoices.js`, `portal.js`, `forecast.js`, `triage.js`, `outflows.js`, `profile.js`, and `ai.js` in `server/routes/` with input validation and standardized error responses.
  - Verify: Node syntax check passes for all route files.
  - Files: `server/routes/invoices.js`, `server/routes/portal.js`, `server/routes/forecast.js`, `server/routes/triage.js`, `server/routes/outflows.js`, `server/routes/profile.js`, `server/routes/ai.js`

- [x] **Task 1.2: Build Server Entry Point & Healthcheck**
  - Acceptance: `server/index.js` initializes Express, attaches CORS & JSON body parser, registers all API routes under `/api`, and exposes `GET /api/health`.
  - Verify: `node server/index.js` starts cleanly on port 3001, and `curl http://localhost:3001/api/health` returns status 200.
  - Files: `server/index.js`

- [x] **Task 1.3: Create Automated Backend API Test Suite**
  - Acceptance: `server/test-api.js` executes end-to-end integration tests across all endpoints (health, invoices, portal payment, forecast, triage, NLP parser).
  - Verify: `node server/test-api.js` exits with code 0 and reports all assertions passed.
  - Files: `server/test-api.js`

---

## Phase 2: Fullstack Wireup & Development Tooling

- [x] **Task 2.1: Configure Vite Proxy & Concurrent Dev Scripts**
  - Acceptance: `vite.config.js` proxies `/api` requests to `http://localhost:3001`. `package.json` includes concurrent dev command `npm run dev` running both server and client.
  - Verify: `npm run dev` boots both Express and Vite without terminal crashes.
  - Files: `vite.config.js`, `package.json`

- [x] **Task 2.2: Build Unified API Client & Update Data Service**
  - Acceptance: `src/lib/api.js` provides typed fetch methods for all `/api` endpoints. `src/lib/dataService.js` routes all CRUD operations through the backend API with graceful local fallback.
  - Verify: Frontend successfully loads profile and invoice records from the running backend server.
  - Files: `src/lib/api.js`, `src/lib/dataService.js`

---

## Phase 3: Interactive Client Pay Portal & Settlement Engine

- [x] **Task 3.1: Build Client Portal Component (`ClientPortalModal.jsx`)**
  - Acceptance: Shows professional client-facing invoice view with studio branding, invoice number, status badge, line items table, and due date.
  - Verify: Clicking "View as Client" on any debtor card opens the portal modal with correct invoice data.
  - Files: `src/components/ClientPortalModal.jsx`

- [x] **Task 3.2: Implement Instant Payment Simulation & PDF Print Styles**
  - Acceptance: Clicking "Pay Now (Card/UPI/ACH)" calls `/api/portal/:id/pay`, marks invoice as paid, credits studio cash reserves, logs transaction, and displays success confetti/toast. Print button formats clean PDF layout.
  - Verify: Settling an invoice via Client Portal immediately updates top navbar cash balance and removes invoice from overdue cohorts.
  - Files: `src/components/ClientPortalModal.jsx`, `src/index.css`

---

## Phase 4: Operational Cockpit Refactor (Purging Landing Page Fluff)

- [x] **Task 4.1: Strip Cosmetic Landing Page Fluff from `App.jsx`**
  - Acceptance: Remove `OrbitalGalaxyBackground`, `InfiniteMarquee`, `HorizontalAccordions`, `ArtCraftPrinciples`, `HeroWordmark`, and `RightScrollRuler`.
  - Verify: No leftover broken imports or console errors; page loads cleanly without 3D canvas or marketing banners.
  - Files: `src/App.jsx`

- [x] **Task 4.2: Assemble High-Density Operational Cockpit Layout**
  - Acceptance: High-utility layout featuring:
    1. Header Telemetry Bar (cash balance, runway days, buffer health, backend connection badge `🟢 API Connected (Port 3001)`).
    2. Prescriptive Action Queue (surfaces immediate deficit warnings with 1-click solutions).
    3. Quick Inflow NLP Bar with 1-click service presets.
    4. Aging AR Radar ("Who owes me, how much, since when?") with direct triggers (Client Pay Portal, WhatsApp follow-up, Mark Paid, 50/50 Split).
    5. 30–90 Day Cash Horizon Radar with What-If scenario sliders.
    6. Outflows Ledger for fixed and flexible expenses.
  - Verify: Visual and responsive inspection confirms all 5 Problem Statement 1 core deliverables are front-and-center.
  - Files: `src/App.jsx`, `src/components/Navbar.jsx`, `src/components/DebtorCard.jsx`

---

## Phase 5: Verification & Production Readiness

- [x] **Task 5.1: Run Full Integration & Build Test Pipeline**
  - Acceptance: Backend test suite passes (`node server/test-api.js`), and frontend production build (`npm run build`) compiles with zero errors into `dist/`.
  - Verify: Build succeeds with code 0.
  - Files: `dist/`, `package.json`

- [x] **Task 5.2: Update Documentation & Pitch Walkthrough**
  - Acceptance: `README.md` documents architecture, concurrent startup commands, API endpoints, and a 3-minute hackathon judge evaluation script.
  - Verify: `README.md` is complete and formatted cleanly in Markdown.
  - Files: `README.md`
