import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  Sparkles,
  Phone
} from 'lucide-react';

export default function InvoiceModal({
  isOpen,
  onClose,
  clients = [],
  currency = '$',
  onSaveInvoice,
}) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('+15552345678');
  
  const [projectTitle, setProjectTitle] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('Payment due via ACH/Stripe. Thank you for your business!');
  
  const [items, setItems] = useState([
    { desc: 'Creative Direction & Design Deliverables', qty: 1, rate: 2500 },
  ]);

  // Set default dates and random invoice number on open
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const issue = today.toISOString().split('T')[0];
      
      const due = new Date();
      due.setDate(due.getDate() + 15);
      const dueStr = due.toISOString().split('T')[0];

      const randNum = Math.floor(100 + Math.random() * 900);
      setInvoiceNumber(`INV-2026-${randNum}`);
      setIssueDate(issue);
      setDueDate(dueStr);

      if (clients.length > 0 && !selectedClientId) {
        setSelectedClientId(clients[0].id);
        setClientPhone(clients[0].phone || '+15552345678');
      }
    }
  }, [isOpen, clients]);

  if (!isOpen) return null;

  // Handle client select change
  const handleClientChange = (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      setIsNewClient(true);
      setSelectedClientId('');
      setClientPhone('');
    } else {
      setIsNewClient(false);
      setSelectedClientId(val);
      const found = clients.find((c) => c.id === val);
      if (found?.phone) setClientPhone(found.phone);
    }
  };

  // Quick terms helper
  const setQuickTerms = (days) => {
    const d = new Date(issueDate || new Date());
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  // Line items helpers
  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { desc: '', qty: 1, rate: 500 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate total
  const calculatedTotal = items.reduce((sum, item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    return sum + qty * rate;
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalClientId = selectedClientId;
    let finalClientName = '';

    if (isNewClient) {
      if (!newClientName.trim()) {
        alert('Please enter client name');
        return;
      }
      finalClientName = newClientName.trim();
    } else {
      const selected = clients.find((c) => c.id === selectedClientId);
      finalClientName = selected ? selected.name : 'Client';
    }

    if (!projectTitle.trim()) {
      alert('Please enter a project title');
      return;
    }

    if (calculatedTotal <= 0) {
      alert('Invoice total must be greater than 0');
      return;
    }

    onSaveInvoice({
      client_id: finalClientId || null,
      client_name: finalClientName,
      client_company: isNewClient ? newClientCompany : undefined,
      client_phone: clientPhone.trim(),
      invoice_number: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-4)}`,
      project_title: projectTitle.trim(),
      amount: calculatedTotal,
      issue_date: issueDate,
      due_date: dueDate,
      status: 'sent',
      items,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/90 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Create New Invoice</h3>
              <p className="text-xs text-slate-400">Generate studio deliverable invoice & Net terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Client & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Client
              </label>
              {!isNewClient ? (
                <div className="space-y-1.5">
                  <select
                    value={selectedClientId}
                    onChange={handleClientChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                    <option value="__new__">+ Add New Client...</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Client or Company Name"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsNewClient(false)}
                      className="text-xs text-slate-400 hover:text-slate-200 underline shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Client WhatsApp Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Client WhatsApp Phone</span>
                <span className="text-[10px] text-slate-500 lowercase font-normal">(with country code)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+15551234567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Project Title & Invoice # */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Project Deliverable Title
              </label>
              <input
                type="text"
                placeholder="e.g. Brand Identity System & Guidelines"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Invoice #
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Dates & Quick Net Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Due Date
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuickTerms(0)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTerms(15)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Net 15
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTerms(30)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Net 30
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Deliverable description"
                    value={item.desc}
                    onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                    required
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    className="w-16 px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-center text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    className="w-24 px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-right text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total Display */}
            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl mt-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Invoice Balance
              </span>
              <span className="text-lg font-bold text-white tracking-tight">
                {currency}{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Client Memo / Payment Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition shadow-lg shadow-indigo-600/30"
            >
              Create & Issue Invoice
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
