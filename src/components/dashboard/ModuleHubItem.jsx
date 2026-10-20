import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { moduleColour } from '@/lib/moduleColours';

export default function ModuleHubItem({ module }) {
  const Icon = module.icon;
  const colour = moduleColour(module.label);
  return <Link to={module.path} title={module.blurb} className="group flex min-w-0 items-start gap-2.5 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ color: colour, background: `${colour}18` }}><Icon className="h-4 w-4" /></span>
    <div className="min-w-0 flex-1">
      <h3 className="text-[13px] font-bold leading-5 text-foreground">{module.label}</h3>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{module.blurb}</p>
    </div>
    <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
  </Link>;
}