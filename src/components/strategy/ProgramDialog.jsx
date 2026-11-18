import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const blank = () => ({ portfolio_id: '', name: '', purpose: '', sponsor: '', owner_role: '', start_date: '', target_date: '', notes: '' });

/** A program always belongs to one portfolio in this business. */
export default function ProgramDialog({ open, onOpenChange, program, portfolios = [], busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!program) { setForm({ ...blank(), portfolio_id: portfolios.length === 1 ? portfolios[0].id : '' }); return; }
    setForm({
      portfolio_id: program.portfolio_id || '', name: program.name || '', purpose: program.purpose || '',
      sponsor: program.sponsor || '', owner_role: program.owner_role || '',
      start_date: program.start_date || '', target_date: program.target_date || '', notes: program.notes || '',
    });
  }, [open, program, portfolios]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const ready = form.portfolio_id && form.name.trim() && form.sponsor.trim() && form.purpose.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{program ? `Edit ${program.name}` : 'Record a program'}</DialogTitle>
          <DialogDescription>A program turns a portfolio into a body of work. Its objectives roll up to the portfolio you choose here.</DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {!portfolios.length && <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">Record a portfolio before adding a program.</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="program-portfolio">Portfolio</Label>
            <Select value={form.portfolio_id} onValueChange={(portfolio_id) => set({ portfolio_id })}>
              <SelectTrigger id="program-portfolio"><SelectValue placeholder="Choose a portfolio" /></SelectTrigger>
              <SelectContent>{portfolios.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="program-name">Program name</Label>
            <Input id="program-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Practice assurance uplift" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="program-purpose">What this program changes</Label>
            <Textarea id="program-purpose" rows={2} value={form.purpose} onChange={(e) => set({ purpose: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="program-sponsor">Program sponsor</Label>
            <Input id="program-sponsor" value={form.sponsor} onChange={(e) => set({ sponsor: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="program-owner">Delivery owner</Label>
            <Input id="program-owner" value={form.owner_role} onChange={(e) => set({ owner_role: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="program-start">Start date</Label>
            <Input id="program-start" type="date" value={form.start_date} onChange={(e) => set({ start_date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="program-target">Target date</Label>
            <Input id="program-target" type="date" value={form.target_date} onChange={(e) => set({ target_date: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="program-notes">Notes</Label>
            <Input id="program-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || !ready} onClick={() => onSave?.({ ...form, ...(program ? { program_id: program.id } : {}) })}>
            {busy ? 'Saving…' : program ? 'Save program' : 'Record program'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}