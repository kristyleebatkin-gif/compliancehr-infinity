import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun,
  Inbox,
  CalendarClock,
  ReceiptText,
  Heart,
  ShieldCheck,
  HeartHandshake,
  Users,
  FolderOpen,
  ScrollText,
  HeartPulse,
  Sparkles
} from 'lucide-react';

const MODULES = [
  { label: 'Today', path: '/today', icon: Sun },
  { label: 'Inbox', path: '/communications', icon: Inbox },
  { label: 'Roster', path: '/rostering', icon: CalendarClock },
  { label: 'Invoicing', path: '/invoicing', icon: ReceiptText },
  { label: 'Participants & Goals', path: '/our-participants', icon: Heart },
  { label: 'Compliance & Audits', path: '/compliance', icon: ShieldCheck },
  { label: 'NDIS & Aged Care', path: '/ndis-portal', icon: HeartHandshake },
  { label: 'Team', path: '/our-employees', icon: Users },
  { label: 'Documents', path: '/documents', icon: FolderOpen },
  { label: 'Audit log & Registers', path: '/governance', icon: ScrollText }
];

export default function TodaySidebar({ plan, onWellbeing }) {
  const { pathname } = useLocation();

  return (
    <aside className="t-rail sticky top-4 hidden h-[calc(100vh-2rem)] w-[228px] shrink-0 flex-col p-3 lg:flex">
      <div className="px-2 pb-3 pt-1">
        <p className="t-muted text-[10px] font-bold uppercase tracking-[0.16em]">ComplianceHR</p>
        <p className="t-grad-text text-[15px] font-extrabold leading-tight">Infinity</p>
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5">
        {MODULES.map(({ label, path, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
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
            <li key={item.id} className="text-[11.5px] font-medium leading-snug text-[#2E4472]">
              • {item.label}
            </li>
          ))}
          {!plan?.length ? <li className="text-[11.5px] text-[#4B6392]">Nothing scheduled yet.</li> : null}
        </ul>
      </div>
    </aside>
  );
}