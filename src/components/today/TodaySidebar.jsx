import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun, Inbox, CalendarClock, ReceiptText, Heart, ShieldCheck,
  HeartHandshake, Users, FolderOpen, ScrollText, HeartPulse, Sparkles
} from 'lucide-react';
import { useRole } from '@/lib/useRole';

const MODULES = [
  { key: 'today', label: 'Today', path: '/today', icon: Sun },
  { key: 'communications', label: 'Inbox', path: '/communications', icon: Inbox },
  { key: 'rostering', label: 'Roster', path: '/rostering', icon: CalendarClock },
  { key: 'invoicing', label: 'Invoicing', path: '/invoicing', icon: ReceiptText },
  { key: 'our-participants', label: 'Participants & Goals', path: '/our-participants', icon: Heart },
  { key: 'compliance', label: 'Compliance & Audits', path: '/compliance', icon: ShieldCheck },
  { key: 'ndis-provider', label: 'NDIS & Aged Care', path: '/ndis-portal', icon: HeartHandshake },
  { key: 'our-staff', label: 'Team', path: '/our-employees', icon: Users },
  { key: 'documents', label: 'Documents', path: '/documents', icon: FolderOpen },
  { key: 'governance', label: 'Audit log & Registers', path: '/governance', icon: ScrollText }
];

export default function TodaySidebar({ plan, onWellbeing }) {
  const { pathname } = useLocation();
  const { can } = useRole();
  const visibleModules = MODULES.filter((module) => can(module.key));

  return (
    <aside className="t-rail sticky top-4 hidden h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-[228px] shrink-0 flex-col p-3 lg:flex xl:w-[244px]">
      <div className="px-2 pb-3 pt-1">
        <p className="t-muted text-[10px] font-bold uppercase tracking-[0.16em]">ComplianceHR</p>
        <p className="t-grad-text text-[15px] font-extrabold leading-tight">Infinity</p>
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5" aria-label="Today workspace navigation">
        {visibleModules.map(({ key, label, path, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={key}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] font-semibold transition ${
                active ? 'bg-white/85 text-[#0A2B6D] shadow-sm' : 't-muted hover:bg-white/50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onWellbeing}
          className="t-muted flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12.5px] font-semibold transition hover:bg-white/50"
        >
          <HeartPulse className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          <span className="truncate">Wellbeing</span>
        </button>
      </nav>

      <div className="mt-3 rounded-2xl border border-[#C7B6FF]/50 bg-white/70 p-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#5A00D6]" />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#0A2B6D]">Planner</p>
        </div>
        <ul className="mt-2 space-y-1.5">
          {(plan || []).slice(0, 3).map((item) => (
            <li key={item.id} className="text-[11.5px] font-medium leading-snug text-[#2E4472]">• {item.label}</li>
          ))}
          {!plan?.length ? <li className="text-[11.5px] text-[#4B6392]">Nothing scheduled yet.</li> : null}
        </ul>
      </div>
    </aside>
  );
}