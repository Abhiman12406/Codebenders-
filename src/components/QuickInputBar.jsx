import React, { useState } from 'react';
import { parseInvoiceText } from '../lib/nlpParser.js';
import { Terminal, ArrowRight, Check, FileText, Sparkles } from 'lucide-react';

const PRESETS = [
  { label: 'Brand Identity ($2,500)', project: 'Brand Identity', amount: 2500 },
  { label: 'Figma UI Sprint ($1,800)', project: 'Figma UI Sprint', amount: 1800 },
  { label: 'Monthly Retainer ($1,500)', project: 'Monthly Retainer', amount: 1500 },
];

export default function QuickInputBar({ onCreateInvoice }) {
  const [text, setText] = useState('');
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');

  const runParse = (source) => {
    const parsed = parseInvoiceText(source);
    setDraft(parsed);
    setError(parsed.amount == null ? 'Could not extract an invoice amount from the phrase.' : '');
  };

  const handleParse = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    runParse(text);
  };

  const handlePreset = (preset) => {
    const template = `Billed Client ${preset.project.toLowerCase()} $${preset.amount}`;
    setText(template);
    runParse(template);
  };

  const handleConfirm = () => {
    if (!draft || draft.amount == null) return;
    onCreateInvoice(draft);
    setDraft(null);
    setText('');
    setError('');
  };

  return (
    <div className="card-spacex p-6 space-y-6 h-full flex flex-col justify-between bg-[#0a0a0a]">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[4px] bg-black border border-[#3a3a3f] flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="button-cap text-white text-sm">
              Quick Inflow Engine
            </h2>
          </div>
          <span className="text-xs text-[#5a5a5f] hidden sm:inline">
            Natural language invoice parser
          </span>
        </div>

        <form onSubmit={handleParse} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Billed Nike brand design $3,200 due next Friday"
              className="w-full text-input text-xs placeholder:text-[#5a5a5f]"
            />
          </div>
          <button
            type="submit"
            className="button-ghost-on-dark shrink-0 text-xs py-2 px-4"
          >
            <span>Parse &amp; Draft</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-[#5a5a5f] mr-1">
            Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset)}
              className="text-xs font-normal px-3 py-1 rounded-[32px] border border-[#3a3a3f] bg-black text-[#f0f0fa] hover:border-white hover:text-white transition-all"
            >
              + {preset.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-xs text-white border border-[#ef4444] rounded-[4px] px-3.5 py-2 bg-black">
            {error}
          </div>
        )}

        {/* Draft Confirmation Panel */}
        {draft && (
          <div className="bg-black border border-[#3a3a3f] rounded-[4px] p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-white" />
                Draft Invoice Preview
              </span>
              <span className="text-[11px] text-[#5a5a5f]">
                Ready for confirmation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#5a5a5f] text-[10px] uppercase font-bold block">Client</span>
                <span className="text-white font-medium">{draft.client ?? '—'}</span>
              </div>
              <div>
                <span className="text-[#5a5a5f] text-[10px] uppercase font-bold block">Project</span>
                <span className="text-white font-medium">{draft.project ?? '—'}</span>
              </div>
              <div>
                <span className="text-[#5a5a5f] text-[10px] uppercase font-bold block">Amount</span>
                <span className="text-white font-bold tabular-nums">
                  {draft.amount != null ? `$${Number(draft.amount).toLocaleString()}` : '—'}
                </span>
              </div>
              <div>
                <span className="text-[#5a5a5f] text-[10px] uppercase font-bold block">Due Date</span>
                <span className="text-white font-medium">{draft.dueDate ?? 'Immediate'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#3a3a3f]">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="button-ghost-sm text-xs py-1.5 px-3"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={draft.amount == null}
                className="button-ghost-on-dark text-xs py-1.5 px-4"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm &amp; Create Invoice</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#3a3a3f] flex items-center justify-between text-xs text-[#5a5a5f]">
        <span>Instant Draft Generation</span>
        <span>Enter plain English or click a preset</span>
      </div>
    </div>
  );
}
