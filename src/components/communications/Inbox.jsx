import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Paperclip, Reply } from 'lucide-react';
import { openAttachment } from '@/lib/commTypes';
import ReplyDialog from './ReplyDialog';
import { fetchAllRecords } from '@/lib/csvExport';

const parseJson = (value, fallback = []) => { try { return JSON.parse(value || '') || fallback; } catch { return fallback; } };

export default function Inbox() {
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [box, setBox] = useState('received');
  const [replyTarget, setReplyTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const user = await base44.auth.me();
      setMe(user);
      const rows = await fetchAllRecords(base44.entities.CommunicationEntry, {}, '-created_date');
      setItems(rows);
    } catch {
      setItems([]);
      setLoadError('Unable to load inbox messages. Refresh to try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const { received, sent } = useMemo(() => {
    const myEmail = String(me?.email || '').toLowerCase();
    const myName = String(me?.full_name || '').toLowerCase();
    const matchesMe = (entry) => {
      const recipients = parseJson(entry.recipients_json);
      return recipients.some((r) => String(r.email || '').toLowerCase() === myEmail
        || (myName && String(r.name || '').toLowerCase() === myName));
    };
    const receivedList = items.filter((e) => e.sender_email && String(e.sender_email).toLowerCase() !== myEmail && matchesMe(e));
    const sentList = items.filter((e) => String(e.sender_email || '').toLowerCase() === myEmail);
    return { received: receivedList, sent: sentList };
  }, [items, me]);

  const list = box === 'received' ? received : sent;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={box === 'received' ? 'default' : 'outline'} onClick={() => setBox('received')}>Received ({loading ? '…' : loadError ? '—' : received.length})</Button>
        <Button size="sm" variant={box === 'sent' ? 'default' : 'outline'} onClick={() => setBox('sent')}>Sent ({loading ? '…' : loadError ? '—' : sent.length})</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : loadError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{loadError} <Button type="button" variant="outline" size="sm" className="ml-2" onClick={load}>Retry</Button></div>
      ) : list.length === 0 ? (
        <p className="rounded-xl border border-white/15 bg-[#0A2B6D] py-6 px-4 text-center text-xs sm:text-sm font-bold text-slate-200">
          {box === 'received' ? 'No messages addressed to you yet — bulk messages, emails, replies and shift note copies sent to you will appear here.' : 'Nothing sent yet.'}
        </p>
      ) : (
        <div className="space-y-2.5">
          {list.map((entry) => {
            const attachments = parseJson(entry.attachments_json);
            const recipients = parseJson(entry.recipients_json);
            return (
              <div key={entry.id} className="rounded-xl border border-white/15 bg-[#0A2B6D] p-3.5 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className="bg-[#0072FF] text-white border-none">{entry.entry_kind}</Badge>
                    <span className="text-sm font-bold text-white">{entry.subject || entry.note_type || entry.entry_kind}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">{[entry.sender_name, entry.entry_date].filter(Boolean).join(' · ')}</span>
                    <Button variant="outline" size="sm" className="h-7 border-[#00C6FF]/50 bg-[#0A2B6D] text-white hover:bg-[#0072FF]" onClick={() => setReplyTarget(entry)}><Reply className="h-3.5 w-3.5" />Reply</Button>
                  </div>
                </div>
                {recipients.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-slate-300">
                    {box === 'received' ? 'From' : 'To'}: {recipients.slice(0, 6).map((r) => r.name || r.email).join(', ')}{recipients.length > 6 ? ` +${recipients.length - 6} more` : ''}
                  </p>
                )}
                {entry.body && <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-100">{entry.body}</p>}
                {attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attachments.map((a, i) => (
                      <Button key={i} variant="outline" size="sm" className="border-white/25 bg-[#0A2B6D] text-white" onClick={() => openAttachment(a)}><Paperclip className="h-3 w-3" />{a.name}</Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {replyTarget && (
        <ReplyDialog entry={replyTarget} open={Boolean(replyTarget)} onOpenChange={(o) => !o && setReplyTarget(null)} onSaved={load} />
      )}
    </div>
  );
}