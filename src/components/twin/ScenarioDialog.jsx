import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const parse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value || '');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

/** @param {any} props */
export default function ScenarioDialog({ open, onOpenChange, scenario, models = [], catalogue = [], observations = {}, saving, error, onSave } = {}) {
  const editing = Boolean(scenario);
  const [modelId, setModelId] = useState('');
  const [form, setForm] = useState({ name: '', description: '', baseline_note: '' });
  const [levers, setLevers] = useState({});

  const usableModels = useMemo(
    () => models.filter((row) => ['Validated', 'Approved'].includes(row.status)),
    [models],
  );
  const model = editing ? models.find((row) => row.id === scenario.model_id) : usableModels.find((row) => row.id === modelId);
  const modelMetrics = model ? parse(model.metrics_json, []) : [];

  useEffect(() => {
    if (!open) return;
    setModelId(editing ? scenario.model_id : (usableModels[0]?.id || ''));
    setForm({
      name: scenario?.name || '',
      description: scenario?.description || '',
      baseline_note: scenario?.baseline_note || '',
    });
    const existing = scenario ? parse(scenario.levers_json, []) : [];
    setLevers(Object.fromEntries(existing.map((row) => [row.metric, { delta: row.delta ?? 0, rationale: row.rationale || '' }])));
  }, [open, scenario, editing, usableModels]);

  const patch = (key, field, value) => setLevers((current) => ({
    ...current,
    [key]: { delta: current[key]?.delta ?? 0, rationale: current[key]?.rationale || '', [field]: value },
  }));

  const submit = () => {
    const rows = modelMetrics
      .map((row) => {
        const entry = levers[row.metric];
        if (!entry || Number(entry.delta) === 0) return null;
        return { metric: row.metric, delta: Number(entry.delta), rationale: entry.rationale };
      })
      .filter(Boolean);
    onSave?.({ model_id: model?.id || '', ...form, levers: rows });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${scenario?.name}` : 'New scenario'}</DialogTitle>
          <DialogDescription>
            One lever per input, with the reason for it. A lever without a reason is a hidden assumption, so the twin will not accept it.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        {!usableModels.length && !editing ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            Validate a model first. A scenario needs a validated model to read its inputs from.
          </p>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {!editing && (
              <div>
                <Label htmlFor="twin-scenario-model">Model</Label>
                <Select value={modelId} onValueChange={setModelId}>
                  <SelectTrigger id="twin-scenario-model"><SelectValue placeholder="Choose a validated model" /></SelectTrigger>
                  <SelectContent>
                    {usableModels.map((row) => (
                      <SelectItem key={row.id} value={row.id}>{row.name} · v{row.version} ({row.status})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {editing && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#0A2B6D]">
                Model {model?.name} pinned at version {scenario?.model_version}. A later model change will not move this scenario.
              </p>
            )}

            <div>
              <Label htmlFor="twin-scenario-name">Scenario name</Label>
              <Input id="twin-scenario-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Evidence catch-up" />
            </div>
            <div>
              <Label htmlFor="twin-scenario-description">What this scenario tests</Label>
              <Textarea id="twin-scenario-description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Levers</p>
              <div className="mt-2 space-y-2">
                {modelMetrics.map((row) => {
                  const meta = catalogue.find((entry) => entry.key === row.metric);
                  const observed = observations?.metrics?.[row.metric];
                  const unit = meta?.unit === 'count' ? 'records' : 'points';
                  return (
                    <div key={row.metric} className="rounded-lg border border-slate-200 bg-white p-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#0A2B6D]">{meta?.label || row.metric}</p>
                        <p className="text-[11px] text-[#0A2B6D]/60">
                          observed now: {observed?.value === null || observed?.value === undefined ? 'no data' : observed.value}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-end gap-2">
                        <div className="w-28">
                          <Label className="text-[10px]">Change ({unit})</Label>
                          <Input
                            type="number"
                            value={levers[row.metric]?.delta ?? 0}
                            onChange={(e) => patch(row.metric, 'delta', e.target.value)}
                            aria-label={`Change to ${meta?.label || row.metric}`}
                          />
                        </div>
                        <div className="min-w-[180px] flex-1">
                          <Label className="text-[10px]">Why it moves</Label>
                          <Input
                            value={levers[row.metric]?.rationale || ''}
                            onChange={(e) => patch(row.metric, 'rationale', e.target.value)}
                            placeholder="What action produces this change?"
                            aria-label={`Reason for ${meta?.label || row.metric}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!modelMetrics.length && <p className="text-xs text-[#0A2B6D]/70">This model has no inputs recorded.</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="twin-scenario-baseline">Baseline note</Label>
              <Textarea
                id="twin-scenario-baseline"
                rows={2}
                value={form.baseline_note}
                onChange={(e) => setForm({ ...form, baseline_note: e.target.value })}
                placeholder="The baseline is what the registers hold today."
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving || (!editing && !usableModels.length)}>
            {saving ? 'Saving…' : editing ? 'Save scenario' : 'Create draft scenario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}