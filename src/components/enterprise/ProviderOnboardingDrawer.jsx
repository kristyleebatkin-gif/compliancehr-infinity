import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  CheckCircle2, Circle, X, ArrowRight, Sparkles, ShieldCheck, Building2, Users, Heart, Calendar,
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 'business',
    title: '1. Organisation Identity & ABN',
    description: 'Configure your legal entity name, ABN, NDIS Provider Number, and key personnel.',
    path: '/company-safe',
    cta: 'Configure Business Identity',
    icon: Building2,
  },
  {
    id: 'staff',
    title: '2. Workforce & 100-Point Screening',
    description: 'Add active staff profiles and verify NDIS Worker Screening, First Aid, and CPR clearances.',
    path: '/our-employees',
    cta: 'Open Employee Profiles',
    icon: Users,
  },
  {
    id: 'participants',
    title: '3. Participant Dossiers & Consents',
    description: 'Onboard participants, link support plans, and record signed 3-part information consents.',
    path: '/our-participants',
    cta: 'Open Participant Profiles',
    icon: Heart,
  },
  {
    id: 'compliance',
    title: '4. Policies & 356 Audit Checkpoints',
    description: 'Review mandatory governance policies, clinical procedures, and NDIS/Aged Care evidence.',
    path: '/compliance',
    cta: 'Open Compliance Centre',
    icon: ShieldCheck,
  },
  {
    id: 'rostering',
    title: '5. Smart Roster & Shift Guardrails',
    description: 'Schedule your first screened shift with live availability and award cost forecasting.',
    path: '/roster',
    cta: 'Open Smart Roster',
    icon: Calendar,
  },
];

export default function ProviderOnboardingDrawer({ open, onClose }) {
  const [counts, setCounts] = useState({
    business: false,
    staff: false,
    participants: false,
    compliance: false,
    rostering: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    Promise.all([
      base44.entities.BusinessDetails.count({}).catch(() => 0),
      base44.entities.StaffProfile.count({}).catch(() => 0),
      base44.entities.ParticipantProfile.count({}).catch(() => 0),
      base44.entities.Policy.count({}).catch(() => 0),
      base44.entities.Shift.count({}).catch(() => 0),
    ])
      .then(([biz, staff, part, pol, shift]) => {
        if (!active) return;
        setCounts({
          business: Number(biz) > 0,
          staff: Number(staff) > 0,
          participants: Number(part) > 0,
          compliance: Number(pol) > 0,
          rostering: Number(shift) > 0,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  const completedCount = Object.values(counts).filter(Boolean).length;
  const pct = Math.round((completedCount / ONBOARDING_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
      />
      <aside
        aria-label="Provider Onboarding & Readiness Guide"
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl border-l border-slate-200 text-[#0A2B6D]"
      >
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{
            background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#00C6FF]" />
            <div>
              <h2 className="text-sm font-extrabold text-white">5-Step Provider Launch Checklist</h2>
              <p className="text-xs text-white/80">Fastest path to 100% NDIS &amp; Aged Care audit readiness</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close onboarding checklist"
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-slate-200 bg-[#F8FAFC] px-5 py-3.5">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#0A2B6D]">
            <span>Activation Progress ({completedCount} of {ONBOARDING_STEPS.length} complete)</span>
            <span className="text-[#0072FF]">{pct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {ONBOARDING_STEPS.map((step) => {
            const done = counts[step.id];
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`rounded-xl border p-4 transition ${
                  done
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:border-[#0072FF]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#0072FF]" />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-[#5A00D6]" />
                        <h3 className="text-sm font-extrabold text-[#0A2B6D]">{step.title}</h3>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#0A2B6D]/75">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      done
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#0072FF]/10 text-[#0072FF]'
                    }`}
                  >
                    {loading ? 'Checking…' : done ? 'Verified' : 'Action'}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link
                    to={step.path}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold text-white shadow-2xs transition hover:opacity-95"
                    style={{
                      background: done
                        ? '#0A2B6D'
                        : 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                    }}
                  >
                    <span>{done ? 'Review Step' : step.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}