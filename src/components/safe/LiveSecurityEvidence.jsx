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
  return <Card><CardContent className="p-2">
    <p className="mb-1.5 text-xs font-semibold">Live evidence</p>
    {stats ? <div className="grid grid-cols-3 gap-1.5">
      {['Status-trail entries', 'Platform audit-log entries', 'Controlled user accounts'].map((label, index) => <div key={label} className="min-w-0 rounded-lg border border-border/60 px-2 py-1">
        <p className="text-lg leading-6 font-editorial tabular-nums">{stats[index] === null ? '—' : stats[index].toLocaleString()}</p>
        <p className="text-[10px] leading-3.5 text-muted-foreground">{label}</p>
      </div>)}
    </div> : <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Collecting evidence...</div>}
  </CardContent></Card>;
}