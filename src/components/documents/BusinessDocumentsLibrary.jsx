import React, { useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import {
  BUSINESS_PLAN_TEMPLATES,
  BUSINESS_REGISTER_TEMPLATES,
  POLICY_TEMPLATES,
  POLICY_VOLUMES,
  downloadBusinessPlanPdf,
  downloadStrategicPlanPdf,
  downloadOperationalPlanPdf,
  downloadPlanTemplatePdf,
  downloadRegisterTemplatePdf,
  downloadPolicyTemplatePdf,
} from '@/lib/businessDocuments';
import { cn } from '@/lib/utils';

const SectionButton = ({ label, onClick, primary = false }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm hover:bg-brand/5',
      primary ? 'border-brand/40 bg-brand/5' : 'border-border/60',
    )}
  >
    <FileText className="h-4 w-4 shrink-0 text-brand" />
    <span className="flex-1 truncate">{label}</span>
    <Download className="h-4 w-4 shrink-0 text-foreground/40" />
  </button>
);

export default function BusinessDocumentsLibrary() {
  const [open, setOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [registersOpen, setRegistersOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-3.5">
        <div className="text-left">
          <div className="text-sm font-semibold">Business Plan, Policy & Register Templates</div>
          <div className="text-xs text-foreground/50">Download blank plan, policy and register templates</div>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-foreground/40 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-border/60 p-5">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Core Plans</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <SectionButton label="Business Plan" primary onClick={downloadBusinessPlanPdf} />
              <SectionButton label="Strategic Plan" primary onClick={downloadStrategicPlanPdf} />
              <SectionButton label="Operational Plan" primary onClick={downloadOperationalPlanPdf} />
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Additional Plan Templates</div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {BUSINESS_PLAN_TEMPLATES.map((name) => (
                <SectionButton key={name} label={name} onClick={() => downloadPlanTemplatePdf(name)} />
              ))}
            </div>
          </div>

          <div>
            <button onClick={() => setRegistersOpen((o) => !o)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-foreground/50 hover:text-foreground">
              <span>Register Templates ({BUSINESS_REGISTER_TEMPLATES.length})</span>
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', registersOpen && 'rotate-180')} />
            </button>
            {registersOpen && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {BUSINESS_REGISTER_TEMPLATES.map((name) => (
                  <SectionButton key={name} label={name} onClick={() => downloadRegisterTemplatePdf(name)} />
                ))}
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setPoliciesOpen((o) => !o)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-foreground/50 hover:text-foreground">
              <span>NDIS Policy & Procedure Manual ({POLICY_TEMPLATES.length} policies)</span>
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', policiesOpen && 'rotate-180')} />
            </button>
            {policiesOpen && (
              <div className="mt-2 space-y-3">
                {POLICY_VOLUMES.map((vol) => (
                  <div key={vol.id}>
                    <div className="mb-1.5 text-[11px] font-bold text-brand">{vol.title} <span className="font-normal text-foreground/40">({vol.range})</span></div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {POLICY_TEMPLATES.filter((p) => p.volume === vol.id).map((policy) => (
                        <SectionButton key={policy.code} label={`${policy.code} - ${policy.title}`} onClick={() => downloadPolicyTemplatePdf(policy)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}