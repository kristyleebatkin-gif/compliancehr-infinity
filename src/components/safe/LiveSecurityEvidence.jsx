import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LiveSecurityEvidence() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      base44.entities.StatusLog.count({}),
      base44.entities.AuditLog.count({}),
      base44.entities.User.list(),
    ]).then((results) => {
      if (alive) setStats(results.map((result, index) => result.status === 'fulfilled' ? (index === 2 ? result.value.length : result.value) : null));
    });
    return () => { alive = false; };
  }, []);
  return <Card><CardContent className="p-4">
    <p className="mb-3 text-sm font-semibold">Live evidence</p>
    {stats ? <div className="grid gap-3 sm:grid-cols-3">
      {['Status-trail entries', 'Platform audit-log entries', 'Controlled user accounts'].map((label, index) => <div key={label} className="rounded-xl border border-border/60 p-3">
        <p className="text-2xl font-editorial tabular-nums">{stats[index] === null ? '—' : stats[index].toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>)}
    </div> : <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Collecting evidence...</div>}
  </CardContent></Card>;
}