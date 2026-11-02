import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { fetchAllRecords } from '@/lib/csvExport';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ListChecks, ChevronDown, ChevronRight } from 'lucide-react';

const PREFIX = 'Onboarding pack - ';
const REQUIRED_STEPS = [
  'Send employment contract for signature',
  'Collect national police check',
  'Apply for NDIS Worker Screening',
  'Verify Blue Card / WWCC if applicable',
  'Book First Aid and CPR training',
  'Complete staff induction',
  'Create staff badge and profile photo',
  'Set up IT accounts and email',
  'Add staff to rostering team lists',
  'Schedule 6-month probation review',
];

const intakeTone = (status) => {
  const map = {
    'Converted to Profile': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100',
    Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100',
    'Ready for Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100',
    Declined: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100',
    Withdrawn: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  return map[status] || 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-100';
};

// Progress tracker: how far each staff member is through their required
// onboarding pack tasks, alongside their employee intake status.
export default function StaffOnboardingTracker() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const [taskRows, staffRows, intakeRows] = await Promise.all([
          fetchAllRecords(base44.entities.TodoTask, { title: { $regex: `^${PREFIX}`, $options: 'i' } }, 'due_date'),
          fetchAllRecords(base44.entities.StaffProfile, {}, 'full_name'),
          fetchAllRecords(base44.entities.IntakeCase, { intake_type: 'Employee' }, '-created_date'),
        ]);
        if (cancelled) return;

        const byStaff = new Map();
        taskRows.forEach((t) => {
          const rest = t.title.slice(PREFIX.length);
          const name = rest.slice(0, rest.lastIndexOf(' - ')).trim();
          const step = rest.slice(rest.lastIndexOf(' - ') + 3).trim();
          if (!name || !step) return;
          if (!byStaff.has(name)) byStaff.set(name, []);
          byStaff.get(name).push({ step, status: t.status, due_date: t.due_date });
        });

        const intakeByName = new Map();
        intakeRows.forEach((i) => {
          const name = String(i.applicant_name || '').trim();
          if (name && !intakeByName.has(name)) intakeByName.set(name, i.status);
        });

        const rowsOut = staffRows.map((s) => {
          const name = s.full_name;
          const steps = byStaff.get(name) || [];
          const done = steps.filter((st) => st.status === 'Completed' || st.status === 'Finalised').length;
          const overdue = steps.filter((st) => st.status !== 'Completed' && st.status !== 'Finalised' && st.status !== 'Cancelled' && st.due_date && st.due_date < today).length;
          return {
            name,
            steps,
            done,
            total: steps.length,
            overdue,
            intake: intakeByName.get(name) || null,
            pct: steps.length ? Math.round((done / steps.length) * 100) : null,
          };
        }).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));

        // Staff with no pack generated yet but an intake on file.
        const packNames = new Set(rowsOut.map((r) => r.name));
        const missing = Array.from(byStaff.keys()).filter((n) => !packNames.has(n));
        missing.forEach((n) => {
          const steps = byStaff.get(n);
          const done = steps.filter((st) => st.status === 'Completed' || st.status === 'Finalised').length;
          rowsOut.push({ name: n, steps, done, total: steps.length, overdue: 0, intake: intakeByName.get(n) || null, pct: Math.round((done / steps.length) * 100) });
        });

        setRows(rowsOut);
      } catch (error) {
        console.error(error);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [refresh]);

  const barTone = (pct, overdue) => {
    if (pct === 100) return 'bg-emerald-500';
    if (overdue > 0) return 'bg-red-500';
    return 'bg-indigo-500';
  };

  if (loading) {
    return <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
      <Loader2 className="h-4 w-4 animate-spin" />Loading onboarding progress...
    </CardContent></Card>;
  }
  if (loadError) return <Card><CardContent className="flex items-center justify-between gap-3 p-4 text-sm text-amber-900" role="alert">Onboarding task or profile records could not be confirmed.<button type="button" className="underline" onClick={() => setRefresh((v) => v + 1)}>Retry</button></CardContent></Card>;

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <div className="mb-1 flex items-center gap-2 font-display text-base font-bold"><ListChecks className="h-4 w-4 text-indigo-500" />Onboarding progress tracker</div>
        <p className="mb-4 text-xs font-medium text-muted-foreground">How far each staff member is through their required onboarding pack (10 steps), alongside their employee intake status. Click a row to see the individual steps.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-foreground/60">
                <th className="px-3 py-2 font-semibold">Staff member</th>
                <th className="px-3 py-2 font-semibold">Employee intake</th>
                <th className="px-3 py-2 font-semibold">Progress</th>
                <th className="px-3 py-2 text-right font-semibold">Done</th>
                <th className="px-3 py-2 text-right font-semibold">Overdue</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <React.Fragment key={r.name}>
                  <tr
                    className="cursor-pointer border-t border-border/50 hover:bg-accent/50"
                    onClick={() => setExpanded(expanded === r.name ? null : r.name)}
                  >
                    <td className="px-3 py-2 font-semibold">{r.name}</td>
                    <td className="px-3 py-2">
                      {r.intake
                        ? <span className={`inline-block rounded-md px-2 py-0.5 font-semibold ${intakeTone(r.intake)}`}>{r.intake}</span>
                        : <span className="text-foreground/40">No intake</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-40 min-w-24 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${barTone(r.pct ?? 0, r.overdue)}`} style={{ width: `${r.pct ?? 0}%` }} />
                        </div>
                        <span className="font-bold tabular-nums">{r.pct == null ? '—' : `${r.pct}%`}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums">{r.total ? `${r.done}/${r.total}` : 'Pack not generated'}</td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums">
                      {r.overdue > 0 ? <span className="text-red-600 dark:text-red-400">{r.overdue}</span> : <span className="text-foreground/30">0</span>}
                    </td>
                    <td className="px-2 py-2">{expanded === r.name ? <ChevronDown className="h-4 w-4 text-foreground/50" /> : <ChevronRight className="h-4 w-4 text-foreground/40" />}</td>
                  </tr>
                  {expanded === r.name && (
                    <tr className="border-t border-border/30 bg-muted/30">
                      <td colSpan={6} className="px-4 py-3">
                        {r.steps.length ? (
                          <div className="grid gap-1.5 sm:grid-cols-2">
                            {r.steps.map((st, i) => {
                              const isDone = st.status === 'Completed' || st.status === 'Finalised';
                              const isOverdue = !isDone && st.status !== 'Cancelled' && st.due_date && st.due_date < format(new Date(), 'yyyy-MM-dd');
                              return (
                                <div key={i} className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 ${isDone ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30' : isOverdue ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30' : 'border-border bg-card'}`}>
                                  <span className={`font-bold tabular-nums ${isDone ? 'text-emerald-600 dark:text-emerald-400' : isOverdue ? 'text-red-600 dark:text-red-400' : 'text-foreground/40'}`}>{isDone ? '✓' : isOverdue ? '!' : '○'}</span>
                                  <span className={`flex-1 font-medium ${isDone ? 'text-foreground/60 line-through' : ''}`}>{st.step}</span>
                                  {isOverdue && st.due_date && <span className="text-foreground/50 tabular-nums">Due {format(new Date(`${st.due_date}T00:00:00`), 'd MMM')}</span>}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-foreground/60">No onboarding pack has been generated for this staff member yet — it is created automatically when a staff profile is added, or from the staff detail page.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-foreground/60">No staff profiles found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}