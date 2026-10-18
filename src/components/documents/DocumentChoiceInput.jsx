import React from 'react';
import { answerText, validFieldChoice } from '@/lib/formQuestionModel';

export default function DocumentChoiceInput({ field, id, value, onChange, required }) {
  const selected = validFieldChoice(field, value);
  const values = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const invalid = value && answerText(value) && !values.length;
  return <div role="group" aria-labelledby={`${id}-label`} className="space-y-2">
    <p className="text-xs text-muted-foreground">{field.help}{field.optional ? ' Optional.' : ''}</p>
    {field.options.map((option, index) => <label key={option} className="flex cursor-pointer items-start gap-3 rounded-md px-1 py-1.5 text-sm leading-relaxed">
      <input type={field.type === 'multiple' ? 'checkbox' : 'radio'} name={id} value={option} checked={values.includes(option)}
        required={required && (field.type !== 'multiple' || !values.length) && (field.type !== 'multiple' || index === 0)}
        onChange={(event) => onChange(field.type === 'multiple' ? (event.target.checked ? [...values, option] : values.filter((item) => item !== option)) : option)}
        className="mt-1 h-4 w-4 shrink-0 accent-primary" />
      <span>{option}</span>
    </label>)}
    {invalid && <p className="rounded-md border border-primary/20 bg-accent p-2 text-xs text-accent-foreground">Earlier recorded answer: {answerText(value)}. Confirm the appropriate option above.</p>}
  </div>;
}