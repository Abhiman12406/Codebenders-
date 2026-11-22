import React, { useState, useEffect, useMemo } from 'react';
import FintechDock from './components/FintechDock.jsx';
import FintechHeader from './components/FintechHeader.jsx';
import FintechOverview from './components/FintechOverview.jsx';
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

import { calculateCashForecast, DEFAULT_SCENARIOS } from './lib/forecastEngine.js';
import { dataService } from './lib/dataService.js';
import { supabase } from './lib/supabaseClient.js';
import { getHealth } from './lib/api.js';
import mockDesignerData from './data/mockDesignerData.js';
import { 
  Plus, 
  Flame, 
  X, 
  ShieldCheck, 
  Send,
  Wallet,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [cashBalance, setCashBalance] = useState(6556.73);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isBadDayActive, setIsBadDayActive] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'receivables' | 'forecast' | 'outflows' | 'cards'

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
      setCashBalance(prof?.starting_cash || 6556.73);
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
      showToast('Demo data successfully restored');
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
    return { monthlyBurn: burn || 3450.65, runwayDays: days || 57 };
  }, [bills, cashBalance]);

  const handleToggleBadDay = () => {
    const nextActive = !isBadDayActive;
    setIsBadDayActive(nextActive);
    if (nextActive) {
      setIsBadDayModalOpen(true);
      showToast('Bad Day Crisis Simulation activated');
    } else {
      showToast('Crisis simulation deactivated — Nominal trajectory');
    }
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
      safetyBuffer: profile?.safety_buffer || 1867.42,
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
      <div className="min-h-screen bg-[#EFEFEF] flex flex-col items-center justify-center text-xs text-[#1C1C1C]">
        <div className="w-10 h-10 border-3 border-[#675DFC] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm tracking-tight text-[#909090]">Loading StudioFlow Neo-Fintech Cockpit...</p>
      </div>
    );
  }

  const currency = profile?.currency || '$';
  const safetyBuffer = profile?.safety_buffer || 1867.42;

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-[#1C1C1C] flex flex-row font-sans selection:bg-[#C4FC51] selection:text-black">
      
      {/* 1. LEFT DOCK VERTICAL SIDEBAR */}
      <FintechDock
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isBadDayActive={isBadDayActive}
        onToggleBadDay={handleToggleBadDay}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isCloudSynced={isCloudSynced}
        apiOnline={apiOnline}
      />

      {/* 2. MAIN WORKSPACE CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden overflow-y-auto">
        
        {/* INNER CONTENT WRAPPER */}
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col">
          
          {/* HEADER */}
          <FintechHeader
            profile={profile}
            activeTab={activeTab}
            onOpenNewInvoice={handleOpenNewInvoice}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isBadDayActive={isBadDayActive}
            onToggleBadDay={handleToggleBadDay}
          />

          {/* TOAST NOTIFICATION */}
          {toastMessage && (
            <div className="mb-4 bg-[#1C1C1C] text-white px-5 py-3 rounded-2xl flex items-center justify-between text-xs font-medium shadow-xl animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#C4FC51]" />
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-zinc-400 hover:text-white ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* CRISIS BANNER IF ACTIVE */}
          {(forecastData.deficitInfo?.hasDeficit || forecastData.deficitInfo?.isBelowBuffer || isBadDayActive) && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-[28px] p-5 text-rose-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-rose-900">
                      {isBadDayActive ? 'CRISIS PROTOCOL ACTIVE: MULTI-CLIENT PAYMENT DELAY' : 'PRESCRIPTIVE CASH DEFICIT ALERT'}
                    </h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-200/80 text-rose-800">
                      Shortfall: -{currency}{forecastData.deficitInfo?.maxShortfall || 420}
                    </span>
                  </div>
                  <p className="text-xs text-rose-800/80 mt-1 max-w-2xl leading-relaxed">
                    {forecastData.deficitInfo?.alertMessage || 'Anchor receivables delayed past day 30. Immediate liquidity recovery triggers recommended.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {forecastData.deficitInfo?.actionInvoice && (
                  <button
                    type="button"
                    onClick={() => handleChaseWhatsApp(forecastData.deficitInfo.actionInvoice)}
                    className="px-4 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Chase on WhatsApp</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsBadDayModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-rose-900 border border-rose-200 text-xs font-semibold transition-all"
                >
                  Triage Deficit
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: MAIN DASHBOARD (1-to-1 MATCHING THE IMAGE REFERENCE) */}
          {activeTab === 'dashboard' && (
            <FintechOverview
              cashBalance={cashBalance}
              monthlyBurn={monthlyBurn}
              safetyBuffer={safetyBuffer}
              currency={currency}
              onOpenNewInvoice={handleOpenNewInvoice}
              onOpenSend={() => {
                setActiveTab('outflows');
                showToast('Switched to Outflows & Transfers ledger');
              }}
              onOpenReceive={() => {
                setIsInvoiceModalOpen(true);
              }}
              onContactClick={(contact) => {
                showToast(`Selected contact: ${contact.name}. Quick transfer initiated.`);
              }}
            />
          )}

          {/* TAB 2: ACCOUNTS RECEIVABLE RADAR */}
          {activeTab === 'receivables' && (
            <div className="fintech-panel-dark p-6 sm:p-8 space-y-6">
              <AgingDashboard
                invoices={invoices}
                clients={clients}
                currency={currency}
                onChaseWhatsApp={handleChaseWhatsApp}
                onMarkPaid={handleMarkAsPaid}
                onSplitPayment={handleSplitPayment}
                onViewAsClient={handleViewAsClient}
              />
            </div>
          )}

          {/* TAB 3: CASH FORECAST & WHAT-IF ENGINE */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <div className="fintech-panel-dark p-6 sm:p-8">
                <CashForecastChart
                  forecastData={forecastData}
                  horizonDays={horizonDays}
                  onHorizonChange={setHorizonDays}
                  currency={currency}
                />
              </div>
              <div className="fintech-panel-dark p-6 sm:p-8">
                <WhatIfSimulator
                  scenarios={scenarios}
                  onScenarioChange={setScenarios}
                  onResetScenarios={handleResetScenarios}
                  deficitInfo={forecastData.deficitInfo}
                  safetyBuffer={safetyBuffer}
                  currency={currency}
                  onChaseInvoice={handleChaseWhatsApp}
                />
              </div>
            </div>
          )}

          {/* TAB 4: COMMITTED OUTFLOWS & QUICK INPUT */}
          {activeTab === 'outflows' && (
            <div className="space-y-6">
              <div className="fintech-panel-dark p-6 sm:p-8">
                <QuickInputBar onCreateInvoice={handleQuickCreateInvoice} clients={clients} />
              </div>
              <div className="fintech-panel-dark p-6 sm:p-8">
                <OutflowsManager
                  bills={bills}
                  onSaveBill={handleSaveBill}
                  onDeleteBill={handleDeleteBill}
                  onToggleFlexible={handleToggleFlexible}
                />
              </div>
            </div>
          )}

          {/* TAB 5: MY CARDS & LIQUIDITY */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              <FintechOverview
                cashBalance={cashBalance}
                monthlyBurn={monthlyBurn}
                safetyBuffer={safetyBuffer}
                currency={currency}
                onOpenNewInvoice={handleOpenNewInvoice}
                onOpenSend={() => setActiveTab('outflows')}
                onOpenReceive={() => setIsInvoiceModalOpen(true)}
                onContactClick={(contact) => showToast(`Selected contact: ${contact.name}`)}
              />
            </div>
          )}

        </div>

        {/* COMPACT FOOTER */}
        <footer className="border-t border-gray-200/80 bg-white/70 backdrop-blur-sm text-gray-500 text-xs py-5 px-6 sm:px-8 mt-12">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-[#111827] flex items-center justify-center text-[#C8F832] font-black text-[10px]">
                SF
              </div>
              <span className="font-bold text-[#111827] tracking-tight">StudioFlow Neo-Fintech</span>
              <span className="text-gray-300">|</span>
              <span className="text-[11px] text-gray-500">Autonomous Cash Operations Radar</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {apiOnline ? 'API:3001 Live' : 'Offline-first Local Store'}
              </span>
              <span>·</span>
              <span>Private & Client-Side Encrypted</span>
            </div>
          </div>
        </footer>

      </div>

      {/* MODALS */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        clients={clients}
        currency={currency}
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
        currency={currency}
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
