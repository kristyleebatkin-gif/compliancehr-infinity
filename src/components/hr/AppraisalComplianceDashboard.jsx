import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/EmptyState';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, CalendarClock, AlertTriangle, CalendarCheck, ClipboardList, Loader2, ShieldCheck } from 'lucide-react';

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysUntil = (d) => (d ? Math.ceil((new Date(d) - new Date(todayStr())) / 86400000) : null);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
const norm = (v) => String(v || '').trim().toLowerCase();

export function complianceChip(expired, expiring) {
  if (expired > 0) return { label: `${expired} expired document${expired > 1 ? 's' : ''}`, className: 'bg-danger/10 text-danger' };
  if (expiring > 0) return { label: `${expiring} expiring soon`, className: 'bg-warning/10 text-warning' };
  if (expired === null && expiring === null) return { label: 'No compliance documents on file', className: 'bg-muted text-muted-foreground' };
  return { label: 'All documents current', className: 'bg-safe/10 text-safe' };
}

export default function AppraisalComplianceDashboard() {
  const [reviews, setReviews] = useState([]);
  const [staff, setStaff] = useState([]);
  const [docStatus, setDocStatus] = useState([]);
  const [docIssues, setDocIssues] = useState({ expired: {}, expiring: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const [reviewPage, staffPage, byStatus, expiredRows, expiringRows] = await Promise.all([
        base44.entities.PerformanceReview.filter({}, { sort: 'review_date', limit: 300 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 300, fields: ['full_name', 'role', 'status'] }),
        base44.entities.EmployeeDocument.aggregate({ groupBy: 'status' }).catch(() => ({ rows: [] })),
        base44.entities.EmployeeDocument.aggregate({ query: { status: 'Expired' }, groupBy: 'employee_name' }).catch(() => ({ rows: [] })),
        base44.entities.EmployeeDocument.aggregate({ query: { status: 'Expiring Soon' }, groupBy: 'employee_name' }).catch(() => ({ rows: [] })),
      ]);
      setReviews(reviewPage.items || []);
      setStaff(staffPage.items || []);
      setDocStatus((byStatus.rows || []).map((r) => ({ status: r.status, count: r.count })));
      const expired = {}, expiring = {};
      (expiredRows.rows || []).forEach((r) => { expired[r.employee_name] = r.count; });
      (expiringRows.rows || []).forEach((r) => { expiring[r.employee_name] = r.count; });
      setDocIssues({ expired, expiring });
      setLoading(false);
    };
    run();
  }, []);

  const chipFor = (name) => {
    const key = norm(name);
    const expired = Object.entries(docIssues.expired).find(([k]) => norm(k) === key)?.[1] ?? null;
    const expiring = Object.entries(docIssues.expiring).find(([k]) => norm(k) === key)?.[1] ?? null;
    return complianceChip(expired, expiring);
  };

  const pending = reviews
    .filter((r) => r.status === 'Scheduled' || r.status === 'In Progress')
    .sort((a, b) => String(a.review_date || '9999').localeCompare(String(b.review_date || '9999')));
  const overdue = pending.filter((r) => (daysUntil(r.review_date) ?? 1) < 0);
  const dueSoon = pending.filter((r) => { const d = daysUntil(r.review_date); return d !== null && d >= 0 && d <= 30; });
  const pendingNames = new Set(pending.map((r) => norm(r.staff_name)));
  const completedNames = new Set(reviews.filter((r) => r.status === 'Completed').map((r) => norm(r.staff_name)));
  const neverScheduled = staff.filter((s) => s.status === 'Active' && !pendingNames.has(norm(s.full_name)) && !completedNames.has(norm(s.full_name)));
  const nextDue = pending.find((r) => (daysUntil(r.review_date) ?? 1) >= 0) || pending[0];
  const chartData = [
    { name: 'Current', count: docStatus.find((d) => d.status === 'Current')?.count || 0, fill: '#10b981' },
    { name: 'Expiring soon', count: docStatus.find((d) => d.status === 'Expiring Soon')?.count || 0, fill: '#f59e0b' },
    { name: 'Expired', count: docStatus.find((d) => d.status === 'Expired')?.count || 0, fill: '#ef4444' },
  ];
  const totalDocs = chartData.reduce((sum, d) => sum + d.count, 0);

  const dateBadge = (d) => {
    const days = daysUntil(d);
    if (days === null) return <Badge variant="outline">No date set</Badge>;
    if (days < 0) return <Badge className="border-transparent bg-danger text-white">{Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''} overdue</Badge>;
    if (days === 0) return <Badge className="border-transparent bg-warning text-white">Due today</Badge>;
    return <Badge className="border-transparent bg-brand/10 text-brand">in {days} day{days !== 1 ? 's' : ''}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/60 bg-card p-3">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><BarChart3 className="h-4 w-4 text-brand" />Appraisals &amp; compliance dashboard</div>
        <p className="text-xs text-muted-foreground">Every pending staff appraisal with each person's compliance record status beside it, so you can see exactly who is due for a review next.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Pending appraisals', value: pending.length, icon: ClipboardList, tone: 'bg-brand/10 text-brand' },
          { label: 'Overdue appraisals', value: overdue.length, icon: AlertTriangle, tone: 'bg-danger/10 text-danger' },
          { label: 'Due in next 30 days', value: dueSoon.length, icon: CalendarCheck, tone: 'bg-warning/10 text-warning' },
          { label: 'Active staff with no appraisal scheduled', value: neverScheduled.length, icon: CalendarClock, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300' },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-2.5">
            <div className={`mb-2 inline-flex rounded-lg p-2 ${s.tone}`}><s.icon className="h-4 w-4" /></div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-[11px] font-medium text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {nextDue && (
        <Card className="border-brand/30 bg-gradient-to-r from-brand/5 to-transparent">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand"><CalendarCheck className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next review due</p>
                <p className="font-semibold">{nextDue.staff_name}</p>
                <p className="text-xs text-muted-foreground">{nextDue.review_type}{nextDue.reviewer ? ` · Reviewer: ${nextDue.reviewer}` : ''} · {fmtDate(nextDue.review_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {dateBadge(nextDue.review_date)}
              <Badge variant="outline" className={chipFor(nextDue.staff_name).className}>{chipFor(nextDue.staff_name).label}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {pending.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No pending appraisals" subtitle="Schedule a review in the Performance reviews tab and it will appear here with its compliance status." />
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Pending appraisals, soonest first ({pending.length})</p>
          {pending.map((r) => {
            const chip = chipFor(r.staff_name);
            return (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card p-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold">{r.staff_name}</span>
                    <Badge variant="outline">{r.review_type}</Badge>
                    <Badge variant="outline" className="text-muted-foreground">{r.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{fmtDate(r.review_date)}{r.reviewer ? ` · Reviewer: ${r.reviewer}` : ''}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={chip.className}><ShieldCheck className="mr-1 h-3 w-3" />{chip.label}</Badge>
                  {dateBadge(r.review_date)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="mb-1 text-sm font-semibold">Compliance documents across all staff</p>
            <p className="mb-3 text-xs text-muted-foreground">{totalDocs} document{totalDocs !== 1 ? 's' : ''} on file</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="mb-1 text-sm font-semibold">Active staff with no appraisal scheduled ({neverScheduled.length})</p>
            <p className="mb-3 text-xs text-muted-foreground">These people have no pending or completed review on record.</p>
            {neverScheduled.length === 0 ? (
              <p className="text-xs text-muted-foreground">Every active staff member has an appraisal on record.</p>
            ) : (
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                {neverScheduled.map((s) => {
                  const chip = chipFor(s.full_name);
                  return <Badge key={s.id} variant="outline" className={chip.className}>{s.full_name}</Badge>;
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}