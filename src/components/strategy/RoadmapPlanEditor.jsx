import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const nextKey = (rows) => `INIT-${rows.length + 1}`;

/** Initiatives, their dependencies and milestones. Every initiative carries its own version. */
export default function RoadmapPlanEditor({ value = {}, meta = {}, onChange } = {}) {
  const initiatives = value.initiatives || [];
  const dependencies = value.dependencies || [];
  const milestones = value.milestones || [];
  const keys = initiatives.map((row) => row.key).filter(Boolean);

  const emit = (patch) => onChange?.({ initiatives, dependencies, milestones, ...patch });
  const patchInitiative = (index, change) => emit({ initiatives: initiatives.map((row, i) => (i === index ? { ...row, ...change } : row)) });

  return (
    <div className="sm:col-span-2 space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#0A2B6D]">Initiatives</p>
          <Button type="button" size="sm" variant="ghost" onClick={() => emit({ initiatives: [...initiatives, { key: nextKey(initiatives), name: '', owner: '', due_date: '', status: 'Planned', version: 1 }] })}>
            <Plus className="h-3.5 w-3.5" /> Add initiative
          </Button>
        </div>
        {!initiatives.length ? (
          <p className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] text-[#0A2B6D]/60">No initiative yet. A roadmap needs at least one.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {initiatives.map((row, index) => (
              <div key={`initiative-${index}`} className="grid gap-2 sm:grid-cols-[90px_1fr_1fr_140px_140px_70px_auto]">
                <Input value={row.key || ''} onChange={(e) => patchInitiative(index, { key: e.target.value })} placeholder="Key" aria-label="Initiative key" />
                <Input value={row.name || ''} onChange={(e) => patchInitiative(index, { name: e.target.value })} placeholder="Initiative" aria-label="Initiative name" />
                <Input value={row.owner || ''} onChange={(e) => patchInitiative(index, { owner: e.target.value })} placeholder="Owner" aria-label="Initiative owner" />
                <Input type="date" value={row.due_date || ''} onChange={(e) => patchInitiative(index, { due_date: e.target.value })} aria-label="Initiative due date" />
                <Select value={row.status || 'Planned'} onValueChange={(status) => patchInitiative(index, { status })}>
                  <SelectTrigger aria-label="Initiative status"><SelectValue /></SelectTrigger>
                  <SelectContent>{(meta.initiativeStatuses || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" min="1" value={row.version ?? 1} onChange={(e) => patchInitiative(index, { version: e.target.value })} aria-label="Initiative version" />
                <Button type="button" size="icon" variant="ghost" onClick={() => emit({ initiatives: initiatives.filter((_, i) => i !== index) })} aria-label="Remove initiative"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#0A2B6D]">Dependencies</p>
          <Button type="button" size="sm" variant="ghost" onClick={() => emit({ dependencies: [...dependencies, { from: keys[0] || '', to: keys[1] || '', reason: '' }] })}>
            <Plus className="h-3.5 w-3.5" /> Add dependency
          </Button>
        </div>
        {!dependencies.length ? (
          <p className="mt-2 text-[11px] text-[#0A2B6D]/60">No dependency recorded.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {dependencies.map((row, index) => (
              <div key={`dependency-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]">
                <Select value={row.from || ''} onValueChange={(from) => emit({ dependencies: dependencies.map((item, i) => (i === index ? { ...item, from } : item)) })}>
                  <SelectTrigger aria-label="Depends from"><SelectValue placeholder="From" /></SelectTrigger>
                  <SelectContent>{keys.map((key) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={row.to || ''} onValueChange={(to) => emit({ dependencies: dependencies.map((item, i) => (i === index ? { ...item, to } : item)) })}>
                  <SelectTrigger aria-label="Depends on"><SelectValue placeholder="To" /></SelectTrigger>
                  <SelectContent>{keys.map((key) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={row.reason || ''} onChange={(e) => emit({ dependencies: dependencies.map((item, i) => (i === index ? { ...item, reason: e.target.value } : item)) })} placeholder="Why" aria-label="Dependency reason" />
                <Button type="button" size="icon" variant="ghost" onClick={() => emit({ dependencies: dependencies.filter((_, i) => i !== index) })} aria-label="Remove dependency"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#0A2B6D]">Milestones</p>
          <Button type="button" size="sm" variant="ghost" onClick={() => emit({ milestones: [...milestones, { name: '', due_date: '', status: 'Planned' }] })}>
            <Plus className="h-3.5 w-3.5" /> Add milestone
          </Button>
        </div>
        {!milestones.length ? (
          <p className="mt-2 text-[11px] text-[#0A2B6D]/60">No milestone recorded.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {milestones.map((row, index) => (
              <div key={`milestone-${index}`} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <Input value={row.name || ''} onChange={(e) => emit({ milestones: milestones.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)) })} placeholder="Milestone" aria-label="Milestone name" />
                <Input type="date" value={row.due_date || ''} onChange={(e) => emit({ milestones: milestones.map((item, i) => (i === index ? { ...item, due_date: e.target.value } : item)) })} aria-label="Milestone due date" />
                <Select value={row.status || 'Planned'} onValueChange={(status) => emit({ milestones: milestones.map((item, i) => (i === index ? { ...item, status } : item)) })}>
                  <SelectTrigger aria-label="Milestone status"><SelectValue /></SelectTrigger>
                  <SelectContent>{(meta.milestoneStatuses || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" size="icon" variant="ghost" onClick={() => emit({ milestones: milestones.filter((_, i) => i !== index) })} aria-label="Remove milestone"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}