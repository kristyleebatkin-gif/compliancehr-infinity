import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MODULE_TRACKERS, trackerQuery, loadTrackerCounts } from '@/lib/moduleTrackers';
import { cn } from '@/lib/utils';
import { AlertTriangle, Bell, BellRing, CheckCircle2, Clock3, Loader2 } from 'lucide-react';

// Best-guess display field for a tracker record (entities name their title differently).
const TITLE_FIELDS = [
  'title', 'name', 'entry_title', 'full_name', 'applicant_name', 'business_name',
  'subject', 'supplier_name', 'equipment_name', 'staff_name', 'participant_name',
  'po_number', 'invoice_number', 'quote_number', 'label',
];
const recordTitle = (r) => {
  if (!r) return 'Record';
  for (const f of TITLE_FIELDS) {
    const v = r[f];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return String(r.created_date || '').slice(0, 10) || 'Record';
};

// Openable per-module alert & notification bell. Alert groups come live from the
// module's compliance trackers; notifications are unread alerts linked to this module.
export default function ModuleAlertsButton() {
  const { pathname } = useLocation();
  const seg = `/${pathname.split('/')[1] || ''}`;
  const items = MODULE_TRACKERS[seg];
  const [counts, setCounts] = useState(null);
  const [unread, setUnread] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setGroups(null);
    setCounts(null);
    loadTrackerCounts(seg).then((c) => { if (!cancelled) setCounts(c); });
    base44.entities.Notification.filter({ read: false }, { limit: 50, sort: '-created_date' })
      .then((page) => {
        if (cancelled) return;
        const list = (page.items || []).filter((n) => typeof n.action_url === 'string' && n.action_url.includes(seg));
        setUnread(list);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [seg]);

  const activeCounts = (counts || []).filter((c) => c.value > 0);
  const total = activeCounts.reduce((s, c) => s + c.value, 0) + unread.length;

  const openPanel = async () => {
    setOpen(true);
    if (!items || groups || loading) return;
    setLoading(true);
    const active = items.filter((item) => (counts?.find((c) => c.label === item.label)?.value || 0) > 0);
    const results = await Promise.allSettled(
      active.map((item) => base44.entities[item.entity].filter(trackerQuery(item, item.dynamic), { limit: 5, sort: '-created_date' })),
    );
    setGroups(active.map((item, i) => ({
      label: item.label,
      mode: item.dynamic,
      records: results[i].status === 'fulfilled' ? (results[i].value.items || []).map(recordTitle) : [],
    })));
    setLoading(false);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) openPanel(); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative shrink-0 rounded-lg border-border/60 bg-card/75 text-[13px] font-semibold shadow-sm hover:bg-muted" aria-label={`${seg.slice(1) || 'module'} alerts`}>
          {total > 0 ? <BellRing className="h-4 w-4 text-danger" /> : <Bell className="h-4 w-4" />}
          {total > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white shadow">
              {total > 99 ? '99+' : total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Bell className="h-4 w-4" /> Alerts &amp; Notifications
          </div>
          <div className="mt-0.5 text-xs text-foreground/55">Live from this module's registers and your notifications</div>
        </div>

        <div className="max-h-80 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading alerts…
            </div>
          ) : (!items || activeCounts.length === 0) && unread.length === 0 ? (
            <div className="flex items-start gap-2 py-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-safe" />
              <span className="text-foreground/70">No active alerts for this module — everything is in date.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {groups?.filter((g) => g.records.length > 0).map((g) => (
                <div key={g.label}>
                  <div className={cn('mb-1.5 flex items-center gap-1.5 text-xs font-bold', g.mode === 'soon' ? 'text-warning' : 'text-danger')}>
                    {g.mode === 'soon' ? <Clock3 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {g.label}
                  </div>
                  <ul className="space-y-1">
                    {g.records.map((name, i) => (
                      <li key={i} className="rounded-lg border border-border/50 bg-muted/40 px-2.5 py-1.5 text-xs text-foreground/80">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {unread.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Bell className="h-3.5 w-3.5" /> Notifications ({unread.length})
                  </div>
                  <ul className="space-y-1">
                    {unread.slice(0, 8).map((n) => (
                      <li key={n.id} className="rounded-lg border border-border/50 bg-muted/40 px-2.5 py-1.5 text-xs">
                        <div className="font-semibold text-foreground/80">{n.type}</div>
                        <div className="text-foreground/65">{n.message}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}