import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, StickyNote, PartyPopper, Megaphone, HeartHandshake, Lightbulb, Copy, Check, Loader2 } from 'lucide-react';

const tiles = [
  { key: 'messages', label: 'Messages', from: '#0ea5e9', to: '#3b82f6', Icon: MessageSquare, kind: 'Message' },
  { key: 'notes', label: 'Shift Notes', from: '#65a30d', to: '#22c55e', Icon: StickyNote, kind: 'Shift Note' },
  { key: 'banter', label: 'Team Banter', from: '#e11d48', to: '#f43f5e', Icon: PartyPopper, kind: 'Team Banter' },
  { key: 'broadcasts', label: 'Broadcasts', from: '#ea580c', to: '#f97316', Icon: Megaphone, kind: 'Broadcast' },
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
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold leading-snug">{title}</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{tip}</p>
        </div>
        <button
          type="button"
          onClick={() => copy(tip, id)}
          className="shrink-0 rounded-md border p-1 transition hover:bg-muted"
          title="Copy to share"
        >
          {copied === id ? <Check className="h-3.5 w-3.5 text-green-700" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2.5 px-4 py-2.5" style={{ '--comm-bar-bg': 'linear-gradient(120deg, #0d9488 0%, #14b8a6 55%, #0891b2 100%)', color: '#fff' }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <HeartHandshake className="h-4 w-4 text-white" />
        </span>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-base font-bold">Communication &amp; Teamwork</h3>
          <p className="text-xs font-semibold text-white/90">How the team is connecting this week</p>
        </div>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading activity…
        </div>
      ) : (
        <div className="space-y-2.5 p-3.5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {tiles.map(({ key, label, from, to, Icon }) => (
              <div key={key} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-base sm:text-lg font-extrabold leading-5">{stats[key]}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{label} · 7d</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {tipCard('comm', Lightbulb, 'Communication tip', commTips[day % commTips.length], '#0369a1', '#0ea5e9')}
            {tipCard('team', HeartHandshake, 'Teamwork tip', teamTips[day % teamTips.length], '#c026d3', '#ec4899')}
          </div>
        </div>
      )}
    </section>
  );
}