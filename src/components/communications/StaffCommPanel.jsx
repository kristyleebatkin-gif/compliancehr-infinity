import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, MessageSquare, Paperclip } from 'lucide-react';
import { EMPLOYEE_LOG_TYPES, openAttachment, exportCsv } from '@/lib/commTypes';
import ReplyDialog from './ReplyDialog';

const parseJson = (value, fallback = []) => { try { return JSON.parse(value || '') || fallback; } catch { return fallback; } };

export default function StaffCommPanel({ staff }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [logPage, inboxPage] = await Promise.all([
        base44.entities.CommunicationEntry.filter({ person_type: 'Employee', person_name: staff.full_name }, { sort: '-created_date', limit: 200 }),
        base44.entities.CommunicationEntry.filter({}, { sort: '-created_date', limit: 300 }).catch(() => ({ items: [] })),
      ]);
      const involved = (logPage.items || []).slice();
      const myEmail = String(staff.email || '').toLowerCase();
      const inbox = (inboxPage.items || []).filter((e) => {
        if (logPage.items?.some((l) => l.id === e.id)) return false;
        const recipients = parseJson(e.recipients_json);
        return recipients.some((r) => String(r.email || '').toLowerCase() === myEmail
          || (e.staff_involved || []).includes(staff.full_name));
      });
      setEntries([...involved, ...inbox]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [staff?.id]);

  const grouped = useMemo(() => EMPLOYEE_LOG_TYPES
    .map((type) => ({ type, entries: entries.filter((e) => e.log_type === type) }))
    .filter((g) => g.entries.length > 0)
    .concat([{ type: 'Inbox & other', entries: entries.filter((e) => !e.log_type) }].filter((g) => g.entries.length > 0)), [entries]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {entries.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => exportCsv(`communication-log-${staff.full_name}.csv`, entries.map((e) => ({
            kind: e.entry_kind, log_type: e.log_type, subject: e.subject, date: e.entry_date, time: e.entry_time,
            staff: (e.staff_involved || []).join('; '), sender: e.sender_name, communication: e.body,
          })))}><Download className="h-4 w-4" />Export</Button>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No communication log entries yet - logs recorded in the Communication Centre and messages sent to this person appear here.</p>
      ) : (
        grouped.map((group) => (
          <div key={group.type} className="space-y-2">
            <p className="text-sm font-semibold">{group.type} <Badge variant="secondary">{group.entries.length}</Badge></p>
            {group.entries.map((e) => {
              const attachments = parseJson(e.attachments_json);
              return (
                <div key={e.id} className="rounded-xl border border-border/60 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{e.entry_kind}</Badge>
                      <span className="text-sm font-semibold">{e.subject || e.note_type || e.entry_kind}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{[e.entry_date, e.entry_time, e.sender_name].filter(Boolean).join(' · ')}</span>
                      <Button variant="ghost" size="sm" onClick={() => setReplyTarget(e)}><MessageSquare className="h-3.5 w-3.5" />Reply</Button>
                    </div>
                  </div>
                  {e.body && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{e.body}</p>}
                  {(e.staff_involved || []).length > 0 && <p className="mt-1 text-xs text-muted-foreground">Staff: {e.staff_involved.join(', ')}</p>}
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