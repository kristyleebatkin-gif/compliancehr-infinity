import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EmployeeFormTable({ columns, rows, onChange, readOnly }) {
  const id = useId();
  return <div className="min-w-0 space-y-2">
    {!rows.length && <p className="text-xs text-muted-foreground">No entries recorded yet.</p>}
    {rows.map((row, index) => <fieldset key={index} className="min-w-0 rounded-lg border border-border p-2"><legend className="px-1 text-[11px]">Entry {index + 1}</legend><div className="grid min-w-0 gap-2 sm:grid-cols-2">{columns.map((column, columnIndex) => <label key={column} htmlFor={`${id}-${index}-${columnIndex}`} className="min-w-0 space-y-1 text-[11px]">{column}<Input id={`${id}-${index}-${columnIndex}`} disabled={readOnly} type={/date|expiry/i.test(column) ? 'date' : /^(start|end) time$/i.test(column) ? 'time' : 'text'} maxLength={1000} className="h-8 text-xs md:text-xs" value={row[columnIndex] || ''} onChange={(event) => onChange(rows.map((item, rowIndex) => rowIndex === index ? columns.map((name, cellIndex) => cellIndex === columnIndex ? event.target.value : item[cellIndex] || '') : item))} /></label>)}</div>{!readOnly && <Button type="button" variant="ghost" size="sm" onClick={() => { if (window.confirm('Remove this entry? Save the form to keep this change.')) onChange(rows.filter((item, rowIndex) => rowIndex !== index)); }}>Remove entry {index + 1}</Button>}</fieldset>)}
    {!readOnly && <Button type="button" size="sm" variant="outline" disabled={rows.length >= 100} onClick={() => onChange([...rows, columns.map(() => '')])}>Add entry</Button>}
  </div>;
}