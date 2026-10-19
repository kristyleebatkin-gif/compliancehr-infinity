import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv } from '@/lib/csvExport';
import { downloadComplianceAuditReport } from '@/lib/complianceAuditReportPdf';
import { format } from 'date-fns';
import { Download, FileText, Loader2, RefreshCw } from 'lucide-react';

const SCORE_TONE = (score) => (score >= 90 ? 'bg-safe/10 text-safe' : score >= 70 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger');

// Weekly audit reports: every Monday the automated workflow snapshots the
// compliance health score and all monitored controls into a saved report.
// Each saved report downloads as a branded PDF on demand.
export default function WeeklyAuditReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.AuditReport.filter(
        { generated_by: 'Automated weekly audit' },
        { sort: '-audit_date', limit: 52 },
      );
      setReports(page.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generateNow = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('weeklyAuditReport', {});
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: res.data?.skipped ? 'This week\u2019s report already exists' : 'Weekly audit report generated', description: res.data?.reason });
      await load();
    } catch (e) {
      toast({ title: 'Could not generate report', description: e.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const exportCsv = () => {
    downloadCsv('weekly-audit-reports.csv', [
      { key: 'audit_date', label: 'Week Ending' },
      { key: 'readiness_score', label: 'Readiness Score' },
      { key: 'status', label: 'Status' },
      { key: 'findings', label: 'Findings' },
    ], reports);
    toast({ title: 'Weekly audit reports exported' });
  };

  const downloadPdf = async (report) => {
    setDownloadingId(report.id);
    try {
      let sections = [];
      try { sections = JSON.parse(report.metrics || '{}').sections || []; } catch { sections = []; }
      downloadComplianceAuditReport({
        sections,
        generatedBy: report.generated_by || 'Automated weekly audit',
        generatedAt: format(new Date(`${report.audit_date}T00:00:00`), 'd MMM yyyy'),
        overallReadiness: report.readiness_score ?? 0,
        correctiveActions: [],
      });
      toast({ title: 'Audit report downloaded' });
    } catch (e) {
      toast({ title: 'Could not build PDF', description: e.message, variant: 'destructive' });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card p-10 text-sm text-foreground/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading weekly audit reports…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-panel">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold"><FileText className="h-5 w-5 text-primary" />Weekly audit reports</div>
            <p className="text-xs text-muted-foreground">Generated automatically every Monday at 8:00am — a point-in-time snapshot of compliance health across all monitored registers. Download any report as a branded PDF.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-3.5 w-3.5" />Refresh</Button>
            {reports.length > 0 && <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 h-3.5 w-3.5" />Export (CSV)</Button>}
            <Button size="sm" onClick={generateNow} disabled={generating}>
              {generating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <FileText className="mr-2 h-3.5 w-3.5" />}
              Generate now
            </Button>
          </div>
        </CardContent>
      </Card>

      {reports.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
          No weekly reports yet — the first one is generated next Monday, or use "Generate now" to snapshot today's compliance health.
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                    <th className="px-5 py-2 font-semibold">Week ending</th>
                    <th className="px-3 py-2 font-semibold">Readiness score</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Findings</th>
                    <th className="px-5 py-2 font-semibold text-right">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b border-border/40 last:border-0">
                      <td className="px-5 py-2.5 font-semibold">{format(new Date(`${r.audit_date}T00:00:00`), 'd MMM yyyy')}</td>
                      <td className="px-3 py-2.5"><Badge className={`tabular-nums ${SCORE_TONE(r.readiness_score ?? 0)}`}>{r.readiness_score ?? 0}/100</Badge></td>
                      <td className="px-3 py-2.5">{r.status}</td>
                      <td className="max-w-md px-3 py-2.5 text-xs text-muted-foreground"><div className="line-clamp-2">{r.findings}</div></td>
                      <td className="px-5 py-2.5 text-right">
                        <Button variant="outline" size="sm" onClick={() => downloadPdf(r)} disabled={downloadingId === r.id}>
                          {downloadingId === r.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}