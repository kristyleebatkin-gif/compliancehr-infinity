import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Bell, PartyPopper, Check, CheckCheck, ExternalLink, Inbox } from 'lucide-react';
import moment from 'moment';

const TYPE_TONES = {
  'Expiry Alert': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  'Training Expiry': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  'Incident Escalation': 'bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  'Overdue Escalation': 'bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  'Review Reminder': 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
  'Policy Review': 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
  'Task Assigned': 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  'Weekly Compliance Summary': 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
  'NDIS Audit Due': 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
  'Birthday Shout-out': 'bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30',
  'General': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const NOTIF_TYPES = [
  'General', 'Expiry Alert', 'Training Expiry', 'Review Reminder', 'Policy Review',
  'Incident Escalation', 'Overdue Escalation', 'Task Assigned',
  'Weekly Compliance Summary', 'NDIS Audit Due', 'Birthday Shout-out',
];

const PAGE_SIZE = 25;

export default function Notifications() {
  const { user } = useRole();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState('all'); // all | unread
  const [typeFilter, setTypeFilter] = useState('all');

  const buildQuery = useCallback(() => {
    const query = { recipient_id: user.id };
    if (readFilter === 'unread') query.read = false;
    if (typeFilter !== 'all') query.type = typeFilter;
    return query;
  }, [user.id, readFilter, typeFilter]);

  const load = useCallback(async (nextCursor = null) => {
    setLoading(true);
    try {
      const page = await base44.entities.Notification.filter(buildQuery(), { sort: '-created_date', limit: PAGE_SIZE, cursor: nextCursor });
      setItems(nextCursor ? [...items, ...page.items] : page.items);
      setCursor(page.next_cursor);
      setHasMore(page.has_more);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildQuery]);

  // Reload when filters change
  useEffect(() => { load(null); }, [readFilter, typeFilter, user?.id]);

  // Live updates
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data?.recipient_id === user.id) {
        setItems((prev) => {
          if (prev.some((n) => n.id === event.data.id)) return prev;
          const matches = (readFilter === 'all' || !event.data.read) && (typeFilter === 'all' || event.data.type === typeFilter);
          return matches ? [event.data, ...prev] : prev;
        });
      } else {
        load(cursor, true);
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, readFilter, typeFilter]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = async (notification) => {
    if (notification.read) return;
    setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    try {
      await base44.entities.Notification.update(notification.id, { read: true });
    } catch (error) {
      console.error(error);
      load(null);
    }
  };

  const markAllRead = async () => {
    const unreadItems = items.filter((n) => !n.read);
    if (unreadItems.length) {
      try {
        await base44.entities.Notification.updateMany(
          { id: { $in: unreadItems.map((n) => n.id) } },
          { $set: { read: true } }
        );
      } catch (error) {
        console.error(error);
      }
      setItems(items.map((n) => ({ ...n, read: true })));
    }
    toast({ title: 'All notifications marked as read' });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notification Centre"
        subtitle="Every alert, reminder and escalation across the platform, in one live feed."
        icon={Bell}
        showCompliance={false}
        showAudit={false}
        action={
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0 && !hasMore} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      {/* Summary + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setReadFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${readFilter === 'all' ? 'gradient-brand text-white shadow-sm' : 'border border-border bg-card text-foreground/60 hover:bg-brand/5'}`}
        >
          All
        </button>
        <button
          onClick={() => setReadFilter('unread')}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${readFilter === 'unread' ? 'gradient-brand text-white shadow-sm' : 'border border-border bg-card text-foreground/60 hover:bg-brand/5'}`}
        >
          Unread
        </button>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground/70 outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All types</option>
          {NOTIF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading && items.length === 0 && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-card py-14 text-center shadow-sm">
            <Inbox className="h-10 w-10 text-brand/40" />
            <div className="mt-3 font-semibold text-foreground">No notifications here</div>
            <div className="mt-1 text-sm text-foreground/50">You're all caught up. New alerts will appear here live.</div>
          </div>
        )}

        {items.map((n) => {
          if (n.type === 'Birthday Shout-out') {
            return (
              <div key={n.id} className={`rounded-2xl border border-pink-200 p-4 shadow-sm transition-opacity dark:border-pink-500/30 ${n.read ? 'bg-pink-50/40 dark:bg-pink-500/5' : 'bg-pink-50 dark:bg-pink-500/10'}`}>
                <div className="flex items-start gap-3">
                  {n.branding_logo_url ? (
                    <img src={n.branding_logo_url} alt="" className="h-10 w-10 rounded-xl bg-white object-contain p-1 shadow-sm" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
                      <PartyPopper className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-pink-900 dark:text-pink-300">{n.branding_company_name || 'Birthday Shout-out'}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-pink-500" />}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-pink-800 dark:text-pink-300/80">{n.message}</div>
                    {n.branding_slogan && <div className="mt-1 text-xs font-medium text-pink-700/70 dark:text-pink-300/60">{n.branding_slogan}</div>}
                    <div className="mt-2 text-[11px] font-medium text-pink-600/60 dark:text-pink-300/50">{moment(n.created_date).format('D MMM YYYY, h:mm a')}</div>
                  </div>
                </div>
              </div>
            );
          }
          const tone = TYPE_TONES[n.type] || TYPE_TONES['General'];
          return (
            <div
              key={n.id}
              onClick={() => markRead(n)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 shadow-sm transition-all hover:shadow-md ${n.read ? 'border-border/60 bg-card' : 'border-brand/25 bg-brand/5'}`}
            >
              <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? 'bg-border' : 'bg-brand'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${tone}`}>{n.type}</span>
                  {!n.read && <span className="text-[11px] font-bold text-brand">New</span>}
                  <span className="text-[11px] font-medium text-foreground/40">{moment(n.created_date).format('D MMM YYYY, h:mm a')}</span>
                </div>
                <div className={`mt-1.5 text-sm leading-6 ${n.read ? 'text-foreground/60' : 'font-medium text-foreground'}`}>{n.message}</div>
                {n.action_url && (
                  <a
                    href={n.action_url}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand/90"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {!n.read && (
                <button
                  onClick={(e) => { e.stopPropagation(); markRead(n); }}
                  title="Mark as read"
                  className="mt-0.5 rounded-lg p-1.5 text-foreground/30 transition-colors hover:bg-brand/10 hover:text-brand"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}

        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" size="sm" onClick={() => load(cursor)} disabled={loading}>
              {loading ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}