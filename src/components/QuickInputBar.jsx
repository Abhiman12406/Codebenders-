import React, { useState } from 'react';
import { parseInvoiceText } from '../lib/nlpParser.js';
import { Send, Check, Sparkles, FileText } from 'lucide-react';

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
    <div className="card-cockpit p-5 sm:p-6 space-y-5 h-full flex flex-col justify-between rounded-[28px] border-[#2A2A30]">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A2A30] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#675DFC]/15 border border-[#675DFC]/30 flex items-center justify-center text-[#A298DF] shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base tracking-tight">
                Quick Inflow NLP Bar
              </h2>
              <span className="text-[11px] text-[#A1A1AA] hidden sm:inline">
                Natural-language sentence-to-invoice dispatcher
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#A1A1AA] px-2.5 py-0.5 rounded-full bg-[#141417] border border-[#2D2D35]">
            NLP Parser
          </span>
        </div>

        <form onSubmit={handleParse} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Bill Acme Corp $3,500 for Brand Identity due next Friday"
              className="w-full text-input text-xs sm:text-sm placeholder:text-zinc-500"
            />
          </div>
          <button
            type="submit"
            className="btn-primary-purple shrink-0 text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-md"
          >
            <span>Parse &amp; Draft</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-[#A1A1AA] mr-1 font-semibold">
            Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#2D2D35] bg-[#141417] text-zinc-300 hover:border-[#675DFC] hover:text-white transition-all shadow-sm"
            >
              + {preset.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-xs text-rose-300 border border-rose-500/30 rounded-xl px-3.5 py-2.5 bg-rose-950/25">
            {error}
          </div>
        )}

        {draft && draft.amount != null && (
          <div className="border border-[#675DFC]/30 rounded-2xl p-4 bg-[#141417] space-y-3 shadow-lg shadow-[#675DFC]/5">
            <div className="flex items-center justify-between text-xs border-b border-[#2A2A30] pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#675DFC]" /> Parsed Draft Preview
              </span>
              <span className="font-bold text-white text-base tabular-nums">
                ${Number(draft.amount).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-zinc-300">
              <div>
                <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold">Client</span>
                <span className="text-white font-medium">{draft.client || draft.client_name || 'Client'}</span>
              </div>
              <div>
                <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold">Project</span>
                <span className="text-white font-medium">{draft.project || draft.project_title || 'Design Work'}</span>
              </div>
              <div>
                <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold">Due Date</span>
                <span className="text-white font-medium">{draft.dueDate || draft.due_date || 'Standard Net 15'}</span>
              </div>
            </div>
            <div className="pt-2.5 flex items-center justify-end gap-2 border-t border-[#2A2A30]">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="button-ghost text-xs py-1.5 px-3.5 hover:border-white transition-all"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="btn-primary-lime text-xs py-1.5 px-4 flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Confirm &amp; Record</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#2A2A30] flex items-center justify-between text-[11px] text-zinc-500 font-medium">
        <span>Format: "Bill [Client] [Amount] for [Work] due [Date]"</span>
        <span className="text-[#A1A1AA] font-mono">Offline-First</span>
      </div>
    </div>
  );
}
