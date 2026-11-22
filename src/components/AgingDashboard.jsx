import React, { useState, useMemo } from 'react';
import DebtorCard from './DebtorCard.jsx';
import { 
  DollarSign, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Search,
  CheckCircle
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
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

      const diffDays = getDaysDiff(inv.due_date);

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
        graceCohort.push({ ...inv, diffDays });
      } else {
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
    <div className="space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#3a3a3f] pb-5">
        <div>
          <div className="micro-cap text-[#5a5a5f] font-bold mb-2">
            <span>Aging Radar // Net 15 / Net 30</span>
          </div>
          <h2 className="display-lg text-white">
            Accounts Receivable Radar
          </h2>
          <p className="text-sm text-[#f0f0fa] mt-1">
            Real-time aging cohorts, client risk tracking, and one-click payment follow-up.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#5a5a5f]" />
          <input
            type="text"
            placeholder="Search client, project, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-black border border-[#3a3a3f] focus:border-white rounded-[4px] text-xs text-white placeholder:text-[#5a5a5f] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Top Line Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Owed */}
        <div className="card-spacex p-5 bg-[#0a0a0a]">
          <div className="flex items-center justify-between text-[#5a5a5f] mb-2">
            <span className="text-xs uppercase font-bold text-[#5a5a5f]">Total Outstanding</span>
            <div className="w-6 h-6 rounded-[4px] bg-black border border-[#3a3a3f] flex items-center justify-center text-white">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-[-0.42px]">
            {currency}{totalOwed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#5a5a5f] mt-1.5">
            {invoices.filter((i) => i.status !== 'paid').length} active invoices across {clients.length} clients
          </div>
        </div>

        {/* Critical Overdue */}
        <div className="card-spacex p-5 bg-[#0a0a0a] border-[#ef4444]">
          <div className="flex items-center justify-between text-[#ef4444] mb-2">
            <span className="text-xs uppercase font-bold text-[#ef4444]">Critical Overdue</span>
            <div className="w-6 h-6 rounded-[4px] bg-black border border-[#ef4444] flex items-center justify-center text-[#ef4444]">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#ef4444] tabular-nums tracking-[-0.42px]">
            {currency}{criticalOverdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#ef4444] mt-1.5">
            {cohorts.severe.length} invoice(s) past 60+ days
          </div>
        </div>

        {/* Overdue Count */}
        <div className="card-spacex p-5 bg-[#0a0a0a]">
          <div className="flex items-center justify-between text-[#5a5a5f] mb-2">
            <span className="text-xs uppercase font-bold text-[#f59e0b]">Requiring Follow-up</span>
            <div className="w-6 h-6 rounded-[4px] bg-black border border-[#3a3a3f] flex items-center justify-center text-[#f59e0b]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#f59e0b] tabular-nums tracking-[-0.42px]">
            {overdueCount} Invoices
          </div>
          <div className="text-xs text-[#5a5a5f] mt-1.5">
            Immediate follow-up recommended
          </div>
        </div>

        {/* Average DSO / Collection Lag */}
        <div className="card-spacex p-5 bg-[#0a0a0a]">
          <div className="flex items-center justify-between text-[#5a5a5f] mb-2">
            <span className="text-xs uppercase font-bold text-[#5a5a5f]">Average DSO</span>
            <div className="w-6 h-6 rounded-[4px] bg-black border border-[#3a3a3f] flex items-center justify-center text-white">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-[-0.42px]">
            {avgDSO} Days
          </div>
          <div className="text-xs text-[#5a5a5f] mt-1.5">
            Historical collection turnaround
          </div>
        </div>

      </div>

      {/* Cohort Tabs: SpaceX Ghost Outlined Pill Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3a3a3f] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-[32px] text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-white text-black'
                : 'bg-black text-[#f0f0fa] border border-[#3a3a3f] hover:border-white'
            }`}
          >
            All Active ({cohorts.current.length + cohorts.grace.length + cohorts.overdue.length + cohorts.severe.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`px-3.5 py-1.5 rounded-[32px] text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'current'
                ? 'bg-white text-black'
                : 'bg-black text-[#f0f0fa] border border-[#3a3a3f] hover:border-white'
            }`}
          >
            <span>Current (0–15d)</span>
            <span className="text-[11px] opacity-75">({cohorts.current.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grace')}
            className={`px-3.5 py-1.5 rounded-[32px] text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'grace'
                ? 'bg-white text-black'
                : 'bg-black text-[#f0f0fa] border border-[#3a3a3f] hover:border-white'
            }`}
          >
            <span>Grace (16–30d)</span>
            <span className="text-[11px] opacity-75">({cohorts.grace.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={`px-3.5 py-1.5 rounded-[32px] text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'overdue'
                ? 'bg-white text-black'
                : 'bg-black text-[#f59e0b] border border-[#3a3a3f] hover:border-[#f59e0b]'
            }`}
          >
            <span>Overdue (31–60d)</span>
            <span className="text-[11px] opacity-75">({cohorts.overdue.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('severe')}
            className={`px-3.5 py-1.5 rounded-[32px] text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'severe'
                ? 'bg-white text-black'
                : 'bg-black text-[#ef4444] border border-[#3a3a3f] hover:border-[#ef4444]'
            }`}
          >
            <span>Severe (60d+)</span>
            <span className="text-[11px] opacity-75">({cohorts.severe.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paid')}
            className={`px-3.5 py-1.5 rounded-[32px] text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'paid'
                ? 'bg-white text-black'
                : 'bg-black text-[#5a5a5f] border border-[#3a3a3f] hover:border-white'
            }`}
          >
            <span>Settled</span>
            <span className="text-[11px] opacity-75">({cohorts.paid.length})</span>
          </button>

        </div>

        <div className="text-xs text-[#5a5a5f] hidden sm:block">
          Showing {filteredInvoices.length} invoices
        </div>
      </div>

      {/* Invoices Grid */}
      {filteredInvoices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                onViewAsClient={onViewAsClient}
              />
            );
          })}
        </div>
      ) : (
        <div className="card-spacex py-16 text-center px-4 bg-[#0a0a0a]">
          <div className="w-12 h-12 rounded-[4px] bg-black border border-[#3a3a3f] text-white mx-auto flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="button-cap text-white text-base">No invoices in this cohort</h3>
          <p className="text-xs text-[#5a5a5f] max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No invoices matched "${searchQuery}".`
              : 'All invoices in this cohort are fully settled or none are currently scheduled.'}
          </p>
        </div>
      )}

    </div>
  );
}
