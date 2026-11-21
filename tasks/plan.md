# Implementation Plan: StudioFlow — The One-Person Back Office

## Overview
StudioFlow is an intelligent, live-deployable web application tailored for freelance designers and creative consultants (1–5 person teams) that replaces notebooks and informal WhatsApp tracking with an automated working back office. It connects invoice creation to payment tracking with pre-drafted WhatsApp reminders, visualizes an accounts receivable aging dashboard ("Who owes me, how much, and since when?"), models dynamic 30–90 day cash forecasting, provides interactive "what-if" scenario sliders, and executes a dedicated "Bad Day" multi-default liquidity triage protocol. It features a Dual-Mode data architecture powered by Supabase Auth & PostgreSQL with a zero-friction local guest fallback for judging presentations.

## Architecture Decisions
1. **Dual-Mode Data Architecture:** The app seamlessly runs in **Cloud Mode** (when Supabase credentials exist and user logs in) or **Guest Demo Mode** (zero setup, pre-loaded with realistic designer data, persisted to `localStorage`). Hackathon judges never hit authentication walls or broken views.
2. **Interactive SVG Visualizations:** Cash forecasting is rendered using clean, responsive SVG coordinate mapping rather than bloated external charting engines, ensuring 60fps responsiveness during real-time "what-if" slider drags.
3. **Behavioral Lag vs Due-Date Forecasting:** Forecasts calculate expected cash inflows using each client's historical payment lag ($DueDate + \Delta_{delay}$) rather than nominal due dates, curing the "structural optimism" failure of legacy accounting apps.
4. **Assisted, Never Autonomous Communication:** Follow-ups are pre-drafted across 4 contextual cadences (friendly, due-today, firm, urgent) with 1-click WhatsApp deep links (`https://wa.me/{phone}?text=...`), giving the owner 100% human-in-the-loop control.

---

## Dependency Graph

```
Phase 1: Project Setup & Dual-Mode Foundations
  │
  ├── Tailwind & Vite Build Pipeline (Task 1)
  ├── Supabase Client & Data Service Layer (Task 2)
  └── Rich Mock Designer Dataset (Task 3)
        │
Phase 2: Invoicing & Aging AR Engine
  │
  ├── Global Navbar & Studio Runway Health Badge (Task 4)
  ├── "Who Owes Me" Aging AR Dashboard & Debtor Cards (Task 5)
  └── Invoicing Engine & Assisted WhatsApp Follow-up Modal (Task 6)
        │
Phase 3: 30–90 Day Cash Forecasting & "What-If" Simulator
  │
  ├── Dynamic 30-90 Day Cash Forecasting Engine & Visual Curve (Task 7)
  └── Interactive "What-If" Scenario Simulator & Shortfall Alerter (Task 8)
        │
Phase 4: Emergency Triage & Low-Friction Ingestion
  │
  ├── "🚨 Simulate Bad Day" Multi-Default Crisis Protocol (Task 9)
  ├── Natural Language Quick Ingestion Bar & Preset Templates (Task 10)
  └── Studio Outflows & Fixed/Flexible Bills Manager (Task 11)
        │
Phase 5: Auth & Deployment Polish
  │
  ├── Supabase Auth Modal & Guest Switcher (Task 12)
  └── Production Build Verification & Deployment Docs (Task 13)
```

---

## Task List

### Phase 1: Foundation & Data Layer
- [x] **Task 1:** Initialize Vite React App, Tailwind CSS, and Verification Pipeline
- [x] **Task 2:** Build Supabase Client & Dual-Mode Data Access Service (`dataService.js`)
- [x] **Task 3:** Assemble Rich Freelance Designer Dataset (`mockDesignerData.js`)
*Checkpoint: Foundation — `npm run build` succeeds, data service reads/writes locally and via Supabase. (COMPLETED)*

### Phase 2: Invoicing & Accounts Receivable Workflows
- [ ] **Task 4:** Build Global Navbar, Studio Header & Cash Runway Badge
- [ ] **Task 5:** Build "Who Owes Me, How Much, Since When?" Aging AR Dashboard
- [ ] **Task 6:** Build Invoicing Engine & Assisted WhatsApp Follow-up Modal
*Checkpoint: Core Invoicing — Invoices can be created, marked paid, and WhatsApp cadences launch.*

### Phase 3: 30–90 Day Cash Forecasting & "What-If" Simulation
- [ ] **Task 7:** Build Dynamic 30–90 Day Cash Flow Engine & Interactive SVG Chart
- [ ] **Task 8:** Build Interactive "What-If" Scenario Sliders & Deficit Warning System
*Checkpoint: Predictive Intelligence — Sliders dynamically update the 90-day curve and flag cash deficits.*

### Phase 4: Emergency Triage & Low-Friction Data Ingestion
- [ ] **Task 9:** Build "🚨 Simulate Bad Day" Multi-Default Crisis Protocol Modal
- [ ] **Task 10:** Build Natural Language Quick Ingestion Bar & Design Service Presets
- [ ] **Task 11:** Build Studio Outflows & Bills Manager (Figma, Adobe, Studio Rent)
*Checkpoint: Operational Completeness — End-to-end back office handles bad days and rapid entry.*

### Phase 5: Authentication & Production Deployment
- [ ] **Task 12:** Build Supabase Auth Modal & Demo Mode Switcher
- [ ] **Task 13:** Final Styling Polish, Production Build (`npm run build`), and Deployment Guide
*Checkpoint: Hackathon & Live Production Ready — Zero errors, deployable to Vercel/Netlify.*

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Missing Supabase Keys during Judge Demo** | High | Dual-mode data service detects missing credentials and transparently boots into Guest Demo mode with rich local data. |
| **WhatsApp Desktop Deep Link Restrictions** | Med | Generates standard `wa.me` links with fallback "Copy Drafted Message" button for email/Slack. |
| **Forecasting Glitches on Irregular Incomes** | Med | Applies behavioral lag adjustments ($DueDate + \Delta$) and separates fixed retainers from milestone deliverables. |
| **Over-complicated UI for Non-Financial Users** | High | Adheres to "3-second rule": big metrics, plain language labels, single-action buttons, zero accounting jargon. |

---

## Open Questions & Next Steps
- Human reviewed and approved intent in `docs/intent/one-person-backoffice.md`.
- Next action: Execute Phase 1 tasks starting with Task 1.
