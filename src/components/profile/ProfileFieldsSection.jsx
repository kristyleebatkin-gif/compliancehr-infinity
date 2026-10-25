import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfileFieldsSection({ section, form, onChange, prefix }) {
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-card shadow-sm">
      <div
        className="border-b-2 border-[#0A2B6D] px-4 py-2 text-white"
        style={{ background: 'var(--header-gradient)' }}
      >
        <h2 className="text-sm font-extrabold text-white">{section.title}</h2>
      </div>
      <div className="grid gap-2.5 p-3.5 md:grid-cols-2 bg-[#F5F0FF]/35">
        {section.fields.map((field) => {
          const id = `${prefix}-${field.key}`;
          return (
            <div
              key={field.key}
              className={`rounded-xl border-2 border-[#0A2B6D] bg-white p-2.5 shadow-2xs ${
                field.multiline ? 'grid gap-1.5 md:col-span-2' : 'grid gap-1.5'
              }`}
            >
              <Label htmlFor={id} className="text-xs font-extrabold text-[#0A2B6D]">{field.label}</Label>
              {field.options ? (
                <Select value={form[field.key] || undefined} onValueChange={(value) => onChange(field.key, value)}>
                  <SelectTrigger id={id} className="border-[#0A2B6D]/60"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{field.options.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              ) : field.multiline ? (
                <Textarea id={id} rows={3} className="border-[#0A2B6D]/60" value={form[field.key] ?? ''} readOnly={field.readOnly} onChange={(e) => onChange(field.key, e.target.value)} />
              ) : (
                <Input id={id} type={field.type || 'text'} step={field.type === 'number' ? 'any' : undefined} className="border-[#0A2B6D]/60" value={form[field.key] ?? ''} readOnly={field.readOnly} onChange={(e) => onChange(field.key, e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}