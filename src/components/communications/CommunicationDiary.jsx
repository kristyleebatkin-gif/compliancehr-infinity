import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Paperclip, Reply, Trash2, Download } from 'lucide-react';
import { openAttachment, exportCsv } from '@/lib/commTypes';
import { fetchAllRecords } from '@/lib/csvExport';
import ReplyDialog from './ReplyDialog';

const parseJson = (value, fallback = []) => { try { return JSON.parse(value || '') || fallback; } catch { return fallback; } };

export default function CommunicationDiary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState({ kind: '', person_type: '', person: '', search: '', from: '', to: '' });
  const [replyTarget, setReplyTarget] = useState(null);
  const [personLinks, setPersonLinks] = useState({});

  // Resolve diary people to their live participant / staff records.
  useEffect(() => {
    (async () => {
      const [par, staff] = await Promise.allSettled([
        base44.entities.ParticipantProfile.filter({}, { fields: ['full_name'], limit: 500 }),
        base44.entities.StaffProfile.filter({}, { fields: ['full_name'], limit: 500 }),
      ]);
      const links = {};
      if (par.status === 'fulfilled') {
        for (const p of par.value.items || []) {
          if (p.full_name) links[String(p.full_name).toLowerCase()] = `/participants/${p.id}`;
        }
      }
      if (staff.status === 'fulfilled') {
        for (const p of staff.value.items || []) {
          if (p.full_name) links[String(p.full_name).toLowerCase()] = `/staff/${p.id}`;
        }
      }
      setPersonLinks(links);
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const rows = await fetchAllRecords(base44.entities.CommunicationEntry, {}, '-created_date');
      setItems(rows);
    } catch {
      setItems([]);
      setLoadError('Unable to load the communication diary. Refresh to try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const people = useMemo(() => [...new Set(items.map((i) => i.person_name).filter(Boolean))].sort(), [items]);
  const personLink = (name) => personLinks[String(name || '').toLowerCase()];

  const roots = useMemo(() => items.filter((i) => !i.parent_id), [items]);
  const childrenOf = useMemo(() => {
    const map = new Map();
    items.filter((i) => i.parent_id).forEach((child) => {
      map.set(child.parent_id, [...(map.get(child.parent_id) || []), child]);
    });
    return map;
  }, [items]);

  const filtered = roots.filter((n) => (!filters.kind || n.entry_kind === filters.kind)
    && (!filters.person_type || (n.person_type || 'General') === filters.person_type)
    && (!filters.person || n.person_name === filters.person)
    && (!filters.from || (n.entry_date || '') >= filters.from)
    && (!filters.to || (n.entry_date || '') <= filters.to)
    && (!filters.search || [n.subject, n.body, n.person_name, n.sender_name].join(' ').toLowerCase().includes(filters.search.toLowerCase())));

  const kindTone = (kind) => ({
    'Shift Note': 'secondary', 'Employee Log': 'outline', Message: 'default', Email: 'default', Broadcast: 'destructive', 'Team Banter': 'secondary',
  }[kind] || 'outline');

  const EntryCard = ({ entry, isReply }) => {
    const attachments = parseJson(entry.attachments_json);
    return (
      <div className={isReply ? 'rounded-lg border border-border/50 bg-muted/40 p-3' : 'rounded-xl border border-border/60 p-3.5'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={kindTone(entry.entry_kind)}>{entry.entry_kind}</Badge>
            {entry.note_type && entry.note_type !== entry.entry_kind && <Badge variant="outline">{entry.note_type}</Badge>}
            {entry.person_name && (personLink(entry.person_name) ? (
              <Link to={personLink(entry.person_name)} className="hover:opacity-75">
                <Badge variant="outline" className="bg-accent/40">{entry.person_name} ↗</Badge>
              </Link>
            ) : <Badge variant="outline">{entry.person_name}</Badge>)}
            {entry.shift_type && <Badge variant="outline">{entry.shift_type}</Badge>}
            {entry.goal && <Badge className="bg-safe text-safe-foreground">{entry.goal}</Badge>}
            {entry.log_type && <Badge variant="outline">{entry.log_type}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {[entry.entry_date, entry.entry_time, entry.sender_name].filter(Boolean).join(' · ')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setReplyTarget(entry)}><Reply className="h-3.5 w-3.5" />Reply</Button>
            <Button variant="ghost" size="icon" onClick={async () => { await base44.entities.CommunicationEntry.delete(entry.id); await load(); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
          </div>
        </div>
        {entry.attention && <p className="mt-1 text-xs text-muted-foreground">Attention: {entry.attention}</p>}
        {entry.subject && <p className="mt-1 text-sm font-semibold">{entry.subject}</p>}
        {entry.body && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{entry.body}</p>}
        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {(entry.staff_involved || []).length > 0 && <span>Staff: {entry.staff_involved.join(', ')}</span>}
          {Number(entry.travel_km) > 0 && <span>Travel: {entry.travel_km} km{entry.travel_location ? ` at ${entry.travel_location}` : ''}</span>}
          {entry.medication_supervised && <span>Med supervised: {entry.medication_supervised}</span>}
          {entry.module && <span>Module: {entry.module}</span>}
          {entry.management_copy && <span>Management emailed</span>}
        </div>
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              <Button key={i} variant="outline" size="sm" onClick={() => openAttachment(a)}><Paperclip className="h-3 w-3" />{a.name}</Button>
            ))}
          </div>
        )}
        {(childrenOf.get(entry.id) || []).map((child) => <div key={child.id} className="mt-2"><EntryCard entry={child} isReply /></div>)}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={filters.kind} onChange={(e) => setFilters({ ...filters, kind: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All types</option>
          {['Shift Note', 'Employee Log', 'Message', 'Email', 'Broadcast', 'Team Banter'].map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={filters.person_type} onChange={(e) => setFilters({ ...filters, person_type: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">Everyone</option>
          <option value="Participant">Participants</option>
          <option value="Employee">Employees</option>
          <option value="General">General</option>
        </select>
        <select value={filters.person} onChange={(e) => setFilters({ ...filters, person: e.target.value })} className="h-9 max-w-44 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All people</option>
          {people.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="w-auto" />
        <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="w-auto" />
        <Input placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-auto flex-1" />
        {!loading && filtered.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => exportCsv('communication-diary.csv', filtered.map((n) => ({
            kind: n.entry_kind, type: n.note_type || n.log_type, person: n.person_name, subject: n.subject, date: n.entry_date, time: n.entry_time,
            staff: (n.staff_involved || []).join('; '), goal: n.goal, shift_type: n.shift_type, sender: n.sender_name, body: n.body,
          })))}><Download className="h-4 w-4" />Export</Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : loadError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{loadError} <Button type="button" variant="outline" size="sm" className="ml-2" onClick={load}>Retry</Button></div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nothing in the diary yet - shift notes, employee logs, messages, emails and broadcasts all appear here.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
        </div>
      )}

      {replyTarget && (
        <ReplyDialog entry={replyTarget} open={Boolean(replyTarget)} onOpenChange={(o) => !o && setReplyTarget(null)} onSaved={load} />
      )}
    </div>
  );
}