import React, { useRef, useState } from 'react';
import { FileText, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRole } from '@/lib/useRole';
import ReportDocument from '@/components/reports/ReportDocument';
import { reportSources } from '@/components/reports/reportSources';
import { downloadReport, loadReportRecords, printReport } from '@/components/reports/reportOperations';

export default function ReportGenerator({ area, profile, restricted = false, isManager = false }) {
  const { user } = useRole();
  const sources = reportSources(area, { user, profile, restricted, isManager });
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reportRef = useRef(null);
  const source = sources.find((item) => item.id === selected) || sources[0];
  if (!source) return null;
  const generate = async () => {
    setLoading(true); setError(''); setReport(null);
    try {
      const records = await loadReportRecords(source);
      setReport({ title: source.label, columns: source.columns, records, generatedAt: new Date().toLocaleString('en-AU') });
    } catch (err) { setError(err?.message || 'Could not generate this report.'); }
    finally { setLoading(false); }
  };
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}><FileText className="h-4 w-4" />Generate report</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white text-workspace-navy sm:max-w-4xl">
          <DialogHeader><DialogTitle>Generate a report</DialogTitle><DialogDescription>Choose a record type, then generate a printable report.</DialogDescription></DialogHeader>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">Report type
              <select className="h-9 rounded-md border border-input bg-white px-3 text-workspace-navy" value={source.id} disabled={loading} onChange={(event) => { setSelected(event.target.value); setReport(null); setError(''); }}>
                {sources.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
              </select>
            </label>
            <Button type="button" size="sm" disabled={loading} onClick={generate}>{loading ? 'Generating…' : 'Generate report'}</Button>
            {report && <><Button type="button" variant="outline" size="sm" onClick={() => printReport(reportRef.current, report.title)}><Printer className="h-4 w-4" />Print / Save PDF</Button><Button type="button" variant="outline" size="sm" onClick={() => downloadReport(reportRef.current, report.title)}><Download className="h-4 w-4" />Download HTML</Button></>}
          </div>
          {loading && <p role="status" className="text-sm">Loading records…</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {report && <div className="overflow-x-auto rounded-lg border border-border"><ReportDocument ref={reportRef} report={report} /></div>}
        </DialogContent>
      </Dialog>
    </>
  );
}