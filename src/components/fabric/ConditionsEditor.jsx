import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OPS = ['equals', 'not_equals', 'contains', 'exists', 'in', 'gt', 'gte', 'lt', 'lte'];

/** Ordered conditions on payload fields. Every condition must pass for the rule to match. */
export default function ConditionsEditor({ value = [], onChange } = {}) {
  const update = (index, patch) => onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  return (
    <div className="space-y-2">
      {value.map((condition, index) => (
        <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
          <Input
            value={condition.field || ''}
            placeholder="payload field, e.g. severity"
            onChange={(event) => update(index, { field: event.target.value })}
          />
          <Select value={condition.op || 'equals'} onValueChange={(op) => update(index, { op })}>
            <SelectTrigger className="sm:w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>{OPS.map((op) => <SelectItem key={op} value={op}>{op}</SelectItem>)}</SelectContent>
          </Select>
          <Input
            value={condition.value ?? ''}
            placeholder={condition.op === 'in' ? 'one, two, three' : condition.op === 'exists' ? 'true or false' : 'value'}
            onChange={(event) => update(index, { value: event.target.value })}
          />
          <Button type="button" size="icon" variant="ghost" onClick={() => onChange(value.filter((_, i) => i !== index))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...value, { field: '', op: 'equals', value: '' }])}>
        <Plus className="h-3.5 w-3.5" /> Add condition
      </Button>
      <p className="text-[11px] text-[#0A2B6D]/60">No conditions means every event of this type matches.</p>
    </div>
  );
}