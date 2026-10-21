import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';

export default function ModuleHubItem({ module }) {
  const Icon = module.icon;
  const colour = moduleKeyColour(module.key);
  return <Link to={module.path} title={module.blurb} className="group flex min-w-0 items-start gap-2 rounded-lg border p-2 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring" style={{ borderColor: `${colour}99`, background: `linear-gradient(125deg, ${colour}59, ${colour}1f)` }}>
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ color: '#fff', background: colour }}><Icon className="h-4 w-4" /></span>
    <div className="min-w-0 flex-1">
      <h3 className="text-[13px] font-bold leading-5 text-foreground">{module.label}</h3>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{module.blurb}</p>
    </div>
    <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-foreground" style={{ color: colour }} />
  </Link>;
}