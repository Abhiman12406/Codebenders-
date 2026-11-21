import React, { useState, useMemo } from 'react';
import DebtorCard from './DebtorCard.jsx';
import { 
  DollarSign, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Filter, 
  Search,
  CheckCircle,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

export default function AgingDashboard({
  invoices = [],
  clients = [],
  currency = '$',
  onChaseWhatsApp,
  onMarkPaid,
  onSplitPayment,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'current', 'grace', 'overdue', 'severe', 'paid'
  const [searchQuery, setSearchQuery] = useState('');

  // Client map by ID for instant O(1) lookup
  const clientMap = useMemo(() => {
    const map = new Map();
    clients.forEach((c) => {
      map.set(c.id, c);
      if (c.name) map.set(c.name.toLowerCase(), c);
    });
    return map;
  }, [clients]);

  // Categorize invoices into 4 aging cohorts
  const {
    totalOwed,
    criticalOverdueAmount,
    overdueCount,
    avgDSO,
    cohorts,
    filteredInvoices,
  } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let owed = 0;
    let critical = 0;
    let overdueNum = 0;
    let totalDelaySum = 0;
    let delayCount = 0;

    const currentCohort = [];
    const graceCohort = [];
    const overdueCohort = [];
    const severeCohort = [];
    const paidCohort = [];

    invoices.forEach((inv) => {
      const amt = Number(inv.amount) || 0;
      const isPaid = inv.status === 'paid';

      if (isPaid) {
        paidCohort.push(inv);
        return;
      }

      owed += amt;

      const dueDate = new Date(inv.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - dueDate) / (1000 * 60 * 60 * 24));

      // Overdue stats
      if (diffDays > 0) {
        overdueNum += 1;
        totalDelaySum += diffDays;
        delayCount += 1;
      }

      if (diffDays >= 60) {
        critical += amt;
        severeCohort.push({ ...inv, diffDays });
      } else if (diffDays >= 16) {
        overdueCohort.push({ ...inv, diffDays });
      } else if (diffDays >= 0) {
        // Due today or 1-15 days overdue (Grace window)
        graceCohort.push({ ...inv, diffDays });
      } else {
        // Future due (diffDays < 0)
        currentCohort.push({ ...inv, diffDays });
      }
    });

    const averageDSO = delayCount > 0 ? Math.round(totalDelaySum / delayCount) : 12;

    const cohortsData = {
      current: currentCohort,
      grace: graceCohort,
      overdue: overdueCohort,
      severe: severeCohort,
      paid: paidCohort,
    };

    // Filter by active tab & search
    let list = [];
    if (activeTab === 'all') {
      list = [...currentCohort, ...graceCohort, ...overdueCohort, ...severeCohort];
    } else if (activeTab === 'paid') {
      list = paidCohort;
    } else {
      list = cohortsData[activeTab] || [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.client_name?.toLowerCase().includes(q) ||
          i.project_title?.toLowerCase().includes(q) ||
          i.invoice_number?.toLowerCase().includes(q)
      );
    }

    return {
      totalOwed: owed,
      criticalOverdueAmount: critical,
      overdueCount: overdueNum,
      avgDSO: averageDSO,
      cohorts: cohortsData,
      filteredInvoices: list,
    };
  }, [invoices, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Who Owes Me, How Much, Since When?
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time accounts receivable aging cohorts and one-tap payment chase triggers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search client, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Top Line Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Owed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Owed (AR)</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {currency}{totalOwed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <span className="text-slate-300 font-medium">
              {invoices.filter((i) => i.status !== 'paid').length} active invoices
            </span>
            <span>across {clients.length} clients</span>
          </div>
        </div>

        {/* Critical Overdue */}
        <div className="bg-slate-900/90 border border-rose-950/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Critical Overdue</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 tracking-tight">
            {currency}{criticalOverdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-rose-300/80 mt-1.5">
            {cohorts.severe.length} invoice(s) past 60+ days
          </div>
        </div>

        {/* Overdue Count */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Requiring Chase</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 tracking-tight">
            {overdueCount} Invoices
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Past due date, immediate action recommended
          </div>
        </div>

        {/* Average DSO / Collection Lag */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average DSO</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {avgDSO} Days
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            Avg payment turnaround for design clients
          </div>
        </div>

      </div>

      {/* Cohort Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Active ({cohorts.current.length + cohorts.grace.length + cohorts.overdue.length + cohorts.severe.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'current'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Current (0–15d)</span>
            <span className="text-[11px] opacity-75">({cohorts.current.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grace')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'grace'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>Grace / Due (16–30d)</span>
            <span className="text-[11px] opacity-75">({cohorts.grace.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'overdue'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Overdue (31–60d)</span>
            <span className="text-[11px] opacity-75">({cohorts.overdue.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('severe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'severe'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Severe (60d+)</span>
            <span className="text-[11px] opacity-75">({cohorts.severe.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'paid'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Settled / Paid</span>
            <span className="text-[11px] opacity-75">({cohorts.paid.length})</span>
          </button>

        </div>

        {/* Tab Status Subtext */}
        <div className="text-xs text-slate-400 hidden sm:block">
          Showing {filteredInvoices.length} invoices
        </div>
      </div>

      {/* Invoices List / Grid */}
      {filteredInvoices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((inv) => {
            const client = clientMap.get(inv.client_id) || clientMap.get(inv.client_name?.toLowerCase());
            return (
              <DebtorCard
                key={inv.id}
                invoice={inv}
                client={client}
                currency={currency}
                onChaseWhatsApp={onChaseWhatsApp}
                onMarkPaid={onMarkPaid}
                onSplitPayment={onSplitPayment}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl py-14 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No invoices in this cohort</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No invoices matched "${searchQuery}". Clear your search query.`
              : 'All invoices in this cohort have been settled or none currently match.'}
          </p>
        </div>
      )}

    </div>
  );
}
