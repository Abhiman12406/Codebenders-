import React, { useState } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Split, 
  Calendar, 
  Clock, 
  AlertCircle,
  Sparkles
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
          classes: 'border-white text-white',
        };
      case 'reliable':
        return {
          label: 'Reliable',
          sub: `${avgDelay || 3}d lag`,
          classes: 'border-[#3a3a3f] text-[#f0f0fa]',
        };
      case 'habitual_late':
        return {
          label: 'Habitual Late',
          sub: `~${avgDelay || 14}d lag`,
          classes: 'border-[#f59e0b] text-[#f59e0b]',
        };
      case 'chronic_risk':
        return {
          label: 'Chronic Risk',
          sub: `~${avgDelay || 28}d lag`,
          classes: 'border-[#ef4444] text-[#ef4444]',
        };
      default:
        return {
          label: 'Standard',
          sub: 'Net 15',
          classes: 'border-[#3a3a3f] text-[#5a5a5f]',
        };
    }
  };

  const reliability = getReliabilityBadge(
    client?.payment_behavior || 'reliable',
    client?.avg_delay_days
  );

  // Status Badge
  const getStatusBadge = () => {
    if (isPaid) {
      return {
        label: 'Settled',
        classes: 'border-white text-white',
        icon: CheckCircle2,
      };
    }
    if (diffDays > 30) {
      return {
        label: `+${diffDays}d Overdue`,
        classes: 'border-[#ef4444] text-[#ef4444]',
        icon: AlertCircle,
      };
    }
    if (diffDays > 0) {
      return {
        label: `+${diffDays}d Overdue`,
        classes: 'border-[#f59e0b] text-[#f59e0b]',
        icon: Clock,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Due Today',
        classes: 'border-white text-white',
        icon: Clock,
      };
    }
    return {
      label: `Due in ${daysUntilDue}d`,
      classes: 'border-[#3a3a3f] text-[#5a5a5f]',
      icon: Calendar,
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <>
    <div className={`card-spacex p-5 flex flex-col justify-between transition-all duration-200 bg-[#0a0a0a] ${
      isPaid 
        ? 'opacity-60 border-[#3a3a3f]' 
        : isOverdue && diffDays > 30 
          ? 'border-[#ef4444] hover:border-white' 
          : 'hover:border-white'
    }`}>
      <div>
        {/* Top Header: Client & Reliability */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <h4 className="font-bold text-white text-base tracking-tight truncate">
              {invoice.client_name}
            </h4>
            {client?.company && client.company !== invoice.client_name && (
              <p className="text-xs text-[#5a5a5f] truncate mt-0.5">{client.company}</p>
            )}
          </div>

          {/* Client Reliability Tag */}
          <span 
            className={`text-[10px] font-bold uppercase tracking-[0.96px] rounded-[32px] px-2.5 py-0.5 border shrink-0 ${reliability.classes}`}
            title={`Client Profile: ${reliability.label} (${reliability.sub})`}
          >
            {reliability.label}
          </span>
        </div>

        {/* Project Title & Invoice Meta */}
        <div className="space-y-1 mb-3.5">
          <p className="text-xs text-[#f0f0fa] line-clamp-2">
            {invoice.project_title}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#5a5a5f]">
            <span className="font-bold text-white">{invoice.invoice_number}</span>
            <span>·</span>
            <span>Issued {invoice.issue_date}</span>
          </div>
        </div>

        {/* Amount & Status Bar */}
        <div className="flex items-baseline justify-between py-2.5 px-3 rounded-[4px] bg-black border border-[#3a3a3f] mb-3.5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#5a5a5f] font-bold">
              Amount Due
            </div>
            <div className="font-bold text-xl text-white tabular-nums tracking-[-0.42px]">
              {currency}{Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {delinquency && (
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.96px] rounded-[32px] px-2 py-0.5 border ${RISK_TIER_CLASSES[delinquency.tier]}`}
                title={`Delinquency Risk: ${delinquency.tier} (${delinquency.score}/100)`}
              >
                {delinquency.tier}
              </span>
            )}
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-[32px] border flex items-center gap-1.5 ${status.classes}`}>
              <StatusIcon className="w-3 h-3 shrink-0" />
              <span>{status.label}</span>
            </div>
          </div>
        </div>

        {/* Notes preview if available */}
        {invoice.notes && (
          <p className="text-xs text-[#5a5a5f] italic line-clamp-1 mb-3">
            "{invoice.notes}"
          </p>
        )}
      </div>

      {/* Action Buttons: SpaceX Ghost Pills */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        {!isPaid ? (
          <>
            {/* View as Client Portal / Pay Link */}
            {onViewAsClient && (
              <button
                type="button"
                onClick={() => onViewAsClient(invoice)}
                className="button-ghost-on-dark text-xs py-1.5 px-3"
                title="Preview client-facing payment portal"
              >
                <span>Portal</span>
              </button>
            )}

            {/* Primary Action: Chase on WhatsApp */}
            <button
              type="button"
              onClick={() => onChaseWhatsApp(invoice)}
              className="button-ghost-sm text-xs py-1.5 px-3 text-white border-[#3a3a3f] hover:border-white"
              title="Generate tailored WhatsApp message & open wa.me link"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </button>

            {/* AI Recovery Copilot (overdue only) */}
            {isOverdue && (
              <button
                type="button"
                onClick={() => setIsCopilotOpen(true)}
                className="button-ghost-sm text-xs py-1.5 px-3 text-white border-[#3a3a3f] hover:border-white"
                title="Generate an AI recovery plan and draft message"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Recovery Copilot</span>
              </button>
            )}

            {/* Secondary Action: Mark as Paid */}
            <button
              type="button"
              onClick={() => onMarkPaid(invoice)}
              className="button-ghost-sm text-xs py-1.5 px-3 text-white border-[#3a3a3f] hover:border-white"
              title="Mark full balance paid & update cash runway"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Paid</span>
            </button>

            {/* Split Payment Action */}
            <button
              type="button"
              onClick={() => onSplitPayment(invoice)}
              className="button-ghost-sm text-xs py-1.5 px-2.5 text-white border-[#3a3a3f] hover:border-white"
              title="Offer 50/50 Split Payment Plan"
            >
              <Split className="w-3 h-3" />
              <span>Split 50/50</span>
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-xs text-white bg-black border border-[#3a3a3f] rounded-[32px] px-3.5 py-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settled {invoice.paid_date || 'recently'}
            </span>
            <span className="text-[#5a5a5f] text-[11px]">{invoice.invoice_number}</span>
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
