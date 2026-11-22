import React, { useState } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Split, 
  Calendar, 
  Clock, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getDaysDiff } from '../lib/dateUtils.js';
import { getDelinquencyRisk, RISK_TIER_CLASSES } from '../lib/recoveryRisk.js';
import RecoveryCopilotModal from './RecoveryCopilotModal.jsx';

export default function DebtorCard({
  invoice,
  client,
  currency = '$',
  onChaseWhatsApp,
  onMarkPaid,
  onSplitPayment,
  onViewAsClient,
}) {
  const diffDays = getDaysDiff(invoice.due_date);

  const isPaid = invoice.status === 'paid';
  const isOverdue = !isPaid && diffDays > 0;
  const daysUntilDue = -diffDays;
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Delinquency risk (overdue unpaid cards only; exposure uses the invoice amount)
  const delinquency = isOverdue
    ? getDelinquencyRisk({
        daysPastDue: diffDays,
        avgDelayDays: client?.avg_delay_days || 0,
        overdueTotal: invoice.amount,
      })
    : null;

  // Reliability tag
  const getReliabilityBadge = (behavior, avgDelay) => {
    switch (behavior) {
      case 'fast':
        return {
          label: 'Fast Payer',
          sub: '0d lag',
          classes: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        };
      case 'reliable':
        return {
          label: 'Reliable',
          sub: `${avgDelay || 3}d lag`,
          classes: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
        };
      case 'habitual_late':
        return {
          label: 'Habitual Late',
          sub: `~${avgDelay || 14}d lag`,
          classes: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        };
      case 'chronic_risk':
        return {
          label: 'Chronic Risk',
          sub: `~${avgDelay || 28}d lag`,
          classes: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
        };
      default:
        return {
          label: 'Standard',
          sub: 'Net 15',
          classes: 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300',
        };
    }
  };

  const reliability = getReliabilityBadge(
    client?.payment_behavior || 'standard',
    client?.avg_delay_days
  );

  // Status tag
  const getStatusBadge = () => {
    if (isPaid) {
      return {
        label: 'Settled',
        classes: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        icon: CheckCircle2,
      };
    }
    if (diffDays > 30) {
      return {
        label: `+${diffDays}d Overdue`,
        classes: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
        icon: AlertCircle,
      };
    }
    if (diffDays > 0) {
      return {
        label: `+${diffDays}d Overdue`,
        classes: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        icon: Clock,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Due Today',
        classes: 'bg-[#C4FC51]/20 border-[#C4FC51]/50 text-[#C4FC51]',
        icon: Clock,
      };
    }
    return {
      label: `Due in ${daysUntilDue}d`,
      classes: 'bg-[#18181B] border-[#2E2E35] text-[#A1A1AA]',
      icon: Calendar,
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <>
    <div className={`card-cockpit p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 rounded-[24px] ${
      isPaid 
        ? 'opacity-65 border-[#2D2D35]' 
        : isOverdue && diffDays > 30 
          ? 'border-rose-500/50 hover:border-rose-400 shadow-lg shadow-rose-950/20' 
          : 'hover:border-[#675DFC]/50'
    }`}>
      <div>
        {/* Top Header: Client & Reliability */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="min-w-0">
            <h4 className="font-bold text-white text-base tracking-tight truncate">
              {invoice.client_name}
            </h4>
            {client?.company && client.company !== invoice.client_name && (
              <p className="text-xs text-[#A1A1AA] truncate mt-0.5">{client.company}</p>
            )}
          </div>

          {/* Client Reliability Tag */}
          <span 
            className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border shrink-0 ${reliability.classes}`}
            title={`Client Profile: ${reliability.label} (${reliability.sub})`}
          >
            {reliability.label}
          </span>
        </div>

        {/* Project Title & Invoice Meta */}
        <div className="space-y-0.5 mb-3.5">
          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
            {invoice.project_title}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] font-mono">
            <span className="font-semibold text-white">{invoice.invoice_number}</span>
            <span>·</span>
            <span>Issued {invoice.issue_date}</span>
          </div>
        </div>

        {/* Amount & Status Bar */}
        <div className="flex items-baseline justify-between py-3 px-3.5 rounded-2xl bg-[#161619] border border-[#2A2A30] mb-3.5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#A1A1AA] font-bold">
              Amount Due
            </div>
            <div className="font-bold text-lg sm:text-xl text-white tabular-nums">
              {currency}{Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {delinquency && (
              <span
                className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-0.5 border bg-black/40 ${RISK_TIER_CLASSES[delinquency.tier]}`}
                title={`Delinquency Risk: ${delinquency.tier} (${delinquency.score}/100)`}
              >
                {delinquency.tier}
              </span>
            )}
            <div className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${status.classes}`}>
              <StatusIcon className="w-3 h-3 shrink-0" />
              <span>{status.label}</span>
            </div>
          </div>
        </div>

        {/* Notes preview if available */}
        {invoice.notes && (
          <p className="text-xs text-[#A1A1AA] italic line-clamp-1 mb-3">
            "{invoice.notes}"
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        {!isPaid ? (
          <>
            {/* View as Client Portal / Pay Link */}
            {onViewAsClient && (
              <button
                type="button"
                onClick={() => onViewAsClient(invoice)}
                className="button-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-zinc-300 hover:text-white hover:border-[#675DFC] hover:bg-[#675DFC]/10 transition-all"
                title="Preview client-facing payment portal"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Portal</span>
              </button>
            )}

            {/* Primary Action: Chase on WhatsApp */}
            <button
              type="button"
              onClick={() => onChaseWhatsApp(invoice)}
              className="button-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 hover:text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all"
              title="Generate tailored WhatsApp message & open wa.me link"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            {/* AI Recovery Copilot (overdue only) */}
            {isOverdue && (
              <button
                type="button"
                onClick={() => setIsCopilotOpen(true)}
                className="button-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-zinc-300 hover:text-[#A298DF] hover:border-[#675DFC] hover:bg-[#675DFC]/10 transition-all"
                title="Generate an AI recovery plan and draft message"
              >
                <Sparkles className="w-3 h-3 text-[#675DFC]" />
                <span>Copilot</span>
              </button>
            )}

            {/* Secondary Action: Mark as Paid */}
            <button
              type="button"
              onClick={() => onMarkPaid(invoice)}
              className="button-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 hover:text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all"
              title="Mark full balance paid & update cash runway"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Paid</span>
            </button>

            {/* Split Payment Action */}
            <button
              type="button"
              onClick={() => onSplitPayment(invoice)}
              className="button-ghost text-xs py-1.5 px-2.5 flex items-center gap-1.5 hover:text-amber-300 hover:border-amber-400 hover:bg-amber-500/10 transition-all"
              title="Offer 50/50 Split Payment Plan"
            >
              <Split className="w-3 h-3 text-amber-400" />
              <span>Split</span>
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 rounded-full px-4 py-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Settled {invoice.paid_date || 'recently'}
            </span>
            <span className="text-[#A1A1AA] text-[11px] font-mono">{invoice.invoice_number}</span>
          </div>
        )}
      </div>
    </div>
    <RecoveryCopilotModal
      isOpen={isCopilotOpen}
      invoice={invoice}
      onClose={() => setIsCopilotOpen(false)}
    />
    </>
  );
}
