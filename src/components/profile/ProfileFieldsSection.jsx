import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
  color: '#0A2B6D',
};

export default function ProfileFieldsSection({ section, form, onChange, prefix }) {
  return (
    <section
      className="overflow-hidden rounded-2xl p-3 shadow-sm space-y-2.5"
      style={GRADIENT_BORDER_STYLE}
    >
      <div className="flex items-center">
        <h2
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold text-[#0A2B6D]"
          style={GRADIENT_BORDER_STYLE}
        >
          <span style={{ color: '#0072FF' }}>◉</span>
          <span>{section.title}</span>
        </h2>
      </div>
      <div
        className="grid gap-2.5 rounded-xl p-2.5 md:grid-cols-2"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        {section.fields.map((field, idx) => {
          const id = `${prefix}-${field.key}`;
          const symCol = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF'][idx % 4];
          return (
            <div
              key={field.key}
              className={`rounded-xl p-2.5 shadow-2xs ${
                field.multiline ? 'grid gap-1.5 md:col-span-2' : 'grid gap-1.5'
              }`}
              style={GRADIENT_BORDER_STYLE}
            >
              <div>
                <Label
                  htmlFor={id}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
                  style={GRADIENT_BORDER_STYLE}
                >
                  <span style={{ color: symCol }}>◉</span>
                  <span>{field.label}</span>
                </Label>
              </div>
              {field.options ? (
                <Select value={form[field.key] || undefined} onValueChange={(value) => onChange(field.key, value)}>
                  <SelectTrigger id={id} style={GRADIENT_BORDER_STYLE}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{field.options.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              ) : field.multiline ? (
                <Textarea id={id} rows={3} style={GRADIENT_BORDER_STYLE} value={form[field.key] ?? ''} readOnly={field.readOnly} onChange={(e) => onChange(field.key, e.target.value)} />
              ) : (
                <Input id={id} type={field.type || 'text'} step={field.type === 'number' ? 'any' : undefined} style={GRADIENT_BORDER_STYLE} value={form[field.key] ?? ''} readOnly={field.readOnly} onChange={(e) => onChange(field.key, e.target.value)} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}