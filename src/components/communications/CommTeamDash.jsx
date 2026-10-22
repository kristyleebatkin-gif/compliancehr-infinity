import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, StickyNote, PartyPopper, Megaphone, HeartHandshake, Lightbulb, Copy, Check, Loader2 } from 'lucide-react';

const tiles = [
  { key: 'messages', label: 'Messages', from: '#2563eb', to: '#60a5fa', Icon: MessageSquare, kind: 'Message' },
  { key: 'notes', label: 'Shift Notes', from: '#0d9488', to: '#2dd4bf', Icon: StickyNote, kind: 'Shift Note' },
  { key: 'banter', label: 'Team Banter', from: '#db2777', to: '#f472b6', Icon: PartyPopper, kind: 'Team Banter' },
  { key: 'broadcasts', label: 'Broadcasts', from: '#7c3aed', to: '#c084fc', Icon: Megaphone, kind: 'Broadcast' },
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
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
      <div className="flex items-start gap-1.5 px-2 py-1">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
          <Icon className="h-2.5 w-2.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold leading-tight">{title}</p>
          <p className="line-clamp-2 text-[9px] leading-tight text-muted-foreground">{tip}</p>
        </div>
        <button
          type="button"
          onClick={() => copy(tip, id)}
          className="shrink-0 rounded border p-0.5 transition hover:bg-muted"
          title="Copy to share"
        >
          {copied === id ? <Check className="h-2.5 w-2.5 text-green-700" /> : <Copy className="h-2.5 w-2.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2 px-2.5 py-1" style={{ background: 'var(--header-gradient)', color: '#fff' }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
          <HeartHandshake className="h-3 w-3 text-white" />
        </span>
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-xs font-bold">Communication &amp; Teamwork</h3>
          <p className="text-[9px] font-semibold text-white/85">How the team is connecting this week</p>
        </div>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading activity…
        </div>
      ) : (
        <div className="space-y-1.5 p-1.5">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {tiles.map(({ key, label, from, to, Icon }) => (
              <div key={key} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold leading-tight">{stats[key]}</p>
                    <p className="text-[9px] font-semibold text-muted-foreground">{label} · 7d</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {tipCard('comm', Lightbulb, 'Communication tip', commTips[day % commTips.length], '#2563eb', '#60a5fa')}
            {tipCard('team', HeartHandshake, 'Teamwork tip', teamTips[day % teamTips.length], '#db2777', '#f472b6')}
          </div>
        </div>
      )}
    </section>
  );
}