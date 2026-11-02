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
  alerts: {
    icon: Siren,
    label: 'Alerts & Live Warnings',
    colour: '#FF2E9A',
    gradient: 'linear-gradient(125deg, #FF2E9A 0%, #A100FF 55%, #5A00D6 100%)',
    clear: 'All clear — tap to view alerts',
  },
  logs: {
    icon: History,
    label: 'Automated Alert Log',
    colour: '#0A2B6D',
    gradient: 'linear-gradient(125deg, #0072FF 0%, #0A2B6D 55%, #5A00D6 100%)',
    clear: 'Log quiet — tap to open history',
  },
};

export default function AlertLamp({ kind, className = undefined }) {
  const [count, setCount] = useState(null);
  const prev = useRef(null);
  const { icon: Icon, label, colour, gradient, clear } = CONFIG[kind] || CONFIG.alerts;

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
      className={`group relative flex w-full items-center justify-start gap-2 overflow-hidden rounded-xl border px-2.5 py-1.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${className || ''}`}
      style={{
        borderColor: colour,
        background: gradient,
        color: '#ffffff',
      }}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white ring-1 ring-white/40 ${lit ? 'animate-pulse' : ''}`}
      >
        <Icon aria-hidden="true" className="h-3.5 w-3.5 text-white" />
      </span>
      <span className="relative min-w-0 flex-1 truncate leading-tight">
        <span className="text-xs font-extrabold text-white">{label}</span>
        <span className="ml-1.5 text-[10px] font-bold text-white/90">
          ({count === null ? '…' : lit ? `${count} active` : 'All clear'})
        </span>
      </span>
      <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-extrabold text-white">
        Open
      </span>
    </TabsTrigger>
  );
}