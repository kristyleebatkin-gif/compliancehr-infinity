import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function TemplateLibrarySection({ id, title, description, children }) {
  return <details id={id} open className="group scroll-mt-24 rounded-xl border border-border bg-card">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
      <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-open:rotate-180" />
    </summary>
    <div className="space-y-4 border-t border-border p-4">{children}</div>
  </details>;
}