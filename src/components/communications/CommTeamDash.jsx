import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, StickyNote, PartyPopper, Megaphone, HeartHandshake, Lightbulb, Copy, Check, Loader2 } from 'lucide-react';

const tiles = [
  { key: 'messages', label: 'Messages', from: '#00C6FF', to: '#0072FF', Icon: MessageSquare, kind: 'Message' },
  { key: 'notes', label: 'Shift Notes', from: '#0A2B6D', to: '#5A00D6', Icon: StickyNote, kind: 'Shift Note' },
  { key: 'banter', label: 'Team Banter', from: '#A100FF', to: '#FF2E9A', Icon: PartyPopper, kind: 'Team Banter' },
  { key: 'broadcasts', label: 'Broadcasts', from: '#FF2E9A', to: '#FF6EDB', Icon: Megaphone, kind: 'Broadcast' },
];

const commTips = [
  'Check in with a teammate before the day starts — a quick hello sets the tone.',
  'Say the important thing first, then the details. Front-load your message.',
];

const teamTips = [
  'Thank someone out loud today — recognition lifts the whole team.',
  'Ask before assuming: one clarifying question can save a whole shift.',
];

export default function CommTeamDash() {
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(null);
  const day = new Date().getDate();

  useEffect(() => {
    let alive = true;
    (async () => {
      const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
      const counts = await Promise.all(
        tiles.map(({ kind }) => base44.entities.CommunicationEntry.count({ entry_kind: kind, entry_date: { $gte: weekAgo } }))
      );
      if (!alive) return;
      const next = {};
      tiles.forEach(({ key }, i) => { next[key] = counts[i]; });
      setStats(next);
    })().catch(() => { if (alive) setStats(Object.fromEntries(tiles.map(({ key }) => [key, 0]))); });
    return () => { alive = false; };
  }, []);

  const copy = (text, id) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(id); setTimeout(() => setCopied(null), 1500); }).catch(() => {});
  };

  const tipCard = (id, Icon, title, tip, from, to) => (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
      <div className="flex items-start gap-2 px-2.5 py-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
          <Icon className="h-3 w-3" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold leading-tight">{title}</p>
          <p className="mt-0.5 text-[11px] font-semibold leading-snug text-muted-foreground">{tip}</p>
        </div>
        <button
          type="button"
          onClick={() => copy(tip, id)}
          className="shrink-0 rounded border p-1 transition hover:bg-muted"
          title="Copy to share"
        >
          {copied === id ? <Check className="h-3 w-3 text-green-700" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2 px-3.5 py-2" style={{ '--comm-bar-bg': 'var(--header-gradient)', color: '#fff' }}>
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
          <HeartHandshake className="h-3.5 w-3.5 text-white" />
        </span>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-sm font-extrabold">Communication &amp; Teamwork</h3>
          <p className="text-[11px] font-bold text-white/90">How the team is connecting this week</p>
        </div>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading activity…
        </div>
      ) : (
        <div className="space-y-2 p-2.5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {tiles.map(({ key, label, from, to, Icon }) => (
              <div key={key} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
                <div className="flex items-center gap-2 px-2.5 py-1.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white shadow" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold leading-4">{stats[key]}</p>
                    <p className="text-[11px] font-bold text-muted-foreground">{label} · 7d</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {tipCard('comm', Lightbulb, 'Communication tip', commTips[day % commTips.length], '#0072FF', '#5A00D6')}
            {tipCard('team', HeartHandshake, 'Teamwork tip', teamTips[day % teamTips.length], '#A100FF', '#FF2E9A')}
          </div>
        </div>
      )}
    </section>
  );
}