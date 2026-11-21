# Task List: StudioFlow — The One-Person Back Office

## Phase 1: Foundation & Data Layer

### Task 1: Initialize Vite React App, Tailwind CSS, and Verification Pipeline
**Description:** Configure Tailwind CSS, PostCSS, Vite configuration, and core project structure in the repository, and verify the build pipeline executes cleanly with zero warnings.
**Acceptance criteria:**
- [x] `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, and `src/index.css` configured.
- [x] `npm run build` compiles with code 0.
**Verification:**
- [x] Build succeeds: `npm run build`
**Dependencies:** None
**Files likely touched:**
- `package.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `index.html`
- `src/index.css`
**Estimated scope:** Small (1-2 files new/config)

---

### Task 2: Build Supabase Client & Dual-Mode Data Access Service (`dataService.js`)
**Description:** Create the unified data service that handles CRUD for profile, clients, invoices, bills, and follow-ups. If user is logged into Supabase, it syncs with PostgreSQL; otherwise, it persists to `localStorage` with zero crash risk.
**Acceptance criteria:**
- [x] `src/lib/supabaseClient.js` safely initializes with or without `.env` keys.
- [x] `src/lib/dataService.js` provides `getProfile()`, `getInvoices()`, `createInvoice()`, `markPaid()`, `getBills()`, `saveBill()`, and `logFollowUp()`.
- [x] State mutations update both memory/localStorage and Supabase if connected.
**Verification:**
- [x] Script test: Data service loads and performs CRUD without throwing errors.
**Dependencies:** Task 1
**Files likely touched:**
- `src/lib/supabaseClient.js`
- `src/lib/dataService.js`
**Estimated scope:** Medium (2-3 files)

---

### Task 3: Assemble Rich Freelance Designer Dataset (`mockDesignerData.js`)
**Description:** Create authentic seed data reflecting a realistic solo freelance designer / creative consultant: 5 active clients, 7 invoices across current/overdue buckets, and realistic monthly studio expenses (Adobe CC, Figma, Co-working rent, 3D render farm).
**Acceptance criteria:**
- [x] 5 diverse clients (Acme Studios, Horizon Tech, Bloom Botanicals, Nova Fintech, Local Artisan).
- [x] Invoices covering: Current (0–15d), Due Today, Overdue (12 days, 34 days, 62 days).
- [x] Fixed and flexible bills with assigned due days.
**Verification:**
- [x] Import test verifies data shape matches database schema types.
**Dependencies:** Task 2
**Files likely touched:**
- `src/data/mockDesignerData.js`
**Estimated scope:** Small (1 file)

---

## Checkpoint: Foundation
- [x] All foundational configs in place
- [x] `npm run build` passes
- [x] Data service reads and writes properly

---

## Phase 2: Invoicing & Accounts Receivable Workflows

### Task 4: Build Global Navbar, Studio Header & Cash Runway Badge
**Description:** Create the navigation header showing studio branding, current cash balance, calculated runway in days (e.g. "48 Days Safe"), mode badge ("Cloud Synced" vs "Guest Demo"), and the prominent "🚨 Simulate Bad Day" trigger.
**Acceptance criteria:**
- [x] Displays studio name, cash balance, and dynamic runway health indicator.
- [x] Includes "New Invoice" CTA and "Simulate Bad Day" quick toggle.
- [x] Responsive on desktop, tablet, and mobile.
**Verification:**
- [x] Visual check of navbar render and responsive collapse.
**Dependencies:** Task 1, 3
**Files likely touched:**
- `src/components/Navbar.jsx`
- `src/App.jsx`
**Estimated scope:** Small (1-2 files)

---

### Task 5: Build "Who Owes Me, How Much, Since When?" Aging AR Dashboard
**Description:** Build the accounts receivable aging dashboard with top-line summary cards (Total Owed, Critical Overdue, Average DSO) and 4 interactive aging cohorts (Current 0-15d, Grace 16-30d, Overdue 31-60d, Severe 60d+), with direct action triggers on each debtor card.
**Acceptance criteria:**
- [x] Directly answers "Who owes me, how much, and since when?".
- [x] Debtor cards display client name, project title, amount, days overdue, and client reliability tag.
- [x] Direct action buttons on each card: "Chase on WhatsApp", "Mark as Paid", "Split Payment".
**Verification:**
- [x] Manual check: Marking an invoice as paid immediately updates AR total and removes it from overdue cohort.
**Dependencies:** Task 4
**Files likely touched:**
- `src/components/AgingDashboard.jsx`
- `src/components/DebtorCard.jsx`
**Estimated scope:** Medium (2-3 files)

