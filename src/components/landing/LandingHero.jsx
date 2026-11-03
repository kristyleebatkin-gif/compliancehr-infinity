import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, Check, ShieldCheck, Sparkles, TrendingUp, Users, Activity,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HeroDashboardMockup from '@/components/landing/HeroDashboardMockup';

const TRUST_BADGES = [
  'Readiness Tracking',
  'AI Tools',
  'Connected Modules',
  'NDIS & Aged Care',
];

const GLASS_KPIS = [
  {
    icon: ShieldCheck,
    label: 'NDIS Audit Readiness',
    value: '99.2%',
    sub: '356 / 356 Checkpoints',
    accent: '#00C6FF',
  },
  {
    icon: Users,
    label: '100-Pt Screening',
    value: '100%',
    sub: 'Automated Roster Gate',
    accent: '#FF6EDB',
  },
  {
    icon: Activity,
    label: '24h / 5d Incident SLA',
    value: 'Zero Overdue',
    sub: 'Commission Timers',
    accent: '#00C6FF',
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
        className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
        style={{
          background:
            'linear-gradient(125deg, #0A2B6D 0%, #0072FF 34%, #5A00D6 68%, #FF2E9A 100%)',
        }}
      >
        {/* Subtle Enterprise Grid & Ambient Radial Highlights */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.45) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(0,198,255,0.45) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-11">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Column: High-Converting SaaS Hero Copy + High-Contrast KPI Strip */}
            <div className="flex flex-col justify-between lg:col-span-6 text-left text-white space-y-5">
              <div className="space-y-4">
                {/* Top Enterprise Pill — NDIS & Aged Care Support Super-Platform */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#061539]/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
                  <span>NDIS &amp; Aged Care Support Super-Platform</span>
                </div>

                {/* Main Headline */}
                <h1
                  className="font-editorial text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-extrabold tracking-tight text-white leading-[1.14]"
                  style={{ color: '#FFFFFF' }}
                >
                  The Complete Compliance &amp; Workforce Management Platform
                </h1>

                {/* Subheading */}
                <p className="text-sm sm:text-base font-normal leading-relaxed text-white/95">
                  Manage participants, staff, compliance, incidents, rostering, HR, invoicing and audit readiness from one connected platform.
                </p>

                {/* Two Primary CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onBookDemo && onBookDemo('Book a Demo')}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border-2 border-white bg-white px-5 py-2.5 text-sm xl:text-base font-bold text-[#0A2B6D] shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <Calendar className="h-4 w-4 shrink-0 text-[#5A00D6]" />
                    <span>Book a Demo</span>
                  </button>

                  <Link
                    to={authed ? '/dashboard' : '/register'}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-[#061539]/90 px-5 py-2.5 text-sm xl:text-base font-bold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-[#061539]"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#00C6FF]" />
                  </Link>
                </div>

                {/* 4 Trust Badges — WCAG AA High-Contrast Surface & 12px Minimum Text */}
                <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4 pt-1">
                  {TRUST_BADGES.map((badge) => (
                    <div
                      key={badge}
                      className="flex min-h-[38px] items-center gap-2 rounded-xl border border-white/25 bg-[#061539]/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-xs"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00C6FF] text-[#0A2B6D]">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                      <span className="leading-snug">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Contrast KPI Cards Row (WCAG AAA >7:1 Backing) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
                {GLASS_KPIS.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={kpi.label}
                      className="flex flex-col justify-between rounded-2xl border border-white/25 bg-[#061539]/75 p-3.5 text-left text-white backdrop-blur-md shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold text-white/90 leading-snug">
                          {kpi.label}
                        </span>
                        <Icon className="h-4 w-4 shrink-0" style={{ color: kpi.accent }} />
                      </div>
                      <div className="mt-1.5 font-editorial text-xl xl:text-2xl font-extrabold text-white leading-tight">
                        {kpi.value}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/85 leading-snug">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
                        <span>{kpi.sub}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Executive dashboard preview */}
            <div className="lg:col-span-6 flex items-center">
              <HeroDashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}