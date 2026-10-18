import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function OnlineDocumentFields({ fields = [], answers, onChange, disabled = false, requireAll = false }) {
  const prefix = useId();
  return <fieldset disabled={disabled} className="grid min-w-0 gap-5 sm:grid-cols-2">
    {fields.map((field, index) => {
      const id = `${prefix}-${index}`;
      const wide = field.multiline || field.fullWidth || field.label.length > 85;
      return <div key={field.label} className={`${wide ? 'sm:col-span-2' : ''} min-w-0 overflow-hidden rounded-xl border-2 border-primary/70 bg-card shadow-panel`}>
        <label htmlFor={id} className="block bg-primary px-4 py-3 text-sm font-semibold leading-relaxed text-primary-foreground">
          {field.label}{(field.required || requireAll) && <span aria-hidden="true"> *</span>}
        </label>
        <div className="p-3">
          {field.multiline
            ? <Textarea id={id} rows={4} maxLength={4000} required={field.required || requireAll} value={answers[field.label] ?? ''} onChange={(e) => onChange(field.label, e.target.value)} className="min-h-28 bg-background leading-relaxed" />
            : <Input id={id} maxLength={1000} required={field.required || requireAll} value={answers[field.label] ?? ''} onChange={(e) => onChange(field.label, e.target.value)} className="h-11 bg-background" />}
        </div>
      </div>;
    })}
  </fieldset>;
}