import React from 'react';
import { cn } from '@/lib/utils';

/** @param {any} props */
export function Field({ label = undefined, children = undefined, className = undefined } = {}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label className="text-xs font-semibold text-foreground/70">{label}</label>}
      {children}
    </div>
  );
}

const base =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors';

/** @param {any} props */
export function TextInput(props = {}) {
  return <input {...props} className={cn(base, props.className)} />;
}

/** @param {any} props */
export function TextArea(props = {}) {
  return <textarea {...props} className={cn(base, 'min-h-[80px]', props.className)} />;
}

/** @param {any} props */
export function Select({ children = undefined, ...props } = {}) {
  return (
    <select {...props} className={cn(base, 'bg-background', props.className)}>
      {children}
    </select>
  );
}

/** @param {any} props */
export function DateInput(props = {}) {
  return <input type="date" {...props} className={cn(base, props.className)} />;
}

/** @param {any} props */
export function Checkbox({ label = undefined, checked = false, onChange = undefined, ...props } = {}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 cursor-pointer">
      <input {...props} type="checkbox" checked={checked} onChange={onChange} className={cn('h-4 w-4 rounded border-input text-brand focus:ring-brand', props.className)} />
      {label}
    </label>
  );
}