import React from 'react';
import { X, Flame, ShieldAlert, Split, MessageSquare, Pause } from 'lucide-react';

const toAmount = (item) => Number(item?.amount) || 0;

const formatDollars = (value) =>
  `$${Math.round(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export default function BadDayTriageModal({
  isOpen,
  onClose,
  pendingInvoices = [],
  bills = [],
  cashBalance = 0,
  onChaseWhatsApp,
  onSplitPayment,
  onDeferFlexibleBills,
}) {
  if (!isOpen) return null;

  const unpaidInvoices = pendingInvoices.filter((inv) => inv?.status !== 'paid');
  const expectedInflow = unpaidInvoices.reduce((sum, inv) => sum + toAmount(inv), 0);

  const cycleBills = bills.filter((bill) => Number(bill?.due_day) <= 30);
  const outflowsDueBeforeNextCycle = cycleBills.reduce((sum, bill) => sum + toAmount(bill), 0);
  const shortfall = Math.max(0, outflowsDueBeforeNextCycle - (Number(cashBalance) || 0));

  const quickCashInvoices = unpaidInvoices.filter((inv) => toAmount(inv) < 1000);

  const largestInvoice = unpaidInvoices.reduce(
    (largest, inv) => (!largest || toAmount(inv) > toAmount(largest) ? inv : largest),
    null
  );

  const flexibleBills = bills.filter((bill) => bill?.is_flexible === true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#1C1C1F] border border-[#2E2E35] rounded-[28px] overflow-hidden my-8 text-white shadow-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#2A2A32] bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[14px] bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Liquidity Triage Protocol
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Expected inflow: <span className="text-white font-medium">{formatDollars(expectedInflow)}</span> · Projected shortfall:{' '}
                <span className="text-rose-400 font-bold">{formatDollars(shortfall)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs">

          {/* Tier 1: Quick-cash WhatsApp discounts */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A2A32] pb-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[10px] tracking-wide uppercase font-semibold">TIER 1</span> Quick Inflow Incentives (&lt; $1,000)
              </h4>
              <span className="text-xs text-[#A1A1AA]">Immediate clearing</span>
            </div>
            {quickCashInvoices.length === 0 ? (
              <p className="text-xs text-[#71717A] italic py-2">No pending invoices under $1,000 currently scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {quickCashInvoices.map((inv) => (
                  <li
                    key={inv.id ?? inv.invoice_number}
                    className="flex items-center justify-between p-3.5 bg-[#141417] border border-[#27272F] hover:border-[#383844] rounded-[16px] transition-colors"
                  >
                    <div>
                      <p className="text-white font-semibold">{inv.client_name}</p>
                      <p className="text-xs text-[#A1A1AA] tabular-nums mt-0.5">
                        {inv.invoice_number} · <span className="text-white font-medium">{formatDollars(toAmount(inv))}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChaseWhatsApp(inv)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Offer</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Tier 2: 50% split-payment for anchor client */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A2A32] pb-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span className="text-[#8B82FF] border border-[#675DFC]/30 px-2.5 py-0.5 rounded-full bg-[#675DFC]/10 text-[10px] tracking-wide uppercase font-semibold">TIER 2</span> 50% Split Agreement for Anchor Client
              </h4>
              <span className="text-xs text-[#A1A1AA]">Halve bottleneck</span>
            </div>
            {largestInvoice ? (
              <div className="flex items-center justify-between p-3.5 bg-[#141417] border border-[#27272F] hover:border-[#383844] rounded-[16px] transition-colors">
                <div>
                  <p className="text-white font-semibold">{largestInvoice.client_name}</p>
                  <p className="text-xs text-[#A1A1AA] tabular-nums mt-0.5">
                    {largestInvoice.invoice_number} · <span className="text-white font-medium">{formatDollars(toAmount(largestInvoice))}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSplitPayment(largestInvoice)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#675DFC]/15 border border-[#675DFC]/35 hover:bg-[#675DFC]/25 text-[#A59EFF] text-xs font-semibold transition"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Request 50/50 Split</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#71717A] italic py-2">No pending invoices available.</p>
            )}
          </section>

          {/* Tier 3: Defer flexible bills */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A2A32] pb-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span className="text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] tracking-wide uppercase font-semibold">TIER 3</span> Defer Flexible Outflows
              </h4>
              <span className="text-xs text-[#A1A1AA]">Halt discretionary overhead</span>
            </div>
            {flexibleBills.length === 0 ? (
              <p className="text-xs text-[#71717A] italic py-2">No flexible outflows configured.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {flexibleBills.map((bill) => (
                    <li
                      key={bill.id ?? bill.name}
                      className="flex items-center justify-between px-3.5 py-2.5 bg-[#141417] border border-[#27272F] rounded-[14px]"
                    >
                      <span className="text-white font-medium">{bill.name}</span>
                      <span className="text-amber-400 font-semibold tabular-nums">
                        {formatDollars(toAmount(bill))}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onDeferFlexibleBills}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Defer All Flexible Outflows Now</span>
                </button>
              </>
            )}
          </section>

          {/* Modal Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-[#2A2A32]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#26262B] hover:bg-[#32323A] text-white text-xs font-semibold transition"
            >
              Close Triage
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}