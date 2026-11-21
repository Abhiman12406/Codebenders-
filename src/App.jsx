import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import AgingDashboard from './components/AgingDashboard.jsx';
import InvoiceModal from './components/InvoiceModal.jsx';
import WhatsAppModal from './components/WhatsAppModal.jsx';
import { dataService } from './lib/dataService.js';
import mockDesignerData from './data/mockDesignerData.js';

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

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForWhatsApp, setSelectedInvoiceForWhatsApp] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initialize and load seed data
  useEffect(() => {
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

    loadData();
  }, []);

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
    setIsBadDayActive((prev) => !prev);
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

      // Immediately increment cash balance
      const amt = Number(invoice.amount) || 0;
      setCashBalance((prev) => prev + amt);
      showToast(`🎉 Marked ${invoice.invoice_number} as paid! +$${amt.toLocaleString()} added to cash balance.`);
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err);
    }
  };

  // Direct action: Split Payment (Offer 50/50 plan)
  const handleSplitPayment = async (invoice) => {
    try {
      const halfAmount = Math.round((Number(invoice.amount) / 2) * 100) / 100;
      const today = new Date();
      
      const due1 = today.toISOString().split('T')[0];
      const due2Date = new Date();
      due2Date.setDate(due2Date.getDate() + 15);
      const due2 = due2Date.toISOString().split('T')[0];

      // Update Part 1
      const updatedPart1 = await dataService.updateInvoice(invoice.id, {
        amount: halfAmount,
        project_title: `${invoice.project_title} (Part 1/2 - 50%)`,
        due_date: due1,
        notes: `Split payment agreement: 50% due immediately (${due1}).`,
      });

      // Create Part 2
      const newPart2 = await dataService.createInvoice({
        client_id: invoice.client_id,
        client_name: invoice.client_name,
        client_phone: invoice.client_phone,
        invoice_number: `${invoice.invoice_number}-B`,
        project_title: `${invoice.project_title} (Part 2/2 - 50%)`,
        amount: halfAmount,
        issue_date: due1,
        due_date: due2,
        status: 'sent',
        items: invoice.items || [],
        notes: `Split payment agreement: 50% remaining due on ${due2}.`,
      });

      setInvoices((prev) =>
        [newPart2, ...prev.map((inv) => (inv.id === invoice.id ? updatedPart1 : inv))]
      );

      showToast(`✂️ Split ${invoice.invoice_number} into two 50% installments ($${halfAmount.toLocaleString()} each).`);
    } catch (err) {
      console.error('Failed to split invoice payment:', err);
    }
  };

  const handleChaseWhatsApp = (invoice) => {
    setSelectedInvoiceForWhatsApp(invoice);
  };

  // Save newly created invoice
  const handleSaveInvoice = async (invoiceData) => {
    try {
      let clientId = invoiceData.client_id;

      // If user typed a new client name
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
      showToast(`✨ Created invoice ${created.invoice_number} for $${created.amount.toLocaleString()}!`);
    } catch (err) {
      console.error('Failed to create invoice:', err);
      showToast('❌ Failed to create invoice. Please try again.');
    }
  };

  // Log follow up
  const handleLogFollowUp = async (followUpData) => {
    try {
      const logged = await dataService.logFollowUp(followUpData);
      setFollowUps((prev) => [logged, ...prev]);
      showToast(`🚀 WhatsApp follow-up opened & logged in studio history!`);
    } catch (err) {
      console.error('Failed to log follow-up:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Booting StudioFlow Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl shadow-indigo-950/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        profile={profile}
        cashBalance={cashBalance}
        runwayDays={runwayDays}
        safetyBuffer={profile?.safety_buffer || 1500}
        isCloudSynced={isCloudSynced}
        isBadDayActive={isBadDayActive}
        onToggleBadDay={handleToggleBadDay}
        onOpenNewInvoice={handleOpenNewInvoice}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Bad Day Alert Banner if active */}
        {isBadDayActive && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 text-rose-200 flex items-center justify-between gap-4 shadow-lg shadow-rose-950/50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="font-bold text-white text-sm">Crisis Protocol Active: "Bad Day" Multi-Default</h3>
                <p className="text-xs text-rose-300">
                  5 key client deliverables are delayed by 30 days concurrently. Deficit alert triggered.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBadDayActive(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white transition shrink-0"
            >
              Reset Protocol
            </button>
          </div>
        )}

        {/* Task 5: Aging AR Dashboard */}
        <AgingDashboard
          invoices={invoices}
          clients={clients}
          currency={profile?.currency || '$'}
          onChaseWhatsApp={handleChaseWhatsApp}
          onMarkPaid={handleMarkAsPaid}
          onSplitPayment={handleSplitPayment}
        />

      </main>

      {/* Task 6: Invoice Creation Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        clients={clients}
        currency={profile?.currency || '$'}
        onSaveInvoice={handleSaveInvoice}
      />

      {/* Task 6: Assisted WhatsApp Follow-Up Modal */}
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
    </div>
  );
}
