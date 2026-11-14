import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { runGateAction } from './useJourneyGate';

/** Opens a new draft version. The approved record is never edited, so the released copy stays intact. */
export default function RevisionDialog({ document, onClose, onSaved }) {
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    const result = await runGateAction('start_revision', { document_id: document.document_id, change_summary: summary });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.message);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New draft of {document.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-[12px] text-muted-foreground">
            Approved version {document.version} stays released and unchanged. The new draft starts in Draft status and needs its own review and approval.
          </p>
          <div>
            <Label htmlFor="change_summary">What changes?</Label>
            <Textarea id="change_summary" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[12px] text-rose-800">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !summary.trim()}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Open draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}