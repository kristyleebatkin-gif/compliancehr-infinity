import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CHAIN_CATEGORIES, RISK_LEVELS } from '@/lib/approvalChain';

const EMPTY = { title: '', category: 'Expenditure', amount: '', risk_level: 'Medium', summary: '', due_date: '' };

// The number of levels is decided by the server from the category, amount and risk level,
// so the person raising the request cannot shorten their own approval path.
export default function NewApprovalChainDialog({ open, busy, error, onClose, onCreate }) {
  const [form, setForm] = useState({ ...EMPTY });
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const done = await onCreate({
      ...form,
      amount: form.amount === '' ? 0 : Number(form.amount),
    });
    if (done) setForm({ ...EMPTY });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise an approval request</DialogTitle>
          <DialogDescription>
            The engine picks the approval levels from the category, amount and risk. You can never decide one of your own requests.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="space-y-1">
            <Label htmlFor="chain-title">What needs approval</Label>
            <Input id="chain-title" required minLength={4} maxLength={160} value={form.title} onChange={(event) => set('title', event.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="chain-category">Category</Label>
              <select id="chain-category" value={form.category} onChange={(event) => set('category', event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                {(Array.isArray(CHAIN_CATEGORIES) ? CHAIN_CATEGORIES : []).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="chain-risk">Risk level</Label>
              <select id="chain-risk" value={form.risk_level} onChange={(event) => set('risk_level', event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                {RISK_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="chain-amount">Amount (if financial)</Label>
              <Input id="chain-amount" type="number" min="0" step="0.01" value={form.amount} onChange={(event) => set('amount', event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="chain-due">Decision needed by</Label>
              <Input id="chain-due" type="date" value={form.due_date} onChange={(event) => set('due_date', event.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="chain-summary">Context for the approvers</Label>
            <Textarea id="chain-summary" rows={3} maxLength={800} value={form.summary} onChange={(event) => set('summary', event.target.value)} />
          </div>
          {error && <p role="alert" className="rounded-lg border border-destructive/40 p-2 text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy || form.title.trim().length < 4}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}Start approval
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}