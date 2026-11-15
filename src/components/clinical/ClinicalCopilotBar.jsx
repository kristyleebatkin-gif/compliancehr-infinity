import React, { useState } from 'react';
import { Activity, HeartHandshake } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { resolveUserTenantId } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import CopilotRunDialog from '@/components/ai/CopilotRunDialog';

const COPILOTS = [
  {
    action: 'clinical_review',
    label: 'Clinical governance copilot',
    description: 'Reviews recorded clinical governance metadata: control coverage, evidence currency and open clinical findings.',
    icon: Activity,
  },
  {
    action: 'allied_health_review',
    label: 'Allied health copilot',
    description: 'Reviews allied health assurance metadata. Professional scope and registration always need authoritative human verification.',
    icon: HeartHandshake,
  },
];

// Copilots are advisory only and read the shared assurance registers, so nothing clinical
// is drafted from participant notes, plans or files.
export default function ClinicalCopilotBar() {
  const { user } = useAuth();
  const tenantId = resolveUserTenantId(user);
  const [run, setRun] = useState('');

  return (
    <section aria-label="Clinical copilots" className="space-y-2">
      <div className="grid gap-3 md:grid-cols-2">
        {COPILOTS.map((copilot) => {
          const Icon = copilot.icon;
          return (
            <article key={copilot.action} className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground"><Icon className="h-4 w-4 text-primary" />{copilot.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{copilot.description}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setRun(copilot.action)} disabled={!tenantId}>
                Review assurance metadata
              </Button>
            </article>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Copilots never diagnose, prescribe or recommend treatment, and they never approve a plan. Plan, referral and supervision decisions stay with the accountable person.
      </p>
      {run && (
        <CopilotRunDialog
          key={run}
          open={Boolean(run)}
          initialAction={run}
          tenantId={tenantId}
          onClose={() => setRun('')}
        />
      )}
    </section>
  );
}