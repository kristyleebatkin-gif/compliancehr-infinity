import React, { useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { HR_TEMPLATE_PLACEHOLDERS, mergeHrTemplate, hasUnresolvedTokens } from '@/lib/hrTemplateMerge';

const CATEGORIES = ['Letter', 'Form', 'Contract', 'Notice', 'Other'];

// Editor for HR library templates: write the letter body with {{placeholders}},
// preview it merged against a real staff member, then save it to the library.
export default function HrTemplateEditor({ open, template, staff, me, branding, onSaved, onClose }) {
  const isNew = !template;
  const [title, setTitle] = useState(template?.title || '');
  const [category, setCategory] = useState(template?.category || 'Letter');
  const [description, setDescription] = useState(template?.description || '');
  const [content, setContent] = useState(template?.content || '');
  const [previewId, setPreviewId] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef(null);
  const { toast } = useToast();

  const previewStaff = staff.find((s) => s.id === previewId) || null;
  const preview = useMemo(() => mergeHrTemplate(content, previewStaff, branding, me), [content, previewStaff, branding, me]);

  const insertToken = (token) => {
    const el = textareaRef.current;
    if (!el) { setContent((c) => `${c}${token}`); return; }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = `${content.slice(0, start)}${token}${content.slice(end)}`;
    setContent(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length); });
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      if (isNew) {
        await base44.entities.HrTemplate.create({ title: title.trim(), category, description: description.trim(), content, active: true });
      } else {
        await base44.entities.HrTemplate.update(template.id, { title: title.trim(), category, description: description.trim(), content });
      }
      toast({ title: isNew ? 'Template created' : 'Template updated' });
      onSaved();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setBusy(true);
    try {
      await base44.entities.HrTemplate.update(template.id, { active: false });
      toast({ title: 'Template removed from the library' });
      onSaved();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isNew ? 'New letter template' : 'Edit letter template'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Contract Variation Letter" />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Description (shown on the library card)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this template for?" />
            </div>
            <div className="grid gap-1.5">
              <Label>Template content</Label>
              <Textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="font-elegant" placeholder="Dear {{staff_name}}, ... blank lines start a new paragraph" />
            </div>
            <div className="grid gap-1.5">
              <Label>Placeholders — click to insert at the cursor</Label>
              <div className="flex flex-wrap gap-1.5">
                {HR_TEMPLATE_PLACEHOLDERS.map((p) => (
                  <button key={p.token} type="button" onClick={() => insertToken(p.token)} title={p.label}
                    className="rounded-md border border-border bg-brand/5 px-2 py-1 text-[11px] font-semibold text-brand hover:bg-brand/10">
                    {p.token}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Preview with staff member</Label>
              <Select value={previewId} onValueChange={setPreviewId}>
                <SelectTrigger><SelectValue placeholder="None — tokens stay as-is" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="h-[26rem] overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 font-elegant text-sm leading-relaxed">
              {preview || 'Start writing to see the live preview...'}
            </div>
            {hasUnresolvedTokens(preview) && (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Highlighted left in the preview: tokens with no matching data stay visible for manual entry at send time.</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save template</Button>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          {!isNew && (
            <Button variant="ghost" className="ml-auto text-danger hover:bg-danger/10" onClick={remove} disabled={busy}>
              <Trash2 className="h-4 w-4" />{confirmDelete ? 'Click again to confirm' : 'Remove from library'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}