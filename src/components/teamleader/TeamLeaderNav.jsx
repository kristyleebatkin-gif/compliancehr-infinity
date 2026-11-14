import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, CalendarClock, Sparkles, MessageSquare, UserCircle } from 'lucide-react';

const TABS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'workbench', label: 'Studio', icon: Sparkles },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'roster', label: 'Roster', icon: CalendarClock },
  { key: 'messages', label: 'Messages', icon: MessageSquare, path: '/communications' },
  { key: 'me', label: 'Me', icon: UserCircle, path: '/my-profile' }
];

export default function TeamLeaderNav({ screen, onSelect }) {
  const navigate = useNavigate();

  return (
    <nav aria-label="Team Leader workspace" className="tl-nav sticky bottom-0 grid grid-cols-6 gap-1 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
      {TABS.map(({ key, label, icon: Icon, path }) => {
        const active = screen === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => (path ? navigate(path) : onSelect(key))}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[11px] font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0072FF] ${
              active ? 'bg-[#F5F0FF] text-[#5A00D6] shadow-sm' : 'tl-muted'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.6} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}