import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox, CalendarClock, ReceiptText, MessagesSquare, LayoutTemplate, Mic } from 'lucide-react';

const ITEMS = [
  { label: 'Inbox', path: '/communications', icon: Inbox },
  { label: 'Roster', path: '/rostering', icon: CalendarClock },
  { label: 'Invoicing', path: '/invoicing', icon: ReceiptText },
  { label: 'Team chat', path: '/communications', icon: MessagesSquare },
  { label: 'Templates', path: '/documents', icon: LayoutTemplate },
  { label: 'Voice assistant', path: '/assistant', icon: Mic }
];

export default function TodayDock() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center px-3">
      <nav className="t-dock pointer-events-auto flex items-end gap-1 px-2 py-1.5">
        {ITEMS.map(({ label, path, icon: Icon }) => (
          <Link key={label} to={path} title={label} className="t-dock-item group flex w-[52px] flex-col items-center gap-0.5 px-1 py-1.5">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            <span className="max-w-full truncate text-[8.5px] font-bold opacity-70">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}