import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { downloadCsv } from '@/lib/csvExport';
import { DATA_MODULES } from '@/lib/dataModules';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { exportModuleRecordsCsv, downloadAuditListPdf, downloadFullBusinessAuditPdf } from '@/lib/auditCentreExport';
import { ClipboardList, Download, FileText, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

/**
 * Internal audit compliance report: a live record count for every module in
 * the platform, with CSV, branded PDF and full business audit exports.
 */
export default function AuditReportList() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [busyEntity, setBusyEntity] = useState(null);
  const [fullAudit, setFullAudit] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const out = [];
      for (let i = 0; i < DATA_MODULES.length; i += 6) {
        const batch = DATA_MODULES.slice(i, i + 6);
        const results = await Promise.allSettled(
          batch.map(([entity, label]) => base44.entities[entity].count({}).then((count) => ({ entity, label, count }))),
        );
        results.forEach((r) => { if (r.status === 'fulfilled') out.push(r.value); });
      }
      setRows(out);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generatedBy = async () => {
    try {
      const me = await base44.auth.me();
      return me?.full_name || me?.email || '';
    } catch { return ''; }
  };

  const exportCsv = () => {
    setExporting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      downloadCsv(
        `internal-audit-compliance-report-${today}.csv`,
        [
          { key: 'label', label: 'Module' },
          { key: 'entity', label: 'Entity' },
          { key: 'count', label: 'Records on file' },
        ],
        rows,
      );
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      await loadCompanyBranding();
      downloadAuditListPdf(rows, { generatedBy: await generatedBy() });
      toast({ title: 'Audit report PDF downloaded' });
    } catch (err) {
      toast({ title: 'PDF export failed', description: err.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const exportFullAudit = async () => {
    setFullAudit(true);
    try {
      await downloadFullBusinessAuditPdf({ counts: rows, generatedBy: await generatedBy() });
      toast({ title: 'Full business audit report downloaded and logged to the Internal Audit Register' });
    } catch (err) {
      toast({ title: 'Full audit export failed', description: err.message, variant: 'destructive' });
    } finally {
      setFullAudit(false);
    }
  };

  const exportModule = async (entity, label) => {
    setBusyEntity(entity);
    try {
      const count = await exportModuleRecordsCsv(entity, label);
      toast({ title: count ? `${label}: ${count} records exported` : `${label}: no records yet - empty register downloaded` });
    } catch (err) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusyEntity(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold"><ClipboardList className="h-4 w-4 text-brand" />Internal audit compliance report list</p>
          <p className="text-xs text-muted-foreground">Live record counts across every module - the evidence base for internal audits and the NDIS audit evidence map. Export any module's register, the branded audit list, or the full business audit report.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting || rows.length === 0}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Report CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={exporting || rows.length === 0}>
            <FileText className="mr-2 h-4 w-4" />
            Report PDF
          </Button>
          <Button size="sm" onClick={exportFullAudit} disabled={fullAudit || rows.length === 0}>
            {fullAudit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Full business audit
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Records on file</TableHead>
                  <TableHead className="text-right">Register export</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.entity}>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell>{r.count}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => exportModule(r.entity, r.label)} disabled={busyEntity === r.entity}>
                        {busyEntity === r.entity ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                        Export records
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}