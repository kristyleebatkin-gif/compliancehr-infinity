import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * References to the source registers. This stores which record is meant, never a copy of it.
 * @param {any} props
 */
export default function LinkedRecordsEditor({ value = [], registers = [], onChange, label = 'Linked records' } = {}) {
  const rows = Array.isArray(value) ? value : [];
  const update = (index, patch) => onChange?.(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const add = () => onChange?.([...rows, { register: registers[0] || '', record_id: '', reference: '', label: '' }]);
  const remove = (index) => onChange?.(rows.filter((_, i) => i !== index));

  return (
    <div className="sm:col-span-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#0A2B6D]">{label}</p>
        <Button type="button" size="sm" variant="ghost" onClick={add}><Plus className="h-3.5 w-3.5" /> Add reference</Button>
      </div>
      <p className="text-[11px] text-[#0A2B6D]/60">Point at a decision, risk, control, evidence, workflow or AI recommendation. The source register keeps the record.</p>
      {!rows.length ? (
        <p className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] text-[#0A2B6D]/60">No linked record.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {rows.map((row, index) => (
            <div key={`link-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Select value={row.register || ''} onValueChange={(register) => update(index, { register })}>
                <SelectTrigger aria-label="Source register"><SelectValue placeholder="Register" /></SelectTrigger>
                <SelectContent>{registers.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={row.record_id || ''} onChange={(e) => update(index, { record_id: e.target.value })} placeholder="Source record id" aria-label="Source record id" />
              <Input value={row.label || ''} onChange={(e) => update(index, { label: e.target.value })} placeholder="What it shows" aria-label="What it shows" />
              <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)} aria-label="Remove reference"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}