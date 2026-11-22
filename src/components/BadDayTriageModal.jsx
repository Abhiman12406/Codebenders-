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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#3a3a3f] rounded-[8px] overflow-hidden my-8 text-white">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3a3a3f] bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a0a0a] border border-white text-white flex items-center justify-center rounded-[4px]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="button-cap text-white text-base">
                LIQUIDITY TRIAGE PROTOCOL
              </h3>
              <p className="micro-cap text-[#5a5a5f] mt-0.5">
                Expected inflow: {formatDollars(expectedInflow)} · Projected shortfall:{' '}
                <span className="text-white font-bold">{formatDollars(shortfall)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] border border-[#3a3a3f] text-[#5a5a5f] hover:text-white hover:border-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs">

          {/* Tier 1: Quick-cash WhatsApp discounts */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-2">
              <h4 className="micro-cap font-bold text-white flex items-center gap-2">
                <span className="text-white border border-[#3a3a3f] px-2 py-0.5 rounded-[32px] bg-black">TIER 1</span> Quick Inflow Incentives (&lt; $1,000)
              </h4>
              <span className="micro-cap text-[#5a5a5f]">Immediate clearing</span>
            </div>
            {quickCashInvoices.length === 0 ? (
              <p className="micro-cap text-[#5a5a5f] italic">No pending invoices under $1,000 currently scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {quickCashInvoices.map((inv) => (
                  <li
                    key={inv.id ?? inv.invoice_number}
                    className="flex items-center justify-between p-3.5 bg-black border border-[#3a3a3f] rounded-[4px]"
                  >
                    <div>
                      <p className="text-white font-bold tracking-[0.96px]">{inv.client_name}</p>
                      <p className="micro-cap text-[#5a5a5f] tabular-nums mt-0.5">
                        {inv.invoice_number} · {formatDollars(toAmount(inv))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChaseWhatsApp(inv)}
                      className="button-ghost-on-dark text-xs py-1.5 px-3.5"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp Offer</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Tier 2: 50% split-payment for anchor client */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-2">
              <h4 className="micro-cap font-bold text-white flex items-center gap-2">
                <span className="text-white border border-[#3a3a3f] px-2 py-0.5 rounded-[32px] bg-black">TIER 2</span> 50% Split Agreement for Anchor Client
              </h4>
              <span className="micro-cap text-[#5a5a5f]">Halve bottleneck</span>
            </div>
            {largestInvoice ? (
              <div className="flex items-center justify-between p-3.5 bg-black border border-[#3a3a3f] rounded-[4px]">
                <div>
                  <p className="text-white font-bold tracking-[0.96px]">{largestInvoice.client_name}</p>
                  <p className="micro-cap text-[#5a5a5f] tabular-nums mt-0.5">
                    {largestInvoice.invoice_number} · {formatDollars(toAmount(largestInvoice))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSplitPayment(largestInvoice)}
                  className="button-ghost-on-dark text-xs py-1.5 px-3.5"
                >
                  <Split className="w-3 h-3" />
                  <span>Request 50/50 Split</span>
                </button>
              </div>
            ) : (
              <p className="micro-cap text-[#5a5a5f] italic">No pending invoices available.</p>
            )}
          </section>

          {/* Tier 3: Defer flexible bills */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-2">
              <h4 className="micro-cap font-bold text-white flex items-center gap-2">
                <span className="text-white border border-[#3a3a3f] px-2 py-0.5 rounded-[32px] bg-black">TIER 3</span> Defer Flexible Outflows
              </h4>
              <span className="micro-cap text-[#5a5a5f]">Halt discretionary overhead</span>
            </div>
            {flexibleBills.length === 0 ? (
              <p className="micro-cap text-[#5a5a5f] italic">No flexible outflows configured.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {flexibleBills.map((bill) => (
                    <li
                      key={bill.id ?? bill.name}
                      className="flex items-center justify-between px-3.5 py-2.5 bg-black border border-[#3a3a3f] rounded-[4px]"
                    >
                      <span className="text-white font-bold tracking-[0.96px]">{bill.name}</span>
                      <span className="text-[#f59e0b] font-bold tabular-nums">
                        {formatDollars(toAmount(bill))}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onDeferFlexibleBills}
                  className="w-full mt-2 button-ghost-sm text-xs py-2.5 px-4 flex items-center justify-center gap-2 border-[#3a3a3f] hover:border-white text-white"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Defer All Flexible Outflows Now</span>
                </button>
              </>
            )}
          </section>

          {/* Modal Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-[#3a3a3f]">
            <button
              type="button"
              onClick={onClose}
              className="button-ghost-sm text-xs py-2.5 px-5"
            >
              Close Triage
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
