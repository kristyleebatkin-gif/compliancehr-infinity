import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { downloadCsv } from '@/lib/csvExport';
import { Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';

const TEMPLATE_COLUMNS = [
  { key: 'applicant_name', label: 'Full Name' },
  { key: 'preferred_name', label: 'Preferred Name' },
  { key: 'date_of_birth', label: 'Date of Birth' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'ndis_number', label: 'NDIS Number' },
  { key: 'ndis_reference_number', label: 'NDIS Reference Number' },
  { key: 'primary_contact', label: 'Primary Contact / Nominee' },
  { key: 'communication_needs', label: 'Communication and Accessibility Needs' },
  { key: 'requested_supports', label: 'Requested Supports' },
  { key: 'reason_for_referral', label: 'Reason for Referral' },
  { key: 'emergency_contact', label: 'Emergency Contact' },
  { key: 'medical_diagnosis', label: 'Medical Diagnosis' },
  { key: 'medications_dosage', label: 'Medications and Dosage' },
  { key: 'plan_type', label: 'Plan Type' },
  { key: 'plan_start_date', label: 'Plan Start Date' },
  { key: 'plan_end_date', label: 'Plan End Date' },
  { key: 'support_coordinator', label: 'Support Coordinator' },
  { key: 'referral_date', label: 'Referral Date' },
  { key: 'target_start_date', label: 'Proposed Start Date' },
  { key: 'status', label: 'Status' },
  { key: 'assigned_to', label: 'Intake Owner' },
  { key: 'notes', label: 'Notes' },
];

export default function IntakeBulkImport({ intakeType, onImported }) {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  if (!isAdmin) return null;

  const downloadTemplate = () => {
    downloadCsv(`${intakeType.toLowerCase()}-intake-import-template.csv`, TEMPLATE_COLUMNS, [
      { applicant_name: 'Example Participant', preferred_name: '', date_of_birth: '2000-01-01', email: 'example@example.com', phone: '', address: '', ndis_number: '', ndis_reference_number: '', primary_contact: '', communication_needs: '', requested_supports: '', reason_for_referral: '', emergency_contact: '', medical_diagnosis: '', medications_dosage: '', plan_type: 'Plan Managed', plan_start_date: '', plan_end_date: '', support_coordinator: '', referral_date: '', target_start_date: '', status: 'Draft', assigned_to: '', notes: '' },
    ]);
  };

  const importFile = async () => {
    if (!file) {
      toast({ title: 'Choose a spreadsheet first', variant: 'destructive' });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
      const response = await base44.functions.invoke('intakeBulkImport', { file_url: signed_url, intake_type: intakeType });
      const data = response.data || {};
      setResult(data);
      if (data.created > 0) {
        toast({ title: 'Import complete', description: `${data.created} intake case(s) created.` });
        onImported?.();
      } else {
        toast({ title: 'Nothing imported', description: 'No new rows could be imported. Check the skipped rows below.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Import failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" /> Import from spreadsheet
      </Button>
      <Dialog open={open} onOpenChange={(next) => { if (!busy) { setOpen(next); if (!next) setResult(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk import {intakeType.toLowerCase()} intake records</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel spreadsheet of participants and each row becomes an intake case. Download the template first so the column headings match.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download template spreadsheet
            </Button>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Spreadsheet (CSV or Excel)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                disabled={busy}
                onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); }}
                className="w-full cursor-pointer rounded-md border border-input bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
              {file && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> {file.name}
                </p>
              )}
            </div>
            {result && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <p className="font-semibold">{result.created} imported</p>
                {(result.skipped || []).length > 0 && (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                    {result.skipped.map((item, index) => (
                      <li key={index}>Row {item.row}: {item.reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Close</Button>
            <Button onClick={importFile} disabled={busy || !file}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Import records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}