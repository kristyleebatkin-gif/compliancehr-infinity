import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, CalendarClock, ReceiptText, NotebookPen } from 'lucide-react';

const TILES = [
  { key: 'emails', label: 'Emails to answer', icon: Mail, href: '/communications', tone: 'from-[#0072FF] to-[#5A00D6]' },
  { key: 'shifts', label: 'Shifts today', icon: CalendarClock, href: '/rostering', tone: 'from-[#0A2B6D] to-[#0072FF]' },
  { key: 'invoices', label: 'Invoices ready', icon: ReceiptText, href: '/invoicing', tone: 'from-[#5A00D6] to-[#FF2E9A]' },
  { key: 'notesOutstanding', label: 'Shift notes outstanding', icon: NotebookPen, href: '/communications', tone: 'from-[#FF2E9A] to-[#5A00D6]' }
];

export default function MorningBriefTiles({ counts }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {TILES.map(({ key, label, icon: Icon, href, tone }) => (
        <Link key={key} to={href} className="t-card group p-3.5 transition hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
              <Icon className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <span className="t-muted text-[10px] font-bold uppercase tracking-[0.12em]">Today</span>
          </div>
          <p className="t-title mt-2.5 text-[26px] font-extrabold leading-none">{counts[key] ?? 0}</p>
          <p className="t-muted mt-1 text-[11.5px] font-semibold leading-snug">{label}</p>
        </Link>
      ))}
    </div>
  );
}