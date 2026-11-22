import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import AgingDashboard from './components/AgingDashboard.jsx';
import InvoiceModal from './components/InvoiceModal.jsx';
import WhatsAppModal from './components/WhatsAppModal.jsx';
import ClientPortalModal from './components/ClientPortalModal.jsx';
import CashForecastChart from './components/CashForecastChart.jsx';
import WhatIfSimulator from './components/WhatIfSimulator.jsx';
import BadDayTriageModal from './components/BadDayTriageModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import QuickInputBar from './components/QuickInputBar.jsx';
import OutflowsManager from './components/OutflowsManager.jsx';
import InfiniteMarquee from './components/InfiniteMarquee.jsx';
import ScrubTextReveal from './components/ScrubTextReveal.jsx';
import HorizontalAccordions from './components/HorizontalAccordions.jsx';
import FeedbackCarousel from './components/FeedbackCarousel.jsx';
import ArtCraftPrinciples from './components/ArtCraftPrinciples.jsx';

import { calculateCashForecast, DEFAULT_SCENARIOS } from './lib/forecastEngine.js';
import { dataService } from './lib/dataService.js';
import { supabase } from './lib/supabaseClient.js';
import { getHealth } from './lib/api.js';
import mockDesignerData from './data/mockDesignerData.js';
import { 
  Plus, 
  ArrowDown, 
  AlertTriangle, 
  Activity, 
  Flame, 
  X, 
  ShieldCheck, 
  Send
} from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [cashBalance, setCashBalance] = useState(4850);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isBadDayActive, setIsBadDayActive] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  // Forecast & What-If Scenarios State
  const [horizonDays, setHorizonDays] = useState(30);
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isBadDayModalOpen, setIsBadDayModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedInvoiceForWhatsApp, setSelectedInvoiceForWhatsApp] = useState(null);
  const [selectedInvoiceForPortal, setSelectedInvoiceForPortal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initialize and load seed data
  async function loadData() {
    try {
      await dataService.seedInitialData(mockDesignerData);

      const [prof, cls, invs, bls, fus, user] = await Promise.all([
        dataService.getProfile(),
        dataService.getClients(),
        dataService.getInvoices(),
        dataService.getBills(),
        dataService.getFollowUps(),
        dataService.getActiveUser(),
      ]);

      setProfile(prof);
      setClients(cls);
      setInvoices(invs);
      setBills(bls);
      setFollowUps(fus);
      setCashBalance(prof?.starting_cash || 4850);
      setIsCloudSynced(Boolean(user && dataService.isSupabaseConfigured()));
    } catch (err) {
      console.error('Failed to load StudioFlow data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const checkApi = async () => {
      try {
        await getHealth();
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }
    };
    checkApi();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      await loadData();
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await dataService.resetDemoData(mockDesignerData);
      await loadData();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    }
  };

  // Calculate monthly burn & runway days
  const { monthlyBurn, runwayDays } = useMemo(() => {
    const burn = bills.reduce((acc, b) => {
      const amt = Number(b.amount) || 0;
      if (b.frequency === 'quarterly') return acc + amt / 3;
      if (b.frequency === 'annual') return acc + amt / 12;
      return acc + amt;
    }, 0);

    const dailyBurn = burn > 0 ? burn / 30 : 65;
    const days = Math.max(0, Math.round(cashBalance / dailyBurn));
    return { monthlyBurn: burn, runwayDays: days };
  }, [bills, cashBalance]);

  const handleToggleBadDay = () => {
    const nextActive = !isBadDayActive;
    setIsBadDayActive(nextActive);
    if (nextActive) setIsBadDayModalOpen(true);
  };

  // Dynamic 30-90 Day Cash Forecasting Engine calculation
  const forecastData = useMemo(() => {
    return calculateCashForecast({
      cashBalance,
      invoices,
      bills,
      clients,
      horizonDays,
      scenarios: {
        ...scenarios,
        badDayActive: isBadDayActive,
      },
      safetyBuffer: profile?.safety_buffer || 1500,
    });
  }, [cashBalance, invoices, bills, clients, horizonDays, scenarios, isBadDayActive, profile]);

  const handleResetScenarios = () => {
    setScenarios(DEFAULT_SCENARIOS);
  };

  const handleOpenNewInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  // Direct action: Mark as Paid
  const handleMarkAsPaid = async (invoice) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await dataService.markPaid(invoice.id, today);
      
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoice.id ? { ...inv, status: 'paid', paid_date: today } : inv
        )
      );

      const amt = Number(invoice.amount) || 0;
      const newCash = cashBalance + amt;
      setCashBalance(newCash);
      await dataService.updateProfile({ starting_cash: newCash });

      showToast(`Settled ${invoice.invoice_number} — $${amt.toLocaleString()} credited to reserves`);
      return true;
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err);
      return false;
    }
  };

  // Direct action: Split Payment (Offer 50/50 plan)
  const handleSplitPayment = async (invoice) => {
    try {
      const halfAmount = Math.round((Number(invoice.amount) / 2) * 100) / 100;
      const part2Amount = Number((Number(invoice.amount) - halfAmount).toFixed(2));
      const today = new Date();
      
      const due1 = today.toISOString().split('T')[0];
      const due2Date = new Date();
      due2Date.setDate(due2Date.getDate() + 15);
      const due2 = due2Date.toISOString().split('T')[0];

      const updatedPart1 = await dataService.updateInvoice(invoice.id, {
        amount: halfAmount,
        project_title: `${invoice.project_title} (Part 1/2 - 50%)`,
        due_date: due1,
        notes: `Split payment agreement: 50% due immediately (${due1}).`,
      });

      const newPart2 = await dataService.createInvoice({
        client_id: invoice.client_id,
        client_name: invoice.client_name,
        client_phone: invoice.client_phone,
        invoice_number: `${invoice.invoice_number}-B`,
        project_title: `${invoice.project_title} (Part 2/2 - 50%)`,
        amount: part2Amount,
        issue_date: due1,
        due_date: due2,
        status: 'sent',
        items: invoice.items || [],
        notes: `Split payment agreement: 50% remaining due on ${due2}.`,
      });

      setInvoices((prev) =>
        [newPart2, ...prev.map((inv) => (inv.id === invoice.id ? updatedPart1 : inv))]
      );

      showToast(`Split ${invoice.invoice_number} into two tranches ($${halfAmount.toLocaleString()} & $${part2Amount.toLocaleString()})`);
    } catch (err) {
      console.error('Failed to split invoice payment:', err);
    }
  };

  const handleChaseWhatsApp = (invoice) => {
    setSelectedInvoiceForWhatsApp(invoice);
  };

  const handleViewAsClient = (invoice) => {
    setSelectedInvoiceForPortal(invoice);
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      let clientId = invoiceData.client_id;

      if (!clientId && invoiceData.client_name) {
        const newClient = await dataService.saveClient({
          name: invoiceData.client_name,
          company: invoiceData.client_company || invoiceData.client_name,
          phone: invoiceData.client_phone,
          payment_behavior: 'reliable',
          avg_delay_days: 3,
        });
        clientId = newClient.id;
        setClients((prev) => [newClient, ...prev]);
      }

      const created = await dataService.createInvoice({
        ...invoiceData,
        client_id: clientId,
      });

      setInvoices((prev) => [created, ...prev]);
      showToast(`Created invoice ${created.invoice_number} for $${created.amount.toLocaleString()}`);
    } catch (err) {
      console.error('Failed to create invoice:', err);
      showToast('Failed to create invoice');
    }
  };

  const handleQuickCreateInvoice = (draft) => {
    const today = new Date().toISOString().split('T')[0];
    const match = draft.client
      ? clients.find((c) => c.name.toLowerCase() === draft.client.toLowerCase())
      : clients[0];

    handleSaveInvoice({
      client_id: match?.id ?? null,
      client_name: match?.name ?? draft.client,
      client_phone: match?.phone ?? '',
      invoice_number: `INV-${Date.now().toString().slice(-4)}`,
      project_title: draft.project ?? '',
      amount: draft.amount,
      issue_date: today,
      due_date: draft.dueDate ?? today,
      status: 'sent',
      items: [{ desc: draft.project ?? '', qty: 1, rate: draft.amount }],
      notes: '',
    });
  };

  const handleLogFollowUp = async (followUpData) => {
    try {
      const logged = await dataService.logFollowUp(followUpData);
      setFollowUps((prev) => [logged, ...prev]);
      showToast('WhatsApp follow-up logged in audit trail');
    } catch (err) {
      console.error('Failed to log follow-up:', err);
    }
  };

  const handleSaveBill = async (billData) => {
    try {
      await dataService.saveBill(billData);
      setBills(await dataService.getBills());
      showToast('Saved recurring outflow');
    } catch (err) {
      console.error('Failed to save bill:', err);
      showToast('Failed to save outflow');
    }
  };

  const handleDeleteBill = async (id) => {
    try {
      await dataService.deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
      showToast('Deleted outflow');
    } catch (err) {
      console.error('Failed to delete bill:', err);
      showToast('Failed to delete outflow');
    }
  };

  const handleToggleFlexible = (bill) => {
    handleSaveBill({ ...bill, is_flexible: !bill.is_flexible });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-xs text-[#5a5a5f]">
        <div className="w-8 h-8 border border-white border-t-transparent rounded-full animate-spin mb-4" />
        <p className="uppercase tracking-[1.6px]">Loading StudioFlow Financial Infrastructure...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative selection:bg-white selection:text-black">
      
      {/* Toast Notification (Clean high-contrast telemetry pill) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a0a0a] border border-[#3a3a3f] text-white px-5 py-3 rounded-[32px] flex items-center gap-3 text-xs tracking-[0.32px] shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#5a5a5f] hover:text-white ml-2 p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SpaceX Fixed Top Nav Overlay */}
      <Navbar
        profile={profile}
        cashBalance={cashBalance}
        runwayDays={runwayDays}
        safetyBuffer={profile?.safety_buffer || 1500}
        isCloudSynced={isCloudSynced}
        isBadDayActive={isBadDayActive}
        onToggleBadDay={handleToggleBadDay}
        onOpenNewInvoice={handleOpenNewInvoice}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Container */}
      <main className="overflow-x-hidden w-full max-w-full flex-1">
        
        {/* FULL-BLEED PHOTOGRAPHIC HERO SECTION (SpaceX Signature Band) */}
        <section 
          id="overview" 
          className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black card-photo-band"
        >
          {/* Graded atmospheric photography background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1517976487502-57b12d6a5240?auto=format&fit=crop&w=2560&q=85" 
              alt="Atmospheric Space Launch Horizon" 
              className="w-full h-full object-cover object-center opacity-30 filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
          </div>

          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-20 sm:py-28">
            
            {/* All-Caps Eyebrow Microtext */}
            <div className="inline-block mb-6">
              <span className="micro-cap text-white font-bold tracking-[1.6px] border border-[#3a3a3f] px-3.5 py-1.5 rounded-[32px] bg-black/60">
                Financial Runway Radar // For Independent Studios
              </span>
            </div>

            {/* Headline: Uppercase D-DIN-Bold display-xxl */}
            <h1 className="display-xxl text-white max-w-5xl mx-auto my-4">
              Deterministic Cash Runway for Sovereign Studios
            </h1>

            {/* Editorial Description: Readable sentence case with optical breathing room */}
            <p className="body-lg text-[#f0f0fa] max-w-3xl mx-auto mt-6 text-base sm:text-lg leading-relaxed">
              Eliminate the existential blind spot between invoice dispatch and operational survival. Real-time debtor aging history, rolling 90-day runway projection, and automated liquidity triage.
            </p>

            {/* Single Ghost Outlined Pill CTA per Band */}
            <div className="pt-10 flex items-center justify-center">
              <a
                href="#interactive-suite"
                className="button-ghost-on-dark text-sm sm:text-base py-4 px-8"
              >
                <span>Explore Cash Horizon</span>
                <ArrowDown className="w-4 h-4 ml-1" />
              </a>
            </div>

            {/* Operational Runway Cockpit Telemetry Display */}
            <div className="mt-14 max-w-4xl mx-auto">
              <div className="card-spacex p-5 sm:p-7 text-left bg-black/85 backdrop-blur-md">
                
                {/* Telemetry Header */}
                <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-white inline-block" />
                    <span className="text-xs uppercase tracking-[1.2px] text-white font-bold">
                      Current Operational Runway
                    </span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.96px] text-[#5a5a5f]">
                    Window: {horizonDays} Days
                  </div>
                </div>

                {/* Inner Telemetry Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  <div className="p-4 rounded-[4px] bg-[#0a0a0a] border border-[#3a3a3f]">
                    <span className="micro-cap text-[#5a5a5f] block font-bold">Cash Reserves</span>
                    <span className="text-2xl font-bold text-white tabular-nums tracking-[1.6px] block mt-1.5">
                      ${Number(cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-[#f0f0fa] mt-1.5 block">
                      +{runwayDays} days runway buffer
                    </span>
                  </div>

                  <div className="p-4 rounded-[4px] bg-[#0a0a0a] border border-[#3a3a3f]">
                    <span className="micro-cap text-[#5a5a5f] block font-bold">Monthly Burn</span>
                    <span className="text-2xl font-bold text-white tabular-nums tracking-[1.6px] block mt-1.5">
                      ${Math.round(monthlyBurn).toLocaleString()} / mo
                    </span>
                    <span className="text-[11px] text-[#5a5a5f] mt-1.5 block">
                      Committed recurring outflows
                    </span>
                  </div>

                  <div className="p-4 rounded-[4px] bg-[#0a0a0a] border border-[#3a3a3f]">
                    <span className="micro-cap text-[#5a5a5f] block font-bold">Receivables Lag</span>
                    <span className="text-2xl font-bold text-white tabular-nums tracking-[1.6px] block mt-1.5">
                      12d avg DSO
                    </span>
                    <span className="text-[11px] text-[#5a5a5f] mt-1.5 block">
                      4 active aging cohorts
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* TRUSTED PROTOCOLS: Infinite Marquee */}
        <InfiniteMarquee />

        {/* CRISIS BANNER IF ENGAGED */}
        {isBadDayActive && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="bg-[#0a0a0a] border border-white rounded-[8px] p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full border border-white text-white shrink-0">
                  <Flame className="w-5 h-5 text-white shrink-0" />
                </div>
                <div>
                  <h3 className="button-cap text-white text-sm">
                    Crisis Protocol Engaged: Multi-Client Payment Deficit
                  </h3>
                  <p className="text-xs text-[#f0f0fa] mt-1 leading-relaxed">
                    Anchor client receivables simulated as delayed past 30 days. Emergency liquidity triage active.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsBadDayModalOpen(true)}
                  className="button-ghost-on-dark text-xs py-2.5 px-5"
                >
                  Open Triage
                </button>
                <button
                  onClick={() => setIsBadDayActive(false)}
                  className="button-ghost-sm text-xs py-2.5 px-5 border-[#3a3a3f] text-[#5a5a5f] hover:text-white hover:border-white"
                >
                  Reset Baseline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OPERATIONAL COMMAND: Bento Grid */}
        <section id="interactive-suite" className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 space-y-3">
            <div className="micro-cap text-[#5a5a5f] font-bold">
              <span>Operational Command</span>
            </div>
            <h2 className="display-lg text-white">
              Direct Inflow &amp; Stress Testing
            </h2>
            <p className="text-sm text-[#f0f0fa] max-w-xl leading-relaxed">
              Rapid invoice generation and real-time stress testing calibrated for independent practices.
            </p>
          </div>

          {/* Bento Grid: 12-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 grid-flow-dense">
            
            {/* Card 1: Direct Command & Dispatch (col-span-8) */}
            <div className="lg:col-span-8 group overflow-hidden">
              <div className="h-full">
                <QuickInputBar onCreateInvoice={handleQuickCreateInvoice} clients={clients} />
              </div>
            </div>

            {/* Card 2: Runway Status & Reserve Telemetry (col-span-4) */}
            <div className="lg:col-span-4 group overflow-hidden">
              <div className="h-full card-spacex p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-white" />
                    <h3 className="button-cap text-white">
                      Runway Velocity
                    </h3>
                  </div>
                  <span className="micro-cap text-[#5a5a5f]">
                    Monthly Burn
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-white tabular-nums tracking-[1.6px]">
                      ${Math.round(monthlyBurn).toLocaleString()}
                    </span>
                    <span className="micro-cap text-[#5a5a5f]">/ Month</span>
                  </div>

                  {/* Runway Bar Indicator */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[#5a5a5f]">
                      <span>Reserve Ratio</span>
                      <span className="text-white font-bold">{runwayDays} Days Available</span>
                    </div>
                    <div className="w-full h-2 bg-[#000000] rounded-none overflow-hidden border border-[#3a3a3f]">
                      <div 
                        className="h-full bg-white transition-all duration-700"
                        style={{ width: `${Math.min(100, (runwayDays / 90) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#3a3a3f] flex items-center justify-between micro-cap text-[#5a5a5f]">
                  <span>Buffer: ${profile?.safety_buffer || 1500}</span>
                  <span className="text-white font-bold">Protected</span>
                </div>
              </div>
            </div>

            {/* Card 3: Crisis Switch & Bad Day Simulation (col-span-5) */}
            <div className="lg:col-span-5 group overflow-hidden">
              <div className="h-full card-spacex p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-white" />
                    <h3 className="button-cap text-white">
                      Crisis Simulation
                    </h3>
                  </div>
                  <span className="micro-cap text-[#f0f0fa]">
                    Deficit Engine
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-[#f0f0fa] leading-relaxed">
                    Simulate late payment from your largest anchor client and verify whether emergency reserves hold up against overhead commitments.
                  </p>
                  <div className="text-xs text-white pt-2 font-bold">
                    Status:{' '}
                    <span className={isBadDayActive ? 'text-white underline' : 'text-[#5a5a5f]'}>
                      {isBadDayActive ? 'Engaged (Deficit Triage)' : 'Standby (Baseline)'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleBadDay}
                  className="w-full button-ghost-on-dark text-xs py-3"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isBadDayActive ? 'Deactivate Crisis' : 'Engage Bad Day Protocol'}</span>
                </button>
              </div>
            </div>

            {/* Card 4: Prescriptive Action Stream (col-span-7) */}
            <div className="lg:col-span-7 group overflow-hidden">
              <div className="h-full card-spacex p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <h3 className="button-cap text-white">
                      Prescriptive Action Stream
                    </h3>
                  </div>
                  <span className="micro-cap text-[#5a5a5f]">
                    Deficit Arbitrage
                  </span>
                </div>

                {forecastData.deficitInfo?.hasDeficit || forecastData.deficitInfo?.isBelowBuffer ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-white font-bold">
                        {forecastData.deficitInfo.alertMessage || 'Projected cash position falls below the safety buffer.'}
                      </p>
                      <p className="text-xs text-[#f0f0fa] tabular-nums tracking-[0.96px]">
                        Maximum shortfall: ${Number(forecastData.deficitInfo.maxShortfall || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        disabled={!forecastData.deficitInfo.actionInvoice}
                        onClick={() => handleChaseWhatsApp(forecastData.deficitInfo.actionInvoice)}
                        className="button-ghost-on-dark text-xs py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Chase via WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        disabled={!forecastData.deficitInfo.actionInvoice}
                        onClick={() => handleSplitPayment(forecastData.deficitInfo.actionInvoice)}
                        className="button-ghost-sm text-xs py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span>Start 50/50 Split</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-[#f0f0fa] leading-relaxed">
                      No liquidity deficits identified in the next {horizonDays} days. Cash reserves and anticipated settlements remain securely above the ${profile?.safety_buffer || 1500} safety buffer.
                    </p>
                    <div className="text-xs text-white font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Trajectory Nominal · Buffer Secure</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-[#3a3a3f] flex items-center justify-between micro-cap text-[#5a5a5f]">
                  <span>Deficit Monitor: Active</span>
                  <span>{horizonDays}-Day Horizon</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SCRUBBING TEXT REVEAL SECTION */}
        <ScrubTextReveal
          tagline="Runway Clarity"
          statement="Independent studios should never have to guess their survival horizon. StudioFlow converts volatile, delayed receivables into deterministic runway mathematics."
        />

        {/* CORE CAPABILITIES ARCHITECTURAL BREAKDOWN */}
        <section className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HorizontalAccordions />
        </section>

        {/* ACCOUNTS RECEIVABLE AGING COHORTS RADAR */}
        <section id="aging" className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#3a3a3f]">
          <AgingDashboard
            invoices={invoices}
            clients={clients}
            currency={profile?.currency || '$'}
            onChaseWhatsApp={handleChaseWhatsApp}
            onMarkPaid={handleMarkAsPaid}
            onSplitPayment={handleSplitPayment}
            onViewAsClient={handleViewAsClient}
          />
        </section>

        {/* CASH HORIZON ENGINE & WHAT-IF SIMULATOR */}
        <section id="forecast" className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 border-t border-[#3a3a3f]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3a3a3f] pb-5">
            <div>
              <div className="micro-cap text-[#5a5a5f] font-bold mb-2">
                <span>Rolling Trajectory</span>
              </div>
              <h2 className="display-lg text-white">
                Cash Horizon Engine
              </h2>
            </div>
            <p className="text-sm text-[#f0f0fa] max-w-md">
              Projected reserve curve incorporating recurring outflows and invoice settlement dates.
            </p>
          </div>

          <CashForecastChart
            forecastData={forecastData}
            horizonDays={horizonDays}
            onHorizonChange={setHorizonDays}
            currency={profile?.currency || '$'}
          />

          <div id="stress-test" className="pt-4">
            <WhatIfSimulator
              scenarios={scenarios}
              onScenarioChange={setScenarios}
              onResetScenarios={handleResetScenarios}
              deficitInfo={forecastData.deficitInfo}
              safetyBuffer={profile?.safety_buffer || 1500}
              currency={profile?.currency || '$'}
              onChaseInvoice={handleChaseWhatsApp}
            />
          </div>
        </section>

        {/* RECURRING OUTFLOWS LEDGER */}
        <section id="outflows" className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 border-t border-[#3a3a3f]">
          <OutflowsManager
            bills={bills}
            onSaveBill={handleSaveBill}
            onDeleteBill={handleDeleteBill}
            onToggleFlexible={handleToggleFlexible}
          />
        </section>

        {/* TESTIMONIALS CAROUSEL */}
        <section className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#3a3a3f]">
          <FeedbackCarousel />
        </section>

        {/* OPERATING PHILOSOPHY & PRINCIPLES */}
        <ArtCraftPrinciples />

        {/* BOTTOM HERO ECHO BAND */}
        <section className="py-28 md:py-36 border-t border-[#3a3a3f] bg-black relative overflow-hidden card-photo-band">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=2560&q=85" 
              alt="Atmospheric Dusk Horizon" 
              className="w-full h-full object-cover object-center opacity-25 filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/90" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <div className="micro-cap text-white font-bold tracking-[1.6px] border border-[#3a3a3f] px-3.5 py-1.5 rounded-[32px] inline-block bg-black/60">
              Sovereign Financial Autonomy
            </div>

            <h2 className="display-xl text-white">
              Reclaim Cash Sovereignty for Your Studio
            </h2>

            <p className="body-lg text-[#f0f0fa] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              No cloud lock-in. Zero subscription overhead. Total local data persistence and surgical receivables control.
            </p>

            {/* Single Ghost Outlined Pill CTA */}
            <div className="pt-6 flex items-center justify-center">
              <button
                onClick={handleOpenNewInvoice}
                className="button-ghost-on-dark text-sm sm:text-base py-4 px-8"
              >
                <Plus className="w-4 h-4" />
                <span>Create Invoice</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER: Clean dark aesthetic */}
      <footer className="border-t border-[#3a3a3f] bg-black text-[#5a5a5f] text-xs">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Brand Info */}
            <div className="space-y-4">
              <span className="font-display font-bold text-lg text-white tracking-[2px] uppercase block">
                STUDIOFLOW
              </span>
              <p className="text-xs text-[#5a5a5f] leading-relaxed">
                Open-source financial infrastructure and cash runway radar for independent creative practices.
              </p>
              <p className="text-[11px] text-[#5a5a5f]">
                hello@studioflow.io
              </p>
            </div>

            {/* Modules */}
            <div className="space-y-3">
              <p className="micro-cap text-white font-bold tracking-[1.17px] mb-4">Modules</p>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#forecast" className="hover:text-white transition-colors">90-Day Cash Horizon</a></li>
                <li><a href="#stress-test" className="hover:text-white transition-colors">What-If Stress Simulator</a></li>
                <li><a href="#aging" className="hover:text-white transition-colors">AR Aging Cohorts</a></li>
                <li><a href="#outflows" className="hover:text-white transition-colors">Outflows &amp; Commitments</a></li>
              </ul>
            </div>

            {/* Systems */}
            <div className="space-y-3">
              <p className="micro-cap text-white font-bold tracking-[1.17px] mb-4">Specifications</p>
              <ul className="space-y-2.5 text-xs text-[#5a5a5f]">
                <li><span className="text-white">Core:</span> React 18 + Vite</li>
                <li><span className="text-white">Design:</span> SpaceX Monochrome Tokens</li>
                <li><span className="text-white">Storage:</span> Local File Store + Supabase</li>
                <li><span className="text-white">Privacy:</span> Zero Cloud Tracking</li>
              </ul>
            </div>

            {/* Principles */}
            <div className="space-y-3">
              <p className="micro-cap text-white font-bold tracking-[1.17px] mb-4">Philosophy</p>
              <p className="text-xs text-[#5a5a5f] leading-relaxed">
                No software taxes. Zero third-party lock-in. Deterministic cash runway autonomy for independent creators.
              </p>
              <p className="text-[11px] text-[#5a5a5f] pt-1">
                © 2026 StudioFlow Protocol.
              </p>
            </div>

          </div>
        </div>
      </footer>

      {/* Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        clients={clients}
        currency={profile?.currency || '$'}
        onSaveInvoice={handleSaveInvoice}
      />

      <BadDayTriageModal
        isOpen={isBadDayModalOpen}
        onClose={() => setIsBadDayModalOpen(false)}
        pendingInvoices={invoices.filter((inv) => inv.status !== 'paid')}
        bills={bills}
        cashBalance={cashBalance}
        onChaseWhatsApp={handleChaseWhatsApp}
        onSplitPayment={handleSplitPayment}
        onDeferFlexibleBills={() =>
          setScenarios((prev) => ({ ...prev, deferFlexibleBills: true }))
        }
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthChanged={loadData}
        onResetDemo={handleResetDemo}
      />

      <WhatsAppModal
        isOpen={Boolean(selectedInvoiceForWhatsApp)}
        onClose={() => setSelectedInvoiceForWhatsApp(null)}
        invoice={selectedInvoiceForWhatsApp}
        client={
          selectedInvoiceForWhatsApp
            ? clients.find((c) => c.id === selectedInvoiceForWhatsApp.client_id)
            : null
        }
        currency={profile?.currency || '$'}
        onLogFollowUp={handleLogFollowUp}
      />

      <ClientPortalModal
        isOpen={Boolean(selectedInvoiceForPortal)}
        invoice={selectedInvoiceForPortal}
        client={clients.find((c) => c.id === selectedInvoiceForPortal?.client_id)}
        profile={profile}
        onClose={() => setSelectedInvoiceForPortal(null)}
        onPay={handleMarkAsPaid}
      />
    </div>
  );
}
