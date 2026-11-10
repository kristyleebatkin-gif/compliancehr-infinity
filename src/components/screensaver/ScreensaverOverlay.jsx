import React, { useEffect, useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import '@/components/screensaver/screensaver.css';
import ScreensaverArt from '@/components/screensaver/ScreensaverArt';

const timeFormat = new Intl.DateTimeFormat('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
const dateFormat = new Intl.DateTimeFormat('en-AU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

export default function ScreensaverOverlay({ design, name, roleLabel, stats = [], onClose }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const first = useMemo(() => (name || '').trim().split(' ')[0], [name]);

  if (!design) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${design.name} screensaver`}
      className="sa-overlay"
      onClick={onClose}
    >
      <ScreensaverArt design={design} />

      <button
        type="button"
        onClick={onClose}
        aria-label="Return to the dashboard"
        className="absolute right-4 top-4 z-[3] grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <LogOut className="h-4 w-4" />
      </button>

      <div className="sa-body" style={{ '--sa-accent': design.accent }}>
        <p className="sa-eyebrow">{design.name}</p>
        <p className="sa-clock">{timeFormat.format(now)}</p>
        <p className="sa-date">{dateFormat.format(now)}</p>
        <p className="sa-person">{first ? `${first} · ${roleLabel}` : roleLabel}</p>
        <p className="sa-design-name">{design.blurb}</p>

        {stats.length > 0 && (
          <div className="sa-stats">
            {stats.map((stat) => (
              <p key={stat.label} className="sa-stat">
                <span>{stat.value}</span> {stat.label}
              </p>
            ))}
          </div>
        )}

        <p className="sa-hint">Tap anywhere to return</p>
      </div>
    </div>
  );
}