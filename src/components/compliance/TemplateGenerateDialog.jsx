import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { downloadBrandedTemplatePdf } from '@/lib/officialFormTemplates';

// Fill in a template's fields and generate the branded review form PDF
// (blank download or a completed copy) without starting from scratch.
export default function TemplateGenerateDialog({ template, open, onOpenChange }) {
  const { toast } = useToast();
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState('');

  const fields = (() => {
    try { return JSON.parse(template?.fields_schema || '[]'); } catch { return []; }
  })();
  const todayStr = new Date().toISOString().slice(0, 10);
  const setValue = (label, v) => setValues((prev) => ({ ...prev, [label]: v }));

  const generate = async (withValues) => {
    setBusy(withValues ? 'completed' : 'blank');
    try {
      await downloadBrandedTemplatePdf({
        title: template.title,
        code: `RFT-${(template.id || '').slice(-6).toUpperCase()}`,
        subtitle: template.category,
        purpose: [template.description, template.instructions].filter(Boolean).join(' '),
        fields: fields.map((f) => f.label),
        values: withValues ? { ...values, 'Date of review': values['Date of review'] || todayStr } : {},
        declaration: true,
        signoff: [['Reviewed by (Signature)', 'Date'], ['Approved by (Manager)', 'Date']],
      });
      toast({ title: withValues ? 'Completed form generated' : 'Blank form downloaded', description: template.title });
      onOpenChange(false);
    } catch {
      toast({ title: 'Could not generate the form', variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate: {template.title}</DialogTitle>
          <DialogDescription>Fill in the fields below, or download the blank branded form to complete by hand.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {fields.map((f) => (
            <div key={f.label} className="grid gap-1.5">
              <Label>{f.label}</Label>
              {f.type === 'Long text' ? (
                <Textarea rows={3} value={values[f.label] || ''} onChange={(e) => setValue(f.label, e.target.value)} />
              ) : f.type === 'Yes / No' ? (
                <Select value={values[f.label] || ''} onValueChange={(v) => setValue(f.label, v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type === 'Date' ? 'date' : 'text'}
                  value={values[f.label] || ''}
                  onChange={(e) => setValue(f.label, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => generate(false)} disabled={!!busy}>
            <Download className="h-4 w-4" /> {busy === 'blank' ? 'Downloading…' : 'Download blank form'}
          </Button>
          <Button onClick={() => generate(true)} disabled={!!busy}>
            <FileCheck className="h-4 w-4" /> {busy === 'completed' ? 'Generating…' : 'Generate completed PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}