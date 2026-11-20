import React from 'react';
import { ArrowUpRight, CircleCheck, Clock3, FileText } from 'lucide-react';

const PREVIEW_ITEMS = [
  { icon: Clock3, title: 'Review due', detail: 'A policy review has an assigned owner', status: 'Needs attention', tone: 'amber' },
  { icon: FileText, title: 'Evidence linked', detail: 'A document is connected to its source record', status: 'Recorded', tone: 'blue' },
  { icon: CircleCheck, title: 'Action completed', detail: 'A reviewer has recorded the outcome', status: 'Complete', tone: 'green' },
];

const TONES = {
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
};

export default function HeroDashboardMockup() {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:p-4" aria-label="Illustrative workspace preview using sample content">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[#0A2B6D] shadow-xl sm:p-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5A00D6]">Workspace preview</p>
            <h2 className="mt-1 text-lg font-extrabold">Work that needs a clear next step</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">Sample content</span>
        </div>
        <div className="mt-4 space-y-3">
          {PREVIEW_ITEMS.map(({icon:Icon,title,detail,status,tone}) => (
            <article key={title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A2B6D]/5 text-[#0A2B6D]"><Icon aria-hidden="true" className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-0.5 text-xs leading-5 text-slate-600">{detail}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${TONES[tone]}`}>{status}</span>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">Illustrative layout only. The information shown is sample content, not live organisational data.</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>Tasks · records · evidence</span><span className="inline-flex items-center gap-1 font-semibold text-[#0A2B6D]">Traceable work <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </div>
  );
}
