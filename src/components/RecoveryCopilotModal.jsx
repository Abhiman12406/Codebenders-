import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Send, Copy, Check } from 'lucide-react';
import { recoveryCopilot } from '../lib/api.js';
import { RISK_TIER_CLASSES } from '../lib/recoveryRisk.js';

export default function RecoveryCopilotModal({ isOpen, invoice, onClose }) {
  const [state, setState] = useState({ status: 'idle', data: null, error: '' });
  const [copyStatus, setCopyStatus] = useState('idle'); // idle | copied | failed
  const draftRef = useRef(null);
  const invoiceId = invoice?.id;

  useEffect(() => {
    if (!isOpen || !invoiceId) return undefined;
    let cancelled = false;
    setState({ status: 'loading', data: null, error: '' });
    setCopyStatus('idle');
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
    if (copyStatus === 'idle') return undefined;
    const timer = setTimeout(() => setCopyStatus('idle'), 2000);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  if (!isOpen || !invoice) return null;

  const { data, error, status } = state;
  const draftText = data?.draft?.text || '';

  const handleSendViaWhatsApp = () => {
    const cleanPhone = (data?.client?.phone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(draftText);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener');
  };

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(draftText);
      setCopyStatus('copied');
      return;
    } catch {
      // Fall back to selecting the draft and using the legacy copy command below.
    }
    const textarea = draftRef.current;
    if (textarea) {
      textarea.focus();
      textarea.select();
      try {
        if (document.execCommand('copy')) {
          setCopyStatus('copied');
          return;
        }
      } catch {
        // Ignored: reported as a failed copy below.
      }
    }
    setCopyStatus('failed');
  };

  const copyLabel = copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Copy failed' : 'Copy';

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

              {/* Draft Message */}
              <div className="space-y-1.5">
                <label className="micro-cap text-[#5a5a5f] font-bold block">DRAFT MESSAGE</label>
                <textarea
                  ref={draftRef}
                  rows={8}
                  readOnly
                  value={draftText}
                  className="w-full text-input text-xs leading-relaxed resize-none font-mono"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#3a3a3f]">
            <button
              type="button"
              onClick={handleCopy}
              disabled={status !== 'ready'}
              className="button-ghost-sm text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
            >
              {copyStatus === 'copied' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyLabel}</span>
            </button>
            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              disabled={status !== 'ready'}
              className="button-ghost-on-dark text-xs py-2 px-5 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>
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
