import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  ShieldAlert
} from 'lucide-react';
import { getDaysDiff } from '../lib/dateUtils.js';

export default function WhatsAppModal({
  isOpen,
  onClose,
  invoice,
  client,
  currency = '$',
  onLogFollowUp,
}) {
  if (!isOpen || !invoice) return null;

  const diffDays = invoice?.due_date ? getDaysDiff(invoice.due_date) : 0;
  const isOverdue = diffDays > 0;
  const clientName = client?.name || invoice.client_name || 'Client';
  const clientPhone = client?.phone || invoice.client_phone || '';
  const amountStr = `${currency}${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const templates = {
    friendly: `Hi ${clientName}, hope you're having a great week! Just sharing a friendly reminder that invoice ${invoice.invoice_number} for ${invoice.project_title} (${amountStr}) is scheduled for payment on ${invoice.due_date}. Let me know if you need any additional details!`,
    
    due_today: `Hi ${clientName}, just checking in regarding invoice ${invoice.invoice_number} for ${invoice.project_title} (${amountStr}), which is due today (${invoice.due_date}). Thank you!`,
    
    firm: `Hi ${clientName}, following up on invoice ${invoice.invoice_number} for ${invoice.project_title} (${amountStr}), which is now ${diffDays} days overdue. Could you confirm when payment will be processed this week? Thank you.`,
    
    urgent: `Hi ${clientName}, invoice ${invoice.invoice_number} (${amountStr}) is now ${Math.max(diffDays, 15)} days overdue. Please let us know when to expect settlement as studio scheduling for active deliverables is currently on pause until accounts are current.`,
  };

  const getRecommendedTone = () => {
    if (isOverdue) {
      if (diffDays >= 15) return 'urgent';
      return 'firm';
    }
    if (diffDays === 0) return 'due_today';
    return 'friendly';
  };

  const [selectedTone, setSelectedTone] = useState(getRecommendedTone());
  const [customText, setCustomText] = useState(templates[getRecommendedTone()]);
  const [phoneInput, setPhoneInput] = useState(clientPhone);
  const [copied, setCopied] = useState(false);

  const handleSelectTone = (tone) => {
    setSelectedTone(tone);
    setCustomText(templates[tone]);
  };

  const buildWhatsAppUrl = () => {
    const cleanPhone = phoneInput.replace(/[^\d+]/g, '');
    const encoded = encodeURIComponent(customText);
    return cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
  };

  const handleSendViaWhatsApp = () => {
    if (onLogFollowUp) {
      onLogFollowUp({
        invoice_id: invoice.id,
        channel: 'whatsapp',
        tone: selectedTone,
        message_snapshot: customText,
      });
    }
    window.open(buildWhatsAppUrl(), '_blank');
  };

  const handleCopyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(customText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const cadences = [
    { id: 'friendly', label: 'Friendly', desc: 'Pre-due check-in', icon: MessageSquare },
    { id: 'due_today', label: 'Due Today', desc: 'Day 0 notification', icon: Calendar },
    { id: 'firm', label: 'Firm', desc: '1–14d delay follow-up', icon: Clock },
    { id: 'urgent', label: 'Urgent', desc: '15d+ escalation notice', icon: ShieldAlert },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#1C1C1F] border border-[#2E2E35] rounded-[28px] overflow-hidden my-8 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#2A2A32] bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[14px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                WhatsApp Client Recovery
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Invoice {invoice.invoice_number} · <span className="text-white">{clientName}</span>
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

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 text-xs">
          
          {/* Invoice Summary Strip */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#141417] border border-[#27272F] rounded-[18px]">
            <div>
              <span className="text-[10px] font-bold text-[#A1A1AA] tracking-wider uppercase block">AMOUNT DUE</span>
              <span className="font-extrabold text-white text-base sm:text-lg tabular-nums mt-0.5 block">{amountStr}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#A1A1AA] tracking-wider uppercase block">STATUS</span>
              <span className={`text-xs font-bold mt-1 block ${isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isOverdue ? `${diffDays}d overdue` : 'Upcoming'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#A1A1AA] tracking-wider uppercase block">CLIENT LAG</span>
              <span className="text-white text-xs tabular-nums mt-1 block font-mono font-medium">
                {client?.avg_delay_days != null ? `+${client.avg_delay_days}d avg` : 'Net 15'}
              </span>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] font-bold text-[#A1A1AA] tracking-wider uppercase">
                Communication Cadence
              </label>
              <span className="text-[10px] font-semibold text-[#8B82FF] border border-[#675DFC]/30 px-2.5 py-0.5 rounded-full bg-[#675DFC]/10">
                Suggested: {getRecommendedTone()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cadences.map((cadence) => {
                const isSelected = selectedTone === cadence.id;
                const Icon = cadence.icon;
                return (
                  <button
                    key={cadence.id}
                    type="button"
                    onClick={() => handleSelectTone(cadence.id)}
                    className={`p-3 rounded-[16px] border text-left transition-all ${
                      isSelected
                        ? 'border-[#675DFC] bg-[#675DFC]/15 text-white ring-1 ring-[#675DFC]/50'
                        : 'border-[#27272F] bg-[#141417] text-[#A1A1AA] hover:border-[#383844] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-white">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8B82FF]' : 'text-[#A1A1AA]'}`} />
                      <span className="font-bold text-xs text-white">{cadence.label}</span>
                    </div>
                    <p className="text-[10px] text-[#A1A1AA] leading-snug">{cadence.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client WhatsApp Number */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#A1A1AA] tracking-wider uppercase block">
              Recipient Phone (WhatsApp)
            </label>
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+15551234567"
              className="w-full bg-[#141417] border border-[#2E2E38] rounded-[14px] px-3.5 py-2.5 text-white text-xs font-mono focus:border-[#675DFC] focus:ring-1 focus:ring-[#675DFC] outline-none transition"
            />
          </div>

          {/* Message Draft Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#A1A1AA] tracking-wider uppercase block">
                Message Preview
              </label>
              <span className="text-[10px] font-medium text-[#71717A]">
                {customText.length} chars
              </span>
            </div>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-[#141417] border border-[#2E2E38] rounded-[14px] p-3 text-white text-xs leading-relaxed resize-none font-mono focus:border-[#675DFC] focus:ring-1 focus:ring-[#675DFC] outline-none transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#2A2A32]">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="px-4 py-2 rounded-full bg-[#26262B] hover:bg-[#32323A] text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-white/5 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via WhatsApp</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}