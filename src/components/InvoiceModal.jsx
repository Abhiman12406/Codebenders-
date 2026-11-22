import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileText, 
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
  const [notes, setNotes] = useState('Payment due via ACH/Wire. Thank you for your business!');
  
  const [items, setItems] = useState([
    { desc: 'Creative Direction & Design Deliverables', qty: 1, rate: 2500 },
  ]);

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

  const setQuickTerms = (days) => {
    const d = new Date(issueDate || new Date());
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#1C1C1F] border border-[#2E2E35] rounded-[28px] overflow-hidden my-8 text-white shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A30] bg-[#18181B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#675DFC]/15 border border-[#675DFC]/30 text-[#A298DF] flex items-center justify-center rounded-xl shadow-inner">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight">CREATE NEW INVOICE</h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">Issue invoice and update your cash forecast horizon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-[#2D2D35] text-zinc-400 hover:text-white hover:border-zinc-400 hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-xs">
          
          {/* Client & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                CLIENT ENTITY
              </label>
              {!isNewClient ? (
                <div className="space-y-1.5">
                  <select
                    value={selectedClientId}
                    onChange={handleClientChange}
                    className="w-full text-input text-xs bg-[#141417] text-white border border-[#2E2E35]"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#1C1C1F] text-white">
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                    <option value="__new__" className="text-white font-bold bg-[#141417]">+ Add new client...</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Client or company name"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      required
                      className="w-full text-input text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setIsNewClient(false)}
                      className="text-xs text-[#675DFC] hover:underline shrink-0 font-semibold"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Client WhatsApp Phone */}
            <div>
              <label className="block text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>WHATSAPP PHONE</span>
                <span className="text-[10px] text-zinc-500 font-normal">(Int'l format)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="+15551234567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full text-input pl-10 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Project Title & Invoice # */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                PROJECT TITLE
              </label>
              <input
                type="text"
                placeholder="e.g. Brand Identity System & Guidelines"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                className="w-full text-input text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                INVOICE NUMBER
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="w-full text-input text-xs tabular-nums font-mono font-bold"
              />
            </div>
          </div>

          {/* Dates & Quick Net Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                ISSUE DATE
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-input text-xs bg-[#141417] text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                  DUE DATE
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickTerms(0)}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#2D2D35] bg-[#141417] text-zinc-300 hover:border-[#675DFC] hover:text-white transition-all"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTerms(15)}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#2D2D35] bg-[#141417] text-zinc-300 hover:border-[#675DFC] hover:text-white transition-all"
                  >
                    Net 15
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTerms(30)}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#2D2D35] bg-[#141417] text-zinc-300 hover:border-[#675DFC] hover:text-white transition-all"
                  >
                    Net 30
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-input text-xs bg-[#141417] text-white"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3 pt-3 border-t border-[#2A2A30]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                LINE ITEMS
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs text-[#675DFC] hover:text-[#8B82FF] font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Deliverable description"
                    value={item.desc}
                    onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                    required
                    className="flex-1 text-input text-xs py-2"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="QTY"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    className="w-16 text-input text-xs text-center py-2 tabular-nums"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="RATE"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    className="w-28 text-input text-xs text-right py-2 tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-zinc-500 hover:text-rose-400 disabled:opacity-30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total Display */}
            <div className="flex items-center justify-between p-4 bg-[#141417] border border-[#2A2A30] rounded-xl mt-2">
              <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                TOTAL INVOICE BALANCE
              </span>
              <span className="text-xl font-black text-white tabular-nums tracking-tight">
                {currency}{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              PAYMENT INSTRUCTIONS &amp; NOTES
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-input text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A2A30]">
            <button
              type="button"
              onClick={onClose}
              className="button-ghost-on-dark text-xs py-2.5 px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-purple text-xs py-2.5 px-6 shadow-md"
            >
              Issue Invoice
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
