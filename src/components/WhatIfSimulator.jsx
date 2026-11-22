import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Laptop, 
  Clock, 
  MessageSquare,
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
    <div className="card-spacex p-6 sm:p-8 space-y-6 bg-[#0a0a0a]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3a3a3f]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-[4px] bg-black border border-[#3a3a3f] flex items-center justify-center text-white">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <h2 className="button-cap text-white text-base">
              WHAT-IF CASH STRESS SIMULATOR
            </h2>
            {isSimulationActive ? (
              <span className="micro-cap text-white px-2.5 py-0.5 rounded-[32px] border border-white bg-black">
                SIMULATION ACTIVE
              </span>
            ) : (
              <span className="micro-cap text-[#5a5a5f] px-2.5 py-0.5 rounded-[32px] border border-[#3a3a3f] bg-black">
                BASELINE
              </span>
            )}
          </div>
          <p className="micro-cap text-[#5a5a5f] mt-1.5">
            Model liquidity resilience against late client payments and unexpected hardware expenses
          </p>
        </div>

        {isSimulationActive && (
          <button
            onClick={onResetScenarios}
            className="button-ghost-sm text-xs py-1.5 px-3.5 self-start sm:self-auto flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3 text-white" />
            <span>Reset Baseline</span>
          </button>
        )}
      </div>

      {/* Dynamic Deficit Warning Banner */}
      {deficitInfo?.isBelowBuffer ? (
        <div className="bg-black border border-[#ef4444] rounded-[4px] p-5 text-white space-y-4 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[4px] border border-[#ef4444] text-[#ef4444] shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="button-cap text-white text-sm">
                    DEFICIT ALERT: -{currency}{deficitInfo.maxShortfall} SHORTFALL ON DAY {deficitInfo.firstDeficitDay}
                  </h3>
                  <span className="micro-cap text-[#ef4444] px-2 py-0.5 rounded-[32px] border border-[#ef4444]">
                    BELOW {currency}{safetyBuffer.toLocaleString()} BUFFER
                  </span>
                </div>
                <p className="text-xs text-[#f0f0fa]">
                  {deficitInfo.alertMessage || `Cash dips to ${currency}${deficitInfo.lowestCashPoint?.toLocaleString()} on Day ${deficitInfo.lowestCashDay}. ${deficitInfo.recommendedAction}`}
                </p>
              </div>
            </div>

            {/* Direct Action Trigger */}
            {deficitInfo?.actionInvoice && (
              <button
                onClick={() => onChaseInvoice && onChaseInvoice(deficitInfo.actionInvoice)}
                className="button-ghost-on-dark shrink-0 self-start md:self-auto text-xs py-2.5 px-5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chase Invoice #{deficitInfo.actionInvoice.invoice_number?.replace('INV-2026-', '') || '104'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-4 text-white flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-white shrink-0" />
            <span className="text-[#f0f0fa]">
              <strong className="text-white">Healthy Trajectory:</strong> Studio maintains minimum {currency}{safetyBuffer.toLocaleString()} safe reserve across the forecast window.
            </span>
          </div>
          <span className="micro-cap text-white border border-[#3a3a3f] px-2.5 py-0.5 rounded-[32px] shrink-0">
            NOMINAL
          </span>
        </div>
      )}

      {/* Simulator Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Control 1: Key Client Acme Studios Delay Slider */}
        <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="button-cap text-white text-sm">
                  ACME STUDIOS ({currency}3,500)
                </span>
                <span className="micro-cap text-[#5a5a5f]">
                  #101
                </span>
              </div>
              <p className="micro-cap text-[#5a5a5f] mt-1">
                Net 30 milestone invoice payment delay
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className={`micro-cap text-xs font-bold px-2.5 py-1 rounded-[32px] border tabular-nums ${
                acmeDelay > 15
                  ? 'border-[#ef4444] text-[#ef4444]'
                  : acmeDelay > 0
                  ? 'border-[#f59e0b] text-[#f59e0b]'
                  : 'border-[#3a3a3f] text-[#5a5a5f]'
              }`}>
                +{acmeDelay} DAYS
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2.5 pt-1">
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={acmeDelay}
              onChange={handleAcmeSliderChange}
              className="w-full h-1.5 bg-[#3a3a3f] rounded-none appearance-none cursor-pointer accent-white focus:outline-none"
            />
            <div className="flex justify-between micro-cap text-[#5a5a5f]">
              <span>On Time (Day 12)</span>
              <span className={acmeDelay >= 15 ? 'text-white font-bold' : ''}>+15d (Day 27)</span>
              <span className={acmeDelay >= 30 ? 'text-[#ef4444] font-bold' : ''}>+30d</span>
              <span>+45d extreme</span>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="micro-cap text-[#5a5a5f] mr-1">PRESETS:</span>
            {[
              { label: 'On Time (0d)', days: 0 },
              { label: '+10 Days', days: 10 },
              { label: '+16 Days (Shortfall)', days: 16 },
              { label: '+30 Days (Crisis)', days: 30 },
            ].map((preset) => (
              <button
                key={preset.days}
                onClick={() => handleApplyPreset(preset.days)}
                className={`text-[11px] font-bold px-3 py-1 rounded-[32px] border transition ${
                  acmeDelay === preset.days
                    ? 'bg-white text-black border-white'
                    : 'bg-black text-[#f0f0fa] border-[#3a3a3f] hover:border-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-[#5a5a5f] italic">
            {acmeDelay > 15
              ? 'Delaying beyond 15 days pushes Acme settlement past day 24 overhead, triggering a cash deficit.'
              : 'Acme settlement lands before day 24 overhead, maintaining buffer integrity.'}
          </p>
        </div>

        {/* Control 2: CapEx & Flexible Outflows Controls */}
        <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* CapEx Toggle: M4 MacBook */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-[4px] bg-[#0a0a0a] border border-[#3a3a3f]">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-[4px] border ${
                  isMacbookCapex
                    ? 'border-white text-white'
                    : 'border-[#3a3a3f] text-[#5a5a5f]'
                }`}>
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="button-cap text-white text-xs block truncate">
                    SIMULATE HARDWARE CAPEX ({currency}1,800)
                  </span>
                  <p className="micro-cap text-[#5a5a5f] mt-0.5">
                    Studio workstation upgrade on Day 14
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleCapex}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-[32px] border transition-colors duration-200 ease-in-out focus:outline-none ${
                  isMacbookCapex ? 'bg-white border-white' : 'bg-black border-[#3a3a3f]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
                    isMacbookCapex ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
                  }`}
                />
              </button>
            </div>

            {/* Defense Toggle: Defer Flexible Expenses */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-[4px] bg-[#0a0a0a] border border-[#3a3a3f]">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-[4px] border ${
                  isDeferFlexible
                    ? 'border-white text-white'
                    : 'border-[#3a3a3f] text-[#5a5a5f]'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="button-cap text-white text-xs block truncate">
                    DEFENSE: DEFER FLEXIBLE OUTFLOWS
                  </span>
                  <p className="micro-cap text-[#5a5a5f] mt-0.5">
                    Temporarily halt AWS GPU ($220) &amp; tax reserve ($2,710)
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleFlexibleBills}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-[32px] border transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDeferFlexible ? 'bg-white border-white' : 'bg-black border-[#3a3a3f]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
                    isDeferFlexible ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="micro-cap text-[#5a5a5f]">
            Combine delayed receivables with CapEx to stress-test minimum runway trajectory.
          </p>
        </div>
      </div>
    </div>
  );
}