---

### Task 6: Build Invoicing Engine & Assisted WhatsApp Follow-up Modal
**Description:** Build the invoice creation modal and the assisted WhatsApp follow-up generator featuring 4 pre-drafted emotional cadences (Friendly, Due Today, Firm, Urgent) and 1-click `wa.me` launch.
**Acceptance criteria:**
- [x] Invoice creation modal with project name, client selection/creation, amount, due date, and line items.
- [x] Assisted follow-up modal generates custom WhatsApp message based on days overdue.
- [x] "Send via WhatsApp" button opens `https://wa.me/{phone}?text={encoded}` with copy-to-clipboard fallback.
**Verification:**
- [x] Verify `wa.me` URL encodes message and opens WhatsApp Web/app correctly.
**Dependencies:** Task 5
**Files likely touched:**
- `src/components/InvoiceModal.jsx`
- `src/components/WhatsAppModal.jsx`
**Estimated scope:** Medium (2-3 files)

---

## Checkpoint: Core Invoicing Workflows
- [x] Invoice creation flow works end-to-end
- [x] Invoices reflect in Aging Dashboard immediately
- [x] Assisted WhatsApp follow-ups generate realistic text and working deep links

---

## Phase 3: 30–90 Day Cash Forecasting & "What-If" Simulation

### Task 7: Build Dynamic 30–90 Day Cash Flow Engine & Interactive SVG Chart
**Description:** Build the rolling 30, 60, and 90-day cash projection engine that combines invoice inflows (adjusted by client payment behavior) against upcoming fixed and recurring expenses, rendered on an interactive SVG chart with safe buffer line and deficit zones.
**Acceptance criteria:**
- [ ] Calculates rolling daily cash balance for 30, 60, and 90-day horizons.
- [ ] Interactive SVG chart shows historical trend + forecasted curve.
- [ ] Highlights safe cash buffer line ($1,500) and paints deficit areas in warning red.
- [ ] Hover tooltips reveal daily cash breakdown (expected inflows vs bills due).
**Verification:**
- [ ] Verify cash projection changes when toggle is switched between 30, 60, and 90 days.
**Dependencies:** Task 5
**Files likely touched:**
- `src/components/CashForecastChart.jsx`
- `src/lib/forecastEngine.js`
**Estimated scope:** Medium (2 files)

---

### Task 8: Build Interactive "What-If" Scenario Sliders & Deficit Warning System
**Description:** Build the scenario planning controls allowing the designer to simulate "Key Client Pays 15 Days Late", "New Studio Hardware Purchase ($1,200 CapEx)", and custom delay sliders, immediately recalibrating the forecast curve and surfacing clear next actions.
**Acceptance criteria:**
- [ ] Interactive slider: "Key Client (Acme Studio - $3,500) pays +N days late" (0 to 45 days).
- [ ] CapEx toggle: "Simulate purchasing M4 MacBook ($1,800) on Day 14".
- [ ] Live warning banner triggers if cash balance drops below buffer: *"⚠️ Cash Deficit Alert: -$420 shortfall on Day 24. Action: Chase invoice #104 today."*
**Verification:**
- [ ] Dragging the slider past Day 15 visually causes the cash curve to dip and displays the deficit alert.
**Dependencies:** Task 7
**Files likely touched:**
- `src/components/WhatIfSimulator.jsx`
- `src/App.jsx`
**Estimated scope:** Medium (2 files)

---

## Checkpoint: Predictive Cash & Scenario Simulation
- [ ] Cash forecast renders accurately across 30, 60, 90 days
- [ ] What-If sliders update the chart in real time without lag
- [ ] Actionable alert displays specific next step to resolve the deficit

---

## Phase 4: Emergency Triage & Low-Friction Data Ingestion

### Task 9: Build "🚨 Simulate Bad Day" Multi-Default Crisis Protocol Modal
**Description:** Implement the answer to Problem Statement 1's core question: "What does the owner do on a bad day, when five customers are late at once?". A one-click crisis simulation that triggers automated liquidity triage and a step-by-step recovery plan.
**Acceptance criteria:**
- [ ] "Simulate Bad Day" trigger instantly delays 5 pending client payments.
- [ ] Modal calculates immediate shortfall before next rent/payroll cycle.
- [ ] Generates a 3-tier action plan:
  - Tier 1: Quick-cash WhatsApp discounts on small balances.
  - Tier 2: 50% split-payment request for anchor client.
  - Tier 3: Outflow preservation (one-click deferral of flexible software bills).
