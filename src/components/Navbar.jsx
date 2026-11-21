import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Flame, 
  Sparkles, 
  Cloud, 
  Laptop,
  Layers
} from 'lucide-react';

export default function Navbar({
  profile,
  cashBalance,
  runwayDays,
  safetyBuffer = 1500,
  isCloudSynced = false,
  isBadDayActive = false,
  onToggleBadDay,
  onOpenNewInvoice,
}) {
  const currency = profile?.currency || '$';
  const businessName = profile?.business_name || 'Aura Design Studio';
  const ownerName = profile?.owner_name || 'Alex Morgan';

  // Determine runway health status
  const getRunwayBadge = () => {
    if (runwayDays <= 14 || cashBalance < safetyBuffer) {
      return {
        label: `${runwayDays}d Critical`,
        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-500',
        icon: AlertTriangle,
      };
    }
    if (runwayDays <= 30) {
      return {
        label: `${runwayDays}d Tight`,
        color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
        icon: AlertTriangle,
      };
    }
    return {
      label: `${runwayDays}d Safe`,
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
    };
  };

  const runway = getRunwayBadge();
  const RunwayIcon = runway.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Left: Branding & Studio Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Layers className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight truncate">
                  StudioFlow
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                  v0.1
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {businessName} <span className="hidden sm:inline text-slate-600">•</span> <span className="hidden sm:inline text-slate-500">{ownerName}</span>
              </p>
            </div>
          </div>

          {/* Center / Right: Cash Runway & Health Metrics */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mode Indicator: Cloud vs Guest */}
            <div 
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isCloudSynced 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
              title={isCloudSynced ? 'Connected to Supabase PostgreSQL' : 'Guest Demo: Persisting in browser localStorage'}
            >
              {isCloudSynced ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud Synced</span>
                </>
              ) : (
                <>
                  <Laptop className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guest Demo</span>
                </>
              )}
            </div>

            {/* Cash Balance + Runway Health Pill */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 sm:p-1.5 shadow-inner">
              <div className="px-2 sm:px-3 text-left">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Cash Balance
                </div>
                <div className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {currency}{Number(cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Dynamic Runway Health Badge */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${runway.color} transition-all`}
                title={`Buffer: ${currency}${safetyBuffer.toLocaleString()}. Based on recurring monthly studio overhead.`}
              >
                <RunwayIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{runway.label}</span>
              </div>
            </div>

            {/* Quick Action: Simulate Bad Day */}
            <button
              onClick={onToggleBadDay}
              type="button"
              className={`relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                isBadDayActive
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/50 animate-pulse'
                  : 'bg-rose-950/30 text-rose-300 border-rose-900/60 hover:bg-rose-900/40 hover:border-rose-700'
              }`}
              title="Crisis Simulation: 5 customers delay payments at once. Triggers automated liquidity triage."
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">
                {isBadDayActive ? 'Crisis Active' : 'Simulate Bad Day'}
              </span>
              <span className="sm:hidden">
                {isBadDayActive ? 'Crisis' : 'Bad Day'}
              </span>
            </button>

            {/* CTA: New Invoice */}
            <button
              onClick={onOpenNewInvoice}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 border border-indigo-500/50"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">New Invoice</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
