import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import OnlineDocumentFields from '@/components/documents/OnlineDocumentFields';

export default function OnlineDocumentRegister({ columns = [], rows, onChange, disabled }) {
  if (!columns.length) return null;
  return <section className="space-y-5">
    <h3 className="font-heading text-lg font-semibold">Register entries</h3>
    {!rows.length && <p className="text-sm text-muted-foreground">No entries yet. Add a row to record information in this register.</p>}
    {rows.map((row, index) => <div key={index} className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-semibold">Entry {index + 1}</h4>
        {!disabled && <Button type="button" size="sm" variant="ghost" aria-label={`Remove entry ${index + 1}`} onClick={() => onChange(rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" />Remove</Button>}
      </div>
      <OnlineDocumentFields fields={columns.map((label) => ({ label }))} answers={Object.fromEntries(columns.map((column, i) => [column, row[i] || '']))} disabled={disabled}
        onChange={(label, value) => onChange(rows.map((r, i) => i === index ? columns.map((c, j) => c === label ? value : (r[j] || '')) : r))} />
    </div>)}
    {!disabled && <Button type="button" variant="outline" disabled={rows.length >= 50} onClick={() => onChange([...rows, columns.map(() => '')])}><Plus className="h-4 w-4" />Add entry</Button>}
  </section>;
}