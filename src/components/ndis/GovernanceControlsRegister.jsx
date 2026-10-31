import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Scale } from 'lucide-react';
import { statusTone } from '@/lib/statusStyles';
import { fetchAllRecords } from '@/lib/csvExport';

const TEST_TONE = {
  'Effective': 'bg-emerald-500/10 text-emerald-600',
  'Partially Effective': 'bg-amber-500/10 text-amber-600',
  'Ineffective': 'bg-rose-500/10 text-rose-600',
};

// Governance controls register: NDIS Practice Standard controls, owners and test results.
export default function GovernanceControlsRegister() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let live = true;
    fetchAllRecords(base44.entities.GovernanceControlRecord, {}, '-created_date')
      .then((rows) => { if (live) setItems(rows); })
      .catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, []);

  if (!items) {
    return (
      <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />Loading governance controls...
      </CardContent></Card>
    );
  }

  const current = items.filter((i) => i.status === 'Current' || i.status === 'Completed').length;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/10 p-2"><Scale className="h-4 w-4 text-violet-600" /></div>
            <div>
              <p className="text-sm font-bold">Governance Controls Register</p>
              <p className="text-xs text-muted-foreground">NDIS Practice Standard controls, evidence and test results</p>
            </div>
          </div>
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-700">{current} of {items.length} current</span>
        </div>

        <div className="mt-4 space-y-2">
          {items.map((i) => (
            <div key={i.id} className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{i.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {i.framework}{i.clause ? ` · ${i.clause}` : ''} · Owner: {i.owner || 'Unassigned'}
                  {i.review_date ? ` · Review: ${i.review_date}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {i.test_result && i.test_result !== 'Not Tested' && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TEST_TONE[i.test_result] || 'bg-muted text-foreground/60'}`}>{i.test_result}</span>
                )}
                <Badge variant="outline" className={`text-[10px] ${statusTone(i.status)}`}>{i.status}</Badge>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">{i.control_type}</Badge>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No governance controls recorded yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}