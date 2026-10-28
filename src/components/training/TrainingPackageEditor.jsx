import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { TRAINING_PACKAGE_PREFIX, TRAINING_PACKAGE_SECTIONS, readTrainingPackage, trainingPackageText } from '@/lib/trainingPackage';

const fresh = () => ({
  name: '', role: 'Support Worker', summary: '', revision: '1.0', status: 'Draft',
  reviewer: '', reviewedDate: '', reviewDate: '', sections: {},
});
const AUTHOR_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];

export default function TrainingPackageEditor({ templates = [], onSaved }) {
  const { user } = useRole();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(fresh);
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const canAuthor = AUTHOR_ROLES.includes(user?.role);
  const packages = templates.filter((template) => readTrainingPackage(template.description));
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const edit = (template) => {
    const data = readTrainingPackage(template?.description);
    setEditingId(template?.id || null);
    setForm(data ? { ...fresh(), ...data, name: template.name, role: template.role } : fresh());
    setOpen(true);
  };
  const save = async () => {
    if (!canAuthor || lock.current || !form.name.trim()) return;
    const missing = TRAINING_PACKAGE_SECTIONS.filter(([key]) => !form.sections[key]?.trim());
    if (form.status === 'Reviewed for use' && (missing.length || !form.reviewer.trim() || !form.reviewedDate || !form.reviewDate)) {
      toast({ title: 'Complete the review requirements', description: 'Every package section, reviewer, review date and next review date are required.', variant: 'destructive' });
      return;
    }
    if (form.reviewDate && form.reviewedDate && form.reviewDate <= form.reviewedDate) {
      toast({ title: 'Next review must be after the review date', variant: 'destructive' });
      return;
    }
    lock.current = true; setSaving(true);
    try {
      const record = {
        name: form.name.trim(), role: form.role,
        description: TRAINING_PACKAGE_PREFIX + JSON.stringify({ ...form, version: 1, authorId: user.id, savedAt: new Date().toISOString() }),
        module_titles: form.name.trim(),
      };
      const saved = editingId
        ? await base44.entities.TrainingTemplate.update(editingId, record)
        : await base44.entities.TrainingTemplate.create(record);
      if (!saved?.id) throw new Error('The save was not confirmed.');
      setOpen(false);
      toast({ title: 'Training package saved', description: 'No completion, competency or certificate was created.' });
      await onSaved?.();
    } catch (error) {
      toast({ title: 'Could not save package', description: error.message, variant: 'destructive' });
    } finally { lock.current = false; setSaving(false); }
  };
  const download = (template) => {
    const blob = new Blob([trainingPackageText(template)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url;
    anchor.download = template.name.replace(/[^a-z0-9-]/gi, '-') + '-training-package.md';
    anchor.click(); URL.revokeObjectURL(url);
  };
  return <section className="space-y-4 rounded-2xl border border-[#C084FC] bg-[#F6F0FF] p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-3xl space-y-2">
        <p className="text-base font-bold text-[#0A2B6D]">Build your own training packages</p>
        <p className="text-sm leading-6 text-[#0A2B6D]">Create reusable learner guides, session plans, knowledge checks, practical assessments and evidence requirements using your own policies. This editor does not call AI or buy external courses.</p>
        <p className="text-sm leading-6 text-[#5A00D6]">Packages stay in draft until reviewed. Internal learning does not replace required qualifications, the NDIS worker orientation program or participant-specific specialist training.</p>
      </div>
      {canAuthor && <Button type="button" className="min-h-[44px]" onClick={() => edit(null)}>Create training package</Button>}
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      {packages.map((template) => {
        const pack = readTrainingPackage(template.description);
        return <div key={template.id} className="space-y-3 rounded-xl border border-[#C084FC] bg-white p-4">
          <p className="text-base font-semibold text-[#0A2B6D]">{template.name}</p>
          <p className="text-sm text-[#5A00D6]">{pack.status} · Version {pack.revision} · Next review: {pack.reviewDate || 'Not set'}</p>
          <div className="flex flex-wrap gap-2">
            {canAuthor && <Button type="button" variant="outline" className="min-h-[44px]" onClick={() => edit(template)}>Edit package</Button>}
            <Button type="button" variant="outline" className="min-h-[44px]" onClick={() => download(template)}>Download package</Button>
          </div>
          <details><summary className="cursor-pointer py-2 text-sm font-semibold text-[#5A00D6]">Read package</summary>
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[#0A2B6D]">{trainingPackageText(template)}</pre>
          </details>
        </div>;
      })}
    </div>
    <details className="rounded-xl bg-white p-3"><summary className="cursor-pointer py-2 text-sm font-semibold text-[#0A2B6D]">Official training and capability references</summary>
      <ul className="space-y-2 p-3 text-sm text-[#5A00D6]">
        <li><a href="https://www.ndiscommission.gov.au/workforce/online-training-modules" target="_blank" rel="noreferrer">NDIS Commission worker training modules</a></li>
        <li><a href="https://www.ndiscommission.gov.au/workforce/training-workers/guide-for-ndis-providers/training-your-workers" target="_blank" rel="noreferrer">Training your workers and workforce capability guidance</a></li>
      </ul>
    </details>
    <Dialog open={open} onOpenChange={(value) => { if (!saving) setOpen(value); }}>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>{editingId ? 'Edit training package' : 'Create training package'}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">Package name<Input value={form.name} onChange={(event) => update('name', event.target.value)} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Role<select className="min-h-[44px] rounded-xl border bg-white px-3" value={form.role} onChange={(event) => update('role', event.target.value)}>
              {['Support Worker', 'Team Leader', 'Compliance Manager', 'Administration', 'Management'].map((role) => <option key={role}>{role}</option>)}
            </select></label>
            <label className="grid gap-2 text-sm font-semibold">Version<Input value={form.revision} onChange={(event) => update('revision', event.target.value)} /></label>
          </div>
          <label className="grid gap-2 text-sm font-semibold">Short description<Textarea value={form.summary} onChange={(event) => update('summary', event.target.value)} /></label>
          {TRAINING_PACKAGE_SECTIONS.map(([key, label]) => <label key={key} className="grid gap-2 text-sm font-semibold">{label}
            <Textarea rows={6} value={form.sections[key] || ''} onChange={(event) => update('sections', { ...form.sections, [key]: event.target.value })} placeholder="Add your provider-specific content, instructions, examples and source references." />
          </label>)}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Status<select className="min-h-[44px] rounded-xl border bg-white px-3" value={form.status} onChange={(event) => update('status', event.target.value)}>
              <option>Draft</option><option>Reviewed for use</option><option>Needs revision</option>
            </select></label>
            <label className="grid gap-2 text-sm font-semibold">Reviewer<Input value={form.reviewer} onChange={(event) => update('reviewer', event.target.value)} /></label>
            <label className="grid gap-2 text-sm font-semibold">Review date<Input type="date" value={form.reviewedDate} onChange={(event) => update('reviewedDate', event.target.value)} /></label>
            <label className="grid gap-2 text-sm font-semibold">Next review<Input type="date" value={form.reviewDate} onChange={(event) => update('reviewDate', event.target.value)} /></label>
          </div>
          <Button type="button" className="min-h-[48px]" disabled={saving || !form.name.trim()} onClick={save}>{saving ? 'Saving…' : 'Save training package'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </section>;
}
