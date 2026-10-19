import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { History, Loader2, RefreshCw } from 'lucide-react';

const CATEGORY_TONE = {
  compliance: 'bg-safe/10 text-safe',
  documents: 'bg-teal/10 text-teal',
  other: 'bg-muted text-muted-foreground',
};

const categoryOf = (entry) => {
  const text = `${entry.action || ''} ${entry.entity_type || ''}`;
  if (/complet|marked|status changed|checklist|task|sign|certificate|training|consent|flagged/i.test(text)) return 'compliance';
  if (/document|badge|upload/i.test(text)) return 'documents';
  return 'other';
};

// Detailed activity log for one staff profile: every recorded document update
// and compliance completion for this person, latest first, with category filters.
export default function StaffActivityLog({ staff }) {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setError('');
    setEntries(null);
    try {
      const res = await base44.functions.invoke('staffActivityLog', {
        profile_id: staff.id,
        profile_name: staff.full_name,
        profile_email: staff.email,
      });
      setEntries(res.data?.items || []);
    } catch (e) {
      setError(e.message || 'Could not load activity log');
    }
  }, [staff.id, staff.full_name, staff.email]);

  useEffect(() => { load(); }, [load]);

  if (entries === null) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  const counts = entries.reduce(
    (acc, entry) => { acc[categoryOf(entry)] += 1; return acc; },
    { compliance: 0, documents: 0, other: 0 },
  );
  const visible = filter === 'all' ? entries : entries.filter((e) => categoryOf(e) === filter);
  const filters = [
    { key: 'all', label: `All (${entries.length})` },
    { key: 'compliance', label: `Compliance (${counts.compliance})` },
    { key: 'documents', label: `Documents (${counts.documents})` },
    { key: 'other', label: `Other (${counts.other})` },
  ];

  return (
    <Card className="border-border/60 shadow-panel">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4 text-brand" />Activity log
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-3.5 w-3.5" />Refresh</Button>
        </div>
        <p className="text-xs text-foreground/50">Every recorded update to {staff.full_name}'s documents and compliance items, who did it and when, latest first.</p>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {entries.length === 0 ? 'No activity recorded for this profile yet.' : 'No activity in this category.'}
          </p>
        ) : (
          <div className="space-y-2">
            {visible.map((entry) => {
              const category = categoryOf(entry);
              const when = entry.timestamp ? format(new Date(entry.timestamp), 'd MMM yyyy, h:mm a') : '';
              return (
                <div key={entry.id} className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={CATEGORY_TONE[category]}>{category === 'compliance' ? 'Compliance' : category === 'documents' ? 'Documents' : 'Other'}</Badge>
                    <span className="text-sm font-semibold">{entry.action}</span>
                    {entry.record_title ? <span className="text-sm text-foreground/70">· {entry.record_title}</span> : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/50">
                    <span>{when}</span>
                    <span>by {entry.performed_by || 'Unknown'}{entry.performed_by_role ? ` (${entry.performed_by_role})` : ''}</span>
                    {entry.route ? <span className="truncate">on {entry.route}</span> : null}
                  </div>
                  {entry.details ? <p className="mt-1 text-xs text-foreground/70">{entry.details}</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}