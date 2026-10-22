import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmptyState from '@/components/EmptyState';
import { History, Loader2, Mail, Search, ChevronDown, ChevronUp, Bot } from 'lucide-react';

const AUTOMATED_FILTER = {
  $or: [
    { sender_email: 'system@compliancehr-portal' },
    { sender_name: 'Automated Compliance Reminder' },
    { sender_name: 'System (Compliance Reminders)' },
  ],
};
const PAGE_SIZE = 50;

const sourceBadge = (entry) => {
  if (entry.sender_name === 'System (Compliance Reminders)') return { label: 'Document expiry alert', className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' };
  return { label: 'Task reminder', className: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300' };
};

const parseRecipients = (entry) => {
  try {
    const parsed = JSON.parse(entry.recipients_json || '[]');
    return (Array.isArray(parsed) ? parsed : []).map((r) => r?.name || r?.email || '').filter(Boolean);
  } catch {
    return [];
  }
};

export default function AutomatedLogs() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ total: null, emails: null, today: null });
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = async (term, cursorArg) => {
    setLoading(true);
    const query = term
      ? { ...AUTOMATED_FILTER, $and: [{ subject: { $regex: term, $options: 'i' } }] }
      : { ...AUTOMATED_FILTER };
    const options = { sort: '-created_date', limit: PAGE_SIZE, ...(cursorArg ? { cursor: cursorArg } : {}) };
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
    const [page, total, emails, todayCount] = await Promise.all([
      base44.entities.CommunicationEntry.filter(query, options),
      cursorArg ? Promise.resolve(null) : base44.entities.CommunicationEntry.count(AUTOMATED_FILTER),
      cursorArg ? Promise.resolve(null) : base44.entities.CommunicationEntry.count({ ...AUTOMATED_FILTER, email_sent: true }),
      cursorArg ? Promise.resolve(null) : base44.entities.CommunicationEntry.count({ ...AUTOMATED_FILTER, entry_date: today }),
    ]);
    if (!cursorArg) {
      setStats({ total: total ?? 0, emails: emails ?? 0, today: todayCount ?? 0 });
      setEntries(page.items || []);
    } else {
      setEntries((prev) => [...prev, ...(page.items || [])]);
    }
    setCursor(page.next_cursor || null);
    setHasMore(Boolean(page.has_more));
    setLoading(false);
  };

  useEffect(() => {
    load('');
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    setExpanded(null);
    load(searchTerm.trim(), null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-900 bg-[#1e3a8a] p-4 text-white shadow-lg">
        <div className="mb-1 flex items-center gap-2 text-sm font-bold text-white"><History className="h-4 w-4 text-white" />Automated alert log</div>
        <p className="text-xs text-white/75">A complete history of every automated compliance reminder and email alert the system sends to staff, including task expiry reminders and document expiry alerts.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total alerts', value: stats.total, tone: 'text-violet-700 dark:text-violet-300' },
          { label: 'Email alerts', value: stats.emails, tone: 'text-blue-700 dark:text-blue-300' },
          { label: 'Sent today', value: stats.today, tone: 'text-emerald-700 dark:text-emerald-300' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card p-3 text-center">
            <p className={`text-xl font-bold ${s.tone}`}>{s.value ?? '…'}</p>
            <p className="text-[11px] font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submitSearch} className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search alert subjects" className="pl-8 pr-16" />
        <Button type="submit" size="sm" variant="secondary" className="absolute right-1 top-1 h-7">Search</Button>
      </form>

      {loading && entries.length === 0 ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No automated alerts recorded yet"
          subtitle="Alerts appear here automatically when the daily compliance reminder workflows run and send emails to staff."
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const badge = sourceBadge(entry);
            const recipients = parseRecipients(entry);
            const open = expanded === entry.id;
            return (
              <div key={entry.id} className="rounded-xl border border-border/60 bg-card p-3">
                <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setExpanded(open ? null : entry.id)}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`border-transparent ${badge.className}`}>{badge.label}</Badge>
                      {entry.email_sent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"><Mail className="h-3 w-3" />Email sent</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"><Mail className="h-3 w-3" />In-app only</span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold">{entry.subject || '(no subject)'}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.entry_date || ''}{entry.entry_time ? ` · ${entry.entry_time}` : ''}{recipients.length ? ` · To: ${recipients.join(', ')}` : ''}
                    </p>
                  </div>
                  {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>
                {open && (
                  <div className="mt-2 border-t border-border/60 pt-2">
                    <p className="whitespace-pre-wrap text-xs text-muted-foreground">{entry.body || '(no message body)'}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">Sent by: {entry.sender_name || 'System'}{entry.attention ? ` · Attention: ${entry.attention}` : ''}{entry.module ? ` · Module: ${entry.module}` : ''}</p>
                  </div>
                )}
              </div>
            );
          })}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => load(searchTerm.trim(), cursor)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}