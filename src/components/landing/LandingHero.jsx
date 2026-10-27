import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, Check, ShieldCheck, Sparkles, TrendingUp, Users, Award, Activity,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HeroDashboardMockup from '@/components/landing/HeroDashboardMockup';

const TRUST_BADGES = [
  '✓ Audit Ready',
  '✓ AI Powered',
  '✓ 46 Connected Modules',
  '✓ NDIS Focused',
];

const GLASS_KPIS = [
  {
    icon: ShieldCheck,
    label: 'NDIS Audit Readiness',
    value: '99.2%',
    sub: '356 / 356 Checkpoints Verified',
    accent: '#00C6FF',
  },
  {
    icon: Users,
    label: '100-Pt Worker Screening',
    value: '100%',
    sub: 'Automated Roster Gate Active',
    accent: '#FF6EDB',
  },
  {
    icon: Activity,
    label: '24h / 5d Reportable SLA',
    value: 'Zero Overdue',
    sub: 'Statutory Commission Timers',
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

        <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            {/* Left Column: High-Converting SaaS Hero Copy + Glassmorphism KPI Strip */}
            <div className="flex flex-col justify-between lg:col-span-6 text-left text-white space-y-6">
              <div className="space-y-5">
                {/* Top Enterprise Pill */}
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" />
                  <span>Enterprise NDIS &amp; Disability Support Super-Platform</span>
                </div>

                {/* Main Headline */}
                <h1
                  className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
                  style={{ color: '#FFFFFF' }}
                >
                  The Complete Compliance &amp; Workforce Management Platform
                </h1>

                {/* Subheading */}
                <p className="text-base sm:text-lg font-medium leading-relaxed text-white/90">
                  Manage participants, staff, compliance, incidents, rostering, HR, invoicing and audit readiness from one connected platform.
                </p>

                {/* Two Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onBookDemo && onBookDemo('Book a Demo')}
                    className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-white bg-white px-7 py-3.5 text-base font-extrabold text-[#0A2B6D] shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <Calendar className="h-5 w-5 text-[#5A00D6]" />
                    <span>Book a Demo</span>
                  </button>

                  <Link
                    to={authed ? '/dashboard' : '/register'}
                    className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-white/40 bg-[#0A2B6D]/85 px-7 py-3.5 text-base font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-[#0A2B6D]"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="h-5 w-5 text-[#00C6FF]" />
                  </Link>
                </div>

                {/* 4 Trust Badges */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 pt-1">
                  {TRUST_BADGES.map((badge) => (
                    <div
                      key={badge}
                      className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-xs font-extrabold text-white backdrop-blur-md shadow-xs"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00C6FF] text-[#0A2B6D]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span className="truncate">{badge.replace(/^✓\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glassmorphism KPI Cards Row (No Empty Space) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
                {GLASS_KPIS.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={kpi.label}
                      className="rounded-2xl border border-white/30 bg-white/15 p-3.5 text-left text-white backdrop-blur-md shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/85">
                          {kpi.label}
                        </span>
                        <Icon className="h-4 w-4 shrink-0" style={{ color: kpi.accent }} />
                      </div>
                      <div className="mt-1 font-editorial text-2xl font-extrabold text-white">
                        {kpi.value}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-white/85">
                        <TrendingUp className="h-3 w-3 text-[#00C6FF]" />
                        <span className="truncate">{kpi.sub}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Modern Executive Dashboard Mockup with Glassmorphism Accents */}
            <div className="lg:col-span-6 flex items-stretch">
              <HeroDashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}