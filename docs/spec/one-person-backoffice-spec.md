# Technical Specification: StudioFlow — The One-Person Back Office

**Project Name:** StudioFlow  
**Target User:** Freelance Designers, Creative Directors & Solo Consultants (1–5 person teams)  
**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide Icons, Supabase JS (`@supabase/supabase-js`)  
**Deployment Target:** Vercel / Netlify / GitHub Pages (Zero-config static build with client-side Supabase connection)  

---

## 1. System Architecture & Dual-Mode Strategy

To guarantee that the app is **both production-ready with persistent cloud storage** AND **100% fail-safe during live hackathon judging**, StudioFlow implements a **Dual-Mode Data Layer**:

```
+---------------------------------------------------------------------------------+
|                                 STUDIOFLOW UI                                   |
|   (Dashboard, Aging AR, 90-Day Forecaster, Invoicing, Bad Day Triage, NLP Bar) |
+---------------------------------------------------------------------------------+
                                         |
                                         v
                         +-------------------------------+
                         |      Data Access Service      |
                         +-------------------------------+
                                  /             \
       [Supabase Configured & Logged In]       [No Supabase / Guest Demo Mode]
                                /                 \
                               v                   v
                   +-----------------------+   +-----------------------+
                   |  Supabase PostgreSQL  |   |  LocalStorage Cache   |
                   |   + RLS Cloud Sync    |   |  + Rich Sample Data   |
                   +-----------------------+   +-----------------------+
```

1. **Cloud Mode (Supabase):**
   - Active when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided and user is authenticated.
   - All mutations sync directly to PostgreSQL tables protected by Row Level Security (RLS).
2. **Guest / Demo Mode (Fail-Safe Hackathon Mode):**
   - Active if environment variables are not set or user clicks **"Explore as Guest"**.
   - Pre-loads rich, realistic freelance designer data (Acme Studio brand redesign, Nike 3D assets, Figma design system retainer, Adobe & Figma subscriptions, Co-working studio rent).
   - All edits persist in browser `localStorage`.
   - Never crashes on missing keys or network issues.

---

## 2. Supabase Database Schema (`supabase_schema.sql`)

```sql
-- 1. Profiles Table (Cash Settings & Studio Preferences)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  business_name text default 'My Design Studio',
  owner_name text default 'Creative Director',
  currency text default '$',
  starting_cash numeric default 4500.00,
  safety_buffer numeric default 1500.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. Clients Table
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  company text,
  email text,
  phone text, -- For WhatsApp direct deep links
  payment_behavior text default 'reliable', -- 'fast', 'reliable', 'habitual_late', 'chronic_risk'
  avg_delay_days integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.clients enable row level security;
create policy "Users can CRUD own clients" on public.clients for all using (auth.uid() = user_id);

-- 3. Invoices Table (Accounts Receivable)
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  client_name text not null,
  client_phone text,
  invoice_number text not null,
  project_title text not null,
  amount numeric not null,
  issue_date date not null,
  due_date date not null,
  paid_date date,
  status text default 'sent', -- 'draft', 'sent', 'viewed', 'overdue', 'paid'
  items jsonb default '[]'::jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.invoices enable row level security;
create policy "Users can CRUD own invoices" on public.invoices for all using (auth.uid() = user_id);

-- 4. Bills / Outflows Table (Fixed & Variable Expenses)
create table if not exists public.bills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text default 'software', -- 'software', 'rent', 'contractor', 'tax', 'utilities'
  amount numeric not null,
  due_day integer not null, -- Day of month (1-31)
  frequency text default 'monthly', -- 'monthly', 'quarterly', 'one_time'
  is_flexible boolean default false, -- Can be deferred on a "Bad Day"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bills enable row level security;
create policy "Users can CRUD own bills" on public.bills for all using (auth.uid() = user_id);

-- 5. Follow-ups Log
create table if not exists public.follow_ups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  invoice_id uuid references public.invoices on delete cascade not null,
  tone text not null, -- 'friendly', 'polite_checkin', 'firm', 'urgent'
  channel text default 'whatsapp', -- 'whatsapp', 'email'
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.follow_ups enable row level security;
create policy "Users can view own follow_ups" on public.follow_ups for all using (auth.uid() = user_id);
```

---

## 3. Mathematical Cash Forecasting & "What-If" Engine

### Baseline Forecast Formula:
For each day $d \in [1, 90]$ starting from today:

$$\text{Balance}(d) = \text{Balance}(d-1) + \sum \text{Inflows}(d) - \sum \text{Outflows}(d)$$

Where:
- $\text{Inflows}(d) = \sum \{ \text{inv.amount} \mid \text{adjusted\_due\_date}(inv) == d \text{ and } inv.status \neq 'paid' \}$
- $\text{Outflows}(d) = \sum \{ \text{bill.amount} \mid \text{bill\_due\_date}(bill) == d \}$

### Behavioral Adjustment (The "Structural Optimism" Fix):
Rather than trusting contractual `due_date`, the system computes:
$$\text{adjusted\_due\_date}(inv) = inv.due\_date + client.avg\_delay\_days$$

### What-If Scenario Overrides:
1. **Scenario 1: Key Client Delay Slider:**
   - User moves slider: *Acme Corp ($3,500) pays $+N$ days late*.
   - Invoice arrival date shifts by $N$ days.
   - If minimum balance in next 30 days falls below $\text{Safety Buffer}$, alert triggers: *"Liquidity Dip: Rent on Day 25 creates -$420 cash deficit. Action: Chase invoice #104 today."*
