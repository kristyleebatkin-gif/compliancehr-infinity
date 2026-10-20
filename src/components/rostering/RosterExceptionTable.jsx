import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function RosterExceptionTable({ icon, title, tone, items, render }) {
  return <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
    <div className={`flex items-center gap-2 border-b border-border px-3 py-2 ${tone}`}>
      {icon}<h3 className="text-xs font-bold">{title}</h3><Badge variant="outline" className="ml-auto border-current text-inherit">{items.length}</Badge>
    </div>
    {items.length === 0 ? <p className="p-3 text-xs text-muted-foreground">Nothing to action.</p> : <div className="max-h-60 overflow-auto">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-muted text-muted-foreground"><tr><th className="w-10 px-3 py-2">#</th><th className="px-3 py-2 font-semibold">Shift / exception details</th></tr></thead>
        <tbody className="divide-y divide-border">{items.slice(0, 12).map((item, i) => <tr key={i} className="even:bg-muted/40 hover:bg-accent/50"><td className="px-3 py-2 align-top tabular-nums text-muted-foreground">{i + 1}</td><td className="px-3 py-2 leading-5 [&_button]:text-left [&_button]:text-foreground">{render(item)}</td></tr>)}</tbody>
      </table>
      {items.length > 12 && <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">+ {items.length - 12} more</p>}
    </div>}
  </div>;
}