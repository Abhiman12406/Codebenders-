import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
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

  // Modals state (wired up in tasks 5 & 6)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForWhatsApp, setSelectedInvoiceForWhatsApp] = useState(null);

  // Initialize and load seed data
  useEffect(() => {
    async function loadData() {
      try {
        // Seed default dataset if none exists in storage
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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

        {/* Placeholder container for Task 5 and Task 6 */}
        <div className="text-slate-500 text-center py-12 border border-dashed border-slate-800 rounded-2xl">
          <p className="text-sm font-medium">Phase 2: Invoicing & Accounts Receivable in progress...</p>
        </div>
      </main>
    </div>
  );
}
