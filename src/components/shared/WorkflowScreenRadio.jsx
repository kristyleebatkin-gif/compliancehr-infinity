import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarRange, ClipboardList } from 'lucide-react';

const SCREENS = [
  { value: 'rostering', label: 'Rostering', path: '/rostering', Icon: CalendarRange },
  { value: 'quoting', label: 'Quoting', path: '/quotes', Icon: ClipboardList },
];

export default function WorkflowScreenRadio() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = pathname.startsWith('/quotes') ? 'quoting' : 'rostering';

  return (
    <fieldset className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5 shadow-2xs">
      <legend className="sr-only">Switch between the rostering and quoting screens</legend>
      {SCREENS.map(({ value, label, path, Icon }) => {
        const active = current === value;
        return (
          <label
            key={value}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring ${
              active ? 'bg-workspace-navy text-header-foreground' : 'text-workspace-navy hover:bg-muted'
            }`}
          >
            <input
              type="radio"
              name="rostering-quoting-screen"
              value={value}
              checked={active}
              onChange={() => { if (!active) navigate(path); }}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={`grid h-3 w-3 shrink-0 place-items-center rounded-full border ${active ? 'border-header-foreground' : 'border-workspace-navy/50'}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-header-foreground' : 'bg-transparent'}`} />
            </span>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </label>
        );
      })}
    </fieldset>
  );
}