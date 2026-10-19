import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { useToast } from '@/components/ui/use-toast';
import { Download, Loader2 } from 'lucide-react';

// Downloads the current compliance health report (live score + control
// evidence) and all staff document/certificate records as CSV files.
export default function ComplianceHealthExportButton() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const [scoreRes, empDocs, certs] = await Promise.all([
        base44.functions.invoke('complianceScore', {}),
        fetchAllRecords(base44.entities.EmployeeDocument, {}, '-created_date'),
        fetchAllRecords(base44.entities.Certificate, {}, '-created_date'),
      ]);
      const data = scoreRes?.data;

      // Compliance health report: headline score + every monitored control.
      downloadCsv('compliance-health-report.csv', [
        { key: 'section', label: 'Section' },
        { key: 'item', label: 'Item' },
        { key: 'status', label: 'Status' },
        { key: 'detail', label: 'Detail' },
      ], [
        ...(data && !data.error ? [
          { section: 'Overall', item: 'Live compliance score', status: data.status || 'Collected', detail: `${data.score}/100 — ${data.registers_monitored ?? ''} registers monitored` },
          ...(data.controls || []).map((c) => ({ section: 'Control', item: c.label, status: c.status, detail: c.detail })),
        ] : [{ section: 'Overall', item: 'Live compliance score', status: 'unavailable', detail: '' }]),
      ]);

      // Staff documents: employee documents and certificates in one register.
      downloadCsv('staff-documents.csv', [
        { key: 'source', label: 'Source' },
        { key: 'staff_name', label: 'Staff Member' },
        { key: 'document_type', label: 'Document / Module' },
        { key: 'issue_date', label: 'Issue Date' },
        { key: 'expiry_date', label: 'Expiry Date' },
        { key: 'status', label: 'Status' },
        { key: 'score', label: 'Score' },
        { key: 'issued_by', label: 'Issued By' },
        { key: 'notes', label: 'Notes' },
      ], [
        ...empDocs.map((d) => ({ ...d, source: 'Employee Document', document_type: d.document_type })),
        ...certs.map((c) => ({ ...c, source: 'Certificate', document_type: c.module_title })),
      ]);

      toast({ title: 'Exported', description: 'Compliance health report and staff documents downloaded.' });
    } catch (e) {
      toast({ title: 'Export failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={run} disabled={busy}>
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Export Health &amp; Staff Docs (CSV)
    </Button>
  );
}