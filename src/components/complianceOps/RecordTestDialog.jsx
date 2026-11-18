import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RESULTS = ['Pass', 'Partial', 'Fail', 'Not tested', 'Not applicable'];
const METHODS = ['Evidence review', 'Record inspection', 'Walkthrough', 'Re-performance', 'Interview', 'System output'];

/** @param {any} props */
export default function RecordTestDialog({ open, onOpenChange, controlOptions = [], evidenceOptions = [], saving, error, onSubmit } = {}) {
  const [controlId, setControlId] = useState('');
  const [result, setResult] = useState('Pass');
  const [method, setMethod] = useState('Evidence review');
  const [evidenceId, setEvidenceId] = useState('');
  const [notes, setNotes] = useState('');

  const reset = () => {
    setControlId('');
    setResult('Pass');
    setMethod('Evidence review');
    setEvidenceId('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange?.(next); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Record a control test</DialogTitle>
          <DialogDescription>
            Record what you tested and the evidence you used. The control's last-tested date moves to today.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="test-control">Control</Label>
            <Select value={controlId} onValueChange={setControlId}>
              <SelectTrigger id="test-control"><SelectValue placeholder="Choose a control" /></SelectTrigger>
              <SelectContent>
                {controlOptions.map((option) => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="test-result">Result</Label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger id="test-result"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESULTS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="test-method">Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="test-method"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METHODS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="test-evidence">Evidence used (optional)</Label>
            <Select value={evidenceId} onValueChange={setEvidenceId}>
              <SelectTrigger id="test-evidence"><SelectValue placeholder="No evidence selected" /></SelectTrigger>
              <SelectContent>
                {evidenceOptions.slice(0, 200).map((option) => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="test-notes">What did you find?</Label>
            <Textarea id="test-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          {error && <p className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange?.(false); }} disabled={saving}>Cancel</Button>
          <Button
            onClick={() => onSubmit?.({ control_id: controlId, result, test_method: method, evidence_id: evidenceId, notes })}
            disabled={saving || !controlId}
          >
            {saving ? 'Saving…' : 'Record test'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}