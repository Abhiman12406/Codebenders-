import React from 'react';
import { Bell, Plus, Flame } from 'lucide-react';

export default function FintechHeader({
  profile,
  activeTab = 'dashboard',
  onOpenNewInvoice,
  onOpenAuth,
  isBadDayActive = false,
  onToggleBadDay,
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'receivables':
        return { title: 'Receivables Radar', subtitle: 'Accounts Aging & Cash Collection' };
      case 'forecast':
        return { title: 'Cash Runway', subtitle: '30-90 Day Projection & What-If Engine' };
      case 'outflows':
        return { title: 'Outflows Ledger', subtitle: 'Recurring Studio Commitments & Burn' };
      case 'cards':
        return { title: 'My Cards & Accounts', subtitle: 'Fintech Liquidity & Reserves' };
      case 'dashboard':
      default:
        return { title: 'Welcome Back!', subtitle: 'Dashboard' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-6">
      {/* Title & Subtitle with exact colors from photo (#1C1C1C and #909090) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1C] tracking-tight">
          {title}
        </h1>
        <p className="text-sm font-medium text-[#909090] mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Right Action Tools: + Action, Notifications, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Quick New Invoice Action */}
        <button
          type="button"
          onClick={onOpenNewInvoice}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1C1C] hover:bg-[#2D2D2D] text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Invoice</span>
        </button>

        {/* Bad Day Quick Pill */}
        {isBadDayActive && (
          <button
            type="button"
            onClick={onToggleBadDay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold animate-pulse"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Crisis Active</span>
          </button>
        )}

        {/* Circular Notification Bell (White circular button from photo) */}
        <button
          type="button"
          className="relative w-11 h-11 rounded-full bg-white text-[#1C1C1C] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-md transition-all border border-gray-100/80"
          title="Notifications"
        >
          <Bell className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* User Portrait Avatar (matching photo circular avatar) */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="relative group focus:outline-none"
          title={profile?.owner_name || 'Alex Morgan — Studio Lead'}
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            alt={profile?.owner_name || 'Alex Morgan'}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] group-hover:ring-[#675DFC] transition-all"
          />
        </button>
      </div>
    </header>
  );
}
