import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, Check, ShieldCheck, Sparkles, TrendingUp, Users, Activity,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HeroDashboardMockup from '@/components/landing/HeroDashboardMockup';

const TRUST_BADGES = [
  'Audit Ready',
  'AI Powered',
  '46 Connected Modules',
  'NDIS & Aged Care',
];

const GLASS_KPIS = [
  {
    icon: ShieldCheck,
    label: 'NDIS Audit Readiness',
    value: '99.2%',
    sub: '356 / 356 Checkpoints',
  },
  {
    icon: Users,
    label: '100-Pt Screening',
    value: '100%',
    sub: 'Automated Roster Gate',
  },
  {
    icon: Activity,
    label: '24h / 5d Incident SLA',
    value: 'Zero Overdue',
    sub: 'Commission Timers',
  },
];

export default function LandingHero({ onBookDemo }) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  return (
    <section className="relative w-full">
      <div
        className="relative overflow-hidden rounded-3xl border border-indigo-900/20 shadow-xl"
        style={{
          background:
            'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 20%, rgba(99,102,241,0.45) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(139,92,246,0.35) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 px-5 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            <div className="flex flex-col justify-between lg:col-span-6 text-left text-white space-y-4">
              <div className="space-y-3.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur-md sm:whitespace-nowrap">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-300" />
                  <span>NDIS &amp; Aged Care Support Super-Platform</span>
                </div>

                <h1
                  className="text-2xl sm:text-3xl lg:text-[2.15rem] xl:text-[2.55rem] font-extrabold tracking-tight text-white leading-[1.15]"
                  style={{ color: '#FFFFFF' }}
                >
                  The Complete Compliance &amp; Workforce Management Platform
                </h1>

                <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-200">
                  Manage participants, staff, compliance, incidents, rostering, HR, invoicing and audit readiness from one connected platform.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Link
                    to={authed ? '/dashboard' : '/register'}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-5 py-2.5 text-sm xl:text-base font-semibold text-white shadow-lg transition hover:bg-indigo-500"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onBookDemo && onBookDemo('Book a Demo')}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300/80 bg-white px-5 py-2.5 text-sm xl:text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-50"
                  >
                    <Calendar className="h-4 w-4 shrink-0 text-indigo-600" />
                    <span>Book a Demo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 pt-0.5">
                  {TRUST_BADGES.map((badge) => (
                    <div
                      key={badge}
                      className="flex min-h-[36px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                      <span className="whitespace-nowrap leading-tight">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 pt-1">
                {GLASS_KPIS.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={kpi.label}
                      className="flex flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-3 text-left text-white backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 leading-tight whitespace-nowrap">
                          {kpi.label}
                        </span>
                        <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-300" />
                      </div>
                      <div className="mt-1 text-base xl:text-2xl font-extrabold text-white leading-tight whitespace-nowrap">
                        {kpi.value}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-slate-300 leading-tight whitespace-nowrap">
                        <TrendingUp className="h-3 w-3 shrink-0 text-indigo-300" />
                        <span>{kpi.sub}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 flex items-center">
              <HeroDashboardMockup />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-300">
                Australian Organisational Operating System — 5 Master Architecture Layers
              </span>
              <span className="text-[11px] font-bold text-white">
                PEOPLE → WORK → COMPLIANCE → EVIDENCE → INTELLIGENCE
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                'Workforce Management',
                'NDIS Compliance',
                'Aged Care Compliance',
                'Governance',
                'Risk Management',
                'Quality Management',
                'Audit Readiness',
                'Evidence Management',
                'AI Automation',
                'Organisational Intelligence',
              ].map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold text-white"
                >
                  <Check className="h-3 w-3 text-indigo-300" />
                  <span>{cap}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}