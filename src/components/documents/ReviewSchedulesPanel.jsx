import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Download, RefreshCw } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { statusTone } from '@/lib/statusStyles';

const fmt = (d) => (d ? String(d).slice(0, 10) : '—');

// Staff performance review schedules and employee appraisals, logged from the
// HR Hub and appraisals module, surfaced in the document vault for every employee.
export default function ReviewSchedulesPanel() {
  const [reviews, setReviews] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, a] = await Promise.all([
        base44.entities.PerformanceReview.filter({}, { sort: '-review_date', limit: 200 }),
        base44.entities.EmployeePerformanceAppraisal.filter({}, { sort: '-created_date', limit: 200 }),
      ]);
      setReviews(r.items || []);
      setAppraisals(a.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportReviews = () => {
    downloadCsv('Performance-Review-Schedules.csv', [
      { key: 'staff_name', label: 'Staff' }, { key: 'review_type', label: 'Review Type' },
      { key: 'review_date', label: 'Review Date' }, { key: 'next_review_date', label: 'Next Review' },
      { key: 'reviewer', label: 'Reviewer' }, { key: 'overall_rating', label: 'Rating' },
      { key: 'outcome', label: 'Outcome' }, { key: 'status', label: 'Status' },
    ], reviews);
  };

  const exportAppraisals = () => {
    downloadCsv('Employee-Appraisals.csv', [
      { key: 'employee_name', label: 'Employee' }, { key: 'position_title', label: 'Position' },
      { key: 'review_type', label: 'Review Type' }, { key: 'scheduled_review_date', label: 'Scheduled Date' },
      { key: 'review_period_start', label: 'Period Start' }, { key: 'review_period_end', label: 'Period End' },
      { key: 'reviewer', label: 'Reviewer' }, { key: 'overall_rating', label: 'Overall Rating' },
      { key: 'review_outcome', label: 'Outcome' }, { key: 'status', label: 'Status' },
      { key: 'next_12_month_review', label: 'Next 12-Month Review' },
    ], appraisals);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg shadow-sm"><ClipboardCheck className="h-4 w-4 text-white" /></span>
        <span className="text-sm font-bold font-editorial text-foreground/80">Staff performance review schedules</span>
        <span className="h-1 w-8 rounded-full bg-brand" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={load} title="Refresh"><RefreshCw className="h-3.5 w-3.5" /></Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold">Performance reviews <span className="text-muted-foreground">({reviews.length} logged)</span></p>
            <Button size="sm" variant="outline" onClick={exportReviews} disabled={loading || reviews.length === 0}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
          {loading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading review schedules…</p>
          ) : reviews.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No performance reviews logged yet. Reviews scheduled in the HR Hub appear here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Staff</th>
                    <th className="px-3 py-2 font-semibold">Type</th>
                    <th className="px-3 py-2 font-semibold">Review date</th>
                    <th className="px-3 py-2 font-semibold">Next review</th>
                    <th className="px-3 py-2 font-semibold">Reviewer</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-2 font-medium">{r.staff_name}</td>
                      <td className="px-3 py-2 text-xs">{r.review_type}</td>
                      <td className="px-3 py-2 text-xs">{fmt(r.review_date)}</td>
                      <td className="px-3 py-2 text-xs">{fmt(r.next_review_date)}</td>
                      <td className="px-3 py-2 text-xs">{r.reviewer || '—'}</td>
                      <td className="px-3 py-2"><Badge className={statusTone(r.status)}>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold">Employee appraisals <span className="text-muted-foreground">({appraisals.length} logged)</span></p>
            <Button size="sm" variant="outline" onClick={exportAppraisals} disabled={loading || appraisals.length === 0}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
          {loading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading appraisals…</p>
          ) : appraisals.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No employee appraisals logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Employee</th>
                    <th className="px-3 py-2 font-semibold">Type</th>
                    <th className="px-3 py-2 font-semibold">Scheduled</th>
                    <th className="px-3 py-2 font-semibold">Period</th>
                    <th className="px-3 py-2 font-semibold">Rating</th>
                    <th className="px-3 py-2 font-semibold">Next review</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appraisals.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-2 font-medium">{a.employee_name}</td>
                      <td className="px-3 py-2 text-xs">{a.review_type}</td>
                      <td className="px-3 py-2 text-xs">{fmt(a.scheduled_review_date)}</td>
                      <td className="px-3 py-2 text-xs">{fmt(a.review_period_start)} – {fmt(a.review_period_end)}</td>
                      <td className="px-3 py-2 text-xs">{a.overall_rating || '—'}</td>
                      <td className="px-3 py-2 text-xs">{fmt(a.next_12_month_review)}</td>
                      <td className="px-3 py-2"><Badge className={statusTone(a.status)}>{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}