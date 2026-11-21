import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  MessageSquare, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Phone, 
  Clock, 
  ShieldAlert,
  Calendar
} from 'lucide-react';

export default function WhatsAppModal({
  isOpen,
  onClose,
  invoice,
  client,
  currency = '$',
  onLogFollowUp,
}) {
  const [activeCadence, setActiveCadence] = useState('friendly');
  const [customText, setCustomText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute overdue days
  const { diffDays, defaultCadence } = useMemo(() => {
    if (!invoice?.due_date) return { diffDays: 0, defaultCadence: 'friendly' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(invoice.due_date);
    dueDate.setHours(0, 0, 0, 0);

    const diff = Math.round((today - dueDate) / (1000 * 60 * 60 * 24));

    let cadence = 'friendly';
    if (diff > 14) {
      cadence = 'urgent';
    } else if (diff > 0) {
      cadence = 'firm';
    } else if (diff === 0) {
      cadence = 'due_today';
    } else {
      cadence = 'friendly';
    }

    return { diffDays: diff, defaultCadence: cadence };
  }, [invoice]);

  // Pre-drafted cadence templates
  const templates = useMemo(() => {
    if (!invoice) return {};

    const clientName = invoice.client_name?.split(' ')[0] || 'there';
    const amountStr = `${currency}${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const project = invoice.project_title || 'Design Deliverables';
    const invNum = invoice.invoice_number || 'INV';
    const due = invoice.due_date || 'today';
    const payLink = `https://pay.studioflow.design/${invNum}`;

    return {
      friendly: `Hi ${clientName}! Hope you're having a great week. Just sharing a friendly heads-up that invoice #${invNum} (${amountStr}) for ${project} is due on ${due}. You can view/settle it here: ${payLink}. Let me know if you need anything else!`,
      
      due_today: `Hi ${clientName}, quick note that invoice #${invNum} (${amountStr}) for ${project} is due today. Let me know if you need our bank transfer details or Stripe link again. Thank you!`,
      
      firm: `Hi ${clientName}, checking in regarding invoice #${invNum} (${amountStr}) which was due on ${due}${diffDays > 0 ? ` (${diffDays} days ago)` : ''}. Please let me know when payment will be processed so we can keep upcoming design deliverables on schedule.`,
      
      urgent: `Hi ${clientName}, invoice #${invNum} (${amountStr}) for ${project} is now ${Math.max(diffDays, 15)} days overdue. To prevent pausing production on the current project milestones, please clear the outstanding balance today: ${payLink}. Thank you for your immediate attention.`,
    };
  }, [invoice, currency, diffDays]);

  // Sync state on open
  useEffect(() => {
    if (isOpen && invoice) {
      setActiveCadence(defaultCadence);
      setCustomText(templates[defaultCadence] || '');
      const rawPhone = invoice.client_phone || client?.phone || '+15552345678';
      setPhoneNumber(rawPhone);
      setCopied(false);
    }
  }, [isOpen, invoice, client, defaultCadence, templates]);

  // When cadence tab switches
  const handleSelectCadence = (cadence) => {
    setActiveCadence(cadence);
    setCustomText(templates[cadence] || '');
  };

  if (!isOpen || !invoice) return null;

  // Clean phone number for wa.me (digits only)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  // Formatted wa.me URL
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customText)}`;

  const handleSendWhatsApp = () => {
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    if (onLogFollowUp) {
      onLogFollowUp({
        invoice_id: invoice.id,
        tone: activeCadence,
        channel: 'whatsapp',
        sent_at: new Date().toISOString(),
      });
    }

    onClose();
  };

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(customText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const cadences = [
    { id: 'friendly', label: 'Friendly', desc: 'Pre-due heads up', icon: Sparkles, color: 'text-sky-400' },
    { id: 'due_today', label: 'Due Today', desc: 'Day 0 gentle ping', icon: Calendar, color: 'text-indigo-400' },
    { id: 'firm', label: 'Firm', desc: '1-14d delay nudge', icon: Clock, color: 'text-amber-400' },
    { id: 'urgent', label: 'Urgent', desc: '15d+ work halt warning', icon: ShieldAlert, color: 'text-rose-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/90 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Assisted WhatsApp Follow-up</span>
              </h3>
              <p className="text-xs text-slate-400">
                Chasing <span className="text-white font-medium">{invoice.client_name}</span> for {currency}{Number(invoice.amount).toLocaleString('en-US')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Overdue Status Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">
              Invoice <span className="font-mono text-slate-200">{invoice.invoice_number}</span> (Due: {invoice.due_date})
            </span>
            <span className={`font-semibold ${
              diffDays > 14 
                ? 'text-rose-400' 
                : diffDays > 0 
                  ? 'text-amber-400' 
                  : diffDays === 0 
                    ? 'text-indigo-400' 
                    : 'text-emerald-400'
            }`}>
              {diffDays > 0 ? `${diffDays} days overdue` : diffDays === 0 ? 'Due Today' : `Due in ${-diffDays} days`}
            </span>
          </div>

          {/* 4 Emotional Cadences */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Tone Cadence
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cadences.map((c) => {
                const Icon = c.icon;
                const isSelected = activeCadence === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCadence(c.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-sm text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${c.color}`} />
                    <span className="text-xs font-bold">{c.label}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client WhatsApp Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Recipient WhatsApp Phone</span>
              <span className="text-[10px] text-slate-500">Digits with country code</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+15551234567"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Drafted Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Generated WhatsApp Message</span>
              </label>
              <span className="text-[10px] text-slate-500">Editable before launch</span>
            </div>
            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Deep link URL Preview */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono truncate">
            <span className="text-emerald-400 font-semibold">wa.me: </span>
            {waUrl}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            {/* Copy Fallback */}
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            {/* Launch WhatsApp Deep Link */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition shadow-lg shadow-emerald-600/30 border border-emerald-500/50"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-75" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
