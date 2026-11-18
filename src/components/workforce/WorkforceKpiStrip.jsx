import React from 'react';
import { Bot, CircleSlash, FileLock2, ShieldQuestion, UserCheck, Wrench } from 'lucide-react';

const tiles = [
  { key: 'activeAgents', label: 'Active agents', hint: 'Registered and running', icon: Bot, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'awaitingReview', label: 'Awaiting review', hint: 'A person must decide', icon: ShieldQuestion, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'approved', label: 'Approved', hint: 'Reviewed and authorised', icon: UserCheck, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'blocked', label: 'Blocked', hint: 'Policy refused the action', icon: CircleSlash, tone: 'text-rose-700 bg-rose-50 border-rose-200' },
  { key: 'autonomousGrants', label: 'Internal grants', hint: 'Explicit low-risk policies', icon: Wrench, tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'publishedPrompts', label: 'Published prompts', hint: 'Versioned and guardrailed', icon: FileLock2, tone: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
];

/** @param {any} props */
export default function WorkforceKpiStrip({ counts = {} } = {}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map(({ key, label, hint, icon: Icon, tone }) => (
        <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${tone}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0A2B6D]">{counts[key] ?? 0}</div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">{label}</div>
          <p className="mt-0.5 text-[11px] text-[#0A2B6D]/60">{hint}</p>
        </div>
      ))}
      <p className="col-span-full text-[11px] text-[#0A2B6D]/70">
        Counts read this business only, from the latest 100 decisions. Nothing here claims a model ran: every figure comes from a stored record.
      </p>
    </div>
  );
}