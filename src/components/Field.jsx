import React from 'react';
import { cn } from '@/lib/utils';

export function Field({ label, children, className = undefined }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label className="text-xs font-semibold text-foreground/70">{label}</label>}
      {children}
    </div>
  );
}

const base =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors';

export function TextInput(props) {
  return <input {...props} className={cn(base, props.className)} />;
}

export function TextArea(props) {
  return <textarea {...props} className={cn(base, 'min-h-[80px]', props.className)} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={cn(base, 'bg-background', props.className)}>
      {children}
    </select>
  );
}

export function DateInput(props) {
  return <input type="date" {...props} className={cn(base, props.className)} />;
}

export function Checkbox({ label, checked, onChange, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 cursor-pointer">
      <input {...props} type="checkbox" checked={checked} onChange={onChange} className={cn('h-4 w-4 rounded border-input text-brand focus:ring-brand', props.className)} />
      {label}
    </label>
  );
}