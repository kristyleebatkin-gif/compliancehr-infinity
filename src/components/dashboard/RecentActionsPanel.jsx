import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';

// Latest non-page-view actions by staff and participants, straight from the
// audit trail so admins see what people did without opening each module.
export default function RecentActionsPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AuditLog
      .filter({ entity_type: { $nin: ['App Page', 'User Session'] } }, { sort: '-timestamp', limit: 8 })
      .then((page) => setRows(page.items || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg shadow-sm">
            <History className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-bold font-editorial">Staff &amp; participant actions</span>
          <span className="text-xs text-muted-foreground">Latest actions logged from across the app.</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No actions logged yet. Profile edits, document uploads, task updates and name tags are captured here automatically.</p>
        ) : (
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg bg-muted/30 px-3 py-2 text-sm">
                <span className="font-medium">{r.performed_by || 'Unknown'}</span>
                {r.performed_by_role && <span className="text-xs text-muted-foreground">({r.performed_by_role})</span>}
                <span className="font-semibold text-brand">{r.action}</span>
                <span className="text-xs text-muted-foreground">{r.entity_type}</span>
                {r.record_title && <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{r.record_title}</span>}
                <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">{r.timestamp ? format(new Date(r.timestamp), 'd MMM, h:mm a') : ''}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}