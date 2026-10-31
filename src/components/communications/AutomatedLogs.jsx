import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsList } from '@/components/ui/tabs';
import AlertLamp from '@/components/communications/AlertLamp';
import AlertsCentre from '@/components/communications/AlertsCentre';
import { History, Loader2, Mail, Search, ChevronDown, ChevronUp, Bot, Siren } from 'lucide-react';

const AUTOMATED_FILTER = {
  $or: [
    { sender_email: 'system@compliancehr-portal' },
    { sender_name: 'Automated Compliance Reminder' },
    { sender_name: 'System (Compliance Reminders)' },
  ],
};
const PAGE_SIZE = 20;

const sourceBadge = (entry) => {
  if (entry.sender_name === 'System (Compliance Reminders)') {
    return { label: 'Document expiry alert', className: 'bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-200' };
  }
  if (entry.sender_name === 'Automated Compliance Reminder') {
    return { label: 'Task reminder', className: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200' };
  }
  return { label: 'Automated message', className: 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200' };
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
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = async (term, cursorArg) => {
    setLoading(true);
    setLoadError('');
    const query = term
      ? { ...AUTOMATED_FILTER, $and: [{ subject: { $regex: term, $options: 'i' } }] }
      : { ...AUTOMATED_FILTER };
    const options = { sort: '-created_date', limit: PAGE_SIZE, ...(cursorArg ? { cursor: cursorArg } : {}) };
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
    try {
      const [page, total, emails, todayCount] = await Promise.all([
        base44.entities.CommunicationEntry.filter(query, options),
        cursorArg ? Promise.resolve(null) : base44.entities.CommunicationEntry.count(AUTOMATED_FILTER),
        cursorArg ? Promise.resolve(null) : base44.entities.CommunicationEntry.count({ ...AUTOMATED_FILTER, email_sent: true }),
        cursorArg ? Promise.resolve(null) : base44.entities.CommunicationEntry.count({ ...AUTOMATED_FILTER, entry_date: today }),
      ]);
      if (!cursorArg) {
        setStats({ total: total ?? null, emails: emails ?? null, today: todayCount ?? null });
        setEntries(page.items || []);
      } else {
        setEntries((prev) => [...prev, ...(page.items || [])]);
      }
      setCursor(page.next_cursor || null);
      setHasMore(Boolean(page.has_more));
    } catch {
      if (!cursorArg) {
        setStats({ total: null, emails: null, today: null });
        setEntries([]);
      }
      setLoadError('Unable to load automated communication records. Refresh or search again to retry.');
    } finally {
      setLoading(false);
    }
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
    <section
      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel"
      style={{ borderTop: '4px solid #7c3aed' }}
    >
      <div
        className="comm-panel-bar relative flex flex-wrap items-center justify-between gap-2 px-2.5 py-1"
        style={{ background: 'var(--header-gradient)', color: '#fff' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/30">
            <History className="h-3 w-3 text-white" />
          </span>
          <h3 className="text-[11px] font-extrabold text-white">Automated Alert Log</h3>
        </div>
        <div className="flex items-center gap-1">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Emailed', value: stats.emails },
            { label: 'Today', value: stats.today },
          ].map((s) => (
            <span key={s.label} className="rounded bg-white/15 px-1.5 py-0 text-[9px] font-bold text-white ring-1 ring-white/25">
              {s.label}: {s.value ?? '…'}
            </span>
          ))}
        </div>
      </div>

      <div
        className="space-y-2 p-2.5"
        style={{ background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, rgba(236, 72, 153, 0.04) 50%, transparent 100%)' }}
      >
        <form onSubmit={submitSearch} className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alert subjects…"
            className="h-7 pl-7 pr-14 text-xs"
          />
          <Button type="submit" size="sm" variant="secondary" className="absolute right-1 top-0.5 h-6 px-2 text-[10px]">
            Search
          </Button>
        </form>

        {loading && entries.length === 0 ? (
          <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
        ) : loadError ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{loadError}</div>
        ) : entries.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-violet-200/60 bg-white/80 px-3 py-2 text-xs text-muted-foreground">
            <Bot className="h-4 w-4 shrink-0 text-primary" />
            <span>No automated alert records were returned for this filter.</span>
          </div>
        ) : (
          <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
            {entries.map((entry) => {
              const badge = sourceBadge(entry);
              const recipients = parseRecipients(entry);
              const open = expanded === entry.id;
              return (
                <div key={entry.id} className="rounded-xl border border-violet-200/60 bg-white/90 px-2.5 py-1.5">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-2 text-left"
                    onClick={() => setExpanded(open ? null : entry.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className={`border-transparent text-[10px] ${badge.className}`}>{badge.label}</Badge>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                          <Mail className="h-2.5 w-2.5" />
                          {entry.email_sent === true ? 'Email marked sent' : entry.email_sent === false ? 'Email not marked sent' : 'Email status unavailable'}
                        </span>
                        <span className="truncate text-xs font-bold text-foreground">{entry.subject || '(no subject)'}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.entry_date || ''}{entry.entry_time ? ` · ${entry.entry_time}` : ''}{recipients.length ? ` · To: ${recipients.join(', ')}` : ''}
                      </p>
                    </div>
                    {open ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-primary" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>
                  {open && (
                    <div className="mt-1.5 border-t border-border/60 pt-1.5">
                      <p className="whitespace-pre-wrap text-[11px] text-muted-foreground">{entry.body || '(no message body)'}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Sent by: {entry.sender_name || 'System'}{entry.attention ? ` · Attention: ${entry.attention}` : ''}{entry.module ? ` · Module: ${entry.module}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {hasMore && (
              <div className="flex justify-center pt-1">
                <Button variant="outline" size="sm" className="h-6 px-2 text-[10px]" onClick={() => load(searchTerm.trim(), cursor)} disabled={loading}>
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Compact bottom-of-page Automated Alert System styled in the app's blue-purple-pink brand colours.
export function AutomatedAlertSystem() {
  return <AutomatedLogs />;
}