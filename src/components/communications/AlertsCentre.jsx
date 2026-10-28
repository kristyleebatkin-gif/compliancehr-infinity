import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Bell, MessageCircleWarning, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/lib/useRole';

export default function AlertsCentre({ selfOnly = false } = {}) {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [errors, setErrors] = useState({ notifications: '', flagged: '' });
  const [markingRead, setMarkingRead] = useState(false);
  const loadSequence = useRef(0);

  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    if (!user?.id) {
      setNotifications([]);
      setFlagged([]);
      setErrors({ notifications: 'Sign in to view your notifications.', flagged: 'Sign in to view communications.' });
      setLoading(false);
      return;
    }
    const results = await Promise.allSettled([
      base44.entities.Notification.filter({ read: false, recipient_id: user.id }, { sort: '-created_date', limit: 50 }),
      base44.entities.CommunicationEntry.filter(
        { issues_concerns: { $exists: true, $ne: '' } },
        { sort: '-created_date', limit: 50 },
      ),
    ]);
    if (sequence !== loadSequence.current) return;
    const message = (result) => {
      const status = result.reason?.status ?? result.reason?.response?.status;
      return status === 401 || status === 403 ? 'Access denied. Contact your administrator if access is needed.' : 'Could not load this section. Refresh to retry.';
    };
    const [notificationResult, flaggedResult] = results;
    setNotifications(notificationResult.status === 'fulfilled' ? (notificationResult.value.items || []) : []);
    setFlagged(flaggedResult.status === 'fulfilled' ? (flaggedResult.value.items || []).filter((entry) => !selfOnly
      || (user.email && entry.sender_email === user.email)
      || (user.full_name && entry.sender_name === user.full_name)
      || (user.full_name && (entry.staff_involved || []).includes(user.full_name))) : []);
    setErrors({
      notifications: notificationResult.status === 'rejected' ? message(notificationResult) : '',
      flagged: flaggedResult.status === 'rejected' ? message(flaggedResult) : '',
    });
    setLoading(false);
  }, [selfOnly, user?.id, user?.email, user?.full_name]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => { window.clearInterval(timer); loadSequence.current += 1; };
  }, [load]);

  const markAllRead = async () => {
    if (markingRead || !user?.id) return;
    const unread = notifications.filter((notification) => notification.read !== true && notification.recipient_id === user.id);
    if (!unread.length) return;
    setMarkingRead(true);
    try {
      const results = await Promise.allSettled(unread.map((notification) =>
        base44.entities.Notification.update(notification.id, { read: true })
      ));
      const confirmedIds = new Set(unread.filter((_, index) => results[index].status === 'fulfilled').map((notification) => notification.id));
      setNotifications((current) => current.filter((notification) => !confirmedIds.has(notification.id)));
      setErrors((current) => ({ ...current, notifications: confirmedIds.size < unread.length
        ? 'Some alerts could not be marked read. They remain in this list; refresh before retrying.' : '' }));
    } finally {
      setMarkingRead(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-red-400/70 bg-card shadow-panel">
      <div
        className="comm-panel-bar relative flex flex-wrap items-center justify-between gap-2 px-3 py-1.5"
        style={{ '--comm-bar-bg': 'linear-gradient(120deg, #FF2E9A 0%, #A100FF 52%, #5A00D6 100%)', color: '#fff' }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/40">
            <Siren className="h-3.5 w-3.5 text-white" />
          </span>
          <h3 className="text-xs font-extrabold text-white">Live Alerts &amp; Flagged Communications</h3>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="h-6 border-white/40 bg-white/15 px-2 text-[10px] font-bold text-white hover:bg-white/25">
          <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm font-bold text-foreground/70">
          <Loader2 className="h-5 w-5 animate-spin text-red-600" /> Checking for new alerts…
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 text-sm font-extrabold text-red-700">
                <Bell className="h-4 w-4 text-red-600" />Your Unread Notifications ({notifications.length} loaded)
              </h4>
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingRead} className="min-h-[44px] font-bold">{markingRead ? 'Saving…' : 'Mark displayed alerts read'}</Button>
              )}
            </div>
            {errors.notifications ? (
              <p role="alert" className="rounded-xl border border-[#C084FC] bg-[#F6F0FF] p-3 text-sm text-[#0A2B6D]">{errors.notifications}</p>
            ) : null}
            {!errors.notifications && notifications.length === 0 ? (
              <p className="rounded-xl border-2 border-emerald-400/50 bg-emerald-50 p-3.5 text-sm font-bold text-emerald-800">
                No unread notifications were returned for your account.
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-xl border-2 border-red-200 bg-red-50/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-600 font-bold text-white">{n.type}</Badge>
                        <span className="text-sm font-bold">{n.message}</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{(n.created_date || '').slice(0, 10)}</span>
                    </div>
                    {n.action_url && (
                      <Button asChild variant="link" size="sm" className="h-6 px-0 font-bold">
                        <Link to={n.action_url}>Open</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-extrabold text-orange-700">
              <MessageCircleWarning className="h-4 w-4 text-orange-600" />Flagged Communications ({flagged.length} loaded)
            </h4>
            {errors.flagged ? (
              <p role="alert" className="rounded-xl border border-[#C084FC] bg-[#F6F0FF] p-3 text-sm text-[#0A2B6D]">{errors.flagged}</p>
            ) : flagged.length === 0 ? (
              <p className="rounded-xl border border-border/60 bg-white p-3.5 text-sm font-bold text-foreground/75">
                No diary entries currently flag issues or concerns.
              </p>
            ) : (
              <div className="space-y-2">
                {flagged.map((f) => (
                  <Link key={f.id} to="/communications" className="block rounded-xl border-2 border-orange-300 bg-orange-50/60 p-3 hover:bg-orange-100/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-bold">{f.entry_kind}</Badge>
                        <span className="text-sm font-extrabold">{f.subject || f.note_type || f.entry_kind}</span>
                        {f.person_name && <Badge variant="outline" className="font-bold">{f.person_name}</Badge>}
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{[f.sender_name, f.entry_date].filter(Boolean).join(' · ')}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold text-foreground/80">{f.issues_concerns}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}