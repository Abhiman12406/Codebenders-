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
    ? { label: 'PAID & SETTLED', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' }
    : isOverdue
      ? { label: 'PAYMENT OVERDUE', classes: 'border-rose-500/30 bg-rose-500/10 text-rose-400' }
      : { label: 'SENT / DUE', classes: 'border-[#3E3E4C] bg-[#222228] text-white' };

  return (
    <div className="client-portal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="client-portal-print relative w-full max-w-2xl bg-[#1C1C1F] border border-[#2E2E35] rounded-[28px] overflow-hidden my-8 text-white shadow-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#2A2A32] bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C4FC51] text-[#161619] font-black text-xs flex items-center justify-center rounded-[14px]">
              SF
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Client Settlement Portal</h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">Direct invoice clearing powered by StudioFlow</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close client portal"
            className="no-print p-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs">

          {/* Settlement Success Banner */}
          {isSettled && (
            <div className="no-print relative overflow-hidden flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-[18px] text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span className="text-xs font-semibold">
                Payment successfully settled — {currency}{formatMoney(invoice.amount)} credited to studio reserves.
              </span>
            </div>
          )}

          {/* Studio Branding & Invoice Identity */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="font-extrabold text-xl sm:text-2xl text-white tracking-tight uppercase">{businessName}</p>
              {profile?.owner_name && (
                <p className="text-xs text-[#A1A1AA] mt-1 font-medium">{profile.owner_name}</p>
              )}
            </div>
            <div className="text-left sm:text-right space-y-1">
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">INVOICE</p>
              <p className="font-extrabold text-white text-base sm:text-lg tabular-nums tracking-wide">{invoice.invoice_number}</p>
              <span className={`inline-block text-[10px] font-bold px-3 py-0.5 rounded-full border ${statusBadge.classes}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Bill To & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#141417] border border-[#27272F] rounded-[18px]">
            <div>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">BILL TO</p>
              <p className="font-bold text-white text-sm tracking-wide">{clientName}</p>
              {client?.company && client.company !== clientName && (
                <p className="text-xs text-[#A1A1AA] mt-0.5">{client.company}</p>
              )}
              {invoice.project_title && (
                <p className="text-xs text-[#D4D4D8] mt-2 font-medium">{invoice.project_title}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-[#A1A1AA]">ISSUED</span>
                <span className="text-white tabular-nums font-mono font-medium">{formatDate(invoice.issue_date)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  DUE DATE
                </span>
                <span className="font-bold text-white tabular-nums font-mono">{formatDate(invoice.due_date)}</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-[#27272F] rounded-[18px] overflow-hidden bg-[#141417]">
            <table className="w-full text-left">
              <thead className="bg-[#18181D] border-b border-[#27272F]">
                <tr className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222228]">
                {lineItems.length > 0 ? (
                  lineItems.map((item, index) => (
                    <tr key={index} className="text-white text-xs hover:bg-[#1C1C22]/60 transition-colors">
                      <td className="px-4 py-3.5 text-white font-medium">{item.desc}</td>
                      <td className="px-4 py-3.5 text-center tabular-nums text-[#A1A1AA] font-mono">{item.qty}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-[#A1A1AA] font-mono">{currency}{formatMoney(item.rate)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-bold text-white font-mono">{currency}{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-[#71717A]">
                      No line items specified.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-5 bg-[#16161A] border border-[#2E2E38] rounded-[18px]">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
              Total Amount Due
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#C4FC51] tabular-nums tracking-tight font-display">
              {currency}{formatMoney(total)}
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-5 border-t border-[#2A2A32] bg-[#161619]">
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print px-4 py-2.5 rounded-full bg-[#26262B] hover:bg-[#32323A] text-white text-xs font-semibold flex items-center gap-2 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          {!isPaid && (
            <button
              type="button"
              onClick={handlePay}
              disabled={!onPay || isPaying}
              className="no-print px-6 py-2.5 rounded-full bg-[#675DFC] hover:bg-[#786FFD] text-white text-xs font-bold tracking-wide shadow-md shadow-[#675DFC]/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isPaying ? 'Processing Settlement…' : 'Pay Now (ACH/Wire/Card)'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="no-print px-4 py-2.5 rounded-full text-[#A1A1AA] hover:text-white hover:bg-white/5 text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}