import React from 'react';
import SectionCard from '@/components/SectionCard';

export default function TakeFiveContainer({ embedded, title, description, action, children }) {
  if (!embedded) return <SectionCard title={title} description={description} action={action}>{children}</SectionCard>;
  return <div className="border-b border-border/60 py-5"><div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="text-xs text-muted-foreground">{description}</p></div>{action}</div>{children}</div>;
}