import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TabsTrigger } from '@/components/ui/tabs';
import { Siren, History } from 'lucide-react';

const beep = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    setTimeout(() => ctx.close(), 900);
  } catch { /* audio unavailable */ }
};

const CONFIG = {
  alerts: { icon: Siren, label: 'Automated Alerts', colour: '#ec4899', clear: 'All clear' },
  logs: { icon: History, label: 'Automated Alert Log', colour: '#7c3aed', clear: 'Log quiet' },
};

export default function AlertLamp({ kind, className, onClick }) {
  const [count, setCount] = useState(null);
  const prev = useRef(null);
  const { icon: Icon, label, colour, clear } = CONFIG[kind] || CONFIG.alerts;

  useEffect(() => {
    let alive = true;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });
    const load = async () => {
      try {
        const c = kind === 'alerts'
          ? await base44.entities.Notification.count({ read: false })
          : await base44.entities.CommunicationEntry.count({
              entry_date: today,
              $or: [
                { sender_email: 'system@compliancehr-portal' },
                { sender_name: 'Automated Compliance Reminder' },
                { sender_name: 'System (Compliance Reminders)' },
              ],
            });
        if (alive) setCount(c ?? 0);
      } catch { if (alive) setCount(0); }
    };
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [kind]);

  useEffect(() => {
    if (prev.current !== null && count !== null && count > prev.current) beep();
    prev.current = count;
  }, [count]);

  const lit = (count ?? 0) > 0;
  const Comp = onClick ? 'button' : TabsTrigger;

  return (
    <Comp
      {...(onClick ? { type: 'button', onClick } : { value: kind })}
      aria-label={`${label}${lit ? `: ${count} active` : ''}`}
      className={`group relative flex w-full items-center justify-start gap-2 overflow-hidden rounded-xl border px-2.5 py-1.5 text-left transition-all ${className || ''}`}
      style={{
        borderColor: `${colour}55`,
        background: `linear-gradient(135deg, ${colour}22 0%, ${colour}0d 55%, hsl(var(--card)) 100%)`,
        boxShadow: lit ? `0 0 16px 1px ${colour}55` : `0 4px 12px -6px ${colour}40`,
      }}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${lit ? 'animate-pulse' : ''}`}
        style={{
          background: `linear-gradient(135deg, #2563eb 0%, ${colour} 100%)`,
          boxShadow: lit ? `0 0 10px 1px ${colour}` : 'none',
        }}
      >
        <Icon aria-hidden="true" className="h-3 w-3" />
      </span>
      <span className="relative min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[11px] font-bold text-foreground">{label}</span>
        <span className="block text-[10px] font-semibold" style={{ color: colour }}>
          {count === null ? 'Checking…' : lit ? `${count} active` : clear}
        </span>
      </span>
    </Comp>
  );
}