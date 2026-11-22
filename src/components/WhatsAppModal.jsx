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
    { id: 'friendly', label: 'FRIENDLY', desc: 'Pre-due check-in', icon: MessageSquare },
    { id: 'due_today', label: 'DUE TODAY', desc: 'Day 0 notification', icon: Calendar },
    { id: 'firm', label: 'FIRM', desc: '1–14d delay follow-up', icon: Clock },
    { id: 'urgent', label: 'URGENT', desc: '15d+ notice', icon: ShieldAlert },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-[#3a3a3f] rounded-[8px] overflow-hidden my-8 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3a3a3f] bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a0a0a] border border-[#3a3a3f] text-white flex items-center justify-center rounded-[4px]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="button-cap text-white text-base">
                WHATSAPP CLIENT RECOVERY
              </h3>
              <p className="micro-cap text-[#5a5a5f] mt-0.5">
                Invoice {invoice.invoice_number} · {clientName}
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

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 text-xs">
          
          {/* Invoice Summary Strip */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-black border border-[#3a3a3f] rounded-[4px]">
            <div>
              <span className="micro-cap text-[#5a5a5f] font-bold block">AMOUNT DUE</span>
              <span className="font-bold text-white text-base tabular-nums mt-0.5 block">{amountStr}</span>
            </div>
            <div>
              <span className="micro-cap text-[#5a5a5f] font-bold block">STATUS</span>
              <span className={`micro-cap font-bold mt-1 block ${isOverdue ? 'text-[#ef4444]' : 'text-white'}`}>
                {isOverdue ? `${diffDays}d overdue` : 'Upcoming'}
              </span>
            </div>
            <div>
              <span className="micro-cap text-[#5a5a5f] font-bold block">CLIENT LAG</span>
              <span className="text-white text-xs tabular-nums mt-1 block font-mono">
                {client?.avg_delay_days != null ? `+${client.avg_delay_days}d avg` : 'Net 15'}
              </span>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="micro-cap text-[#5a5a5f] font-bold">
                COMMUNICATION CADENCE
              </label>
              <span className="micro-cap text-white border border-[#3a3a3f] px-2 py-0.5 rounded-[32px] bg-black">
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
                    className={`p-3 rounded-[4px] border text-left transition ${
                      isSelected
                        ? 'border-white bg-black'
                        : 'border-[#3a3a3f] bg-black/60 hover:border-[#5a5a5f]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-white">
                      <Icon className="w-3.5 h-3.5 text-white" />
                      <span className="button-cap text-xs text-white">{cadence.label}</span>
                    </div>
                    <p className="micro-cap text-[#5a5a5f] text-[10px]">{cadence.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client WhatsApp Number */}
          <div className="space-y-1.5">
            <label className="micro-cap text-[#5a5a5f] font-bold block">
              RECIPIENT PHONE (WHATSAPP)
            </label>
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+15551234567"
              className="w-full text-input text-xs tracking-[0.96px]"
            />
          </div>

          {/* Message Draft Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="micro-cap text-[#5a5a5f] font-bold block">
                MESSAGE PREVIEW
              </label>
              <span className="micro-cap text-[#5a5a5f]">
                {customText.length} CHARS
              </span>
            </div>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full text-input text-xs leading-relaxed resize-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#3a3a3f]">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="button-ghost-sm text-xs py-2 px-4 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="button-ghost-sm text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                className="button-ghost-on-dark text-xs py-2 px-5 flex items-center gap-1.5"
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
