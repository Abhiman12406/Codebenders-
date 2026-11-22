import React, { useState } from 'react';
import { TrendingUp, Users, Flame, Send, ArrowUpRight } from 'lucide-react';

const SLICES = [
  {
    id: 'runway',
    title: 'Runway Sovereignty',
    subtitle: 'Rolling 90-Day Trajectory',
    description: 'Dynamic burn-rate calculations and safety buffer alerts that project your zero-cash date weeks before danger strikes.',
    metric: '90-Day Horizon',
    detail: 'Lag-adjusted daily curve',
    icon: TrendingUp,
    badge: 'Real-Time Radar'
  },
  {
    id: 'cohorts',
    title: 'Cohort Risk Radar',
    subtitle: 'AR Aging Classification',
    description: 'Algorithmic categorization into 0–15d, 16–30d, and severe 60d+ brackets to prioritize collection efforts without awkward follow-ups.',
    metric: '4 Aging Cohorts',
    detail: 'Automated DSO tracking',
    icon: Users,
    badge: 'Risk Engine'
  },
  {
    id: 'crisis',
    title: 'Bad Day Triage',
    subtitle: 'Crisis Simulation Engine',
    description: 'Instant multi-client default simulation that activates 50% split payment requests and halts discretionary outflows.',
    metric: '1-Click Triage',
    detail: 'Deficit protection protocol',
    icon: Flame,
    badge: 'Liquidity Armor'
  },
  {
    id: 'settlement',
    title: 'Direct Settlement',
    subtitle: 'Frictionless Recovery',
    description: 'Pre-formatted professional WhatsApp reminders and standalone client pay portals that accelerate cash conversion.',
    metric: 'Zero Portal Overhead',
    detail: 'Direct client payment links',
    icon: Send,
    badge: 'Direct Protocol'
  }
];

export default function HorizontalAccordions() {
  const [activeId, setActiveId] = useState('runway');

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3a3a3f] pb-5">
        <div>
          <div className="micro-cap text-[#5a5a5f] font-bold mb-2">
            <span>Modular Architecture</span>
          </div>
          <h2 className="display-lg text-white">
            Core Operating Capabilities
          </h2>
        </div>
        <p className="text-sm text-[#f0f0fa] max-w-md leading-relaxed">
          Engineered to convert volatile freelance receivables into deterministic, audit-ready financial resilience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SLICES.map((slice) => {
          const isActive = activeId === slice.id;
          const Icon = slice.icon;

          return (
            <div
              key={slice.id}
              onClick={() => setActiveId(slice.id)}
              onMouseEnter={() => setActiveId(slice.id)}
              className={`relative overflow-hidden rounded-[8px] border cursor-pointer transition-all duration-300 ease-out flex flex-col justify-between p-6 sm:p-7 ${
                isActive
                  ? 'border-white bg-[#0f0f12]'
                  : 'border-[#3a3a3f] bg-[#0a0a0a] hover:border-[#5a5a5f]'
              }`}
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between">
                <span className="micro-cap text-white font-bold tracking-[0.96px] border border-[#3a3a3f] px-2.5 py-0.5 rounded-[32px] bg-black">
                  {slice.badge}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#3a3a3f]'}`} />
              </div>

              {/* Bottom Content Area */}
              <div className="space-y-3 pt-12">
                <div className="w-9 h-9 rounded-[4px] flex items-center justify-center bg-black border border-[#3a3a3f] text-white">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white tracking-[0.96px]">
                    {slice.title}
                  </h3>
                  <p className="text-xs text-[#5a5a5f] font-sans">
                    {slice.subtitle}
                  </p>
                </div>

                <p className="text-xs text-[#f0f0fa] leading-relaxed pt-1">
                  {slice.description}
                </p>

                <div className="pt-3 border-t border-[#3a3a3f] flex items-center justify-between text-xs">
                  <span className="font-bold text-white tabular-nums">{slice.metric}</span>
                  <span className="text-[#5a5a5f] text-[11px]">{slice.detail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
