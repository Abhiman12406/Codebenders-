import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  CheckCircle2,
  CreditCard,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { getDaysDiff } from '../lib/dateUtils.js';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ClientPortalModal({
  invoice,
  client,
  currency = '$',
  profile,
  isOpen,
  onClose,
  onPay,
}) {
  const [paidInvoiceId, setPaidInvoiceId] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  if (!isOpen || !invoice) return null;

  const businessName = profile?.business_name || 'AURA DESIGN STUDIO';
  const clientName = invoice.client_name || client?.name || 'CLIENT';
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const lineItems = items.map((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    return { desc: item.desc, qty, rate, lineTotal: qty * rate };
  });

  const total = lineItems.length > 0
    ? lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
    : Number(invoice.amount) || 0;

  const isSettled = paidInvoiceId === invoice.id;
  const isPaid = invoice.status === 'paid' || isSettled;

  const handlePay = async () => {
    if (!onPay || isPaying) return;
    setIsPaying(true);
    const ok = await onPay(invoice);
    setIsPaying(false);
    if (ok) setPaidInvoiceId(invoice.id);
  };
  const isOverdue = !isPaid && (invoice.status === 'overdue' || getDaysDiff(invoice.due_date) > 0);

  const statusBadge = isPaid
    ? { label: 'PAID & SETTLED', classes: 'border-white text-white' }
    : isOverdue
      ? { label: 'PAYMENT OVERDUE', classes: 'border-[#ef4444] text-[#ef4444]' }
      : { label: 'SENT / DUE', classes: 'border-[#3a3a3f] text-[#f0f0fa]' };

  return (
    <div className="client-portal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="client-portal-print relative w-full max-w-2xl bg-[#0a0a0a] border border-[#3a3a3f] rounded-[8px] overflow-hidden my-8 text-white">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3a3a3f] bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a0a0a] border border-[#3a3a3f] text-white font-bold text-xs flex items-center justify-center rounded-[4px]">
              SF
            </div>
            <div>
              <h3 className="button-cap text-white text-base">CLIENT SETTLEMENT PORTAL</h3>
              <p className="micro-cap text-[#5a5a5f] mt-0.5">Direct invoice clearing powered by StudioFlow</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close client portal"
            className="no-print p-1.5 rounded-[4px] border border-[#3a3a3f] text-[#5a5a5f] hover:text-white hover:border-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs">

          {/* Settlement Success Banner */}
          {isSettled && (
            <div className="no-print relative overflow-hidden flex items-center gap-3 p-4 bg-black border border-white rounded-[4px] text-white">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
              <span className="button-cap text-xs">
                Payment successfully settled — {currency}{formatMoney(invoice.amount)} credited to reserves.
              </span>
            </div>
          )}

          {/* Studio Branding & Invoice Identity */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="font-display font-bold text-xl text-white tracking-[1.6px] uppercase">{businessName}</p>
              {profile?.owner_name && (
                <p className="micro-cap text-[#5a5a5f] mt-1">{profile.owner_name}</p>
              )}
            </div>
            <div className="text-left sm:text-right space-y-1">
              <p className="micro-cap text-[#5a5a5f] font-bold">INVOICE</p>
              <p className="font-bold text-white text-base tabular-nums tracking-[1.17px]">{invoice.invoice_number}</p>
              <span className={`inline-block micro-cap text-[10px] font-bold px-2.5 py-0.5 rounded-[32px] border ${statusBadge.classes}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Bill To & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-black border border-[#3a3a3f] rounded-[4px]">
            <div>
              <p className="micro-cap text-[#5a5a5f] font-bold mb-1">BILL TO</p>
              <p className="font-bold text-white text-xs tracking-[0.96px]">{clientName}</p>
              {client?.company && client.company !== clientName && (
                <p className="micro-cap text-[#5a5a5f] mt-0.5">{client.company}</p>
              )}
              {invoice.project_title && (
                <p className="text-xs text-[#f0f0fa] mt-2 tracking-[0.32px]">{invoice.project_title}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="micro-cap text-[#5a5a5f]">ISSUED</span>
                <span className="text-white tabular-nums tracking-[0.96px]">{formatDate(invoice.issue_date)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="micro-cap text-[#5a5a5f] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  DUE DATE
                </span>
                <span className="font-bold text-white tabular-nums tracking-[0.96px]">{formatDate(invoice.due_date)}</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-[#3a3a3f] rounded-[4px] overflow-hidden bg-black">
            <table className="w-full text-left">
              <thead className="bg-[#0a0a0a] border-b border-[#3a3a3f]">
                <tr className="micro-cap text-[#5a5a5f] font-bold">
                  <th className="px-4 py-3">DESCRIPTION</th>
                  <th className="px-4 py-3 text-center">QTY</th>
                  <th className="px-4 py-3 text-right">RATE</th>
                  <th className="px-4 py-3 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a3a3f]">
                {lineItems.length > 0 ? (
                  lineItems.map((item, index) => (
                    <tr key={index} className="text-white text-xs">
                      <td className="px-4 py-3.5 tracking-[0.32px]">{item.desc}</td>
                      <td className="px-4 py-3.5 text-center tabular-nums">{item.qty}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums">{currency}{formatMoney(item.rate)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-bold">{currency}{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center micro-cap text-[#5a5a5f]">
                      No line items specified.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-black border border-[#3a3a3f] rounded-[4px]">
            <span className="micro-cap text-[#5a5a5f] font-bold">
              TOTAL AMOUNT DUE
            </span>
            <span className="text-2xl font-bold text-white tabular-nums tracking-[1.2px]">
              {currency}{formatMoney(total)}
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-5 border-t border-[#3a3a3f] bg-black">
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print button-ghost-sm text-xs py-2.5 px-4"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / PDF</span>
          </button>
          {!isPaid && (
            <button
              type="button"
              onClick={handlePay}
              disabled={!onPay || isPaying}
              className="no-print button-ghost-on-dark text-xs py-2.5 px-6 disabled:opacity-50"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isPaying ? 'PROCESSING SETTLEMENT…' : 'PAY NOW (ACH/WIRE/CARD)'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="no-print button-ghost-sm text-xs py-2.5 px-4"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
