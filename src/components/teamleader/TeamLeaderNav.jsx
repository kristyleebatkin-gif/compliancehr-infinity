import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, CalendarClock, MessageSquare, UserCircle } from 'lucide-react';

const TABS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'roster', label: 'Roster', icon: CalendarClock },
  { key: 'messages', label: 'Messages', icon: MessageSquare, path: '/communications' },
  { key: 'me', label: 'Me', icon: UserCircle, path: '/my-profile' }
];

export default function TeamLeaderNav({ screen, onSelect }) {
  const navigate = useNavigate();

  return (
    <nav className="tl-nav sticky bottom-0 grid grid-cols-5 px-1 pb-2 pt-1.5">
      {TABS.map(({ key, label, icon: Icon, path }) => {
        const active = screen === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => (path ? navigate(path) : onSelect(key))}
            className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[9.5px] font-bold ${
              active ? 'text-[#5A00D6]' : 'tl-muted'
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