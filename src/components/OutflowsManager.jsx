import React, { useState } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'software', label: 'Software' },
  { value: 'rent', label: 'Rent' },
  { value: 'tax', label: 'Tax' },
  { value: 'contractor', label: 'Contractor' },
];

const EMPTY_FORM = { name: '', amount: '', due_day: '', category: 'software', is_flexible: false };

export default function OutflowsManager({ bills = [], onSaveBill, onDeleteBill, onToggleFlexible }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const groups = new Map(CATEGORIES.map((c) => [c.value, []]));
  bills.forEach((bill) => {
    const key = (bill.category || 'software').toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(bill);
  });

  const labelFor = (key) => CATEGORIES.find((c) => c.value === key)?.label
    ?? key.toUpperCase();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !(Number(form.amount) > 0)) return;
    onSaveBill({
      name: form.name.trim(),
      amount: Number(form.amount),
      due_day: Number(form.due_day) || 1,
      category: form.category,
      frequency: 'monthly',
      is_flexible: form.is_flexible,
    });
    setForm(EMPTY_FORM);
  };

  const totalMonthlyOutflow = bills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  return (
    <section className="card-cockpit p-5 sm:p-6 space-y-6 rounded-[28px] border-[#2A2A30]">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2A30] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#675DFC]/15 border border-[#675DFC]/30 flex items-center justify-center text-[#A298DF] shadow-inner">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base tracking-tight">
              Recurring Studio Outflows Ledger
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Fixed commitments, studio space, tax reserves, and software subscriptions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-white px-3.5 py-1 rounded-full bg-[#141417] border border-[#2D2D35] tabular-nums font-mono shadow-inner">
            Burn: ${totalMonthlyOutflow.toLocaleString()}/mo
          </span>
          <span className="text-[10px] font-mono uppercase text-[#A1A1AA] border border-[#2D2D35] px-2.5 py-1 rounded-full bg-[#18181B]">
            Outflows Ledger
          </span>
        </div>
      </header>

      {/* Outflows List Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...groups.entries()].map(([key, items]) => {
          if (items.length === 0 && CATEGORIES.some((c) => c.value === key)) {
            return null;
          }
          return (
            <div key={key} className="space-y-3 bg-[#18181B] border border-[#2A2A30] rounded-2xl p-4.5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#675DFC]" />
                  {labelFor(key)}
                </span>
                <span className="text-[11px] text-[#A1A1AA] font-mono font-medium">
                  {items.length} item(s)
                </span>
              </h3>

              <ul className="divide-y divide-[#24242A] rounded-xl overflow-hidden">
                {items.map((bill) => (
                  <li key={bill.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{bill.name}</p>
                      <p className="text-[11px] text-[#A1A1AA] tabular-nums font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="font-bold text-white">${Number(bill.amount).toFixed(2)}</span>
                        <span>·</span>
                        <span>Due Day {bill.due_day}</span>
                        {bill.frequency === 'quarterly' ? ' · Quarterly' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleFlexible(bill)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          bill.is_flexible
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-[#141417] text-zinc-400 border-[#2D2D35] hover:border-zinc-500 hover:text-white'
                        }`}
                        title="Toggle whether bill is flexible for deferral during cash dips"
                      >
                        {bill.is_flexible ? 'Deferrable' : 'Fixed'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBill(bill.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete outflow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Add New Outflow Form */}
      <div className="pt-4 border-t border-[#2A2A30]">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            placeholder="Bill Name (e.g. Figma Organization, Cloud Server)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full sm:flex-1 text-input text-xs"
          />
          <input
            type="number"
            placeholder="Amount ($)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full sm:w-28 text-input text-xs"
          />
          <input
            type="number"
            placeholder="Due Day (1-31)"
            min="1"
            max="31"
            value={form.due_day}
            onChange={(e) => setForm({ ...form, due_day: e.target.value })}
            className="w-full sm:w-28 text-input text-xs"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full sm:w-36 text-input text-xs bg-[#17171A] text-white border border-[#2E2E35]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#1C1C1F] text-white">{c.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="btn-primary-purple text-xs py-2 px-4 shrink-0 flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Outflow</span>
          </button>
        </form>
      </div>
    </section>
  );
}
