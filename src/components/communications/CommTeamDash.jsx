import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, StickyNote, PartyPopper, Megaphone, HeartHandshake, Loader2 } from 'lucide-react';

const tiles = [
  { key: 'messages', label: 'Messages', color: '#0072FF', Icon: MessageSquare, kind: 'Message' },
  { key: 'notes', label: 'Shift Notes', color: '#A855F7', Icon: StickyNote, kind: 'Shift Note' },
  { key: 'banter', label: 'Team Banter', color: '#FF2E9A', Icon: PartyPopper, kind: 'Team Banter' },
  { key: 'broadcasts', label: 'Broadcasts', color: '#0072FF', Icon: Megaphone, kind: 'Broadcast' },
];

export default function CommTeamDash() {
  const [stats, setStats] = useState(null);

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

  return (
    <section className="flex h-full flex-col justify-between overflow-hidden rounded-xl border border-[#A855F7]/60 bg-[#081018] p-3 text-white shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#A855F7] text-white">
            <HeartHandshake className="h-3.5 w-3.5 text-white" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white">Merged Communication Dashboard</h3>
            <p className="text-[10px] text-slate-300">7-day live team communication &amp; shift note activity</p>
          </div>
        </div>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading activity…
        </div>
      ) : (
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiles.map(({ key, label, color, Icon }) => (
            <div key={key} className="flex min-w-0 items-center gap-2 rounded-lg border border-white/15 bg-[#162235] p-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white" style={{ backgroundColor: color }}>
                <Icon className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-4 text-white">{stats[key]}</p>
                <p className="text-[10px] font-bold leading-tight text-slate-300 break-words">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}