**Verification:**
- [ ] Triggering Bad Day updates AR to critical state and opens the Triage action plan.
**Dependencies:** Task 8
**Files likely touched:**
- `src/components/BadDayTriageModal.jsx`
- `src/App.jsx`
**Estimated scope:** Medium (2 files)

---

### Task 10: Build Natural Language Quick Ingestion Bar & Design Service Presets
**Description:** Implement the answer to "What is the minimum data an owner will actually enter, and how can it get in with least effort?". A smart command bar that parses plain English invoice descriptions plus 1-click design service presets.
**Acceptance criteria:**
- [ ] Natural language input parsing: e.g. *"Billed Nike brand design $3,200 due next Friday"* automatically extracts client, project, amount, and due date.
- [ ] Quick-add preset chips: "Brand Identity ($2,500)", "Figma UI Sprint ($1,800)", "Monthly Retainer ($1,500)".
- [ ] Invoice draft appears instantly with 1-click confirmation.
**Verification:**
- [ ] Typing natural language string creates invoice correctly without filling a multi-page form.
**Dependencies:** Task 6
**Files likely touched:**
- `src/components/QuickInputBar.jsx`
- `src/lib/nlpParser.js`
**Estimated scope:** Small to Medium (2 files)

---

### Task 11: Build Studio Outflows & Bills Manager (Figma, Adobe, Studio Rent)
**Description:** Build the bills and expenses panel allowing the designer to review and manage fixed overhead (Figma, Adobe Creative Cloud, Studio Co-working rent, taxes, contractor payouts) with a toggle for "Is Flexible" (can be delayed during cash crunches).
**Acceptance criteria:**
- [ ] List of recurring studio expenses categorized by Software, Rent, Tax, and Contractor.
- [ ] Toggle to mark expenses as "Flexible" vs "Non-Negotiable".
- [ ] Quick add bill form.
**Verification:**
- [ ] Adding or toggling a bill updates the 90-day cash forecast immediately.
**Dependencies:** Task 7
**Files likely touched:**
- `src/components/OutflowsManager.jsx`
**Estimated scope:** Small (1-2 files)

---

## Checkpoint: Operational Completeness
- [ ] "Bad Day" protocol runs smoothly with full recovery roadmap
- [ ] Natural language prompt bar creates invoices in under 3 seconds
- [ ] Outflows manager updates runway projections seamlessly

---

## Phase 5: Authentication & Production Deployment

### Task 12: Build Supabase Auth Modal & Demo Mode Switcher
**Description:** Create the authentication modal with email/password login and signup, session persistence, and an explicit "Continue as Guest / Reset Demo Data" button.
**Acceptance criteria:**
- [ ] Clean Supabase Auth modal for login and signup.
- [ ] Clear status indicator in navbar: "🟢 Supabase Cloud Connected" vs "⚡ Guest Demo Mode".
- [ ] "Reset Demo Data" button to restore pristine demo state for multiple pitch presentations.
**Verification:**
- [ ] Logging in connects to Supabase; logging out or clicking Guest seamlessly runs local mode.
**Dependencies:** Task 2, 4
**Files likely touched:**
- `src/components/AuthModal.jsx`
- `src/App.jsx`
**Estimated scope:** Small (1-2 files)

---

### Task 13: Final Styling Polish, Production Build, and Deployment Guide
**Description:** Perform thorough visual audit, ensure responsive design, run production build (`npm run build`), and generate `README.md` with live deployment instructions (Vercel, Netlify) and hackathon judge pitch script.
**Acceptance criteria:**
- [ ] `npm run build` generates optimized static bundle in `dist/` with 0 errors.
- [ ] `README.md` contains 3-minute pitch walkthrough, live deployment instructions, and environment variable documentation.
**Verification:**
- [ ] Production build succeeds and preview runs without console errors.
**Dependencies:** Tasks 1-12
**Files likely touched:**
- `README.md`
- `src/App.jsx`
- `src/index.css`
**Estimated scope:** Small (2 files)

---

## Final Checkpoint: Hackathon Ready
- [ ] All 13 tasks completed and verified
- [ ] All 5 requirements from Problem Statement 1 working and tested
- [ ] Production build passing
- [ ] Ready for live deployment
