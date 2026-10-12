import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Trash2, UploadCloud } from 'lucide-react';
import { routeDocumentBatch } from '@/lib/documentRouting';

const DOC_TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Other'];

const GUESS_RULES = [
  [/\bcpr\b/i, 'CPR Certificate'],
  [/first.?aid/i, 'First Aid Certificate'],
  [/police/i, 'Police Check'],
  [/blue.?card/i, 'Blue Card'],
  [/screen/i, 'NDIS Worker Screening'],
  [/licen[cs]e|dl\b/i, "Driver's License"],
  [/qual|cert.*iv|diploma/i, 'Qualifications'],
  [/referee|reference/i, 'Reference Check'],
  [/contract|agreement/i, 'Contract'],
  [/resume|cv\b/i, 'Resume'],
];

const guessType = (filename) => {
  const match = GUESS_RULES.find(([pattern]) => pattern.test(filename));
  return match ? match[1] : 'Other';
};

export default function BulkUploadDocuments({ staff, onDone }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [employee, setEmployee] = useState('');
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []).map((file) => ({
      file,
      name: file.name,
      doc_type: guessType(file.name),
      expiry_date: '',
    }));
    setRows((current) => [...current, ...incoming]);
  };

  const updateRow = (index, updates) => setRows((current) => current.map((row, i) => (i === index ? { ...row, ...updates } : row)));

  const uploadAll = async () => {
    if (!employee || rows.length === 0) return;
    setBusy(true);
    try {
      const records = [];
      for (let i = 0; i < rows.length; i++) {
        setProgress(`Uploading ${i + 1} of ${rows.length}: ${rows[i].name}`);
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: rows[i].file });
        records.push({
          title: rows[i].name.replace(/\.[^.]+$/, ''),
          employee_name: employee,
          document_type: rows[i].doc_type,
          expiry_date: rows[i].expiry_date || '',
          status: 'Current',
          file_uri,
        });
      }
      await base44.entities.EmployeeDocument.bulkCreate(records);
      await routeDocumentBatch(records.map((r) => ({ ...r, id: `emp-${r.title}-${r.document_type}` })), { source: 'EmployeeDocument', person_name: employee, person_type: 'Employee' });
      toast({ title: `${records.length} documents added to ${employee}` });
      setRows([]);
      setEmployee('');
      setOpen(false);
      onDone?.();
    } catch (error) {
      toast({ title: 'Bulk upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><UploadCloud className="mr-2 h-4 w-4" /> Bulk upload</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Bulk upload employee documents</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Staff member *</Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
              <SelectContent>{staff.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <label className={`flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:bg-muted/40 ${busy ? 'pointer-events-none opacity-50' : ''}`}>
            <UploadCloud className="h-5 w-5" />
            Select one or more files
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.txt"
              className="hidden"
              disabled={busy}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
          </label>
          {rows.map((row, index) => (
            <div key={`${row.name}-${index}`} className="grid grid-cols-[minmax(0,1fr)_10rem_10rem_2rem] items-center gap-2 rounded-lg border border-border p-2">
              <span className="truncate text-sm" title={row.name}>{row.name}</span>
              <Select value={row.doc_type} onValueChange={(v) => updateRow(index, { doc_type: v })} disabled={busy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={row.expiry_date} onChange={(e) => updateRow(index, { expiry_date: e.target.value })} disabled={busy} />
              <Button variant="ghost" size="icon" disabled={busy} onClick={() => setRows((current) => current.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {busy && progress && <p className="text-xs text-muted-foreground">{progress}</p>}
          <Button onClick={uploadAll} disabled={busy || !employee || rows.length === 0}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload {rows.length || ''} {rows.length === 1 ? 'document' : 'documents'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}