import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TYPES = [
  'Scheduled assurance pass', 'Manual assessment', 'Pre-audit readiness', 'Post-incident review',
  'Certification readiness',
];

/** @param {any} props */
export default function RunAssessmentDialog({ open, onOpenChange, frameworks = [], saving, error, onRun } = {}) {
  const [framework, setFramework] = useState('');
  const [type, setType] = useState('Manual assessment');
  const chosen = framework || frameworks[0] || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run an assessment</DialogTitle>
          <DialogDescription>
            Every active control in the framework is tested against the evidence you hold. A gap is raised wherever coverage is missing or stale.
          </DialogDescription>
        </DialogHeader>

        {!frameworks.length ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            No framework has standards or controls recorded yet. Load them into the frameworks register first; the assessment will not invent coverage.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="run-framework">Framework</Label>
              <Select value={chosen} onValueChange={setFramework}>
                <SelectTrigger id="run-framework"><SelectValue placeholder="Choose a framework" /></SelectTrigger>
                <SelectContent>
                  {frameworks.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="run-type">Assessment type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="run-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>Cancel</Button>
          <Button
            onClick={() => onRun?.({ framework: chosen, assessment_type: type })}
            disabled={saving || !frameworks.length || !chosen}
          >
            {saving ? 'Assessing…' : 'Run assessment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}