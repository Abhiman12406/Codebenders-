import React from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Split, 
  Calendar, 
  Clock, 
  AlertCircle,
  FileText,
  User,
  Zap
} from 'lucide-react';

export default function DebtorCard({
  invoice,
  client,
  currency = '$',
  onChaseWhatsApp,
  onMarkPaid,
  onSplitPayment,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(invoice.due_date);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = today - dueDate;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isPaid = invoice.status === 'paid';
  const isOverdue = !isPaid && diffDays > 0;
  const isDueToday = !isPaid && diffDays === 0;
  const daysUntilDue = -diffDays;

  // Reliability badge
  const getReliabilityBadge = (behavior, avgDelay) => {
    switch (behavior) {
      case 'fast':
        return {
          label: 'Fast Payer',
          sub: '0d delay',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400',
        };
      case 'reliable':
        return {
          label: 'Reliable',
          sub: `${avgDelay || 3}d delay`,
          color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          dot: 'bg-sky-400',
        };
      case 'habitual_late':
        return {
          label: 'Habitual Late',
          sub: `~${avgDelay || 14}d lag`,
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400',
        };
      case 'chronic_risk':
        return {
          label: 'Chronic Risk',
          sub: `~${avgDelay || 28}d lag`,
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          dot: 'bg-rose-400',
        };
      default:
        return {
          label: 'Standard',
          sub: 'Net 15',
          color: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-400',
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
        label: 'Paid & Settled',
        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2,
      };
    }
    if (diffDays > 30) {
      return {
        label: `${diffDays} days overdue (Critical)`,
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        icon: AlertCircle,
      };
    }
    if (diffDays > 0) {
      return {
        label: `${diffDays} days overdue`,
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: Clock,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Due Today',
        color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        icon: Clock,
      };
    }
    return {
      label: `Due in ${daysUntilDue} days`,
      color: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: Calendar,
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 p-5 ${
      isPaid 
        ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
        : isOverdue && diffDays > 30
          ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700 shadow-lg shadow-rose-950/20'
          : isOverdue
            ? 'bg-amber-950/15 border-amber-900/40 hover:border-amber-700'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top Header: Client & Reliability */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h4 className="font-bold text-white text-base tracking-tight truncate flex items-center gap-1.5">
              <span>{invoice.client_name}</span>
            </h4>
            {client?.company && client.company !== invoice.client_name && (
              <p className="text-xs text-slate-400 truncate">{client.company}</p>
            )}
          </div>

          {/* Client Reliability Tag */}
          <span 
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${reliability.color} shrink-0`}
            title={`Client Profile: ${reliability.label} (${reliability.sub})`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${reliability.dot}`}></span>
            {reliability.label}
          </span>
        </div>

        {/* Project Title & Invoice Meta */}
        <div className="space-y-1 mb-4">
          <p className="text-sm font-medium text-slate-200 line-clamp-2">
            {invoice.project_title}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-slate-300">{invoice.invoice_number}</span>
            <span>•</span>
            <span>Issued {invoice.issue_date}</span>
          </div>
        </div>

        {/* Amount & Status Bar */}
        <div className="flex items-baseline justify-between py-2 border-y border-slate-800/80 mb-4">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Amount Due
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {currency}{Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{status.label}</span>
          </div>
        </div>

        {/* Notes preview if available */}
        {invoice.notes && (
          <p className="text-xs text-slate-400 italic line-clamp-1 mb-4">
            "{invoice.notes}"
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        {!isPaid ? (
          <>
            {/* Primary Action: Chase on WhatsApp */}
            <button
              type="button"
              onClick={() => onChaseWhatsApp(invoice)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 active:bg-emerald-800 border border-emerald-700/50 transition shadow-sm"
              title="Generate tailored WhatsApp message & open wa.me link"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chase WhatsApp</span>
            </button>

            {/* Secondary Action: Mark as Paid */}
            <button
              type="button"
              onClick={() => onMarkPaid(invoice)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Mark full balance paid & update cash runway"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Paid</span>
            </button>

            {/* Split Payment Action */}
            <button
              type="button"
              onClick={() => onSplitPayment(invoice)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-800 transition"
              title="Offer 50/50 Split Payment Plan"
            >
              <Split className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 rounded-xl px-3 py-2">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Settled on {invoice.paid_date || 'recently'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{invoice.invoice_number}</span>
          </div>
        )}
      </div>
    </div>
  );
}
