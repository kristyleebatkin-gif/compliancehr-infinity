import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Loader2, Activity } from 'lucide-react';

const ENTITY_TYPES = ['Employee Document', 'Participant Document', 'HR Template', 'Compliance Task'];

const TONE_BY_TYPE = {
  'Employee Document': 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300',
  'Participant Document': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  'HR Template': 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
  'Compliance Task': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300',
};

// Activity feed for the compliance dashboard: recent document changes, HR
// template edits and bulk task updates, drawn from the central audit trail.
export default function ComplianceActivityFeed() {
  const [entries, setEntries] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    base44.entities.AuditLog.filter(
      { entity_type: { $in: ENTITY_TYPES } },
      { sort: '-created_date', limit: 60 },
    )
      .then((page) => { if (!cancelled) setEntries(page.items || []); })
      .catch(() => { if (!cancelled) setEntries([]); });
    return () => { cancelled = true; };
  }, []);

  if (entries === null) {
    return <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
      <Loader2 className="h-4 w-4 animate-spin" />Loading activity...
    </CardContent></Card>;
  }

  const shown = typeFilter === 'All' ? entries : entries.filter((e) => e.entity_type === typeFilter);

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <div className="mb-1 flex items-center gap-2 font-display text-base font-bold"><Activity className="h-4 w-4 text-brand" />Recent activity</div>
        <p className="mb-4 text-xs font-medium text-muted-foreground">Every recent document change, template edit and bulk task update, straight from the audit trail.</p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {['All', ...ENTITY_TYPES].map((t) => (
            <button key={t} type="button" onClick={() => setTypeFilter(t)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${typeFilter === t ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-card text-foreground/60 hover:bg-accent/50'}`}>
              {t}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-foreground/60">No activity recorded yet for this view.</p>
        ) : (
          <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {shown.map((e) => (
              <div key={e.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <Badge className={`shrink-0 border-transparent text-[11px] ${TONE_BY_TYPE[e.entity_type] || statusTone(e.entity_type) || ''}`}>{e.entity_type}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{e.action}{e.record_title ? `: ${e.record_title}` : ''}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                    <span>{e.performed_by || 'Unknown'}</span>
                    {e.performed_by_role && <span>({e.performed_by_role})</span>}
                    {e.created_date && <span className="tabular-nums">{format(new Date(e.created_date), 'd MMM yyyy, h:mm a')}</span>}
                  </div>
                  {e.details && <p className="mt-0.5 text-xs text-muted-foreground">{e.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}