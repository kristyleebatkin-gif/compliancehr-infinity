import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, PartyPopper, Megaphone, Radio } from 'lucide-react';

const SORT = (a, b) => String(b._feedDate).localeCompare(String(a._feedDate));

// Team Feed: one live stream combining staff shoutouts and internal
// announcements so the team can see recognition and important updates together.
export default function TeamFeed() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    let live = true;

    const load = async () => {
      const [shoutPage, annPage] = await Promise.all([
        base44.entities.CommunicationEntry
          .filter({ entry_kind: 'Team Banter', note_type: 'Shoutout' }, { sort: '-created_date', limit: 30 })
          .catch(() => ({ items: [] })),
        base44.entities.Announcement
          .filter({}, { sort: '-created_date', limit: 20 })
          .catch(() => ({ items: [] })),
      ]);
      if (!live) return;
      const merged = [
        ...(shoutPage.items || []).map((s) => ({ ...s, _kind: 'Shoutout', _feedDate: s.created_date })),
        ...(annPage.items || []).map((a) => ({ ...a, _kind: 'Announcement', _feedDate: a.created_date })),
      ].sort(SORT);
      setItems(merged);
    };

    load();
    const unsubShout = base44.entities.CommunicationEntry.subscribe(() => load());
    const unsubAnn = base44.entities.Announcement.subscribe(() => load());
    return () => { live = false; unsubShout(); unsubAnn(); };
  }, []);

  const shown = (items || []).filter((i) => filter === 'All' || i._kind === filter).slice(0, 2);

  return (
    <Card>
      <CardContent className="p-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-cyan-500/10 p-2"><Radio className="h-4 w-4 text-cyan-600" /></div>
            <div>
              <p className="text-sm font-bold">Team Feed</p>
              <p className="text-xs text-muted-foreground">Shoutouts and internal updates in one live stream</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {['All', 'Shoutout', 'Announcement'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {f === 'Shoutout' ? 'Shoutouts' : f === 'Announcement' ? 'Updates' : 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          {items === null && (
            <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          )}
          {items !== null && shown.map((i) => (
            i._kind === 'Shoutout' ? (
              <div key={i.id} className="rounded-xl border border-chart-5/30 bg-chart-5/10 p-2">
                <div className="mb-1 flex items-center gap-2">
                  <Badge className="gap-1 border-0 bg-chart-5/20 text-foreground hover:bg-chart-5/20">
                    <PartyPopper className="h-3 w-3" /> Shoutout
                  </Badge>
                  <span className="text-[11px] font-semibold text-foreground/60">{i.person_name}</span>
                </div>
                <p className="text-xs leading-snug">{i.body}</p>
                <p className="mt-1 text-[10px] text-foreground/50">{[i.sender_name, i.entry_date, i.entry_time].filter(Boolean).join(' · ')}</p>
              </div>
            ) : (
              <div key={i.id} className="rounded-xl border border-indigo-200/60 bg-indigo-500/10 p-2 dark:border-indigo-500/20">
                <div className="mb-1 flex items-center gap-2">
                  <Badge className="gap-1 border-0 bg-indigo-500/20 text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300">
                    <Megaphone className="h-3 w-3" /> Update
                  </Badge>
                  <span className="text-[11px] font-semibold text-foreground/60">{i.audience}</span>
                </div>
                <p className="text-xs font-semibold leading-snug">{i.title}</p>
                {i.body && <p className="mt-0.5 text-xs leading-snug">{i.body}</p>}
                <p className="mt-1 text-[10px] text-foreground/50">{[i.posted_by, i.created_date?.slice(0, 10)].filter(Boolean).join(' · ')}</p>
              </div>
            )
          ))}
          {items !== null && shown.length === 0 && (
            <p className="py-3 text-center text-xs text-muted-foreground">
              {filter === 'All' ? 'Nothing on the feed yet - post a shoutout or an update.' : `No ${filter === 'Shoutout' ? 'shoutouts' : 'updates'} yet.`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}