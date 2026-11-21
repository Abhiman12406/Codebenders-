import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Laptop, 
  Clock, 
  MessageSquare,
  Sparkles,
  Zap,
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 backdrop-blur-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              "What-If" Cash Stress Test
            </h2>
            {isSimulationActive ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                <Zap className="w-3 h-3 text-amber-400" /> Simulation Active
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                Baseline Trajectory
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test liquidity resilience against late client payments and equipment CapEx purchases
          </p>
        </div>

        {isSimulationActive && (
          <button
            onClick={onResetScenarios}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset to Baseline
          </button>
        )}
      </div>

      {/* Dynamic Deficit Warning Banner */}
      {deficitInfo?.isBelowBuffer ? (
        <div className="bg-gradient-to-r from-rose-950/60 via-rose-900/40 to-slate-900/80 border border-rose-500/50 rounded-xl p-4 text-rose-100 shadow-xl shadow-rose-950/40 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    ⚠️ Cash Deficit Alert: -{currency}{deficitInfo.maxShortfall} shortfall on Day {deficitInfo.firstDeficitDay}
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Below ${safetyBuffer.toLocaleString()} Buffer
                  </span>
                </div>
                <p className="text-xs text-rose-200">
                  {deficitInfo.alertMessage || `Cash dips to ${currency}${deficitInfo.lowestCashPoint?.toLocaleString()} on Day ${deficitInfo.lowestCashDay}. ${deficitInfo.recommendedAction}`}
                </p>
              </div>
            </div>

            {/* Direct Action Trigger */}
            {deficitInfo?.actionInvoice && (
              <button
                onClick={() => onChaseInvoice && onChaseInvoice(deficitInfo.actionInvoice)}
                className="self-start md:self-auto shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Chase Invoice #{deficitInfo.actionInvoice.invoice_number?.replace('INV-2026-', '') || '104'} on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Healthy Cash Trajectory:</strong> Studio maintains minimum {currency}{safetyBuffer.toLocaleString()} safe buffer across the entire forecast window.
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            Resilient
          </span>
        </div>
      )}

      {/* Simulator Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Control 1: Key Client Acme Studios Delay Slider */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">
                  Key Client: Acme Studios ({currency}3,500)
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                  Invoice #101
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Simulate payment delay: Net 30 deliverable with habitual payment lag
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-sm font-extrabold px-2 py-1 rounded-lg border ${
                acmeDelay > 15
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : acmeDelay > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                +{acmeDelay} Days
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-1.5 pt-1">
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={acmeDelay}
              onChange={handleAcmeSliderChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>On Time (Day 12)</span>
              <span className={acmeDelay >= 15 ? 'text-amber-400 font-bold' : ''}>+15d (Day 27)</span>
              <span className={acmeDelay >= 30 ? 'text-rose-400 font-bold' : ''}>+30d</span>
              <span>+45d Extreme</span>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
            <span className="text-[10px] text-slate-500 font-medium mr-1">Presets:</span>
            {[
              { label: 'On Time (0d)', days: 0 },
              { label: '+10 Days', days: 10 },
              { label: '+16 Days (Shortfall)', days: 16 },
              { label: '+30 Days (Crisis)', days: 30 },
            ].map((preset) => (
              <button
                key={preset.days}
                onClick={() => handleApplyPreset(preset.days)}
                className={`text-[11px] font-medium px-2 py-1 rounded-md border transition ${
                  acmeDelay === preset.days
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Helper hint */}
          <p className="text-[10px] text-slate-400 italic">
            {acmeDelay > 15
              ? '⚠️ Dragging past 15 days pushes Acme ($3,500) past Day 24, triggering the cash deficit alert.'
              : 'Acme payment lands before Day 24 expenses, keeping studio cash balance above buffer.'}
          </p>
        </div>

        {/* Control 2: CapEx & Flexible Outflows Controls */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            {/* CapEx Toggle: M4 MacBook */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`p-2 rounded-lg border ${
                  isMacbookCapex
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">
                    Simulate M4 MacBook Purchase ({currency}1,800)
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Studio hardware upgrade CapEx scheduled on Day 14
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleCapex}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isMacbookCapex ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isMacbookCapex ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Defense Toggle: Defer Flexible Expenses */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`p-2 rounded-lg border ${
                  isDeferFlexible
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">
                    Defense: Defer Flexible Bills
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Temporarily pause AWS GPU Render ($220) & Tax Reserve ($2,710)
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleFlexibleBills}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDeferFlexible ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDeferFlexible ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-2">
            💡 Combine client delays with CapEx to stress-test studio emergency cash resilience.
          </p>
        </div>
      </div>
    </div>
  );
}
