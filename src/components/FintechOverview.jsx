import React, { useState, useRef } from 'react';
import { 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  ChevronDown 
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function FintechOverview({
  cashBalance = 6556.73,
  monthlyBurn = 3450.65,
  safetyBuffer = 1867.42,
  currency = '$',
  onOpenNewInvoice,
  onOpenSend,
  onOpenReceive,
  onContactClick,
}) {
  const [incomeRange, setIncomeRange] = useState('30 days');
  const [expenseYear, setExpenseYear] = useState('2025');
  const [transactionSpan, setTransactionSpan] = useState('This Week');
  const [activeBar, setActiveBar] = useState(4); // index 4 is active $2121 bar

  const containerRef = useRef(null);

  // GSAP Entrance Physics as mandated by gpt-taste
  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-stat-card', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: 'power3.out',
      });

      gsap.from('.gsap-chart-card', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        delay: 0.2,
        stagger: 0.15,
        ease: 'power3.out',
      });

      gsap.from('.gsap-right-panel', {
        x: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.25,
        ease: 'power3.out',
      });

      gsap.from('.gsap-visa-card', {
        scale: 0.94,
        opacity: 0,
        duration: 0.85,
        delay: 0.4,
        ease: 'back.out(1.4)',
      });
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  // Exact merchant transaction data from the photo comp
  const referenceTransactions = [
    {
      id: 'tx-1',
      name: 'The North Face',
      date: '28 Jul 2025',
      amount: '$156.90',
      avatar: (
        <div className="w-10 h-10 rounded-full bg-[#E51937] flex items-center justify-center text-white font-black text-[9px] leading-tight text-center uppercase tracking-tighter shrink-0 shadow-sm">
          THE<br/>NORTH<br/>FACE
        </div>
      ),
    },
    {
      id: 'tx-2',
      name: "McDonald's",
      date: '28 Jul 2025',
      amount: '$12.49',
      avatar: (
        <div className="w-10 h-10 rounded-full bg-[#DA291C] flex items-center justify-center text-[#FFC72C] font-black text-xl select-none shrink-0 shadow-sm">
          M
        </div>
      ),
    },
    {
      id: 'tx-3',
      name: 'Figma Pro',
      date: '29 Jul 2025',
      amount: '$16.99',
      avatar: (
        <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 38 57" fill="none">
            <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
            <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
            <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
            <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
            <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
          </svg>
        </div>
      ),
    },
    {
      id: 'tx-4',
      name: 'Starbucks',
      date: '28 Jul 2025',
      amount: '$5.75',
      avatar: (
        <div className="w-10 h-10 rounded-full bg-[#006241] flex items-center justify-center text-white shrink-0 shadow-sm">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
      ),
    },
    {
      id: 'tx-5',
      name: 'Amazon',
      date: '29 Jul 2025',
      amount: '$10.99',
      avatar: (
        <div className="w-10 h-10 rounded-full bg-[#1A1E29] flex items-center justify-center text-white font-bold text-lg select-none shrink-0 shadow-sm">
          a
        </div>
      ),
    },
  ];

  // Exact contacts list matching photo
  const referenceContacts = [
    {
      id: 'c-1',
      name: 'Daniel',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'c-2',
      name: 'Emily',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'c-3',
      name: 'Ryan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'c-4',
      name: 'Jason',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'c-5',
      name: 'Luke',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      
      {/* ============================================================ */}
      {/* ROW 1: TOP 3 STAT METRIC CARDS                                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: TOTAL BALANCE (#1E1E1E from photo, with #C4FC51 lime badge) */}
        <div className="gsap-stat-card fintech-card-obsidian p-6 relative flex flex-col justify-between min-h-[172px] overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            {/* Exact Neon Lime Circle Badge (#C4FC51) with Money Bag Icon */}
            <div className="w-12 h-12 rounded-full bg-[#C4FC51] flex items-center justify-center text-[#1E1E1E] shadow-sm transition-transform group-hover:scale-105">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm0 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </div>
            {/* Three Dots Menu with exact #909090 color */}
            <button 
              type="button" 
              className="text-[#909090] hover:text-white p-1 rounded-full transition-colors"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="text-xs font-medium text-[#909090] mb-1">
              Total Balance
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums font-sans">
              $ 6556.73
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL SPENDING (#FFFFFF pure white card from photo) */}
        <div className="gsap-stat-card fintech-card-white p-6 relative flex flex-col justify-between min-h-[172px] group hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            {/* Light Circle Badge with Exchange/Dollar Icon */}
            <div className="w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center text-[#1C1C1C] transition-transform group-hover:scale-105">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M9 9h4.5a1.5 1.5 0 0 1 0 3H10a1.5 1.5 0 0 0 0 3h5" />
              </svg>
            </div>
            {/* Three Dots Menu */}
            <button 
              type="button" 
              className="text-[#909090] hover:text-[#1C1C1C] p-1 rounded-full transition-colors"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#666666] mb-1">
              Total Spending
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#1C1C1C] tracking-tight tabular-nums font-sans">
              $ 3450.65
            </div>
          </div>
        </div>

        {/* CARD 3: TOTAL SAVED (#FFFFFF pure white card from photo) */}
        <div className="gsap-stat-card fintech-card-white p-6 relative flex flex-col justify-between min-h-[172px] group hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            {/* Light Circle Badge with Vault Icon */}
            <div className="w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center text-[#1C1C1C] transition-transform group-hover:scale-105">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="4" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 9v1M15 12h-1M12 15v-1M9 12h1" />
              </svg>
            </div>
            {/* Three Dots Menu */}
            <button 
              type="button" 
              className="text-[#909090] hover:text-[#1C1C1C] p-1 rounded-full transition-colors"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#666666] mb-1">
              Total Saved
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#1C1C1C] tracking-tight tabular-nums font-sans">
              $ 1867.42
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* ROW 2: MAIN DASHBOARD SPLIT GRID                              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN AREA (8 COLS): CHARTS & TRANSACTIONS */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. INCOME CHART CARD */}
            <div className="gsap-chart-card fintech-card-white p-6 flex flex-col justify-between min-h-[224px] hover:shadow-lg transition-shadow duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base text-[#1C1C1C]">
                  Income
                </h3>
                <button 
                  type="button"
                  className="flex items-center gap-1 text-xs text-[#909090] font-medium hover:text-[#1C1C1C] transition-colors"
                >
                  <span>{incomeRange}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Metric & Growth Tag with exact #C3EA75 / #C4FC51 */}
              <div className="flex items-center gap-3 my-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#1C1C1C] tracking-tight tabular-nums">
                  $ 6556.73
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#C3EA75] text-[#165A00]">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#165A00] stroke-[2.5]" />
                  <span>+28%</span>
                </span>
              </div>

              {/* Smooth Lavender-Purple Bezier Line (#A298DF from photo) */}
              <div className="relative w-full h-24 mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 90" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="incomeCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A298DF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#A298DF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Wash */}
                  <path
                    d="M 0 75 Q 75 70, 150 55 T 250 35 T 300 25 L 300 90 L 0 90 Z"
                    fill="url(#incomeCurveGrad)"
                  />

                  {/* Bezier Line with exact #A298DF stroke */}
                  <path
                    d="M 0 75 Q 75 70, 150 55 T 250 35 T 300 25"
                    fill="none"
                    stroke="#A298DF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Active Indicator Point on the Curve */}
                  <circle cx="210" cy="40" r="5" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="3" />
                </svg>

                {/* Exact Deep Black Capsule Tooltip "$4121" (#0E0E0E) */}
                <div 
                  className="absolute left-[65%] -top-4 -translate-x-1/2 bg-[#0E0E0E] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 select-none pointer-events-none"
                >
                  <span>$4121</span>
                </div>
              </div>
            </div>

            {/* 2. EXPENSES HATCHED BAR CHART CARD */}
            <div className="gsap-chart-card fintech-card-white p-6 flex flex-col justify-between min-h-[224px] hover:shadow-lg transition-shadow duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-[#1C1C1C]">
                  Expences
                </h3>
                <button 
                  type="button"
                  className="flex items-center gap-1 text-xs text-[#909090] font-medium hover:text-[#1C1C1C] transition-colors"
                >
                  <span>{expenseYear}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Hatched Bars with exact #747474 stripes and active #625BFF bar */}
              <div className="relative w-full h-32 flex items-end justify-between px-2 pt-6">
                
                {/* Bar 1 */}
                <div className="w-7 bg-diagonal-hatch rounded-t-lg transition-all" style={{ height: '36px' }} />
                
                {/* Bar 2 */}
                <div className="w-7 bg-diagonal-hatch rounded-t-lg transition-all" style={{ height: '58px' }} />
                
                {/* Bar 3 */}
                <div className="w-7 bg-diagonal-hatch rounded-t-lg transition-all" style={{ height: '42px' }} />
                
                {/* Bar 4 */}
                <div className="w-7 bg-diagonal-hatch rounded-t-lg transition-all" style={{ height: '28px' }} />
                
                {/* Bar 5 (Active Highlighted Solid Purple Bar #625BFF with $2121 Tooltip) */}
                <div className="relative flex flex-col items-center">
                  {/* Floating Deep Black Capsule Tooltip "$2121" (#0E0E0E) */}
                  <div className="absolute -top-7 bg-[#0E0E0E] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-lg select-none whitespace-nowrap">
                    $2121
                  </div>
                  {/* Solid Purple Bar #625BFF */}
                  <div 
                    className="w-8 rounded-full bg-[#625BFF] shadow-md shadow-[#625BFF]/30 flex flex-col items-center pt-1.5 transition-all"
                    style={{ height: '90px' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/95" />
                  </div>
                </div>

                {/* Bar 6 */}
                <div className="w-7 bg-diagonal-hatch rounded-t-lg transition-all" style={{ height: '62px' }} />
                
                {/* Bar 7 */}
                <div className="w-7 bg-diagonal-hatch rounded-t-lg transition-all" style={{ height: '46px' }} />

              </div>
            </div>

          </div>

          {/* 3. RECENT TRANSACTIONS CARD */}
          <div className="gsap-chart-card fintech-card-white p-6 hover:shadow-lg transition-shadow duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0]">
              <h3 className="font-bold text-base text-[#1C1C1C]">
                Transactions
              </h3>
              <button 
                type="button"
                className="flex items-center gap-1 text-xs text-[#909090] font-medium hover:text-[#1C1C1C] transition-colors"
              >
                <span>{transactionSpan}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Merchant Transactions */}
            <div className="divide-y divide-[#F5F5F5]">
              {referenceTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between group hover:bg-[#FAFAFA] px-2 -mx-2 rounded-xl transition-colors">
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3.5">
                    {tx.avatar}
                    <div>
                      <div className="font-semibold text-sm text-[#1C1C1C]">
                        {tx.name}
                      </div>
                      <div className="text-xs text-[#909090]">
                        {tx.date}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="font-bold text-sm text-[#1C1C1C] tabular-nums">
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN AREA (4 COLS): MY CARDS & RECENT CONTACTS       */}
        {/* (#1C1C1C dark container from photo)                           */}
        {/* ============================================================ */}
        <div className="gsap-right-panel lg:col-span-4 fintech-panel-dark p-6 space-y-7 bg-[#1C1C1C]">
          
          {/* SECTION A: MY CARDS */}
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">
                  My Cards
                </h3>
                <div className="text-xs text-[#909090]">
                  2 Cards
                </div>
              </div>
              {/* Exact Purple #675DFC + Action Button from photo */}
              <button 
                type="button"
                onClick={onOpenNewInvoice}
                className="btn-purple-circle"
                title="Add New Card or Account"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* EXACT SIGNATURE DUAL-TONE VISA CARD FROM PHOTO */}
            <div className="gsap-visa-card relative rounded-2xl overflow-hidden bg-[#C4FC51] text-[#1C1C1C] p-5 shadow-2xl transition-all hover:scale-[1.02] duration-300">
              
              {/* Exact Organic Wavy Purple Accent (#675DFC) on Top Contour */}
              <div 
                className="absolute -top-12 -right-12 w-48 h-32 bg-[#675DFC] rounded-[40%] rotate-12 pointer-events-none opacity-95"
                style={{ filter: 'blur(0.5px)' }}
              />
              <div 
                className="absolute -top-10 right-8 w-28 h-20 bg-[#6C63FC] rounded-full pointer-events-none opacity-90"
              />

              {/* Card Top Row: VISA Brand & Contactless Icon */}
              <div className="relative z-10 flex items-center justify-between mb-6">
                <span className="font-black text-xl tracking-tight text-[#1C1C1C]">
                  VISA
                </span>
                {/* Contactless payment waves symbol */}
                <svg className="w-6 h-6 text-[#1C1C1C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                  <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                  <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                </svg>
              </div>

              {/* Card Center: Balance ($3265.75) */}
              <div className="relative z-10 my-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1C] tracking-tight tabular-nums font-sans">
                  $3265.75
                </div>
              </div>

              {/* Card Bottom Row: Number & Expiry */}
              <div className="relative z-10 flex items-end justify-between pt-4 text-xs font-semibold text-[#1C1C1C] tracking-wider">
                <span className="font-mono text-sm tracking-widest">
                  **** **** 1287 2342
                </span>
                <span className="text-[11px] font-sans font-bold">
                  Exp 05/29
                </span>
              </div>

            </div>

            {/* SEND & RECEIVE ACTION PILL BUTTONS (White #FFFFFF pills from photo) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onOpenSend}
                className="fintech-pill-btn w-full justify-center"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>Send</span>
              </button>

              <button
                type="button"
                onClick={onOpenReceive}
                className="fintech-pill-btn w-full justify-center"
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Receive</span>
              </button>
            </div>

          </div>

          {/* SECTION B: RECENT CONTACTS */}
          <div className="space-y-4 pt-2">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">
                  Recent Contacts
                </h3>
                <div className="text-xs text-[#909090]">
                  24 Contacts
                </div>
              </div>
              {/* Exact Purple #675DFC + Action Button */}
              <button 
                type="button"
                onClick={onOpenNewInvoice}
                className="btn-purple-circle"
                title="Add New Contact"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Contacts Avatar Tray */}
            <div className="flex items-center justify-between pt-1">
              {referenceContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => onContactClick?.(contact)}
                  className="flex flex-col items-center gap-1.5 group focus:outline-none"
                  title={`Transfer to ${contact.name}`}
                >
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-[#2A2A2A] group-hover:ring-[#675DFC] transition-all"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#909090] group-hover:text-white transition-colors">
                    {contact.name}
                  </span>
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
