import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Building2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';

// Dashboard summary: compliance completion rate per department (staff role group),
// lowest first, so the areas needing attention stand out at a glance.
export default function DepartmentComplianceSummary() {
  const [departments, setDepartments] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    base44.functions.invoke('departmentCompliance', {})
      .then((res) => { if (alive) setDepartments(res?.departments || []); })
      .catch((e) => console.error(e))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const needsAttention = (departments || []).filter((d) => d.rate < 80).length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4 shadow-lg shadow-violet-500/5 dark:border-violet-900 dark:from-violet-950/25 dark:via-card dark:to-sky-950/20">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md">
              <Building2 className="h-4 w-4" />
            </span>
            Compliance completion by department
          </div>
          <div className="text-xs text-foreground/50">Current documents, certificates and training per staff group, lowest first</div>
        </div>
        {!loading && needsAttention > 0 && (
          <span className="hidden shrink-0 items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 sm:inline-flex">
            <AlertTriangle className="h-3 w-3" /> {needsAttention} needing attention
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-foreground/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : !departments || departments.length === 0 ? (
        <div className="py-8 text-center text-sm text-foreground/50">No active staff records yet, so there is nothing to break down by department.</div>
      ) : (
        <div className="space-y-2.5">
          {departments.map((d) => {
            const tone = d.rate >= 80
              ? { bar: 'bg-gradient-to-r from-emerald-500 to-teal-500', chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' }
              : d.rate >= 60
                ? { bar: 'bg-gradient-to-r from-amber-500 to-orange-500', chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' }
                : { bar: 'bg-gradient-to-r from-rose-500 to-red-500', chip: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' };
            return (
              <Link key={d.department} to="/documents" className="block rounded-xl border border-border/70 bg-card/60 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-card/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{d.department}</div>
                    <div className="text-xs text-foreground/50">
                      {d.staff_count} {d.staff_count === 1 ? 'person' : 'people'} &middot; {d.current}/{d.total} items current
                      {d.expired > 0 && <span className="font-semibold text-rose-600 dark:text-rose-400"> &middot; {d.expired} expired</span>}
                      {d.expiring > 0 && <span className="font-semibold text-amber-600 dark:text-amber-400"> &middot; {d.expiring} expiring</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone.chip}`}>{d.rate}%</span>
                    <ArrowRight className="h-3.5 w-3.5 text-foreground/30" />
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/50">
                  <div className={`h-full rounded-full ${tone.bar} transition-all duration-700`} style={{ width: `${d.rate}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}