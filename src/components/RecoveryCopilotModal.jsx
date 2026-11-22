import React, { useEffect, useState } from 'react';
import { X, Sparkles, Send, Copy, Check } from 'lucide-react';
import { recordOutreach as saveOutreach } from '../lib/dataService.js';
import { RISK_TIER_CLASSES } from '../lib/recoveryRisk.js';
import { fetchRecoveryCopilot } from '../lib/offlineCopilot.js';

const NO_COPY = { key: null, result: 'idle' }; // result: idle | copied | failed
const NO_SETTLEMENT = { discount: false, installments: false };

export default function RecoveryCopilotModal({ isOpen, invoice, onClose }) {
  const [state, setState] = useState({ status: 'idle', data: null, error: '', local: false });
  const [selectedTier, setSelectedTier] = useState('friendly_check_in');
  const [channel, setChannel] = useState('whatsapp'); // whatsapp | email
  const [notesInput, setNotesInput] = useState('');
  const [settlement, setSettlement] = useState(NO_SETTLEMENT); // early discount / installment toggles
  const [copy, setCopy] = useState(NO_COPY); // which copy button was used and its result
  const invoiceId = invoice?.id;

  useEffect(() => {
    if (!isOpen || !invoiceId) return undefined;
    let cancelled = false;
    setState({ status: 'loading', data: null, error: '', local: false });
    setSelectedTier('friendly_check_in');
    setNotesInput('');
    setSettlement(NO_SETTLEMENT);
    setCopy(NO_COPY);
    fetchRecoveryCopilot({ invoice, settlement: NO_SETTLEMENT })
      .then(({ data, local }) => {
        if (!cancelled) setState({ status: 'ready', data, error: '', local });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ status: 'error', data: null, error: err.message || 'Could not generate recovery draft', local: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, invoiceId]);

  useEffect(() => {
    if (copy.result === 'idle') return undefined;
    const timer = setTimeout(() => setCopy(NO_COPY), 2000);
    return () => clearTimeout(timer);
  }, [copy]);

  if (!isOpen || !invoice) return null;

  const { data, error, status, local } = state;
  const escalations = data?.escalations || [];
  const activeTier = escalations.find((e) => e.id === selectedTier) || escalations[0];
  const whatsappText = activeTier?.whatsapp || '';
  const emailSubject = activeTier?.email?.subject || '';
  const emailBody = activeTier?.email?.body || '';
  const portalLink = data?.draft?.portalLink || '';

  // Audit log is best-effort: a failure here must never block the user's action.
  const recordOutreach = (logChannel) => {
    saveOutreach({
      debtorId: invoice.client_id,
      invoiceId,
      strategyId: activeTier?.id || selectedTier,
      channel: logChannel,
    }).catch(() => {});
  };

  const handleSendViaWhatsApp = () => {
    recordOutreach('whatsapp');
    const cleanPhone = (data?.client?.phone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(whatsappText);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener');
  };

  const runCopilot = async (nextSettlement) => {
    setState((prev) => ({ ...prev, status: 'loading', error: '' }));
    try {
      const { data: next, local } = await fetchRecoveryCopilot({
        invoice,
        customNotes: notesInput.trim(),
        settlement: nextSettlement,
      });
      setState({ status: 'ready', data: next, error: '', local });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Could not regenerate recovery draft', local: false });
    }
  };

  const handleRegenerate = () => runCopilot(settlement);

  const toggleSettlement = (key) => {
    const next = { ...settlement, [key]: !settlement[key] };
    setSettlement(next);
    runCopilot(next);
  };

  const copyText = async (text, key) => {
    recordOutreach('copy');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      setCopy({ key, result: 'copied' });
      return;
    } catch {
      // Fall back to a temporary selected textarea and the legacy copy command below.
    }
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      // Ignored: reported as a failed copy below.
    } finally {
      temp.remove();
    }
    setCopy({ key, result: copied ? 'copied' : 'failed' });
  };

  const isCopied = (key) => copy.key === key && copy.result === 'copied';
  const copyLabel = (key, idleLabel) => {
    if (copy.key !== key) return idleLabel;
    if (copy.result === 'copied') return 'Copied!';
    if (copy.result === 'failed') return 'Copy failed';
    return idleLabel;
  };

  const renderCopyButton = (key, idleLabel, text) => (
    <button
      type="button"
      onClick={() => copyText(text, key)}
      disabled={status !== 'ready' || !text}
      className="px-4 py-2 rounded-full bg-[#26262B] hover:bg-[#32323A] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition"
    >
      {isCopied(key) ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copyLabel(key, idleLabel)}</span>
    </button>
  );

  const channelTabClass = (active) =>
    `text-xs font-bold rounded-full px-4 py-1.5 transition ${
      active
        ? 'bg-[#675DFC] text-white shadow-sm'
        : 'bg-[#18181D] text-[#A1A1AA] hover:text-white hover:bg-[#25252D]'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#1C1C1F] border border-[#2E2E35] rounded-[28px] overflow-hidden my-8 text-white shadow-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#2A2A32] bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#675DFC]/10 border border-[#675DFC]/30 text-[#8B82FF] flex items-center justify-center rounded-[14px]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">AI Recovery Copilot</h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Invoice {invoice.invoice_number} · <span className="text-white font-medium">{invoice.client_name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recovery copilot"
            className="p-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 text-xs">
          {status === 'loading' && (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-[#8B82FF] animate-spin" />
              <p className="text-xs text-[#A1A1AA] font-medium">Generating intelligent recovery plan…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-[16px] text-rose-400">
              {error}
            </div>
          )}

          {status === 'ready' && data && (
            <>
              {local && (
                <p className="text-[11px] text-[#A1A1AA] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Offline-first: drafts generated with local heuristics
                </p>
              )}

              {/* Risk Tier & Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#141417] border border-[#27272F] rounded-[18px]">
                <div>
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">DELINQUENCY RISK</span>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${RISK_TIER_CLASSES[data.risk.tier] || 'border-[#3a3a3f] text-[#f0f0fa]'}`}
                  >
                    {data.risk.tier}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">RISK SCORE</span>
                  <span className="font-extrabold text-white text-base tabular-nums mt-0.5 block">{data.risk.score}/100</span>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">RECOVERY STRATEGY</span>
                  <p className="text-[#D4D4D8] mt-1 text-xs leading-relaxed">{data.strategy}</p>
                </div>
              </div>

              {/* Escalation Strategy Cards */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">ESCALATION LEVEL</span>
                <div className="flex flex-wrap gap-2">
                  {escalations.map((item) => {
                    const selected = activeTier?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedTier(item.id)}
                        className={`text-xs font-semibold rounded-full px-3.5 py-1.5 transition ${
                          selected
                            ? 'bg-[#675DFC] text-white shadow-sm'
                            : 'bg-[#18181D] border border-[#2A2A33] text-[#A1A1AA] hover:text-white hover:border-[#3E3E4A]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel Tabs */}
              <div className="flex gap-2">
                <button type="button" onClick={() => setChannel('whatsapp')} className={channelTabClass(channel === 'whatsapp')}>
                  WhatsApp
                </button>
                <button type="button" onClick={() => setChannel('email')} className={channelTabClass(channel === 'email')}>
                  Email
                </button>
              </div>

              {channel === 'whatsapp' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Draft Message</label>
                  <textarea
                    rows={8}
                    readOnly
                    value={whatsappText}
                    className="w-full bg-[#141417] border border-[#2E2E38] rounded-[16px] p-3.5 text-white text-xs leading-relaxed resize-none font-mono focus:border-[#675DFC] outline-none"
                  />
                </div>
              )}

              {channel === 'email' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Subject</label>
                      {renderCopyButton('subject', 'Copy Subject', emailSubject)}
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={emailSubject}
                      className="w-full bg-[#141417] border border-[#2E2E38] rounded-[14px] px-3.5 py-2.5 text-white text-xs font-medium focus:border-[#675DFC] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Body</label>
                      {renderCopyButton('body', 'Copy Body', emailBody)}
                    </div>
                    <textarea
                      rows={8}
                      readOnly
                      value={emailBody}
                      className="w-full bg-[#141417] border border-[#2E2E38] rounded-[16px] p-3.5 text-white text-xs leading-relaxed resize-none font-mono focus:border-[#675DFC] outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    {renderCopyButton('link', 'Copy Payment Link', portalLink)}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Settlement Options */}
          <div className="flex flex-wrap gap-5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settlement.discount}
                disabled={status === 'loading'}
                onChange={() => toggleSettlement('discount')}
                className="w-4 h-4 rounded text-[#675DFC] focus:ring-[#675DFC] bg-[#141417] border-[#2E2E38]"
              />
              <span className="text-xs text-[#D4D4D8] font-medium">2% early-settlement discount</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settlement.installments}
                disabled={status === 'loading'}
                onChange={() => toggleSettlement('installments')}
                className="w-4 h-4 rounded text-[#675DFC] focus:ring-[#675DFC] bg-[#141417] border-[#2E2E38]"
              />
              <span className="text-xs text-[#D4D4D8] font-medium">50/50 installment split</span>
            </label>
          </div>

          {/* Custom Notes & Regenerate */}
          <div className="space-y-1.5">
            <label htmlFor="recovery-custom-notes" className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Custom Notes</label>
            <textarea
              id="recovery-custom-notes"
              rows={2}
              maxLength={500}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Add context for the next draft (optional)"
              className="w-full bg-[#141417] border border-[#2E2E38] rounded-[14px] p-3 text-white text-xs leading-relaxed resize-none focus:border-[#675DFC] focus:ring-1 focus:ring-[#675DFC] outline-none transition placeholder-[#71717A]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={status === 'loading'}
                className="px-4 py-1.5 rounded-full bg-[#26262B] hover:bg-[#32323A] text-white text-xs font-semibold disabled:opacity-50 transition"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#2A2A32]">
            {channel === 'whatsapp' && renderCopyButton('whatsapp', 'Copy Message', whatsappText)}
            {channel === 'whatsapp' && (
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                disabled={status !== 'ready'}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via WhatsApp</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-white/5 text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}