import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

const THRESHOLD = 80;

// Flags staff members whose compliance progress (onboarding pack completion)
// is below 80%. Computed live by the staffComplianceFlags backend function —
// the same metric the daily automated flag scan alerts on.
export default function StaffComplianceFlags() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await base44.functions.invoke('staffComplianceFlags', {});
        if (!cancelled) setData(response.data);
      } catch {
        if (!cancelled) setError(true);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (error) return null;

  if (!data) {
    return <Card className="shadow-panel"><CardContent className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Checking compliance flags…
    </CardContent></Card>;
  }

  const flagged = data.flagged || [];

  return (
    <Card className={`shadow-panel ${flagged.length ? 'border-red-200' : 'border-emerald-200'}`}>
      <CardContent className="p-5">
        <h2 className={`flex items-center gap-2 font-display text-lg font-bold ${flagged.length ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {flagged.length ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          Compliance flags — below {THRESHOLD}%
        </h2>
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Staff whose onboarding and intake compliance progress is below {THRESHOLD}%. The daily automated scan also notifies admins when someone drops below this line.
        </p>
        {flagged.length === 0 ? (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">All staff are at or above {THRESHOLD}% compliance progress.</p>
        ) : (
          <ul className="space-y-2">
            {flagged.map((r) => (
              <li key={r.name} className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-800 dark:bg-red-950/30">
                <span className="font-semibold">{r.name}</span>
                <span className="font-bold tabular-nums text-red-700 dark:text-red-300">{r.pct}%</span>
                <span className="text-xs text-foreground/70">{r.done}/{r.total} steps{r.overdue ? `, ${r.overdue} overdue` : ''}</span>
                <span className="ml-auto rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-900/60 dark:text-red-200">Flagged</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}