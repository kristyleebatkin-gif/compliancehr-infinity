import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquare, Paperclip } from 'lucide-react';
import { SHIFT_TYPES, openAttachment } from '@/lib/commTypes';
import ReplyDialog from './ReplyDialog';

const parseJson = (value, fallback = []) => { try { return JSON.parse(value || '') || fallback; } catch { return fallback; } };

export default function ProfileCommDiary({ participant }) {
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('goal');
  const [filters, setFilters] = useState({ from: '', to: '', shift_type: '', goal: '' });
  const [replyTarget, setReplyTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [entryPage, goalPage] = await Promise.all([
        base44.entities.CommunicationEntry.filter({ person_type: 'Participant', person_name: participant.full_name }, { sort: '-created_date', limit: 300 }),
        base44.entities.Goal.filter({ participant_name: participant.full_name }, { limit: 100 }).catch(() => ({ items: [] })),
      ]);
      setEntries(entryPage.items || []);
      setGoals(goalPage.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [participant?.id]);

  const filtered = entries.filter((e) => (!filters.from || (e.entry_date || '') >= filters.from)
    && (!filters.to || (e.entry_date || '') <= filters.to)
    && (!filters.shift_type || e.shift_type === filters.shift_type)
    && (!filters.goal || e.goal === filters.goal));

  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: 'All notes', entries: filtered }];
    const field = groupBy === 'shift_type' ? 'shift_type' : groupBy === 'location' ? 'travel_location' : 'goal';
    const map = new Map();
    filtered.forEach((e) => {
      const key = e[field] || (field === 'goal' ? 'No goal linked' : field === 'shift_type' ? 'No shift type' : 'No location');
      map.set(key, [...(map.get(key) || []), e]);
    });
    return [...map.entries()].map(([key, list]) => ({ key, entries: list }));
  }, [filtered, groupBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Group by</span>
        {['goal', 'shift_type', 'location', 'none'].map((g) => (
          <Button key={g} size="sm" variant={groupBy === g ? 'default' : 'outline'} onClick={() => setGroupBy(g)}>
            {g === 'none' ? 'List' : g === 'shift_type' ? 'Support type' : g === 'location' ? 'Location' : 'Goal'}
          </Button>
        ))}
        <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="w-auto" />
        <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="w-auto" />
        <select value={filters.shift_type} onChange={(e) => setFilters({ ...filters, shift_type: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All shift types</option>
          {SHIFT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.goal} onChange={(e) => setFilters({ ...filters, goal: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All goals</option>
          {goals.map((g) => <option key={g.id} value={g.goal}>{g.goal}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : groups.length === 0 || groups.every((g) => g.entries.length === 0) ? (
        <p className="text-sm text-muted-foreground">No communication diary entries yet - notes recorded in the Communication Centre appear here.</p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="space-y-2">
            {groupBy !== 'none' && (
              <p className="text-sm font-semibold">{group.key} <Badge variant="secondary">{group.entries.length}</Badge></p>
            )}
            {group.entries.map((e) => {
              const attachments = parseJson(e.attachments_json);
              return (
                <div key={e.id} className="rounded-xl border border-border/60 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{e.note_type || e.entry_kind}</Badge>
                      {e.entry_kind !== 'Shift Note' && <Badge variant="secondary">{e.entry_kind}</Badge>}
                      {e.shift_type && <Badge variant="outline">{e.shift_type}</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{[e.entry_date, e.entry_time, e.sender_name].filter(Boolean).join(' · ')}</span>
                      <Button variant="ghost" size="sm" onClick={() => setReplyTarget(e)}><MessageSquare className="h-3.5 w-3.5" />Reply</Button>
                    </div>
                  </div>
                  {e.subject && <p className="mt-1 text-sm font-semibold">{e.subject}</p>}
                  {e.body && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{e.body}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {(e.staff_involved || []).length > 0 && <span>Staff: {e.staff_involved.join(', ')}</span>}
                    {Number(e.travel_km) > 0 && <span>Travel: {e.travel_km} km{e.travel_location ? ` at ${e.travel_location}` : ''}</span>}
                    {e.medication_supervised && <span>Med supervised: {e.medication_supervised}</span>}
                    {e.goal && <span>Goal: {e.goal}</span>}
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachments.map((a, i) => (
                        <Button key={i} variant="outline" size="sm" onClick={() => openAttachment(a)}><Paperclip className="h-3 w-3" />{a.name}</Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
      {replyTarget && (
        <ReplyDialog entry={replyTarget} open={Boolean(replyTarget)} onOpenChange={(o) => !o && setReplyTarget(null)} onSaved={load} />
      )}
    </div>
  );
}