import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { exportControlledRecordAsPdf } from '@/lib/enterpriseGovernanceStandard';
import { CONTROLLED_REVIEW_FIELDS, controlledReviewRecord, parseReviewFields } from '@/lib/controlledReviewTemplates';

export default function TemplateGenerateDialog({ template, open, onOpenChange }) {
  const { toast } = useToast();
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState('');
  useEffect(() => { setValues({}); }, [template?.id, open]);
  const fields = parseReviewFields(template);
  const setValue = (label, value) => setValues((prev) => ({ ...prev, [label]: value }));
  const record = template ? controlledReviewRecord(template, values) : null;
  const generate = async (withValues) => {
    if (!template) return;
    setBusy(withValues ? 'completed' : 'blank');
    try {
      exportControlledRecordAsPdf(controlledReviewRecord(template, withValues ? values : {}));
      toast({ title: 'Controlled form generated', description: 'Generating a PDF does not approve or activate the template.' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Could not generate the form', variant: 'destructive' });
    } finally { setBusy(''); }
  };
  const renderField = (f, scope = 'subject') => (
    <div key={f.label} className="grid gap-1.5">
      <Label htmlFor={`review-${scope}-${encodeURIComponent(f.label)}`}>{f.label}</Label>
      {f.type === 'Long text' ? (
        <Textarea id={`review-${scope}-${encodeURIComponent(f.label)}`} rows={3} value={values[f.label] || ''} onChange={(e) => setValue(f.label, e.target.value)} />
      ) : f.type === 'Yes / No' ? (
        <Select value={values[f.label] || ''} onValueChange={(v) => setValue(f.label, v)}>
          <SelectTrigger id={`review-${scope}-${encodeURIComponent(f.label)}`}><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
        </Select>
      ) : <Input id={`review-${scope}-${encodeURIComponent(f.label)}`} type={f.type === 'Date' ? 'date' : 'text'} value={values[f.label] || ''} onChange={(e) => setValue(f.label, e.target.value)} />}
    </div>
  );
  const extra = (labels) => CONTROLLED_REVIEW_FIELDS.filter(([label]) => labels.includes(label)).map(([label, type]) => renderField({ label, type }, 'control'));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>1. Form header — {template?.title}</DialogTitle>
          <DialogDescription>11-section controlled form. Approval is recorded separately through F046.</DialogDescription>
        </DialogHeader>
        {record && <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="font-semibold">2. Document control</h3>
            <p className="text-sm">Document: {record.documentName} · Number: {record.documentNumber} · Record ID: {record.recordId} · Version: {record.versionNumber} · Status: {record.status} · Module: {record.module} · Category: {record.category}</p>
            <div className="grid gap-3 sm:grid-cols-2">{extra(['Document owner', 'Department', 'Created date', 'Modified date', 'Last review date', 'Next review date', 'Review frequency'])}</div>
            <p className="text-xs text-muted-foreground">Approver and approval date are in section 10. Leave unknown or unsigned details blank.</p>
          </section>
          <section><h3 className="font-semibold">3. Purpose</h3><p className="text-sm">{record.purpose}</p></section>
          <section><h3 className="font-semibold">4. Scope and instructions</h3><p className="text-sm">{record.scope}</p></section>
          <section><h3 className="font-semibold">5. Related documents</h3><p className="text-sm">{record.relatedDocuments.join(' · ')}</p></section>
          <section className="space-y-3"><h3 className="font-semibold">6. Main content</h3>{fields.map((field) => renderField(field))}</section>
          <section className="space-y-3"><h3 className="font-semibold">7. Evidence</h3>{extra(['Evidence references and findings'])}</section>
          <section className="space-y-3"><h3 className="font-semibold">8. Actions</h3>{extra(['Actions and responsible person'])}</section>
          <section className="space-y-3"><h3 className="font-semibold">9. Review</h3>{extra(['Reviewer', 'Review outcome', 'Review findings and recommendations'])}</section>
          <section className="space-y-3"><h3 className="font-semibold">10. Approval</h3>{extra(['Approver', 'Approval date', 'Approval notes and signature reference'])}<p className="text-xs text-muted-foreground">Typed names are not digital signatures. Complete the authorised approval workflow before activation.</p></section>
          <section><h3 className="font-semibold">11. Controlled footer</h3><p className="text-sm">{record.documentNumber} · v{record.versionNumber} · {record.status} · Page numbers appear in the PDF.</p></section>
        </div>}
        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => generate(false)} disabled={!!busy}><Download className="h-4 w-4" />Download blank form</Button>
          <Button onClick={() => generate(true)} disabled={!!busy}><FileCheck className="h-4 w-4" />Generate PDF with entered details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
