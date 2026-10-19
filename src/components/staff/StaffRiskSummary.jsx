import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import ScoreRing from '@/components/ScoreRing';
import { Loader2, ShieldAlert, CalendarX, FileWarning, BadgeCheck } from 'lucide-react';

const PENDING = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'];
const RISK_ALERT_THRESHOLD = 40; // matches the automated risk alert trigger
const TEAL_BADGE = 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border-transparent';

// High-visibility per-staff risk summary: an at-a-glance risk score plus every
// overdue or expiring item for this staff member, in teal status indicators.
export default function StaffRiskSummary({ staff }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const name = staff.full_name;
    const today = format(new Date(), 'yyyy-MM-dd');
    const in30 = format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd');
    Promise.all([
      base44.entities.TodoTask.filter(
        { status: { $in: PENDING }, assigned_to: name },
        { sort: 'due_date', limit: 100, fields: ['title', 'due_date', 'priority', 'status'] },
      ),
      base44.entities.EmployeeDocument.filter(
        { employee_id: staff.id },
        { limit: 100, fields: ['title', 'document_type', 'status', 'expiry_date'] },
      ),
      base44.entities.Certificate.filter(
        { staff_name: name },
        { limit: 100, fields: ['module_title', 'status', 'expiry_date'] },
      ),
    ])
      .then(([tasks, docs, certs]) => {
        if (cancelled) return;
        const overdueTasks = (tasks.items || []).filter((t) => t.due_date && t.due_date < today);
        const dueTasks = (tasks.items || []).filter((t) => t.due_date && t.due_date >= today);
        const expiredDocs = (docs.items || []).filter((d) => d.expiry_date && d.expiry_date < today);
        const soonDocs = (docs.items || []).filter((d) => d.expiry_date && d.expiry_date >= today && d.expiry_date <= in30);
        const expiredCerts = (certs.items || []).filter((c) => c.expiry_date && c.expiry_date < today);
        const soonCerts = (certs.items || []).filter((c) => c.expiry_date && c.expiry_date >= today && c.expiry_date <= in30);

        // Risk score 0-100: start clear and deduct for each open risk item.
        const score = Math.max(0, Math.min(100,
          100
          - overdueTasks.length * 10
          - expiredDocs.length * 15
          - expiredCerts.length * 15
          - soonDocs.length * 5
          - soonCerts.length * 5
        ));
        setData({
          score,
          overdueTasks, dueTasks,
          expiredDocs, soonDocs, expiredCerts, soonCerts,
        });
      })
      .catch(() => { if (!cancelled) setData({ score: 100, overdueTasks: [], dueTasks: [], expiredDocs: [], soonDocs: [], expiredCerts: [], soonCerts: [] }); });
    return () => { cancelled = true; };
  }, [staff.id, staff.full_name]);

  if (!data) {
    return <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
      <Loader2 className="h-4 w-4 animate-spin" />Calculating risk summary...
    </CardContent></Card>;
  }

  const riskPoints = 100 - data.score;

  const counts = [
    { label: 'Overdue tasks', value: data.overdueTasks.length, Icon: CalendarX },
    { label: 'Expired documents', value: data.expiredDocs.length, Icon: FileWarning },
    { label: 'Expired certificates', value: data.expiredCerts.length, Icon: BadgeCheck },
    { label: 'Expiring within 30 days', value: data.soonDocs.length + data.soonCerts.length, Icon: ShieldAlert },
  ];

  const overdueRows = [
    ...data.overdueTasks.map((t) => ({ key: `t-${t.id}`, title: t.title, sub: `Task · due ${format(new Date(`${t.due_date}T00:00:00`), 'd MMM yyyy')}`, badge: t.status })),
    ...data.expiredDocs.map((d) => ({ key: `d-${d.id}`, title: `${d.document_type}: ${d.title}`, sub: `Document · expired ${format(new Date(`${d.expiry_date}T00:00:00`), 'd MMM yyyy')}`, badge: d.status })),
    ...data.expiredCerts.map((c) => ({ key: `c-${c.id}`, title: c.module_title, sub: `Certificate · expired ${format(new Date(`${c.expiry_date}T00:00:00`), 'd MMM yyyy')}`, badge: c.status })),
  ];

  const upcomingRows = [
    ...data.dueTasks.map((t) => ({ key: `t-${t.id}`, title: t.title, sub: `Task · due ${format(new Date(`${t.due_date}T00:00:00`), 'd MMM yyyy')}`, badge: t.status })),
    ...data.soonDocs.map((d) => ({ key: `d-${d.id}`, title: `${d.document_type}: ${d.title}`, sub: `Document · expires ${format(new Date(`${d.expiry_date}T00:00:00`), 'd MMM yyyy')}`, badge: d.status })),
    ...data.soonCerts.map((c) => ({ key: `c-${c.id}`, title: c.module_title, sub: `Certificate · expires ${format(new Date(`${c.expiry_date}T00:00:00`), 'd MMM yyyy')}`, badge: c.status })),
  ];

  return (
    <div className="space-y-4">
      {riskPoints > RISK_ALERT_THRESHOLD && (
        <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Compliance risk score {riskPoints} exceeds the alert threshold of {RISK_ALERT_THRESHOLD} — admins are notified automatically.
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="shadow-panel">
          <CardContent className="flex flex-col items-center gap-2 p-6">
            <ScoreRing value={data.score} size={150} label="Risk score" />
            <p className="text-center text-xs font-medium text-muted-foreground">100 = fully clear. Deductions for overdue tasks, expired documents and certificates.</p>
          </CardContent>
        </Card>
        <Card className="shadow-panel">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2 font-display text-base font-bold"><ShieldAlert className="h-4 w-4 text-teal" />Risk indicators</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {counts.map(({ label, value, Icon }) => {
                const tone = value === 0 ? 'bg-teal text-teal-foreground' : value <= 2 ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100' : 'bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100';
                return (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold tabular-nums ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold">{label}</span>
                    <span className={`rounded-md px-2 py-0.5 text-lg font-bold tabular-nums ${tone}`}>{value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {overdueRows.length > 0 && (
        <Card className="shadow-panel">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-300"><CalendarX className="h-4 w-4" />Overdue items ({overdueRows.length})</div>
            <div className="space-y-2">
              {overdueRows.map((r) => (
                <div key={r.key} className="flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-800 dark:bg-red-950/30">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{r.title}</div>
                    <div className="text-xs text-foreground/60">{r.sub}</div>
                  </div>
                  <Badge className={`border-transparent text-xs ${r.badge === 'Expired' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' : statusTone(r.badge) || ''}`}>{r.badge}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcomingRows.length > 0 && (
        <Card className="shadow-panel">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-teal"><ShieldAlert className="h-4 w-4" />Coming up ({upcomingRows.length})</div>
            <div className="space-y-2">
              {upcomingRows.map((r) => (
                <div key={r.key} className="flex flex-wrap items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm dark:border-teal-800 dark:bg-teal-950/30">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{r.title}</div>
                    <div className="text-xs text-foreground/60">{r.sub}</div>
                  </div>
                  <Badge className={`border-transparent text-xs ${TEAL_BADGE}`}>{r.badge}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {overdueRows.length === 0 && upcomingRows.length === 0 && (
        <Card><CardContent className="p-10 text-center text-sm text-foreground/60">All clear — no overdue or upcoming compliance items for this staff member.</CardContent></Card>
      )}
    </div>
  );
}