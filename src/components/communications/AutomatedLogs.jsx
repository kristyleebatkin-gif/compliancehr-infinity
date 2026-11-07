import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Loader2, Mail, Search, ChevronDown, ChevronUp, Bot } from 'lucide-react';

const AUTOMATED_FILTER = {
  $or: [
    { sender_email: 'system@compliancehr-portal' },
    { sender_name: 'Automated Compliance Reminder' },
    { sender_name: 'System (Compliance Reminders)' },
  ],
};
const PAGE_SIZE = 10;

const sourceBadge = (entry) => {
  if (entry.sender_name === 'System (Compliance Reminders)') {
    return { label: 'Expiry alert', className: 'bg-[#FF2E9A]/25 text-white border-[#FF2E9A]' };
  }
  if (entry.sender_name === 'Automated Compliance Reminder') {
    return { label: 'Task reminder', className: 'bg-[#A855F7]/25 text-white border-[#A855F7]' };
  }
  return { label: 'Auto log', className: 'bg-[#0072FF]/25 text-white border-[#0072FF]' };
};

export default function AutomatedLogs() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ total: null, emails: null, today: null });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = async (term) => {
    setLoading(true);
    const query = term
      ? { ...AUTOMATED_FILTER, $and: [{ subject: { $regex: term, $options: 'i' } }] }
      : { ...AUTOMATED_FILTER };
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
    try {
      const [page, total, emails, todayCount] = await Promise.all([
        base44.entities.CommunicationEntry.filter(query, { sort: '-created_date', limit: PAGE_SIZE }),
        base44.entities.CommunicationEntry.count(AUTOMATED_FILTER),
        base44.entities.CommunicationEntry.count({ ...AUTOMATED_FILTER, email_sent: true }),
        base44.entities.CommunicationEntry.count({ ...AUTOMATED_FILTER, entry_date: today }),
      ]);
      setStats({ total: total ?? 0, emails: emails ?? 0, today: todayCount ?? 0 });
      setEntries(page.items || []);
    } catch {
      setStats({ total: 0, emails: 0, today: 0 });
      setEntries([]);
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
    load(searchTerm.trim());
  };

  return (
    <section
      className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#A855F7]/60 bg-[#081018] p-2.5 text-white shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#A855F7] text-white">
            <History className="h-3 w-3 text-white" />
          </span>
          <h3 className="text-xs font-extrabold text-white">Automated Alert Log</h3>
        </div>
        <div className="flex items-center gap-1">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Sent', value: stats.emails },
            { label: 'Today', value: stats.today },
          ].map((s) => (
            <span key={s.label} className="rounded bg-[#162235] px-1.5 py-0.5 text-[9px] font-bold text-white border border-white/15">
              {s.label}: {s.value ?? '0'}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        <form onSubmit={submitSearch} className="relative">
          <Search className="absolute left-2 top-1.5 h-3 w-3 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts…"
            className="h-6 border-white/20 bg-[#162235] pl-6 pr-12 text-[11px] text-white placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="absolute right-1 top-0.5 rounded bg-[#0072FF] px-1.5 py-0.5 text-[9px] font-bold text-white"
          >
            Go
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center py-2"><Loader2 className="h-3.5 w-3.5 animate-spin text-[#0072FF]" /></div>
        ) : entries.length === 0 ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#162235] px-2.5 py-1.5 text-[11px] text-slate-300">
            <Bot className="h-3.5 w-3.5 shrink-0 text-[#A855F7]" />
            <span>No automated alerts recorded for this filter.</span>
          </div>
        ) : (
          <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
            {entries.map((entry) => {
              const badge = sourceBadge(entry);
              const open = expanded === entry.id;
              return (
                <div key={entry.id} className="rounded-lg border border-white/15 bg-[#162235] px-2 py-1 text-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-1.5 text-left"
                    onClick={() => setExpanded(open ? null : entry.id)}
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Badge className={`text-[9px] px-1.5 py-0 ${badge.className}`}>{badge.label}</Badge>
                      <span className="truncate text-[11px] font-bold text-white">{entry.subject || 'System Alert'}</span>
                    </div>
                    {open ? <ChevronUp className="h-3 w-3 shrink-0 text-white" /> : <ChevronDown className="h-3 w-3 shrink-0 text-white" />}
                  </button>
                  {open && (
                    <p className="mt-1 border-t border-white/10 pt-1 text-[10px] text-slate-300 line-clamp-2">
                      {entry.body || '(no message body)'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function AutomatedAlertSystem() {
  return <AutomatedLogs />;
}