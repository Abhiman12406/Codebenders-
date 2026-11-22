import React, { useState, useMemo } from 'react';
import DebtorCard from './DebtorCard.jsx';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Search,
  CheckCircle,
  MessageSquare,
  Split,
  BarChart3
} from 'lucide-react';
import { getDaysDiff } from '../lib/dateUtils.js';

export default function AgingDashboard({
  invoices = [],
  clients = [],
  currency = '$',
  onChaseWhatsApp,
  onMarkPaid,
  onSplitPayment,
  onViewAsClient,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'current', 'grace', 'overdue', 'severe', 'paid'
  const [searchQuery, setSearchQuery] = useState('');

  // Client map by ID for instant O(1) lookup
  const clientMap = useMemo(() => {
    const map = new Map();
    clients.forEach((c) => {
      if (c && c.id) map.set(c.id, c);
    });
    return map;
  }, [clients]);

  // Aggregate stats & cohorts
  const {
    totalOwed,
    criticalOverdueAmount,
    overdueCount,
    avgDSO,
    cohorts,
    filteredInvoices,
  } = useMemo(() => {
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

      if (inv.status === 'paid') {
        paidCohort.push(inv);
        return;
      }

      owed += amt;

      const diffDays = getDaysDiff(inv.due_date);

      // Overdue stats
      if (diffDays > 0) {
        overdueNum += 1;
        totalDelaySum += diffDays;
        delayCount += 1;
      }

      // Cohort buckets by days overdue
      if (diffDays >= 60) {
        critical += amt;
        severeCohort.push({ ...inv, diffDays });
      } else if (diffDays >= 31) {
        overdueCohort.push({ ...inv, diffDays });
      } else if (diffDays >= 16) {
        graceCohort.push({ ...inv, diffDays });
      } else {
        currentCohort.push({ ...inv, diffDays });
      }
    });

    const averageDSO = delayCount > 0 ? Math.round(totalDelaySum / delayCount) : 0;

    const cohortsData = {
      current: currentCohort,
      grace: graceCohort,
      overdue: overdueCohort,
      severe: severeCohort,
      paid: paidCohort,
    };

    // Filter by active tab & search query
    let list = [];
    if (activeTab === 'all') {
      list = [...currentCohort, ...graceCohort, ...overdueCohort, ...severeCohort];
    } else {
      list = cohortsData[activeTab] || [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((inv) => {
        const client = clientMap.get(inv.client_id);
        const nameMatch = (inv.client_name || client?.name || '').toLowerCase().includes(q);
        const projectMatch = (inv.project_title || '').toLowerCase().includes(q);
        const numMatch = (inv.invoice_number || '').toLowerCase().includes(q);
        return nameMatch || projectMatch || numMatch;
      });
    }

    return {
      totalOwed: owed,
      criticalOverdueAmount: critical,
      overdueCount: overdueNum,
      avgDSO: averageDSO,
      cohorts: cohortsData,
      filteredInvoices: list,
    };
  }, [invoices, activeTab, searchQuery, clientMap]);

  // Cohort totals calculation for gauges
  const cohortMetrics = useMemo(() => {
    const sum = (items) => items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    return {
      current: { count: cohorts.current.length, amount: sum(cohorts.current) },
      grace: { count: cohorts.grace.length, amount: sum(cohorts.grace) },
      overdue: { count: cohorts.overdue.length, amount: sum(cohorts.overdue) },
      severe: { count: cohorts.severe.length, amount: sum(cohorts.severe) },
    };
  }, [cohorts]);

  // Find worst delinquent invoice for quick chase
  const primaryOverdueInvoice = useMemo(() => {
    return cohorts.severe[0] || cohorts.overdue[0] || cohorts.grace[0] || null;
  }, [cohorts]);

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2A2A30] pb-5">
        <div>
          <div className="text-[11px] font-bold text-[#675DFC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#675DFC]" />
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Accounts Receivable Radar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Receivables Aging Cohorts
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Real-time aging distribution, debtor delinquency analysis, and instant liquidity recovery triggers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter client, project, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#141417] border border-[#2D2D35] focus:border-[#675DFC] rounded-full text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Cohort Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 1. Current (0–15d) */}
        <div 
          onClick={() => setActiveTab('current')}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 flex flex-col justify-between ${
            activeTab === 'current'
              ? 'bg-[#212126] border-[#10B981] shadow-lg shadow-[#10B981]/15 scale-[1.01]'
              : 'bg-[#18181B] border-[#2A2A30] hover:border-[#10B981]/50 hover:bg-[#1E1E22]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Current (0–15d)</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {cohortMetrics.current.count}
            </span>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {currency}{cohortMetrics.current.amount.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Due next 15 days</div>
          </div>
        </div>

        {/* 2. Grace (16–30d) */}
        <div 
          onClick={() => setActiveTab('grace')}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 flex flex-col justify-between ${
            activeTab === 'grace'
              ? 'bg-[#212126] border-amber-400 shadow-lg shadow-amber-400/15 scale-[1.01]'
              : 'bg-[#18181B] border-[#2A2A30] hover:border-amber-400/50 hover:bg-[#1E1E22]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Grace (16–30d)</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {cohortMetrics.grace.count}
            </span>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {currency}{cohortMetrics.grace.amount.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Follow-up suggested</div>
          </div>
        </div>

        {/* 3. Overdue (31–60d) */}
        <div 
          onClick={() => setActiveTab('overdue')}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 flex flex-col justify-between ${
            activeTab === 'overdue'
              ? 'bg-[#212126] border-orange-500 shadow-lg shadow-orange-500/15 scale-[1.01]'
              : 'bg-[#18181B] border-[#2A2A30] hover:border-orange-500/50 hover:bg-[#1E1E22]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Overdue (31–60d)</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
              {cohortMetrics.overdue.count}
            </span>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {currency}{cohortMetrics.overdue.amount.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Late collection risk</div>
          </div>
        </div>

        {/* 4. Severe (60d+) */}
        <div 
          onClick={() => setActiveTab('severe')}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 flex flex-col justify-between ${
            activeTab === 'severe'
              ? 'bg-[#212126] border-rose-500 shadow-lg shadow-rose-500/20 scale-[1.01]'
              : 'bg-[#18181B] border-[#2A2A30] hover:border-rose-500/50 hover:bg-[#1E1E22]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Severe (60d+)</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40">
              {cohortMetrics.severe.count}
            </span>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-rose-400 tabular-nums">
              {currency}{cohortMetrics.severe.amount.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Critical liquidity alert</div>
          </div>
        </div>

      </div>

      {/* Cohort Tabs & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A30] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-[#6458E2] text-white shadow-md shadow-[#6458E2]/30'
                : 'text-zinc-400 hover:text-white border border-[#2D2D33] hover:border-zinc-500 bg-[#161619]'
            }`}
          >
            <span>All Active</span>
            <span className="ml-1.5 opacity-80">
              ({cohorts.current.length + cohorts.grace.length + cohorts.overdue.length + cohorts.severe.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'current'
                ? 'bg-[#6458E2] text-white shadow-md shadow-[#6458E2]/30'
                : 'text-zinc-400 hover:text-white border border-[#2D2D33] hover:border-zinc-500 bg-[#161619]'
            }`}
          >
            <span>Current (0–15d)</span>
            <span className="ml-1.5 opacity-80">({cohorts.current.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grace')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'grace'
                ? 'bg-[#6458E2] text-white shadow-md shadow-[#6458E2]/30'
                : 'text-zinc-400 hover:text-white border border-[#2D2D33] hover:border-zinc-500 bg-[#161619]'
            }`}
          >
            <span>Grace (16–30d)</span>
            <span className="ml-1.5 opacity-80">({cohorts.grace.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'overdue'
                ? 'bg-[#6458E2] text-white shadow-md shadow-[#6458E2]/30'
                : 'text-zinc-400 hover:text-white border border-[#2D2D33] hover:border-zinc-500 bg-[#161619]'
            }`}
          >
            <span>Overdue (31–60d)</span>
            <span className="ml-1.5 opacity-80">({cohorts.overdue.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('severe')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'severe'
                ? 'bg-[#6458E2] text-white shadow-md shadow-[#6458E2]/30'
                : 'text-zinc-400 hover:text-white border border-[#2D2D33] hover:border-zinc-500 bg-[#161619]'
            }`}
          >
            <span>Severe (60d+)</span>
            <span className="ml-1.5 opacity-80">({cohorts.severe.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paid')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'paid'
                ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30'
                : 'text-zinc-400 hover:text-white border border-[#2D2D33] hover:border-zinc-500 bg-[#161619]'
            }`}
          >
            <span>Settled</span>
            <span className="ml-1.5 opacity-80">({cohorts.paid.length})</span>
          </button>

        </div>

        <div className="text-xs text-[#A1A1AA] hidden sm:block font-medium">
          Showing {filteredInvoices.length} invoices
        </div>
      </div>

      {/* Invoice Card Grid */}
      {filteredInvoices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((inv) => {
            const client = clientMap.get(inv.client_id);
            return (
              <DebtorCard
                key={inv.id}
                invoice={inv}
                client={client}
                currency={currency}
                onChaseWhatsApp={onChaseWhatsApp}
                onMarkPaid={onMarkPaid}
                onSplitPayment={onSplitPayment}
                onViewAsClient={onViewAsClient}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-[#18181B] border border-[#2A2A30] rounded-2xl py-14 text-center px-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No invoices in this cohort</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto mt-1 leading-relaxed">
            {searchQuery
              ? `No invoices matched "${searchQuery}".`
              : 'All invoices in this cohort are fully settled or none are currently scheduled.'}
          </p>
        </div>
      )}

    </div>
  );
}
