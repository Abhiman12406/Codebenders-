-- ==============================================================================
-- STUDIOFLOW DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- The One-Person Back Office for Freelance Designers & Consultants
-- ==============================================================================

-- 1. Profiles Table (Cash Settings & Studio Preferences)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  business_name text default 'Aura Design Studio',
  owner_name text default 'Alex Morgan',
  currency text default '$',
  starting_cash numeric default 4850.00,
  safety_buffer numeric default 1500.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
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
  phone text, -- For WhatsApp direct deep links (e.g. +1234567890)
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
  is_flexible boolean default false, -- Can be safely deferred on a "Bad Day"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bills enable row level security;
create policy "Users can CRUD own bills" on public.bills for all using (auth.uid() = user_id);

-- 5. Follow-ups Log Table (Assisted Chasing Audit Trail)
create table if not exists public.follow_ups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  invoice_id uuid references public.invoices on delete cascade not null,
  tone text not null, -- 'friendly', 'due_today', 'firm', 'urgent'
  channel text default 'whatsapp', -- 'whatsapp', 'email'
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.follow_ups enable row level security;
create policy "Users can CRUD own follow_ups" on public.follow_ups for all using (auth.uid() = user_id);
