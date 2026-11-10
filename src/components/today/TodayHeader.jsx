import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Bell, Play, Lock, Monitor } from 'lucide-react';
import { initials } from '@/components/today/todayUi';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const longDate = () =>
  new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

export default function TodayHeader({ user, theme, onToggleTheme, started, onStart, onSecurityPin, onScreensaver }) {
  const firstName = (user?.full_name || '').split(' ')[0] || 'there';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="t-muted text-[11px] font-bold uppercase tracking-[0.16em]">{longDate()}</p>
        <h1 className="t-title mt-1 truncate text-[26px] font-extrabold leading-tight sm:text-[30px]">
          {greeting()}, <span className="t-grad-text">{firstName}</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={onStart} className="t-btn t-btn-primary">
          <Play className="h-3.5 w-3.5" />
          {started ? 'Day started' : 'Mark my day started'}
        </button>
        {onSecurityPin && (
          <button
            type="button"
            onClick={onSecurityPin}
            aria-label="Security PIN"
            title="Security PIN"
            className="t-btn t-btn-ghost !px-2.5"
          >
            <Lock className="h-4 w-4" />
          </button>
        )}
        {onScreensaver && (
          <button
            type="button"
            onClick={onScreensaver}
            aria-label="Screensaver settings"
            title="Screensaver"
            className="t-btn t-btn-ghost !px-2.5"
          >
            <Monitor className="h-4 w-4" />
          </button>
        )}
        <Link to="/notifications" aria-label="Notifications" className="t-btn t-btn-ghost !px-2.5">
          <Bell className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Switch theme"
          className="t-btn t-btn-ghost !px-2.5"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          to="/my-profile"
          className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#0A2B6D] via-[#5A00D6] to-[#FF2E9A] text-[13px] font-extrabold text-white"
        >
          {initials(user?.full_name)}
        </Link>
      </div>
    </header>
  );
}