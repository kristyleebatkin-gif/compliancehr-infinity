import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function BriefingList({ title, icon: Icon, tone = 'text-foreground', items = [], emptyLabel = 'All clear' }) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className={`h-4 w-4 shrink-0 ${tone}`} />}
            <span className="font-display text-sm font-bold">{title}</span>
          </div>
          <span className={`rounded-full bg-muted px-2 py-0.5 text-xs font-bold ${tone}`}>{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="mt-2 text-sm font-medium text-safe">{emptyLabel}</p>
        ) : (
          <ul className="mt-2 max-h-72 divide-y divide-border/60 overflow-y-auto">
            {items.map((it, i) => (
              <li key={i} className="py-2">
                <div className="text-sm font-medium leading-snug">{it.primary}</div>
                {it.secondary && <div className="text-xs text-muted-foreground">{it.secondary}</div>}
                {it.meta && <div className={`text-xs font-semibold ${it.tone || tone}`}>{it.meta}</div>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}