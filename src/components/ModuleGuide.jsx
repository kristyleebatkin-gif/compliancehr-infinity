import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { moduleGuides } from '@/lib/moduleGuides';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import { BookMarked, ChevronDown } from 'lucide-react';

export default function ModuleGuide() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const seg = `/${pathname.split('/')[1] || ''}`;
  const guide = useMemo(() => moduleGuides[seg] || null, [seg]);

  useEffect(() => { setOpen(false); }, [guide?.title]);

  if (!guide) return null;

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 via-accent to-transparent shadow-sm">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <div className="rounded-lg bg-brand/10 p-2"><BookMarked className="h-4 w-4 text-brand" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-brand">User Guide: {guide.title}</p>
          <p className="text-xs text-muted-foreground">Order of documents and process steps for this module.</p>
        </div>
        <ModuleComplianceStrip path={seg} />
        <span className="hidden rounded-md border border-brand/20 bg-white px-2 py-1 text-[10px] font-semibold text-brand sm:block">{open ? 'Hide steps' : 'Show steps'}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-brand transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-brand/10 px-4 pb-4 pt-3">
          {guide.purpose && <p className="mb-3 text-xs text-muted-foreground">{guide.purpose}</p>}
          <ol className="space-y-2">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{i + 1}</span>
                <p className="text-sm text-foreground/80">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}