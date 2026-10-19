import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmptyState from '@/components/EmptyState';
import StatCard from '@/components/StatCard';
import IssueLogDialog from '@/components/compliance/IssueLogDialog';
import IssueResolveDialog from '@/components/compliance/IssueResolveDialog';
import { downloadComplianceIssuesReport } from '@/lib/complianceIssuesPdf';
import { nextIssueId } from '@/lib/complianceIssues.js';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import IssueCategoryChart from '@/components/compliance/IssueCategoryChart';
import IssueReportDialog from '@/components/compliance/IssueReportDialog';
import { Plus, Download, ClipboardCheck, History, Trash2, ListChecks, FileSpreadsheet, FileText } from 'lucide-react';
import { format } from 'date-fns';

const CSV_COLUMNS = [
  { key: 'issue_id', label: 'Issue ID' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'source', label: 'Source' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'date_logged', label: 'Date Logged' },
  { key: 'logged_by', label: 'Logged By' },
  { key: 'assigned_to', label: 'Assigned To' },
  { key: 'target_date', label: 'Target Date' },
  { key: 'resolution_action', label: 'Resolution Action' },
  { key: 'resolved_by', label: 'Resolved By' },
  { key: 'resolved_date', label: 'Resolved On' },
  { key: 'verified_by', label: 'Verified By' },
];

export default function ComplianceIssuesTab() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [logOpen, setLogOpen] = useState(false);
  const [resolveIssue, setResolveIssue] = useState(null);
  const [historyIssue, setHistoryIssue] = useState(null);
  const [quickResolve, setQuickResolve] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.ComplianceIssue.filter({}, { sort: '-created_date', limit: 200 });
      setIssues(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = {
    total: issues.length,
    open: issues.filter((i) => i.status === 'Open').length,
    progress: issues.filter((i) => i.status === 'In Progress').length,
    resolved: issues.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length,
  };

  const filtered = statusFilter === 'all' ? issues : issues.filter((i) => i.status === statusFilter);

  const markInProgress = async (issue) => {
    await base44.entities.ComplianceIssue.update(issue.id, {
      status: 'In Progress',
      status_log: [issue.status_log, `${new Date().toISOString().slice(0, 10)} — ${issue.status} → In Progress`].filter(Boolean).join('\n'),
    });
    await load();
  };

  const exportCsv = async () => {
    const rows = await fetchAllRecords(base44.entities.ComplianceIssue);
    downloadCsv('compliance-issues-register.csv', CSV_COLUMNS, rows);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total issues" value={counts.total} tone="violet" icon={ListChecks} />
        <StatCard label="Open" value={counts.open} tone="amber" icon={ListChecks} />
        <StatCard label="In progress" value={counts.progress} tone="blue" icon={ListChecks} />
        <StatCard label="Resolved" value={counts.resolved} tone="emerald" icon={ClipboardCheck} />
      </div>

      <IssueCategoryChart />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setLogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Log compliance issue</Button>
        <Button variant="outline" onClick={() => setReportOpen(true)}><FileText className="mr-2 h-4 w-4" /> Report with filters</Button>
        <Button variant="outline" onClick={() => downloadComplianceIssuesReport(issues)}><Download className="mr-2 h-4 w-4" /> Download report (PDF)</Button>
        <Button variant="outline" onClick={exportCsv}><FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV</Button>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListChecks} modulePath="/compliance" title="No compliance issues yet" message="Log the first compliance issue so it can be documented, resolved and reported." action={<Button onClick={() => setLogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Log issue</Button>} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Issue</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Resolved by</th>
                    <th className="px-4 py-3">Resolved on</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((issue) => (
                    <tr key={issue.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">{issue.issue_id ? `${issue.issue_id} · ` : ''}Logged {issue.date_logged ? format(new Date(issue.date_logged), 'd MMM yyyy') : ''}{issue.assigned_to ? ` · Assigned to ${issue.assigned_to}` : ''}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{issue.category}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{issue.priority || 'Medium'}</Badge></td>
                      <td className="px-4 py-3"><Badge className={statusTone(issue.status)}>{issue.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{issue.resolved_by || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{issue.resolved_date ? format(new Date(issue.resolved_date), 'd MMM yyyy') : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {issue.status === 'Open' && <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => markInProgress(issue)}>Start</Button>}
                          {!['Resolved', 'Closed'].includes(issue.status) && (
                            <>
                              <Button size="sm" className="h-7 px-2 text-xs" onClick={() => { setQuickResolve(true); setResolveIssue(issue); }}>Quick resolve</Button>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => { setQuickResolve(false); setResolveIssue(issue); }}>Record action</Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setHistoryIssue(issue)}><History className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.ComplianceIssue.delete(issue.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <IssueLogDialog open={logOpen} onOpenChange={setLogOpen} nextId={nextIssueId(issues)} onSaved={load} />
      <IssueResolveDialog issue={resolveIssue} open={!!resolveIssue} quick={quickResolve} onOpenChange={(o) => { if (!o) setResolveIssue(null); }} onSaved={load} />
      <IssueReportDialog open={reportOpen} onOpenChange={setReportOpen} issues={issues} />
      <Dialog open={!!historyIssue} onOpenChange={(o) => { if (!o) setHistoryIssue(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Action history — {historyIssue?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(historyIssue?.actions_log || '').split('\n').filter(Boolean).map((entry, idx) => (
              <div key={idx} className="flex gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><p>{entry}</p></div>
            ))}
            {!historyIssue?.actions_log && <p className="text-sm text-muted-foreground">No actions recorded yet.</p>}
            {historyIssue?.resolution_action && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-semibold">Resolution</p>
                <p>{historyIssue.resolution_action}</p>
                <p className="mt-1 text-xs text-muted-foreground">{historyIssue.resolved_by || '—'}{historyIssue.resolved_date ? ` · ${format(new Date(historyIssue.resolved_date), 'd MMM yyyy')}` : ''}{historyIssue.verified_by ? ` · Verified by ${historyIssue.verified_by}` : ''}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}