import React from 'react';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { ShieldAlert, Pencil } from 'lucide-react';

const ratingColor = { Low: 'bg-safe/15 text-safe', Medium: 'bg-warning/15 text-warning', High: 'bg-orange-500/15 text-orange-600', Critical: 'bg-danger/15 text-danger' };

// Accent styles per treatment type
const ACCENTS = {
  elimination: { chip: 'bg-danger/10 text-danger', label: 'Eliminate' },
  minimise: { chip: 'bg-safe/10 text-safe', label: 'Minimise' },
  isolate: { chip: 'bg-teal/10 text-teal', label: 'Isolate' },
};

export default function TreatmentSection({ type, title, description, field, risks, loading, canEdit, onEdit }) {
  const accent = ACCENTS[type];
  const complete = risks.filter((r) => r[field] && r[field].trim()).length;

  return (
    <SectionCard
      title={title}
      description={description}
      action={
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/60">{complete}/{risks.length} completed</span>
      }
    >
      {loading ? (
        <div className="py-8 text-center text-sm text-foreground/40">Loading...</div>
      ) : risks.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No risks recorded" />
      ) : (
        <div className="space-y-2.5">
          {risks.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/60 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{r.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ratingColor[r.rating]}`}>{r.rating}</span>
                    {r.control_measure_category && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground/60">{r.control_measure_category}</span>}
                  </div>
                  {r.risk_id && <div className="text-xs text-foreground/40 mt-0.5">{r.risk_id}</div>}
                </div>
                {canEdit && <button onClick={() => onEdit(r)} className="shrink-0 rounded p-1.5 hover:bg-brand/10"><Pencil className="h-4 w-4 text-foreground/50" /></button>}
              </div>
              <div className="mt-2.5 rounded-lg p-3 bg-muted/30">
                <div className={`mb-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${accent.chip}`}>{accent.label} Strategy</div>
                <div className="text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed">{r[field] || '— Not yet recorded —'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}