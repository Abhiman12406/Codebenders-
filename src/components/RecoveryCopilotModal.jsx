import React, { useEffect, useState } from 'react';
import { X, Sparkles, Send, Copy, Check } from 'lucide-react';
import { recoveryCopilot } from '../lib/api.js';
import { RISK_TIER_CLASSES } from '../lib/recoveryRisk.js';

const NO_COPY = { key: null, result: 'idle' }; // result: idle | copied | failed

export default function RecoveryCopilotModal({ isOpen, invoice, onClose }) {
  const [state, setState] = useState({ status: 'idle', data: null, error: '' });
  const [selectedTier, setSelectedTier] = useState('friendly_check_in');
  const [channel, setChannel] = useState('whatsapp'); // whatsapp | email
  const [notesInput, setNotesInput] = useState('');
  const [copy, setCopy] = useState(NO_COPY); // which copy button was used and its result
  const invoiceId = invoice?.id;

  useEffect(() => {
    if (!isOpen || !invoiceId) return undefined;
    let cancelled = false;
    setState({ status: 'loading', data: null, error: '' });
    setSelectedTier('friendly_check_in');
    setNotesInput('');
    setCopy(NO_COPY);
    recoveryCopilot({ invoiceId })
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data, error: '' });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ status: 'error', data: null, error: err.message || 'Could not generate recovery draft' });
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

  const { data, error, status } = state;
  const escalations = data?.escalations || [];
  const activeTier = escalations.find((e) => e.id === selectedTier) || escalations[0];
  const whatsappText = activeTier?.whatsapp || '';
  const emailSubject = activeTier?.email?.subject || '';
  const emailBody = activeTier?.email?.body || '';
  const portalLink = data?.draft?.portalLink || '';

  const handleSendViaWhatsApp = () => {
    const cleanPhone = (data?.client?.phone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(whatsappText);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener');
  };

  const handleRegenerate = async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: '' }));
    try {
      const next = await recoveryCopilot({ invoiceId, customNotes: notesInput.trim() });
      setState({ status: 'ready', data: next, error: '' });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Could not regenerate recovery draft' });
    }
  };

  const copyText = async (text, key) => {
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
      className="button-ghost-sm text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
    >
      {isCopied(key) ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copyLabel(key, idleLabel)}</span>
    </button>
  );

  const channelTabClass = (active) =>
    `text-[10px] font-bold uppercase tracking-[0.96px] rounded-[4px] px-4 py-2 border transition ${
      active ? 'border-white text-white' : 'border-[#3a3a3f] text-[#5a5a5f] hover:text-white hover:border-white'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-[#3a3a3f] rounded-[8px] overflow-hidden my-8 text-white">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3a3a3f] bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a0a0a] border border-[#3a3a3f] text-white flex items-center justify-center rounded-[4px]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="button-cap text-white text-base">AI RECOVERY COPILOT</h3>
              <p className="micro-cap text-[#5a5a5f] mt-0.5">
                Invoice {invoice.invoice_number} · {invoice.client_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recovery copilot"
            className="p-1.5 rounded-[4px] border border-[#3a3a3f] text-[#5a5a5f] hover:text-white hover:border-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 text-xs">
          {status === 'loading' && (
            <p className="micro-cap text-[#5a5a5f] font-bold">GENERATING RECOVERY PLAN…</p>
          )}

          {status === 'error' && (
            <div className="p-4 bg-black border border-[#ef4444] rounded-[4px] text-[#ef4444]">
              {error}
            </div>
          )}

          {status === 'ready' && data && (
            <>
              {/* Risk Tier & Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-black border border-[#3a3a3f] rounded-[4px]">
                <div>
                  <span className="micro-cap text-[#5a5a5f] font-bold block">DELINQUENCY RISK</span>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-[0.96px] rounded-[32px] px-2.5 py-0.5 border ${RISK_TIER_CLASSES[data.risk.tier] || 'border-[#3a3a3f] text-[#f0f0fa]'}`}
                  >
                    {data.risk.tier}
                  </span>
                </div>
                <div>
                  <span className="micro-cap text-[#5a5a5f] font-bold block">SCORE</span>
                  <span className="font-bold text-white text-base tabular-nums mt-0.5 block">{data.risk.score}/100</span>
                </div>
                <div className="sm:col-span-3">
                  <span className="micro-cap text-[#5a5a5f] font-bold block">STRATEGY</span>
                  <p className="text-[#f0f0fa] mt-1">{data.strategy}</p>
                </div>
              </div>

              {/* Escalation Strategy Cards */}
              <div className="space-y-1.5">
                <span className="micro-cap text-[#5a5a5f] font-bold block">ESCALATION LEVEL</span>
                <div className="flex flex-wrap gap-2">
                  {escalations.map((item) => {
                    const selected = activeTier?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedTier(item.id)}
                        className={`text-[10px] font-bold uppercase tracking-[0.96px] rounded-[4px] px-3 py-2 border transition ${
                          selected ? 'border-white text-white' : 'border-[#3a3a3f] text-[#5a5a5f] hover:text-white hover:border-white'
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
                  <label className="micro-cap text-[#5a5a5f] font-bold block">DRAFT MESSAGE</label>
                  <textarea
                    rows={8}
                    readOnly
                    value={whatsappText}
                    className="w-full text-input text-xs leading-relaxed resize-none font-mono"
                  />
                </div>
              )}

              {channel === 'email' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="micro-cap text-[#5a5a5f] font-bold block">SUBJECT</label>
                      {renderCopyButton('subject', 'Copy subject', emailSubject)}
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={emailSubject}
                      className="w-full text-input text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="micro-cap text-[#5a5a5f] font-bold block">BODY</label>
                      {renderCopyButton('body', 'Copy body', emailBody)}
                    </div>
                    <textarea
                      rows={8}
                      readOnly
                      value={emailBody}
                      className="w-full text-input text-xs leading-relaxed resize-none font-mono"
                    />
                  </div>
                  <div className="flex justify-end">
                    {renderCopyButton('link', 'Copy payment link', portalLink)}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Custom Notes & Regenerate */}
          <div className="space-y-1.5">
            <label htmlFor="recovery-custom-notes" className="micro-cap text-[#5a5a5f] font-bold block">CUSTOM NOTES</label>
            <textarea
              id="recovery-custom-notes"
              rows={2}
              maxLength={500}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Add context for the next draft (optional)"
              className="w-full text-input text-xs leading-relaxed resize-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={status === 'loading'}
                className="button-ghost-sm text-xs py-2 px-4 disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#3a3a3f]">
            {channel === 'whatsapp' && renderCopyButton('whatsapp', 'Copy', whatsappText)}
            {channel === 'whatsapp' && (
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                disabled={status !== 'ready'}
                className="button-ghost-on-dark text-xs py-2 px-5 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via WhatsApp</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="button-ghost-sm text-xs py-2 px-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
