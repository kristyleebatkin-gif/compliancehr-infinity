import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Inbox, CalendarClock, ReceiptText, ShieldCheck, Users, FolderOpen, LayoutDashboard } from 'lucide-react';

const ITEMS = [
  { label: 'Today', path: '/today', icon: Sun },
  { label: 'Workspace', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', path: '/communications', icon: Inbox },
  { label: 'Roster', path: '/rostering', icon: CalendarClock },
  { label: 'Invoicing', path: '/invoicing', icon: ReceiptText },
  { label: 'Compliance', path: '/compliance', icon: ShieldCheck },
  { label: 'Team', path: '/our-employees', icon: Users },
  { label: 'Documents', path: '/documents', icon: FolderOpen }
];

export default function TodayMobileNav() {
  const { pathname } = useLocation();

  return (
    <nav className="flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
      {ITEMS.map(({ label, path, icon: Icon }) => (
        <Link
          key={label}
          to={path}
          className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-bold ${
            pathname === path
              ? 'border-[#0A2B6D]/20 bg-white text-[#0A2B6D]'
              : 'border-[#0A2B6D]/10 bg-white/55 text-[#2E4472]'
          }`}
        >
          <Icon className="h-3 w-3" strokeWidth={1.7} />
          {label}
        </Link>
      ))}
    </nav>
  );
}