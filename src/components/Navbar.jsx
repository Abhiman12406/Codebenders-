import React from 'react';
import { 
  Plus, 
  Flame, 
  Wallet,
  Activity
} from 'lucide-react';

export default function Navbar({
  profile,
  cashBalance,
  runwayDays,
  safetyBuffer = 1500,
  isCloudSynced = false,
  isBadDayActive = false,
  apiOnline = false,
  onToggleBadDay,
  onOpenNewInvoice,
  onOpenAuth,
  onSignOut,
}) {
  const currency = profile?.currency || '$';

  // Determine runway status with clean high-contrast indicators
  const getRunwayBadge = () => {
    if (runwayDays <= 14 || cashBalance < safetyBuffer) {
      return {
        label: `${runwayDays}d Critical`,
        pillClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        dot: 'bg-rose-500',
      };
    }
    if (runwayDays <= 30) {
      return {
        label: `${runwayDays}d Tight`,
        pillClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: `+${runwayDays}d Runway`,
      pillClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
    };
  };

  const runway = getRunwayBadge();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#27272a] bg-black/90 backdrop-blur-md select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Wordmark & Navigation */}
        <div className="flex items-center gap-6 sm:gap-8">
          <a 
            href="#overview" 
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-85"
          >
            <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-extrabold text-xs tracking-tighter">
              SF
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-white tracking-wider uppercase leading-none">
                STUDIOFLOW
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 mt-0.5">
                Operations Cockpit
              </span>
            </div>
          </a>

          {/* Quick Nav Anchor Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs text-zinc-400">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#command" className="hover:text-white transition-colors">Command</a>
            <a href="#aging" className="hover:text-white transition-colors">Receivables</a>
            <a href="#forecast" className="hover:text-white transition-colors">Cash Horizon</a>
            <a href="#outflows" className="hover:text-white transition-colors">Outflows</a>
          </nav>
        </div>

        {/* Right Telemetry & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Connection Status: API & Cloud */}
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
            {apiOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium" title="Node Express Backend online on port 3001">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> API:3001
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-zinc-400 text-[11px]" title="Running in browser offline-first storage">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" /> Local Store
              </span>
            )}
            
            <span className="text-zinc-600">·</span>

            {isCloudSynced ? (
              <span className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
                Cloud Synced
              </span>
            ) : (
              <span className="text-zinc-400 text-[11px]">
                Local
              </span>
            )}
            <button
              type="button"
              onClick={isCloudSynced ? onSignOut : onOpenAuth}
              className="text-[11px] text-zinc-300 hover:text-white hover:underline ml-0.5"
            >
              [{isCloudSynced ? 'Sign out' : 'Connect'}]
            </button>
          </div>

          {/* Reserves & Runway Tag */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0e0e11] border border-[#27272a]">
            <Wallet className="w-3.5 h-3.5 text-zinc-400" />
            <div className="text-right">
              <div className="font-semibold text-xs sm:text-sm text-white tabular-nums tracking-tight">
                {currency}{Number(cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Runway Tag */}
            <div 
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${runway.pillClass}`}
              title={`Safety Buffer: ${currency}${safetyBuffer.toLocaleString()}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${runway.dot}`} />
              <span>{runway.label}</span>
            </div>
          </div>

          {/* Bad Day Crisis Toggle */}
          <button
            onClick={onToggleBadDay}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isBadDayActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-zinc-300 border border-[#27272a] hover:border-amber-400/40 hover:text-amber-300 bg-transparent'
            }`}
            title="Crisis Stress-Test: Simulates multi-client default to test liquidity."
          >
            <Flame className={`w-3.5 h-3.5 shrink-0 ${isBadDayActive ? 'text-rose-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">
              {isBadDayActive ? 'Crisis Active' : 'Crisis Triage'}
            </span>
          </button>

          {/* Create Invoice Primary Button */}
          <button
            onClick={onOpenNewInvoice}
            type="button"
            className="button-primary text-xs py-1.5 sm:py-2 px-3.5 sm:px-4 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>

        </div>
      </div>
    </header>
  );
}
