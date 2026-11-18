import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = () => ({
  name: '', sponsor: '', strategy_alignment: '', description: '', horizon: '', owner_role: '',
  objective_target: '', start_date: '', review_due: '', notes: '',
});

/** @param {any} props */
export default function PortfolioDialog({ open, onOpenChange, portfolio, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!portfolio) { setForm(blank()); return; }
    setForm({
      name: portfolio.name || '', sponsor: portfolio.sponsor || '', strategy_alignment: portfolio.strategy_alignment || '',
      description: portfolio.description || '', horizon: portfolio.horizon || '', owner_role: portfolio.owner_role || '',
      objective_target: portfolio.objective_target ?? '', start_date: portfolio.start_date || '',
      review_due: portfolio.review_due || '', notes: portfolio.notes || '',
    });
  }, [open, portfolio]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const ready = form.name.trim() && form.sponsor.trim() && form.strategy_alignment.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{portfolio ? `Edit ${portfolio.name}` : 'Record a portfolio'}</DialogTitle>
          <DialogDescription>
            A portfolio is the top of the strategy chain. Status changes that start or close work need a manager's approval.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="portfolio-name">Portfolio name</Label>
            <Input id="portfolio-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Quality and safeguarding uplift" />
          </div>
          <div>
            <Label htmlFor="portfolio-sponsor">Executive sponsor</Label>
            <Input id="portfolio-sponsor" value={form.sponsor} onChange={(e) => set({ sponsor: e.target.value })} placeholder="Who owns the outcome" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="portfolio-alignment">How this serves the strategy</Label>
            <Textarea id="portfolio-alignment" rows={2} value={form.strategy_alignment} onChange={(e) => set({ strategy_alignment: e.target.value })} placeholder="Link it to the published strategic priorities." />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="portfolio-description">What it covers</Label>
            <Textarea id="portfolio-description" rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="portfolio-horizon">Planning horizon</Label>
            <Input id="portfolio-horizon" value={form.horizon} onChange={(e) => set({ horizon: e.target.value })} placeholder="2026 to 2028" />
          </div>
          <div>
            <Label htmlFor="portfolio-owner">Portfolio owner</Label>
            <Input id="portfolio-owner" value={form.owner_role} onChange={(e) => set({ owner_role: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="portfolio-target">Objective target</Label>
            <Input id="portfolio-target" type="number" min="0" value={form.objective_target} onChange={(e) => set({ objective_target: e.target.value })} placeholder="How many objectives" />
          </div>
          <div>
            <Label htmlFor="portfolio-review">Strategy review due</Label>
            <Input id="portfolio-review" type="date" value={form.review_due} onChange={(e) => set({ review_due: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="portfolio-start">Start date</Label>
            <Input id="portfolio-start" type="date" value={form.start_date} onChange={(e) => set({ start_date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="portfolio-notes">Notes</Label>
            <Input id="portfolio-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || !ready} onClick={() => onSave?.({ ...form, ...(portfolio ? { portfolio_id: portfolio.id } : {}) })}>
            {busy ? 'Saving…' : portfolio ? 'Save portfolio' : 'Record portfolio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}