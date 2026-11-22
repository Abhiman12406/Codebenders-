import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Flame, 
  Activity
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
  onOpenAuth,
  onSignOut,
}) {
  const currency = profile?.currency || '$';

  // Determine runway status (clean high-contrast indicator)
  const getRunwayBadge = () => {
    if (runwayDays <= 14 || cashBalance < safetyBuffer) {
      return {
        label: `${runwayDays}d Critical`,
        classes: 'border-[#ef4444] text-[#ef4444]',
        dot: 'bg-[#ef4444]',
      };
    }
    if (runwayDays <= 30) {
      return {
        label: `${runwayDays}d Tight`,
        classes: 'border-[#f59e0b] text-[#f59e0b]',
        dot: 'bg-[#f59e0b]',
      };
    }
    return {
      label: `${runwayDays}d Runway`,
      classes: 'border-[#3a3a3f] text-white',
      dot: 'bg-white',
    };
  };

  const runway = getRunwayBadge();

  return (
    <header className="sticky top-0 left-0 z-50 w-full border-b border-[#3a3a3f] bg-black/90 backdrop-blur-md select-none transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
        
        {/* Left: SpaceX Wordmark & Navigation Links */}
        <div className="flex items-center gap-8 sm:gap-10">
          
          {/* Logo Wordmark (Uppercase D-DIN-Bold signature) */}
          <a 
            href="#overview" 
            className="flex items-center gap-3 group transition-opacity hover:opacity-80"
          >
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl text-white tracking-[2px] uppercase leading-none">
                STUDIOFLOW
              </span>
              <span className="text-[10px] uppercase tracking-[1.2px] text-[#5a5a5f] mt-1 font-sans">
                Cash Runway Radar
              </span>
            </div>
          </a>

          {/* Nav Items (Uppercase micro-cap with positive tracking) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-[1.17px] text-[#f0f0fa]">
            <a
              href="#overview"
              className="hover:text-white transition-colors py-1"
            >
              Overview
            </a>
            <a
              href="#interactive-suite"
              className="hover:text-white transition-colors py-1"
            >
              Command
            </a>
            <a
              href="#aging"
              className="hover:text-white transition-colors py-1"
            >
              Receivables
            </a>
            <a
              href="#forecast"
              className="hover:text-white transition-colors py-1"
            >
              Cash Horizon
            </a>
            <a
              href="#outflows"
              className="hover:text-white transition-colors py-1"
            >
              Outflows
            </a>
          </nav>
        </div>

        {/* Right Utility Bar */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Cloud Sync State */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#5a5a5f]">
            {isCloudSynced ? (
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> Cloud Synced
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#5a5a5f]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5a5a5f] inline-block" /> Local Mode
              </span>
            )}
            <button
              type="button"
              onClick={isCloudSynced ? onSignOut : onOpenAuth}
              className="text-[11px] uppercase tracking-[0.96px] text-[#f0f0fa] hover:text-white hover:underline ml-1"
            >
              [{isCloudSynced ? 'Sign out' : 'Connect'}]
            </button>
          </div>

          {/* Reserves Readout */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[4px] bg-[#0a0a0a] border border-[#3a3a3f]">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[1.17px] text-[#5a5a5f] font-bold leading-none">
                Reserves
              </div>
              <div className="font-bold text-xs sm:text-sm text-white tabular-nums tracking-[0.96px] leading-snug">
                {currency}{Number(cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Dynamic Runway Health Tag */}
            <div 
              className={`text-[10px] font-bold uppercase tracking-[0.96px] px-2 py-0.5 rounded-[32px] border flex items-center gap-1.5 ${runway.classes}`}
              title={`Safety Buffer: ${currency}${safetyBuffer.toLocaleString()}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${runway.dot}`} />
              <span className="hidden xs:inline">{runway.label}</span>
            </div>
          </div>

          {/* Bad Day Crisis Simulator Toggle Button */}
          <button
            onClick={onToggleBadDay}
            type="button"
            className={`px-3 py-1.5 rounded-[32px] text-xs font-bold uppercase tracking-[0.96px] flex items-center gap-1.5 transition-all ${
              isBadDayActive
                ? 'bg-white text-black border border-white'
                : 'text-white border border-[#3a3a3f] hover:border-white'
            }`}
            title="Crisis Stress-Test: Simulates multi-client default to test liquidity."
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {isBadDayActive ? 'Crisis Active' : 'Bad Day Test'}
            </span>
          </button>

          {/* SpaceX Ghost Outlined Pill CTA */}
          <button
            onClick={onOpenNewInvoice}
            type="button"
            className="button-ghost-on-dark whitespace-nowrap text-xs sm:text-[13px] py-2 sm:py-2.5 px-3.5 sm:px-5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>

        </div>

      </div>
    </header>
  );
}
