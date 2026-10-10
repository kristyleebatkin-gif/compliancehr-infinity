import React, { useState, useRef, useEffect } from 'react';
import { ClipboardList, ChevronDown } from 'lucide-react';

export default function TemplatePicker({ label, templates, onApply, buttonClassName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          buttonClassName ||
          'inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/10'
        }
      >
        <ClipboardList className="h-3.5 w-3.5" />
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-1 w-72 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onApply(t);
                setOpen(false);
              }}
              className="block w-full border-b border-border/40 px-3 py-2.5 text-left last:border-0 hover:bg-muted"
            >
              <div className="text-sm font-medium text-foreground">{t.name}</div>
              <div className="text-xs text-foreground/50">{t.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}