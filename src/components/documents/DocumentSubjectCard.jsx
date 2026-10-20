import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ChevronDown } from 'lucide-react';
import BusinessPlanTemplates from '@/components/documents/BusinessPlanTemplates';
import PolicyTemplates from '@/components/documents/PolicyTemplates';
import RegisterTemplates from '@/components/documents/RegisterTemplates';
import CompanySafeDocuments from '@/components/documents/CompanySafeDocuments';

export default function DocumentSubjectCard({ subject, count, expanded, onOpen, onExport, role }) {
  const Icon = subject.icon;
  const library = ['business-doc', 'business', 'policies', 'registers'].includes(subject.key);
  const companyAccess = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Human Resources Manager', 'Quality & Improvement Manager'].includes(role);
  return <section id={`vault-subject-${subject.key}`} data-vault-subject style={{ '--subject-color': subject.colour }} className={`scroll-mt-24 min-w-0 rounded-lg border border-border bg-card shadow-sm ${expanded ? 'sm:col-span-2 xl:col-span-3' : ''}`}>
    <button type="button" onClick={() => onOpen(subject)} aria-expanded={library ? expanded : undefined} className="flex w-full items-start gap-2 rounded-t-lg border-t-2 p-2 text-left hover:bg-muted/40" style={{ borderTopColor: subject.colour }}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted" style={{ color: subject.colour }}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-foreground">{subject.title}</span><span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">{subject.blurb}</span></span>
      {subject.entity && <span className="text-sm font-bold tabular-nums text-foreground">{count == null ? <Loader2 className="h-3 w-3 animate-spin" /> : count}</span>}
      {library && <ChevronDown className={`h-3 w-3 shrink-0 text-muted-foreground ${expanded ? 'rotate-180' : ''}`} />}
    </button>
    <div className="module-action-bar flex items-center justify-between gap-1 px-2 pb-1.5">
      <Button size="sm" variant="ghost" onClick={() => onOpen(subject)}>{library ? (expanded ? 'Close section' : 'Open library') : subject.anchor ? 'Open section' : 'Open module'}</Button>
      {subject.entity && <Button size="sm" variant="outline" onClick={() => onExport(subject)}><Download className="h-3 w-3" />Export CSV</Button>}
    </div>
    {expanded && <div className="compact-module space-y-2 border-t border-border p-2">
      {subject.key === 'business' && <BusinessPlanTemplates />}
      {subject.key === 'policies' && <PolicyTemplates />}
      {subject.key === 'registers' && <RegisterTemplates />}
      {subject.key === 'business-doc' && (companyAccess ? <CompanySafeDocuments role={role} /> : <p className="text-xs text-muted-foreground">Company documents are available to authorised management roles.</p>)}
    </div>}
  </section>;
}