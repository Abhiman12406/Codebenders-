import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle2 } from 'lucide-react';

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

  return (
    <section className="card-spacex p-6 sm:p-8 space-y-8 bg-[#0a0a0a]">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3a3a3f] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-[4px] bg-black border border-[#3a3a3f] flex items-center justify-center text-white">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="button-cap text-white text-base">
              RECURRING STUDIO OUTFLOWS
            </h2>
            <p className="micro-cap text-[#5a5a5f] mt-1">
              Fixed commitments, studio rent, taxes, and software expenses
            </p>
          </div>
        </div>
        <span className="micro-cap text-white border border-[#3a3a3f] px-3 py-1 rounded-[32px] bg-black self-start sm:self-auto">
          OVERHEAD LEDGER
        </span>
      </header>

      <div className="space-y-6">
        {[...groups.entries()].map(([key, items]) => {
          if (items.length === 0 && CATEGORIES.some((c) => c.value === key)) {
            return null;
          }
          return (
            <div key={key} className="space-y-3">
              <h3 className="micro-cap font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {labelFor(key)}
              </h3>
              <ul className="divide-y divide-[#3a3a3f] border border-[#3a3a3f] rounded-[4px] bg-black overflow-hidden">
                {items.map((bill) => (
                  <li key={bill.id} className="flex items-center justify-between gap-3 px-4 py-3.5 text-xs">
                    <div className="min-w-0">
                      <p className="text-white font-bold tracking-[0.96px] truncate">{bill.name}</p>
                      <p className="micro-cap text-[#5a5a5f] tabular-nums mt-0.5">
                        ${Number(bill.amount).toFixed(2)} · Due Day {bill.due_day}
                        {bill.frequency === 'quarterly' ? ' · Quarterly' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleFlexible(bill)}
                        className={`text-[10px] font-bold uppercase tracking-[1.17px] px-3 py-1 rounded-[32px] border transition ${
                          bill.is_flexible
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-[#5a5a5f] border-[#3a3a3f] hover:border-white'
                        }`}
                      >
                        {bill.is_flexible ? 'Flexible' : 'Locked'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBill(bill.id)}
                        className="text-[#5a5a5f] hover:text-[#ef4444] p-1 transition"
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
        {bills.length === 0 && (
          <p className="micro-cap text-[#5a5a5f] italic">No recurring outflows registered yet.</p>
        )}
      </div>

      {/* Add Bill Form */}
      <form onSubmit={handleSubmit} className="border-t border-[#3a3a3f] pt-6 grid grid-cols-1 sm:grid-cols-6 gap-3 items-center text-xs">
        <input
          type="text"
          placeholder="Outflow name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="sm:col-span-2 text-input text-xs tracking-[0.96px] placeholder:text-[#5a5a5f]"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount ($)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="text-input text-xs tracking-[0.96px] placeholder:text-[#5a5a5f]"
        />
        <input
          type="number"
          min="1"
          max="31"
          placeholder="Due day (1-31)"
          value={form.due_day}
          onChange={(e) => setForm({ ...form, due_day: e.target.value })}
          className="text-input text-xs tracking-[0.96px] placeholder:text-[#5a5a5f]"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="text-input text-xs tracking-[0.96px] bg-black text-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-black text-white">{c.label}</option>
          ))}
        </select>
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <label className="flex items-center gap-1.5 micro-cap text-[#f0f0fa] cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_flexible}
              onChange={(e) => setForm({ ...form, is_flexible: e.target.checked })}
              className="accent-white rounded-none"
            />
            Flexible
          </label>
          <button
            type="submit"
            className="button-ghost-on-dark text-xs py-2.5 px-5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Outflow</span>
          </button>
        </div>
      </form>
    </section>
  );
}
