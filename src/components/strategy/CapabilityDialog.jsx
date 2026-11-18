import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LinkedRecordsEditor from '@/components/strategy/LinkedRecordsEditor';
import { parseList } from '@/components/strategy/strategyKit';

const blank = () => ({
  name: '', domain: '', owner: '', current_maturity: '1', target_maturity: '3',
  evidence_basis: '', review_due: '', notes: '', control_refs: [],
});

/** @param {any} props */
export default function CapabilityDialog({ open, onOpenChange, capability, meta = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!capability) { setForm(blank()); return; }
    setForm({
      name: capability.name || '', domain: capability.domain || '', owner: capability.owner || '',
      current_maturity: String(capability.current_maturity ?? 1), target_maturity: String(capability.target_maturity ?? 3),
      evidence_basis: capability.evidence_basis || '', review_due: capability.review_due || '',
      notes: capability.notes || '', control_refs: parseList(capability.control_refs_json),
    });
  }, [open, capability]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const levels = meta.maturityLevels || [];
  const ready = form.name.trim() && form.owner.trim() && form.evidence_basis.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{capability ? `Edit ${capability.name}` : 'Record a capability'}</DialogTitle>
          <DialogDescription>
            The declared maturity is what the organisation records today. A validated assessment replaces it in the rollup, and only an assessment with evidence references counts as evidence backed.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="capability-name">Capability</Label>
            <Input id="capability-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Incident investigation" />
          </div>
          <div>
            <Label htmlFor="capability-domain">Domain</Label>
            <Input id="capability-domain" value={form.domain} onChange={(e) => set({ domain: e.target.value })} placeholder="Quality and safeguarding" />
          </div>
          <div>
            <Label htmlFor="capability-owner">Owner</Label>
            <Input id="capability-owner" value={form.owner} onChange={(e) => set({ owner: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="capability-review">Maturity review due</Label>
            <Input id="capability-review" type="date" value={form.review_due} onChange={(e) => set({ review_due: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="capability-current">Current maturity</Label>
            <Select value={form.current_maturity} onValueChange={(current_maturity) => set({ current_maturity })}>
              <SelectTrigger id="capability-current"><SelectValue /></SelectTrigger>
              <SelectContent>{levels.map((row) => <SelectItem key={row.score} value={String(row.score)}>{row.score} · {row.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="capability-target">Target maturity</Label>
            <Select value={form.target_maturity} onValueChange={(target_maturity) => set({ target_maturity })}>
              <SelectTrigger id="capability-target"><SelectValue /></SelectTrigger>
              <SelectContent>{levels.map((row) => <SelectItem key={row.score} value={String(row.score)}>{row.score} · {row.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="capability-basis">Evidence basis</Label>
            <Textarea id="capability-basis" rows={2} value={form.evidence_basis} onChange={(e) => set({ evidence_basis: e.target.value })} placeholder="What this judgement rests on today." />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="capability-notes">Notes</Label>
            <Input id="capability-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
          <LinkedRecordsEditor
            value={form.control_refs}
            registers={meta.linkedRegisters || []}
            onChange={(control_refs) => set({ control_refs })}
            label="Linked controls and evidence"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || !ready} onClick={() => onSave?.({ ...form, ...(capability ? { capability_id: capability.id } : {}) })}>
            {busy ? 'Saving…' : capability ? 'Save capability' : 'Record capability'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}