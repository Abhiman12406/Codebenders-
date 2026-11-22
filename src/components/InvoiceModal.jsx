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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#3a3a3f] rounded-[8px] overflow-hidden my-8 text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3a3a3f] bg-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a0a0a] border border-[#3a3a3f] text-white flex items-center justify-center rounded-[4px]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="button-cap text-white text-base">CREATE NEW INVOICE</h3>
              <p className="micro-cap text-[#5a5a5f] mt-0.5">Issue invoice and update your cash forecast horizon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] border border-[#3a3a3f] text-[#5a5a5f] hover:text-white hover:border-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-xs">
          
          {/* Client & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block micro-cap text-[#5a5a5f] font-bold mb-1.5">
                CLIENT ENTITY
              </label>
              {!isNewClient ? (
                <div className="space-y-1.5">
                  <select
                    value={selectedClientId}
                    onChange={handleClientChange}
                    className="w-full text-input text-xs tracking-[0.96px] bg-black text-white"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-black text-white">
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                    <option value="__new__" className="text-white font-bold bg-[#0a0a0a]">+ Add new client...</option>
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
                      className="w-full text-input text-xs tracking-[0.96px]"
                    />
                    <button
                      type="button"
                      onClick={() => setIsNewClient(false)}
                      className="micro-cap text-white hover:underline shrink-0"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Client WhatsApp Phone */}
            <div>
              <label className="block micro-cap text-[#5a5a5f] font-bold mb-1.5 flex items-center justify-between">
                <span>WHATSAPP PHONE</span>
                <span className="text-[10px] text-[#5a5a5f]">(Int'l format)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#5a5a5f]" />
                <input
                  type="text"
                  placeholder="+15551234567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full text-input pl-10 text-xs tracking-[0.96px]"
                />
              </div>
            </div>
          </div>

          {/* Project Title & Invoice # */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block micro-cap text-[#5a5a5f] font-bold mb-1.5">
                PROJECT TITLE
              </label>
              <input
                type="text"
                placeholder="e.g. Brand Identity System & Guidelines"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                className="w-full text-input text-xs tracking-[0.96px]"
              />
            </div>

            <div>
              <label className="block micro-cap text-[#5a5a5f] font-bold mb-1.5">
                INVOICE NUMBER
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="w-full text-input text-xs tabular-nums tracking-[1.17px] font-bold"
              />
            </div>
          </div>

          {/* Dates & Quick Net Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block micro-cap text-[#5a5a5f] font-bold mb-1.5">
                ISSUE DATE
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-input text-xs bg-black text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="micro-cap text-[#5a5a5f] font-bold">
                  DUE DATE
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickTerms(0)}
                    className="text-[10px] font-bold uppercase tracking-[0.96px] px-2.5 py-0.5 rounded-[32px] border border-[#3a3a3f] bg-black text-[#f0f0fa] hover:border-white"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTerms(15)}
                    className="text-[10px] font-bold uppercase tracking-[0.96px] px-2.5 py-0.5 rounded-[32px] border border-[#3a3a3f] bg-black text-[#f0f0fa] hover:border-white"
                  >
                    Net 15
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTerms(30)}
                    className="text-[10px] font-bold uppercase tracking-[0.96px] px-2.5 py-0.5 rounded-[32px] border border-[#3a3a3f] bg-black text-[#f0f0fa] hover:border-white"
                  >
                    Net 30
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-input text-xs bg-black text-white"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3 pt-3 border-t border-[#3a3a3f]">
            <div className="flex items-center justify-between">
              <label className="micro-cap text-[#5a5a5f] font-bold">
                LINE ITEMS
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 micro-cap text-white font-bold hover:underline"
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
                    className="flex-1 text-input text-xs py-2 tracking-[0.32px]"
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
                    className="p-2 text-[#5a5a5f] hover:text-[#ef4444] disabled:opacity-30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total Display */}
            <div className="flex items-center justify-between p-4 bg-black border border-[#3a3a3f] rounded-[4px] mt-2">
              <span className="micro-cap text-[#5a5a5f] font-bold">
                TOTAL INVOICE BALANCE
              </span>
              <span className="text-xl font-bold text-white tabular-nums tracking-[1.2px]">
                {currency}{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block micro-cap text-[#5a5a5f] font-bold mb-1.5">
              PAYMENT INSTRUCTIONS &amp; NOTES
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-input text-xs tracking-[0.32px]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3a3a3f]">
            <button
              type="button"
              onClick={onClose}
              className="button-ghost-sm text-xs py-2.5 px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-ghost-on-dark text-xs py-2.5 px-6"
            >
              Issue Invoice
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
