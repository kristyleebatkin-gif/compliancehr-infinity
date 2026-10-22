import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw,Bell, MessageCircleWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/lib/useRole';

export default function AlertsCentre({ selfOnly = false } = {}) {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [flagged, setFlagged] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Notification.filter({ read: false }, { sort: '-created_date', limit: 50 });
      setNotifications(page.items || []);
    } catch { setNotifications([]); }

    try {
      const page = await base44.entities.CommunicationEntry.filter(
        { issues_concerns: { $exists: true, $ne: '' } },
        { sort: '-created_date', limit: 50 },
      );
      setFlagged((page.items || []).filter((f) => !selfOnly
        || f.sender_email === (user?.email || '')
        || f.sender_name === (user?.full_name || '')
        || (f.staff_involved || []).includes(user?.full_name || '')));
    } catch { setFlagged([]); }

    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => n.read !== true);
    if (!unread.length) return;
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    try {
      await base44.entities.Notification.bulkUpdate(unread.map((n) => ({ id: n.id, read: true })));
    } catch { load(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-foreground/65">
          {selfOnly ? 'Your unread notifications and any flagged communication that involves you.' : 'New unread notifications and flagged communications across the platform.'}
        </p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-foreground/50">
          <Loader2 className="h-5 w-5 animate-spin" /> Checking for new alerts…
        </div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold"><Bell className="h-4 w-4 text-brand" />New Alerts &amp; Notifications ({notifications.length})</h3>
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="rounded-xl border border-safe/30 bg-safe/5 p-4 text-sm text-safe">All clear — no new alerts or unread notifications.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-xl border border-border/60 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{n.type}</Badge>
                        <span className="text-sm">{n.message}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{(n.created_date || '').slice(0, 10)}</span>
                    </div>
                    {n.action_url && (
                      <Button asChild variant="link" size="sm" className="h-6 px-0">
                        <Link to={n.action_url}>Open</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-bold"><MessageCircleWarning className="h-4 w-4 text-destructive" />Flagged Communications ({flagged.length})</h3>
            {flagged.length === 0 ? (
              <p className="rounded-xl border border-border/60 bg-white/60 p-4 text-sm text-foreground/60">No diary entries currently flag issues or concerns.</p>
            ) : (
              <div className="space-y-2">
                {flagged.map((f) => (
                  <Link key={f.id} to="/communications" className="block rounded-xl border border-destructive/30 bg-destructive/5 p-3 hover:bg-destructive/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{f.entry_kind}</Badge>
                        <span className="text-sm font-semibold">{f.subject || f.note_type || f.entry_kind}</span>
                        {f.person_name && <Badge variant="outline">{f.person_name}</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{[f.sender_name, f.entry_date].filter(Boolean).join(' · ')}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-foreground/70">{f.issues_concerns}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}