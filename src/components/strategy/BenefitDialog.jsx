import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LinkedRecordsEditor from '@/components/strategy/LinkedRecordsEditor';
import { parseList } from '@/components/strategy/strategyKit';

const blank = () => ({
  objective_id: '', name: '', owner: '', unit: '', baseline_value: '', target_value: '', actual_value: '',
  valuation_method: 'Not valued', valuation_amount: '', realised_date: '', notes: '', evidence_refs: [],
});

/** A benefit carries its own baseline, target and actual, and the method used to value it. */
export default function BenefitDialog({ open, onOpenChange, benefit, objectives = [], meta = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!benefit) { setForm({ ...blank(), objective_id: objectives.length === 1 ? objectives[0].id : '' }); return; }
    setForm({
      objective_id: benefit.objective_id || '', name: benefit.name || '', owner: benefit.owner || '',
      unit: benefit.unit || '', baseline_value: benefit.baseline_value ?? '', target_value: benefit.target_value ?? '',
      actual_value: benefit.actual_value ?? '', valuation_method: benefit.valuation_method || 'Not valued',
      valuation_amount: benefit.valuation_amount ?? '', realised_date: benefit.realised_date || '',
      notes: benefit.notes || '', evidence_refs: parseList(benefit.evidence_refs_json),
    });
  }, [open, benefit, objectives]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const valued = form.valuation_method !== 'Not valued';
  const ready = form.objective_id && form.name.trim() && form.target_value !== ''
    && (!valued || (form.valuation_amount !== '' && Number(form.valuation_amount) >= 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{benefit ? `Edit ${benefit.name}` : 'Record a benefit'}</DialogTitle>
          <DialogDescription>
            Realisation comes from the actual measure against the baseline and target. The valuation amount is what a person assessed using the chosen method.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {!objectives.length && <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">Record an objective before adding a benefit.</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="benefit-objective">Objective</Label>
            <Select value={form.objective_id} onValueChange={(objective_id) => set({ objective_id })}>
              <SelectTrigger id="benefit-objective"><SelectValue placeholder="Choose an objective" /></SelectTrigger>
              <SelectContent>{objectives.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · {row.program_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="benefit-name">Benefit</Label>
            <Input id="benefit-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Hours returned to frontline care" />
          </div>
          <div>
            <Label htmlFor="benefit-owner">Owner</Label>
            <Input id="benefit-owner" value={form.owner} onChange={(e) => set({ owner: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="benefit-unit">Unit</Label>
            <Input id="benefit-unit" value={form.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="hours" />
          </div>
          <div>
            <Label htmlFor="benefit-realised">Realised on</Label>
            <Input id="benefit-realised" type="date" value={form.realised_date} onChange={(e) => set({ realised_date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="benefit-baseline">Baseline</Label>
            <Input id="benefit-baseline" type="number" value={form.baseline_value} onChange={(e) => set({ baseline_value: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="benefit-target">Target</Label>
            <Input id="benefit-target" type="number" value={form.target_value} onChange={(e) => set({ target_value: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="benefit-actual">Actual</Label>
            <Input id="benefit-actual" type="number" value={form.actual_value} onChange={(e) => set({ actual_value: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="benefit-method">Valuation method</Label>
            <Select value={form.valuation_method} onValueChange={(valuation_method) => set({ valuation_method, ...(valuation_method === 'Not valued' ? { valuation_amount: '' } : {}) })}>
              <SelectTrigger id="benefit-method"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.valuationMethods || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="benefit-amount">Valuation amount</Label>
            <Input id="benefit-amount" type="number" min="0" value={form.valuation_amount} onChange={(e) => set({ valuation_amount: e.target.value })} disabled={!valued} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="benefit-notes">Notes</Label>
            <Input id="benefit-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
          <LinkedRecordsEditor
            value={form.evidence_refs}
            registers={meta.linkedRegisters || []}
            onChange={(evidence_refs) => set({ evidence_refs })}
            label="Evidence behind the realised figure"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || !ready} onClick={() => onSave?.({ ...form, ...(benefit ? { benefit_id: benefit.id } : {}) })}>
            {busy ? 'Saving…' : benefit ? 'Save benefit' : 'Record benefit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}