import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TYPES = ['Operational Governance', 'Clinical Governance', 'Financial', 'Strategic', 'Risk Acceptance', 'Workforce', 'Technology', 'Policy', 'Safeguarding', 'Regulatory Response'];
const LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const EMPTY = {
  title: '',
  decision_type: 'Operational Governance',
  priority: 'Medium',
  risk_level: 'Medium',
  owner: '',
  decision_maker: '',
  review_date: '',
  context: '',
  recommendation: '',
  outcome_target: '',
  standard_refs: '',
};

/** @param {any} props */
export default function DecisionFormDialog({ open, onOpenChange, onCreate, saving = false, error = '' } = {}) {
  const [form, setForm] = useState(EMPTY);
  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value?.target ? value.target.value : value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record a decision</DialogTitle>
          <DialogDescription>
            Capture what is being decided, who holds the authority and what the outcome should be. Evidence and outcome measures are added on the record itself.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="decision-title">Decision</Label>
            <Input id="decision-title" value={form.title} onChange={set('title')} placeholder="e.g. Approve the 2027 restrictive practice reduction plan" />
          </div>

          <div className="space-y-1.5">
            <Label>Decision type</Label>
            <Select value={form.decision_type} onValueChange={set('decision_type')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={set('priority')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEVELS.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Risk if wrong</Label>
            <Select value={form.risk_level} onValueChange={set('risk_level')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEVELS.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="decision-review">Next review date</Label>
            <Input id="decision-review" type="date" value={form.review_date} onChange={set('review_date')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="decision-owner">Accountable owner</Label>
            <Input id="decision-owner" value={form.owner} onChange={set('owner')} placeholder="Who owns delivery" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="decision-authority">Decision authority</Label>
            <Input id="decision-authority" value={form.decision_maker} onChange={set('decision_maker')} placeholder="Board, CEO, Clinical Lead" />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="decision-context">Context and trigger</Label>
            <Textarea id="decision-context" rows={3} value={form.context} onChange={set('context')} placeholder="What prompted this, and what was considered" />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="decision-recommendation">Recommendation</Label>
            <Textarea id="decision-recommendation" rows={2} value={form.recommendation} onChange={set('recommendation')} placeholder="What is being recommended and why" />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="decision-outcome">Outcome target</Label>
            <Input id="decision-outcome" value={form.outcome_target} onChange={set('outcome_target')} placeholder="The change this decision should produce" />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="decision-standards">Standards impacted</Label>
            <Input id="decision-standards" value={form.standard_refs} onChange={set('standard_refs')} placeholder="e.g. Core 1.1, ACQS 2" />
          </div>
        </div>

        {error && <p className="text-xs font-bold text-rose-700">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={saving || form.title.trim().length < 4} onClick={() => onCreate?.(form)}>
            {saving ? 'Saving…' : 'Record decision'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}