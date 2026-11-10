import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Inbox, CalendarClock, ReceiptText, ShieldCheck, Users, FolderOpen, LayoutDashboard } from 'lucide-react';
import { useRole } from '@/lib/useRole';

const ITEMS = [
  { key: 'today', label: 'Today', path: '/today', icon: Sun },
  { key: 'dashboard', label: 'Workspace', path: '/dashboard', icon: LayoutDashboard },
  { key: 'communications', label: 'Inbox', path: '/communications', icon: Inbox },
  { key: 'rostering', label: 'Roster', path: '/rostering', icon: CalendarClock },
  { key: 'invoicing', label: 'Invoicing', path: '/invoicing', icon: ReceiptText },
  { key: 'compliance', label: 'Compliance', path: '/compliance', icon: ShieldCheck },
  { key: 'our-staff', label: 'Team', path: '/our-employees', icon: Users },
  { key: 'documents', label: 'Documents', path: '/documents', icon: FolderOpen }
];

export default function TodayMobileNav() {
  const { pathname } = useLocation();
  const { can } = useRole();
  const visibleItems = ITEMS.filter(({ key }) => can(key));

  return (
    <nav className="flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden" aria-label="Today workspace navigation">
      {visibleItems.map(({ key, label, path, icon: Icon }) => (
        <Link
          key={key}
          to={path}
          aria-current={pathname === path ? 'page' : undefined}
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
