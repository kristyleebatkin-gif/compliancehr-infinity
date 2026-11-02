import React from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, ClipboardCheck, RefreshCw } from 'lucide-react';

const DEFAULT_PROPS = [
  { icon: ShieldCheck, title: 'Stay Compliant', desc: 'Meet NDIS standards and regulatory obligations.' },
  { icon: ShieldAlert, title: 'Reduce Risk', desc: 'Identify, assess and manage risks effectively.' },
  { icon: TrendingUp, title: 'Improve Quality', desc: 'Deliver safe, consistent and high quality supports.' },
  { icon: ClipboardCheck, title: 'Audit Ready', desc: 'Maintain accurate records and evidence.' },
  { icon: RefreshCw, title: 'Continuous Improvement', desc: 'Use data and feedback to drive better outcomes.' },
];

export default function ValuePropsFooter({ items = DEFAULT_PROPS, className = undefined }) {
  return (
    <div
      className={`rounded-2xl text-white ${className || ''}`}
      style={{ background: 'linear-gradient(135deg, #1a1a3d 0%, #2a2a5e 100%)' }}
    >
      <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((p) => (
          <div key={p.title} className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <p.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide">{p.title}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-white/70">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}