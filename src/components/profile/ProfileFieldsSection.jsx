import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfileFieldsSection({ section, form, onChange, prefix }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold">{section.title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {section.fields.map((field) => {
          const id = `${prefix}-${field.key}`;
          return (
            <div key={field.key} className={field.multiline ? 'grid gap-1.5 md:col-span-2' : 'grid gap-1.5'}>
              <Label htmlFor={id}>{field.label}</Label>
              {field.options ? (
                <Select value={form[field.key] || undefined} onValueChange={(value) => onChange(field.key, value)}>
                  <SelectTrigger id={id}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{field.options.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              ) : field.multiline ? (
                <Textarea id={id} rows={3} value={form[field.key] ?? ''} readOnly={field.readOnly} onChange={(e) => onChange(field.key, e.target.value)} />
              ) : (
                <Input id={id} type={field.type || 'text'} step={field.type === 'number' ? 'any' : undefined} value={form[field.key] ?? ''} readOnly={field.readOnly} onChange={(e) => onChange(field.key, e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}