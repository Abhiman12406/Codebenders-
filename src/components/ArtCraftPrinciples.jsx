import React from 'react';
import { ShieldCheck, Database, Cpu } from 'lucide-react';

const PRINCIPLES = [
  {
    title: 'Free & Non-Custodial',
    subtitle: 'Zero Subscription Overhead',
    description: 'Independent studios and solo creatives should never have to pay perpetual software subscriptions to know whether their business will survive the next quarter.',
    icon: ShieldCheck,
    tag: 'Sovereignty',
  },
  {
    title: 'Deterministic Mathematics',
    subtitle: 'No Optimistic Guesswork',
    description: 'Cash runway is not a theoretical balance. StudioFlow weighs incoming invoices by actual debtor delay history and mandatory overhead commitments.',
    icon: Cpu,
    tag: 'Precision',
  },
  {
    title: 'Local-First Persistence',
    subtitle: 'Zero-Telemetry Sandbox',
    description: 'Your client records, fee structures, and cash reserves belong entirely to you. Encrypted and saved locally in your browser with zero tracking.',
    icon: Database,
    tag: 'Privacy',
  }
];

export default function ArtCraftPrinciples() {
  return (
    <section id="principles" className="py-24 md:py-32 border-t border-[#3a3a3f] bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3a3a3f] pb-5">
          <div>
            <div className="micro-cap text-[#5a5a5f] font-bold mb-2">
              <span>Operating Principles</span>
            </div>
            <h2 className="display-lg text-white">
              Design &amp; Financial Philosophy
            </h2>
          </div>
          <p className="text-sm text-[#f0f0fa] max-w-md leading-relaxed">
            Built from first principles for creative practitioners who demand complete operational autonomy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;

            return (
              <div 
                key={p.title}
                className="card-spacex p-7 sm:p-8 flex flex-col justify-between space-y-6 bg-[#0a0a0a]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#3a3a3f] pb-3.5">
                    <span className="micro-cap text-white font-bold tracking-[0.96px] border border-[#3a3a3f] px-2.5 py-0.5 rounded-[32px] bg-black">
                      {p.tag}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="w-9 h-9 rounded-[4px] flex items-center justify-center bg-black border border-[#3a3a3f] text-white">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-bold text-white tracking-[0.96px]">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[#5a5a5f] mt-0.5">
                      {p.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#f0f0fa] leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#3a3a3f] flex items-center justify-between text-xs text-[#5a5a5f]">
                  <span>Specification</span>
                  <span className="text-white font-medium">Standalone Engine</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
