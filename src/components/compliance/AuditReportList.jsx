import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadCsv } from '@/lib/csvExport';
import { DATA_MODULES } from '@/lib/dataModules';
import { ClipboardList, Download, Loader2, RefreshCw } from 'lucide-react';

/**
 * Internal audit compliance report: a live record count for every module in
 * the platform, exportable as the internal audit report list.
 */
export default function AuditReportList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold"><ClipboardList className="h-4 w-4 text-brand" />Internal audit compliance report list</p>
          <p className="text-xs text-muted-foreground">Live record counts across every module - the evidence base for internal audits and the NDIS audit evidence map.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button size="sm" onClick={exportCsv} disabled={exporting || rows.length === 0}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export report CSV
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.entity}>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell>{r.count}</TableCell>
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