import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export const FIELD_TYPES = ['Text', 'Long text', 'Date', 'Yes / No'];
export const CATEGORIES = [
  'Compliance Review', 'File Audit', 'Details Check', 'Incident', 'Intake', 'Consent',
  'Medication', 'Risk Assessment', 'Service Agreement', 'Feedback', 'Other',
];

// Create / edit dialog for a review form template stored on the FormTemplate entity.
export default function TemplateEditorDialog({ open, onOpenChange, template, onSaved }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Compliance Review');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [fields, setFields] = useState([{ label: '', type: 'Text' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(template?.title || '');
    setCategory(template?.category || 'Compliance Review');
    setDescription(template?.description || '');
    setInstructions(template?.instructions || '');
    let parsed = [];
    try { parsed = JSON.parse(template?.fields_schema || '[]'); } catch { parsed = []; }
    setFields(parsed.length ? parsed.map((f) => ({ label: f.label || '', type: FIELD_TYPES.includes(f.type) ? f.type : 'Text' })) : [{ label: '', type: 'Text' }]);
  }, [open, template]);

  const save = async () => {
    if (!title.trim()) { toast({ title: 'Give the template a title', variant: 'destructive' }); return; }
    const clean = fields.filter((f) => f.label.trim());
    if (!clean.length) { toast({ title: 'Add at least one field', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        instructions: instructions.trim(),
        fields_schema: JSON.stringify(clean),
        status: 'Active',
        created_by: user?.full_name || '',
      };
      if (template) await base44.entities.FormTemplate.update(template.id, payload);
      else await base44.entities.FormTemplate.create(payload);
      toast({ title: template ? 'Template updated' : 'Template created', description: title.trim() });
      onOpenChange(false);
      if (onSaved) onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit template' : 'New review form template'}</DialogTitle>
          <DialogDescription>Define the standard sections and fields; every generated form keeps this structure.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="tpl-title">Template title</Label>
            <Input id="tpl-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Staff File Review" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="tpl-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="tpl-category"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="tpl-desc">Purpose / description</Label>
            <Textarea id="tpl-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Shown at the top of the generated form" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="tpl-inst">Instructions</Label>
            <Textarea id="tpl-inst" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="How the person completing the form should use it" />
          </div>
          <div className="grid gap-2">
            <Label>Form fields</Label>
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={f.label}
                  onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  placeholder={`Field ${i + 1} label`}
                  className="flex-1"
                />
                <Select value={f.type} onValueChange={(v) => setFields(fields.map((x, j) => (j === i ? { ...x, type: v } : x)))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{FIELD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => setFields(fields.filter((_, j) => j !== i))} aria-label="Remove field">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-fit" onClick={() => setFields([...fields, { label: '', type: 'Text' }])}>
              <Plus className="h-4 w-4" /> Add field
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save template'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}