import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function IssuesDashboardWidget() {
  const [stats, setStats] = useState(null);
  const [overdue, setOverdue] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      base44.entities.ComplianceIssue.aggregate({ groupBy: 'status' }),
      base44.entities.ComplianceIssue.count({ status: { $in: ['Open', 'In Progress'] }, target_date: { $lt: today } }),
      base44.entities.ComplianceIssue.filter(
        { status: { $in: ['Open', 'In Progress'] }, target_date: { $lt: today } },
        { sort: 'target_date', limit: 4, fields: ['title', 'issue_id', 'target_date', 'status'] },
      ),
    ]).then(([byStatus, overdueCount, overdueItems]) => {
      if (cancelled) return;
      const rows = byStatus.rows || [];
      const get = (s) => rows.find((r) => r.status === s)?.count || 0;
      setStats({ open: get('Open'), progress: get('In Progress'), resolved: get('Resolved') + get('Closed'), overdue: overdueCount });
      setOverdue(overdueItems.items || []);
    }).catch(() => { if (!cancelled) setStats({ open: 0, progress: 0, resolved: 0, overdue: 0 }); });
    return () => { cancelled = true; };
  }, []);

  if (!stats) {
    return <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  const tiles = [
    { label: 'Open', value: stats.open, icon: ListChecks, cls: 'text-amber-600' },
    { label: 'In progress', value: stats.progress, icon: Clock, cls: 'text-blue-600' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, cls: 'text-red-600' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, cls: 'text-emerald-600' },
  ];

  return (
    <Card className="compliance-issues-widget overflow-hidden">
      <CardHeader>
        <CardTitle className="font-display text-lg">Compliance issues</CardTitle>
        <CardDescription>Open concerns from the Compliance Issues register and anything past its target date.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="compliance-issue-tile rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><t.icon className="h-3.5 w-3.5" /> {t.label}</div>
              <div className={`mt-1 text-2xl font-bold tabular-nums ${t.cls}`}>{t.value}</div>
            </div>
          ))}
        </div>
        {overdue.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
            <p className="text-xs font-semibold text-red-700 dark:text-red-300">Overdue issues past their target date</p>
            <ul className="mt-2 space-y-1 text-sm">
              {overdue.map((i) => (
                <li key={i.id} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold">{i.title}</span>
                  <span className="text-xs text-muted-foreground">{i.issue_id ? `${i.issue_id} · ` : ''}Target {i.target_date ? format(new Date(i.target_date), 'd MMM yyyy') : ''}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button asChild variant="outline">
          <Link to="/compliance">Open the Compliance Issues register <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}