2. **Scenario 2: The "Bad Day" Multi-Default Crisis (5 Clients Late):**
   - Injects 30-day delay onto all currently pending invoices.
   - Activates **Liquidity Triage Protocol**.
3. **Scenario 3: Capital Expenditure / Tool Purchase:**
   - Simulates spending $1,200 on Day $K$. Recalculates runway depth.

---

## 4. Feature Specifications

### A. Frictionless Data Entry (Natural Language Parser)
Solo designers hate navigating 10-field forms. StudioFlow includes a top command bar with an intelligent parser:
- **Input:** *"Billed Nike brand redesign $3,200 due next Friday"*
- **Regex/Parser Output:**
  - `client_name`: "Nike"
  - `project_title`: "brand redesign"
  - `amount`: 3200
  - `due_date`: Calculated relative to "next Friday"
- Also includes a 1-click **"Quick Add Presets"** for common design packages:
  - *Brand Identity System ($2,500 - 50% upfront)*
  - *Figma UI/UX Sprint ($1,800 - Net 15)*
  - *Monthly Design Retainer ($1,500 - Monthly)*

### B. "Who Owes Me, How Much, Since When?" (Aging AR Dashboard)
- **Top Metrics:** Total Outstanding AR, Overdue Balance, Avg Collection Days (DSO), Safe Runway Days.
- **Aging Cohorts:**
  - **Current (0–15 days remaining):** Status "On Track".
  - **Grace (16–30 days):** Status "Payment Expected".
  - **Overdue 1–15 days:** Status "Friendly Nudge Ready".
  - **Overdue 16–30 days:** Status "Firm Chase Needed".
  - **Overdue 30+ days (Critical):** Status "Stop Work / Call Client".
- **Debtor Card Actions:**
  - One-tap WhatsApp button with pre-filled dynamic message text.
  - One-tap "Mark Paid" (triggers celebration & instant forecast recalibration).
  - One-tap "Offer Payment Plan" (split into two payments).

### C. Assisted Follow-Ups (WhatsApp-First)
The app uses direct `https://wa.me/{phone}?text={encoded_message}` deep links:
- **Friendly Reminder (Due -2 days):**
  > "Hi [Name]! Hope you're having a great week. Just sharing a friendly heads-up that invoice #[Number] ($[Amount]) for [Project] is due on [Date]. You can view/settle it here: [Payment Link]. Thanks!"
- **Due Date Ping (Day 0):**
  > "Hi [Name], invoice #[Number] ($[Amount]) is due today. Let me know if you need any adjustments or bank details. Thank you!"
- **Firm Follow-Up (Day +7 Overdue):**
  > "Hi [Name], checking in regarding invoice #[Number] ($[Amount]) which was due on [Date]. Please let me know when payment will be processed so we can keep upcoming design deliverables on schedule."
- **Urgent Action (Day +15 Overdue):**
  > "Hi [Name], invoice #[Number] is now 15 days overdue. To prevent pausing production on the current milestones, please clear the balance today: [Link]."

### D. The "Bad Day" Crisis Triage Protocol
When the owner clicks **"🚨 Simulate Bad Day"**:
1. Five clients default concurrently.
2. System identifies the exact date and magnitude of the cash deficit (e.g., Shortfall of -$650 on Day 22 when Studio Rent is due).
3. System outputs an **Executive Action Plan**:
   - **Triage 1 (Quick Cash):** 2 small invoices ($300, $450) targeted with a "Pay Today for 5% discount" WhatsApp nudge.
   - **Triage 2 (The Anchor):** Key client ($2,800) targeted with a 50% upfront split-payment request ($1,400 today).
   - **Triage 3 (Cost Preservation):** Recommends pausing flexible expenses (pausing $200 3D cloud rendering subscription & requesting 1-week grace period on studio rent).

---

## 5. UI Component Structure

```
src/
├── components/
│   ├── Navbar.jsx               # Studio branding, Runway badge, Auth/Guest modal, Bad Day Toggle
│   ├── QuickInputBar.jsx        # Natural language invoice parser & preset buttons
│   ├── AgingDashboard.jsx       # "Who owes me, how much, since when?" + 4 aging buckets
│   ├── CashForecastChart.jsx    # SVG 30/60/90-day interactive curve + buffer line + deficit zones
│   ├── WhatIfSimulator.jsx      # Sliders: Client delay, Bad Day toggle, CapEx expense test
│   ├── InvoiceModal.jsx         # Create/Edit invoice form with line items
│   ├── WhatsAppModal.jsx        # Assisted follow-up generator with 4 tone cadences & 1-click wa.me
│   ├── BadDayTriageModal.jsx    # Emergency protocol step-by-step liquidity recovery plan
│   └── OutflowsManager.jsx      # Designer subscriptions (Figma, Adobe, Rent) & flexibility toggles
├── data/
│   └── mockDesignerData.js      # Rich pre-loaded freelance designer demo data
├── lib/
│   ├── supabaseClient.js        # Supabase client with graceful fallback
│   └── dataService.js           # Unified CRUD router (Supabase if auth, LocalStorage if guest)
├── App.jsx                      # Main orchestrator & state manager
├── index.css                    # Tailwind CSS definitions
└── main.jsx                     # Application entry point
```

---

## 6. Verification & Acceptance Checklist

- [x] Tested with `npm run build` with zero compiler errors.
- [x] Runs seamlessly in Guest Mode without any environment variables.
- [x] Connects to Supabase seamlessly when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided.
- [x] All 5 requirements from Problem Statement 1 explicitly addressed and interactive.
- [x] Live deployable to Vercel/Netlify with standard static output.
