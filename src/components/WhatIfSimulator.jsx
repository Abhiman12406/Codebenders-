import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Laptop, 
  Clock, 
  MessageSquare, 
  ArrowRight 
} from 'lucide-react';

export default function WhatIfSimulator({
  scenarios,
  onScenarioChange,
  onResetScenarios,
  deficitInfo,
  safetyBuffer = 1500,
  currency = '$',
  onChaseInvoice,
}) {
  const acmeDelay = Number(scenarios?.acmeDelayDays) || 0;
  const isMacbookCapex = Boolean(scenarios?.macbookCapex);
  const isDeferFlexible = Boolean(scenarios?.deferFlexibleBills);

  const isSimulationActive = acmeDelay > 0 || isMacbookCapex || isDeferFlexible;

  const handleAcmeSliderChange = (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    onScenarioChange({
      ...scenarios,
      acmeDelayDays: val,
    });
  };

  const handleToggleCapex = () => {
    onScenarioChange({
      ...scenarios,
      macbookCapex: !isMacbookCapex,
    });
  };

  const handleToggleFlexibleBills = () => {
    onScenarioChange({
      ...scenarios,
      deferFlexibleBills: !isDeferFlexible,
    });
  };

  const handleApplyPreset = (delay) => {
    onScenarioChange({
      ...scenarios,
      acmeDelayDays: delay,
    });
  };

  return (
    <div className="card-cockpit p-5 sm:p-6 space-y-6 rounded-[28px] border-[#2A2A30]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A30]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#675DFC]/15 border border-[#675DFC]/30 flex items-center justify-center text-[#A298DF] shadow-inner">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-white text-base tracking-tight">
              What-If Stress Simulator
            </h2>
            {isSimulationActive ? (
              <span className="text-[10px] font-bold text-[#C4FC51] px-2.5 py-0.5 rounded-full border border-[#C4FC51]/40 bg-[#C4FC51]/10 shadow-sm animate-pulse">
                Simulation Active
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-[#A1A1AA] px-2.5 py-0.5 rounded-full border border-[#2D2D35] bg-[#141417]">
                Baseline
              </span>
            )}
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Model liquidity resilience against late client settlements and unexpected studio expenses.
          </p>
        </div>

        {isSimulationActive && (
          <button
            onClick={onResetScenarios}
            className="button-ghost text-xs py-1.5 px-3 self-start sm:self-auto flex items-center gap-1.5 hover:border-white transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
        )}
      </div>

      {/* Dynamic Deficit Warning Banner */}
      {deficitInfo?.isBelowBuffer ? (
        <div className="bg-gradient-to-r from-rose-950/40 via-[#1E1418] to-[#18181B] border border-rose-500/40 rounded-2xl p-4.5 text-white space-y-3 shadow-lg shadow-rose-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5 shadow-inner">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-rose-200 text-sm">
                    DEFICIT ALERT: -{currency}{deficitInfo.maxShortfall} SHORTFALL ON DAY {deficitInfo.firstDeficitDay}
                  </h3>
                  <span className="text-[10px] font-bold text-rose-300 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40">
                    Below {currency}{safetyBuffer.toLocaleString()} Buffer
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {deficitInfo.alertMessage || `Cash dips to ${currency}${deficitInfo.lowestCashPoint?.toLocaleString()} on Day ${deficitInfo.lowestCashDay}. ${deficitInfo.recommendedAction}`}
                </p>
              </div>
            </div>

            {/* Direct Action Trigger */}
            {deficitInfo?.actionInvoice && (
              <button
                onClick={() => onChaseInvoice && onChaseInvoice(deficitInfo.actionInvoice)}
                className="btn-primary-purple shrink-0 self-start md:self-auto text-xs py-2 px-4 shadow-md flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chase Invoice #{deficitInfo.actionInvoice.invoice_number?.replace('INV-2026-', '') || '104'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/30 via-[#131D17] to-[#18181B] border border-emerald-500/30 rounded-2xl p-4 text-white flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-300">
              <strong className="text-white">Nominal Trajectory:</strong> Reserves remain securely above the {currency}{safetyBuffer.toLocaleString()} buffer across the forecast window.
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full bg-emerald-950/50 shrink-0">
            NOMINAL
          </span>
        </div>
      )}

      {/* Simulator Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Control 1: Key Client Acme Studios Delay Slider */}
        <div className="bg-[#18181B] border border-[#2A2A30] rounded-2xl p-4.5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  Acme Studios ({currency}3,500)
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  #101
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Simulate delayed settlement on milestone receivable
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border tabular-nums ${
                acmeDelay > 15
                  ? 'border-rose-500/40 text-rose-400 bg-rose-950/30'
                  : acmeDelay > 0
                  ? 'border-amber-500/40 text-amber-400 bg-amber-950/30'
                  : 'border-[#2D2D35] text-[#A1A1AA] bg-[#141417]'
              }`}>
                +{acmeDelay}d DELAY
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2 pt-1">
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={acmeDelay}
              onChange={handleAcmeSliderChange}
              className="w-full cursor-pointer accent-[#675DFC]"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
              <span>On Time (Day 12)</span>
              <span className={acmeDelay >= 15 ? 'text-amber-400 font-bold' : ''}>+15d (Day 27)</span>
              <span className={acmeDelay >= 30 ? 'text-rose-400 font-bold' : ''}>+30d</span>
              <span>+45d Extreme</span>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-xs text-[#A1A1AA] mr-1 font-semibold">Presets:</span>
            {[
              { label: 'On Time (0d)', days: 0 },
              { label: '+10 Days', days: 10 },
              { label: '+16 Days (Shortfall)', days: 16 },
              { label: '+30 Days (Crisis)', days: 30 },
            ].map((preset) => (
              <button
                key={preset.days}
                onClick={() => handleApplyPreset(preset.days)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                  acmeDelay === preset.days
                    ? 'bg-[#6458E2] text-white border-[#6458E2] shadow-sm shadow-[#6458E2]/25'
                    : 'bg-[#141417] text-zinc-300 border-[#2D2D35] hover:border-zinc-500 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-zinc-500">
            {acmeDelay > 15
              ? 'Delaying beyond 15 days pushes settlement past recurring rent/server outflows, causing a deficit.'
              : 'Settlement lands before day 24 overhead, maintaining buffer integrity.'}
          </p>
        </div>

        {/* Control 2: CapEx & Flexible Outflows Controls */}
        <div className="bg-[#18181B] border border-[#2A2A30] rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            {/* CapEx Toggle: M4 MacBook */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#141417] border border-[#2A2A30]">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-lg border ${
                  isMacbookCapex
                    ? 'border-[#675DFC]/50 text-[#A298DF] bg-[#675DFC]/15'
                    : 'border-[#2D2D35] text-zinc-500 bg-transparent'
                }`}>
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">
                    Simulate Hardware CapEx ({currency}1,800)
                  </span>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Workstation hardware upgrade on Day 14
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleCapex}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                  isMacbookCapex
                    ? 'bg-[#6458E2] text-white border-[#6458E2] shadow-sm'
                    : 'bg-transparent text-zinc-300 border-[#2D2D35] hover:border-zinc-500'
                }`}
              >
                {isMacbookCapex ? 'Added' : '+ Add'}
              </button>
            </div>

            {/* Flexible Bill Deferral Toggle */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#141417] border border-[#2A2A30]">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-lg border ${
                  isDeferFlexible
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                    : 'border-[#2D2D35] text-zinc-500 bg-transparent'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">
                    Defer Discretionary Software Outflows
                  </span>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Postpone flexible subscriptions during cash dips
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleFlexibleBills}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                  isDeferFlexible
                    ? 'bg-[#10B981] text-white border-emerald-500 shadow-sm'
                    : 'bg-transparent text-zinc-300 border-[#2D2D35] hover:border-zinc-500'
                }`}
              >
                {isDeferFlexible ? 'Active' : 'Engage'}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#2A2A30] flex items-center justify-between text-[11px] text-zinc-500 font-medium">
            <span>Buffer Protection: Real-Time</span>
            <span className="text-[#A1A1AA] font-mono">Dynamic Recalculation</span>
          </div>
        </div>

      </div>
    </div>
  );
}
