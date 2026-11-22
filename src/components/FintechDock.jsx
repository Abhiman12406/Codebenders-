import React from 'react';
import { 
  Home, 
  CreditCard, 
  ArrowLeftRight, 
  BarChart3, 
  ShoppingBag, 
  Flame, 
  Bell, 
  Settings 
} from 'lucide-react';

export default function FintechDock({
  activeTab = 'dashboard',
  onTabChange,
  isBadDayActive = false,
  onToggleBadDay,
  onOpenAuth,
  isCloudSynced = false,
  apiOnline = false,
}) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'cards', icon: CreditCard, label: 'Cards' },
    { id: 'receivables', icon: ArrowLeftRight, label: 'Transactions' },
    { id: 'forecast', icon: BarChart3, label: 'Analytics' },
    { id: 'outflows', icon: ShoppingBag, label: 'Store' },
  ];

  return (
    <aside className="w-16 sm:w-20 bg-[#1C1C1C] shrink-0 min-h-screen py-6 flex flex-col items-center justify-between select-none z-30 transition-all">
      {/* Top Brand Logo: 4-petal geometric cross matching photo */}
      <div className="flex flex-col items-center gap-8 w-full">
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className="group relative flex items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-all"
          title="StudioFlow Dashboard"
        >
          {/* Custom 4-petal geometric cross with exact lime #C4FC51 & purple #675DFC from photo */}
          <svg className="w-8 h-8 transition-transform group-hover:scale-105" viewBox="0 0 32 32" fill="none">
            {/* Top vertical petal: Lime from photo */}
            <rect x="13.5" y="2" width="5" height="12" rx="2.5" fill="#C4FC51" />
            {/* Bottom vertical petal: Lime from photo */}
            <rect x="13.5" y="18" width="5" height="12" rx="2.5" fill="#C4FC51" />
            {/* Left horizontal petal: Purple from photo */}
            <rect x="2" y="13.5" width="12" height="5" rx="2.5" fill="#675DFC" />
            {/* Right horizontal petal: Purple from photo */}
            <rect x="18" y="13.5" width="12" height="5" rx="2.5" fill="#675DFC" />
          </svg>
        </button>

        {/* Navigation Icons Strip */}
        <nav className="flex flex-col items-center gap-3.5 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                title={item.label}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#6458E2] text-white shadow-md shadow-[#6458E2]/30 scale-105'
                    : 'text-[#909090] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Actions */}
      <div className="flex flex-col items-center gap-3.5 w-full px-2 pt-6 border-t border-[#2A2A2A]">
        {/* Bad Day Crisis Simulation Quick Toggle */}
        <button
          type="button"
          onClick={onToggleBadDay}
          title={isBadDayActive ? 'Crisis Protocol Active' : 'Bad Day Stress Test'}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            isBadDayActive
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/20 animate-pulse'
              : 'text-[#909090] hover:text-amber-400 hover:bg-white/5'
          }`}
        >
          <Flame className="w-5 h-5" />
        </button>

        {/* Sync & Connectivity Indicator */}
        <div 
          className="w-2.5 h-2.5 rounded-full transition-colors cursor-pointer"
          title={apiOnline ? 'Node API:3001 Connected' : 'Offline-first Local Store Active'}
          style={{ backgroundColor: apiOnline ? '#10B981' : isCloudSynced ? '#6458E2' : '#909090' }}
        />

        {/* Profile / Auth Settings */}
        <button
          type="button"
          onClick={onOpenAuth}
          title="Account & System Settings"
          className="w-10 h-10 rounded-2xl text-[#909090] hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>
    </aside>
  );
}
