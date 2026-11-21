# Statement of Intent: The One-Person Back Office (StudioFlow)

**Status:** CONFIRMED  
**Target Persona:** Freelance Designers, Creative Directors & Solo Consultants (1–5 person teams)  
**Deliverable Modality:** Live-Deployable Web Application (React + Vite + Tailwind CSS + Supabase)  

---

## 1. Core Intent

- **Outcome:** A full-stack-ready, live-deployable web application ("StudioFlow - The One-Person Back Office") powered by **Supabase (Authentication & PostgreSQL Database)**, with an instant "Try Demo / Guest" bypass so hackathon judges can experience every feature immediately without a mandatory login.
- **User:** Solo freelance designers, studio leads, and independent creative consultants (1–5 person teams) who run their business on WhatsApp and spreadsheets with no accounting staff.
- **Why Now:** Small businesses rarely fail from a lack of clients; they fail because client payments arrive late while software subscriptions, contractor fees, and studio rent arrive on time.
- **Success Criteria:**
  1. **Authentication & Persistence:** Secure user signup/login via Supabase Auth with Row Level Security (RLS) storing invoices, clients, and expenses; seamless fallback to pre-loaded sample designer data when running in guest/demo mode.
  2. **Invoicing & Assisted Follow-Up:** Complete flow from creating design invoices to tracking payment status with pre-drafted, 1-click WhatsApp follow-ups (`wa.me` links) across polite, firm, and urgent cadences.
  3. **Aging Accounts Receivable Dashboard:** An intuitive view answering *"Who owes me, how much, and since when?"* segmented across 0–15d, 16–30d, 31–60d, and 60d+ cohorts.
  4. **Dynamic 30–90 Day Cash Forecasting:** Visual timeline projecting invoice receivables against fixed outflows (Figma, Adobe Creative Cloud, Co-working rent, taxes).
  5. **Interactive "What-If" Engine:** Real-time sliders to simulate payment shocks (e.g., key client paying 15 days late) with automated shortfall dates and alerts.
  6. **"Bad Day" Liquidity Triage:** Dedicated one-click emergency mode for when 5 clients default simultaneously, generating a prioritized recovery plan (quick-win nudges, anchor client split-payment offers, non-critical bill deferrals).
  7. **Frictionless Data Ingestion:** Quick prompt bar supporting natural language input (e.g., *"Billed Nike brand design $3,200 due next Friday"*).
- **Constraint:** Must be live-deployable to Vercel/Netlify with clean environment variable handling, zero runtime crashes if variables are omitted, and include a copy-pasteable `supabase_schema.sql` file.
- **Out of Scope:** Complex double-entry ledger bookkeeping, full tax filing portals, and external banking API integrations (Plaid/Yodlee).
