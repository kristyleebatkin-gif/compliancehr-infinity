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
  alerts: { icon: Siren, label: 'Alerts', colour: '#dc2626', clear: 'All clear' },
  logs: { icon: History, label: 'Alert Log', colour: '#1e3a8a', clear: 'Log quiet' },
};

// A light shown at the bottom corners of the communication board: it lights up
// (and sounds an alarm) as alerts arrive. Tapping it opens that section.
export default function AlertLamp({ kind }) {
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

  return (
    <TabsTrigger
      value={kind}
      aria-label={`${label}${lit ? `: ${count} active` : ''}`}
      className="group relative flex min-h-20 flex-1 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border p-2 text-center transition-all hover:-translate-y-0.5"
      style={{
        borderColor: lit ? `${colour}80` : 'hsl(var(--border))',
        background: lit ? `linear-gradient(165deg, ${colour}2e 0%, hsl(var(--card)) 85%)` : 'hsl(var(--card))',
        boxShadow: lit ? `0 0 26px 2px ${colour}73` : 'none',
      }}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md ${lit ? 'animate-pulse' : 'opacity-40'}`}
        style={{ background: lit ? colour : '#94a3b8', boxShadow: lit ? `0 0 16px 3px ${colour}` : 'none' }}
      >
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <span className="relative text-xs font-bold text-foreground">{label}</span>
      <span className="relative text-[10px] font-semibold" style={{ color: lit ? colour : 'hsl(var(--muted-foreground))' }}>
        {count === null ? 'Checking…' : lit ? `${count} active` : clear}
      </span>
    </TabsTrigger>
  );
}