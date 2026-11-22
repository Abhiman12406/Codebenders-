import React from 'react';
import { 
  Building2, 
  CreditCard, 
  Globe2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Database
} from 'lucide-react';

const PROTOCOLS = [
  { name: 'Stripe Connect', type: 'Direct Clearing', icon: CreditCard },
  { name: 'Mercury Treasury', type: 'Yield Reserves', icon: Building2 },
  { name: 'Brex Liquidity', type: 'Working Capital', icon: Zap },
  { name: 'Wise Multi-Currency', type: 'Cross-Border Rails', icon: Globe2 },
  { name: 'Chase Commercial', type: 'Vault Settlement', icon: ShieldCheck },
  { name: 'Revolut Business', type: 'FX Hedging', icon: Layers },
  { name: 'Supabase Cloud', type: 'Zero-Telemetry', icon: Database },
];

export default function InfiniteMarquee() {
  const repeated = [...PROTOCOLS, ...PROTOCOLS, ...PROTOCOLS];

  return (
    <div className="w-full border-y border-[#3a3a3f] bg-black overflow-hidden py-3.5 select-none">
      <div className="animate-marquee flex items-center gap-12 text-xs">
        {repeated.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div 
              key={idx} 
              className="flex items-center gap-2.5 shrink-0 text-[#5a5a5f] hover:text-white transition-colors cursor-default"
            >
              <div className="w-6 h-6 rounded-[4px] bg-[#0a0a0a] border border-[#3a3a3f] flex items-center justify-center text-white">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white text-xs">
                {p.name}
              </span>
              <span className="text-[11px] text-[#5a5a5f]">
                · {p.type}
              </span>
              <span className="text-[#3a3a3f] ml-3">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
