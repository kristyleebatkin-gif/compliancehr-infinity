import React from 'react';
import { Input } from '@/components/ui/input';

export default function ManagementSignoffSection({ value = {}, onChange, disabled }) {
  const fields = [
    { key: 'name', label: 'Manager name', type: 'text' },
    { key: 'signature', label: 'Management signature (typed)', type: 'text' },
    { key: 'date', label: 'Sign-off date', type: 'date' },
  ];
  return (
    <fieldset disabled={disabled} className="mt-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <legend className="px-2 text-sm font-bold">Management sign-off</legend>
      <p className="mb-3 text-xs text-muted-foreground">Complete before saving or submitting. A typed signature is not identity-verified.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="space-y-1.5 text-sm font-semibold">
            <span>{field.label}</span>
            <Input type={field.type} maxLength={field.type === 'text' ? 160 : undefined} value={value?.[field.key] || ''} onChange={(event) => onChange({ ...value, [field.key]: event.target.value })} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}