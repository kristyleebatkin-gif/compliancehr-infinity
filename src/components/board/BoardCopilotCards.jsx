import React, { useState } from 'react';
import { Crown, Landmark, LineChart } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { resolveUserTenantId } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import CopilotRunDialog from '@/components/ai/CopilotRunDialog';

const COPILOTS = [
  {
    action: 'board_review',
    label: 'Board copilot',
    description: 'Drafts a board assurance summary from recorded standards, controls, evidence and findings, with the gaps and limitations named.',
    icon: Landmark,
  },
  {
    action: 'ceo_review',
    label: 'CEO copilot',
    description: 'Drafts an executive assurance briefing over the same snapshot. No financial or clinical predictions are made.',
    icon: Crown,
  },
  {
    action: 'executive_review',
    label: 'Executive copilot',
    description: 'Summarises the authorised snapshot and the review priorities it implies.',
    icon: LineChart,
  },
];

export default function BoardCopilotCards() {
  const { user } = useAuth();
  const tenantId = resolveUserTenantId(user);
  const [run, setRun] = useState('');

  return (
    <section aria-label="Board and executive copilots" className="space-y-2">
      <div className="grid gap-3 md:grid-cols-3">
        {COPILOTS.map((copilot) => {
          const Icon = copilot.icon;
          return (
            <article key={copilot.action} className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground"><Icon className="h-4 w-4 text-primary" />{copilot.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{copilot.description}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setRun(copilot.action)} disabled={!tenantId}>
                Draft a briefing
              </Button>
            </article>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Every draft is advisory and records itself in the AI audit trail. Approval, acceptance and any statutory filing remain human, documented decisions.
      </p>
      {run && (
        <CopilotRunDialog key={run} open={Boolean(run)} initialAction={run} tenantId={tenantId} onClose={() => setRun('')} />
      )}
    </section>
  );
}