import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { downloadComplianceAuditReport } from '@/lib/complianceAuditReportPdf';
import { format } from 'date-fns';
import { FileText, Loader2 } from 'lucide-react';

// One-click weekly status report: snapshots the current compliance health
// (saved to the weekly audit report register) and downloads it as a branded
// PDF ready to share with the team.
export default function WeeklyReportPdfButton() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const res = await base44.functions.invoke('weeklyAuditReport', {});
      if (res.data?.error) throw new Error(res.data.error);

      let report = null;
      if (res.data?.report_id) {
        report = await base44.entities.AuditReport.get(res.data.report_id);
      }
      if (!report) {
        const page = await base44.entities.AuditReport.filter(
          { audit_date: today, generated_by: 'Automated weekly audit' },
          { limit: 1 },
        );
        report = page.items?.[0] || null;
      }
      if (!report) throw new Error('The report could not be saved.');

      let metrics = {};
      try { metrics = JSON.parse(report.metrics || '{}'); } catch { metrics = {}; }

      downloadComplianceAuditReport({
        sections: metrics.sections || [],
        generatedBy: report.generated_by || 'Automated weekly audit',
        generatedAt: format(new Date(), 'd MMM yyyy, h:mma'),
        overallReadiness: report.readiness_score ?? metrics.score ?? 0,
        correctiveActions: [],
      });
      toast({
        title: res.data?.skipped ? 'Weekly report downloaded (already saved today)' : 'Weekly report saved and downloaded',
        description: res.data?.skipped ? res.data.reason : `Overall readiness score: ${report.readiness_score}/100`,
      });
    } catch (e) {
      toast({ title: 'Could not generate the weekly report', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={busy}>
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
      Weekly Status Report (PDF)
    </Button>
  );
}