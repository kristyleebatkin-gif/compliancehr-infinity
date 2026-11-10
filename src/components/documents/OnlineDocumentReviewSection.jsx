import React from 'react';
import { Input } from '@/components/ui/input';

export default function OnlineDocumentReviewSection({ value = {}, onChange, disabled }) {
  const fields = [
    { key: 'name', label: 'Reviewer name', type: 'text' },
    { key: 'date', label: 'Review date', type: 'date' },
    { key: 'signature', label: 'Reviewer signature (typed)', type: 'text' },
    { key: 'nextReview', label: 'Next review date', type: 'date' },
  ];
  return (
    <fieldset disabled={disabled} className="rounded-xl border border-border bg-card p-4 text-card-foreground">
      <legend className="px-2 text-sm font-bold">Review</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="space-y-1.5 text-sm font-semibold">
            <span>{field.label}</span>
            <Input type={field.type} maxLength={field.type === 'text' ? 160 : undefined} value={value[field.key] || ''} onChange={(event) => onChange({ ...value, [field.key]: event.target.value })} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}