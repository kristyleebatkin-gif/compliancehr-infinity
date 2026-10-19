import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { today, appendLog } from '@/lib/complianceIssues.js';

export default function IssueResolveDialog({ issue, open, onOpenChange, onSaved, quick = false }) {
  const [form, setForm] = useState({ resolution_action: '', resolved_by: '', resolved_date: '', resolution_notes: '', verified_by: '' });
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (open && issue) {
      setMe(null);
      setForm({
        resolution_action: issue.resolution_action || '',
        resolved_by: '',
        resolved_date: today(),
        resolution_notes: issue.resolution_notes || '',
        verified_by: '',
      });
      base44.auth.me().then((u) => {
        setMe(u);
        setForm((f) => ({ ...f, resolved_by: f.resolved_by || u?.full_name || u?.email || '' }));
      }).catch(() => {});
    }
  }, [open, issue]);

  const save = async () => {
    if (!form.resolution_action.trim()) return;
    setSaving(true);
    try {
      const who = form.resolved_by.trim() || me?.full_name || me?.email || 'Compliance team';
      const when = form.resolved_date || today();
      await base44.entities.ComplianceIssue.update(issue.id, {
        status: 'Resolved',
        resolution_action: form.resolution_action,
        resolution_notes: form.resolution_notes,
        resolved_by: who,
        resolved_date: when,
        verified_by: form.verified_by.trim() || issue.verified_by || '',
        actions_log: appendLog(issue.actions_log, `${when} | ${who} | Resolved: ${form.resolution_action}`),
        status_log: appendLog(issue.status_log, `${when} — ${issue.status} → Resolved by ${who}`),
      });
      await base44.entities.StatusLog.create({
        entity_type: 'Compliance Issues',
        record_id: issue.issue_id || String(issue.id),
        record_title: issue.title,
        from_status: issue.status,
        to_status: 'Resolved',
        changed_by: who,
        notes: `Resolution: ${form.resolution_action}`,
      });
      onOpenChange(false);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{quick ? 'Quick resolve' : 'Record resolution'} — {issue?.title}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Resolution action taken *</Label>
            <Textarea rows={3} value={form.resolution_action} onChange={(e) => setForm({ ...form, resolution_action: e.target.value })} placeholder="What was done to fix this issue?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Resolved by</Label><Input value={form.resolved_by} onChange={(e) => setForm({ ...form, resolved_by: e.target.value })} placeholder="Who resolved it" /></div>
            <div className="grid gap-1.5"><Label>Resolved on</Label><Input type="date" value={form.resolved_date} onChange={(e) => setForm({ ...form, resolved_date: e.target.value })} /></div>
          </div>
          {!quick && <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={2} value={form.resolution_notes} onChange={(e) => setForm({ ...form, resolution_notes: e.target.value })} placeholder="Outcome, evidence or follow-up checks" /></div>}
          {!quick && <div className="grid gap-1.5"><Label>Verified by (optional)</Label><Input value={form.verified_by} onChange={(e) => setForm({ ...form, verified_by: e.target.value })} placeholder="Manager who checked the fix" /></div>}
          <Button onClick={save} disabled={saving || !form.resolution_action.trim()}>Save resolution</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}