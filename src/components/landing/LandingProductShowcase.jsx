import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, GraduationCap, AlertTriangle, CalendarClock,
  BadgeCheck, HeartHandshake, LayoutDashboard, CheckCircle2,
  ArrowUpRight, Sparkles, TrendingUp, Lock,
} from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const SHOWCASE_PANELS = [
  {
    id: 'executive',
    title: 'Executive Dashboard',
    icon: LayoutDashboard,
    badge: 'Live Command View',
    color: '#0A2B6D',
    path: '/dashboard',
    summary: 'Real-time visibility across every NDIS Practice Standard, shift, credential, incident, and claim.',
    kpi: '98.7% Overall Health',
    status: 'All 46 Modules Synced',
  },
  {
    id: 'score',
    title: 'Compliance Score',
    icon: ShieldCheck,
    badge: '99.2% Verified',
    color: '#0072FF',
    path: '/compliance',
    summary: '17 Audit Categories & 356 Checkpoints continuously scored with attached auditor evidence.',
    kpi: '356 / 356 Checkpoints',
    status: 'Audit Pack Ready',
  },
  {
    id: 'training',
    title: 'Training Compliance',
    icon: GraduationCap,
    badge: '98.9% Current',
    color: '#5A00D6',
    path: '/training',
    summary: 'Mandatory NDIS worker orientation, infection control, manual handling, and medication modules tracked.',
    kpi: '142 Certificates Issued',
    status: 'Auto-Refresher Active',
  },
  {
    id: 'incidents',
    title: 'Open Incidents',
    icon: AlertTriangle,
    badge: '100% Within SLA',
    color: '#FF2E9A',
    path: '/incidents',
    summary: 'Statutory 24-hour & 5-day NDIS Commission reportable countdowns with CAPA root-cause tracking.',
    kpi: '0 Overdue Notifications',
    status: '24h / 5d Timers Armed',
  },
  {
    id: 'reviews',
    title: 'Upcoming Reviews',
    icon: CalendarClock,
    badge: '90/60/30/14d Radar',
    color: '#0072FF',
    path: '/review-due',
    summary: 'Automated horizon radar for 10-weekly participant progress notes, plan renewals, and 6-monthly risk checks.',
    kpi: '100% Scheduled On-Time',
    status: 'Automated Alerts Active',
  },
  {
    id: 'credentials',
    title: 'Staff Credentials',
    icon: BadgeCheck,
    badge: '100-Point Cleared',
    color: '#5A00D6',
    path: '/hr',
    summary: 'NDIS Worker Screening, Blue Card, Police Check, First Aid & CPR verified before roster allocation.',
    kpi: 'Zero Unscreened Shifts',
    status: 'Roster Gate Enforced',
  },
  {
    id: 'participants',
    title: 'Participant Activity',
    icon: HeartHandshake,
    badge: 'Person-Centred Care',
    color: '#FF2E9A',
    path: '/our-participants',
    summary: 'Live shift notes, 3-part informed consents, goal progress milestones, and NDIS budget utilisation.',
    kpi: '99.1% Plan Alignment',
    status: '3-Part Consents Locked',
  },
];

export default function LandingProductShowcase() {
  const [selectedId, setSelectedId] = useState('executive');
  const activePanel = SHOWCASE_PANELS.find((p) => p.id === selectedId) || SHOWCASE_PANELS[0];

  return (
    <section id="showcase" className="w-full scroll-mt-20 py-6">
      <Reveal className="space-y-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#5A00D6]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
            Unified Executive Visibility
          </span>
          <h2 className="mt-3 font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
            Everything Connected
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#0A2B6D]/75">
            Every action taken by frontline support workers, team leaders, HR, and finance updates your live compliance posture automatically.
          </p>
        </div>

        {/* Large Realistic SaaS Application Mockup Frame */}
        <div
          className="rounded-3xl p-[3px] shadow-2xl"
          style={{
            background: 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 28%, #5A00D6 62%, #FF2E9A 100%)',
          }}
        >
          <div className="overflow-hidden rounded-[21px] bg-white">
            {/* Application Top Chrome Bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-white"
              style={{
                background: 'linear-gradient(120deg, #0A2B6D 0%, #0072FF 38%, #5A00D6 72%, #FF2E9A 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF2E9A]" />
                  <span className="h-3 w-3 rounded-full bg-white/80" />
                  <span className="h-3 w-3 rounded-full bg-[#00C6FF]" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold tracking-wide text-white">
                  ComplianceHR Infinity — Connected Enterprise Workspace
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                  <Lock className="h-3.5 w-3.5" />
                  NDIS Practice Standards 2026
                </span>
                <Link
                  to={activePanel.path}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-xs transition hover:bg-slate-100"
                >
                  <span>Launch {activePanel.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#0072FF]" />
                </Link>
              </div>
            </div>

            {/* Inside Mockup Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Sidebar Navigation Inside Mockup (7 Required Views) */}
              <div className="border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-4 lg:col-span-4 space-y-2">
                <div className="px-2 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]/60">
                  Connected Telemetry Views (7)
                </div>
                {SHOWCASE_PANELS.map((panel) => {
                  const Icon = panel.icon;
                  const isActive = panel.id === selectedId;
                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => setSelectedId(panel.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left transition-all ${
                        isActive
                          ? 'bg-[#0A2B6D] text-white shadow-md'
                          : 'bg-white text-[#0A2B6D] hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isActive ? 'bg-white/15 text-white' : 'bg-[#0072FF]/10 text-[#0072FF]'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold">
                            {panel.title}
                          </div>
                          <div
                            className={`truncate text-xs font-semibold ${
                              isActive ? 'text-white/80' : 'text-[#0A2B6D]/65'
                            }`}
                          >
                            {panel.kpi}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-[#FF2E9A] text-white'
                            : 'bg-slate-100 text-[#0A2B6D]'
                        }`}
                      >
                        {panel.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Main Canvas Inside Mockup */}
              <div className="p-5 sm:p-7 lg:col-span-8 space-y-6 bg-white">
                {/* Active Panel Spotlight Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-5">
                  <div className="text-left">
                    <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                      <span>Active Module Telemetry</span>
                      <span>•</span>
                      <span className="text-[#FF2E9A]">{activePanel.status}</span>
                    </div>
                    <h3 className="mt-1 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                      {activePanel.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#0A2B6D]/75">
                      {activePanel.summary}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-[#0A2B6D] px-4 py-3 text-center text-white">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/75">
                      Live Benchmark
                    </div>
                    <div className="mt-0.5 font-editorial text-lg font-extrabold text-white">
                      {activePanel.kpi}
                    </div>
                  </div>
                </div>

                {/* All 6 Connected Widget Cards Inside the Executive Dashboard Canvas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {/* 1. Compliance Score */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                        Compliance Score
                      </span>
                      <ShieldCheck className="h-4 w-4 text-[#0072FF]" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D]">
                        99.2%
                      </span>
                      <span className="text-xs font-bold text-emerald-600">+2.4% Q4</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-[#0072FF] to-[#5A00D6]" />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[#0A2B6D]/75">
                      356 / 356 NDIS checkpoints verified
                    </p>
                  </div>

                  {/* 2. Training Compliance */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        Training Compliance
                      </span>
                      <GraduationCap className="h-4 w-4 text-[#5A00D6]" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D]">
                        98.9%
                      </span>
                      <span className="text-xs font-bold text-[#5A00D6]">LMS Active</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A]" />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[#0A2B6D]/75">
                      Mandatory NDIS orientation &amp; CPR current
                    </p>
                  </div>

                  {/* 3. Open Incidents */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                        Open Incidents
                      </span>
                      <AlertTriangle className="h-4 w-4 text-[#FF2E9A]" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D]">
                        2 Active
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                        100% On-Time SLA
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#0A2B6D]/75">
                      24-hour &amp; 5-day Commission timers armed
                    </p>
                  </div>

                  {/* 4. Upcoming Reviews */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                        Upcoming Reviews
                      </span>
                      <CalendarClock className="h-4 w-4 text-[#0072FF]" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D]">
                        14 Due
                      </span>
                      <span className="text-xs font-bold text-[#0072FF]">Next 30 Days</span>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#0A2B6D]/75">
                      10-weekly participant reviews &amp; home risks queued
                    </p>
                  </div>

                  {/* 5. Staff Credentials */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                        Staff Credentials
                      </span>
                      <BadgeCheck className="h-4 w-4 text-[#5A00D6]" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D]">
                        100%
                      </span>
                      <span className="text-xs font-bold text-emerald-600">Roster Gate On</span>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#0A2B6D]/75">
                      NDIS Worker Screening, Blue Card &amp; First Aid verified
                    </p>
                  </div>

                  {/* 6. Participant Activity */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                        Participant Activity
                      </span>
                      <HeartHandshake className="h-4 w-4 text-[#FF2E9A]" />
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D]">
                        100%
                      </span>
                      <span className="text-xs font-bold text-[#FF2E9A]">Shift Notes Synced</span>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-[#0A2B6D]/75">
                      Goals, 3-part consents &amp; NDIS claims matched live
                    </p>
                  </div>
                </div>

                {/* Bottom Executive Status Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0A2B6D] px-5 py-3.5 text-white">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4 text-[#00C6FF]" />
                    <span>Executive Dashboard: Real-time 3-way match across Roster → Shift Note → NDIS Invoice</span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[#00C6FF] hover:underline"
                  >
                    <span>Explore Full Executive Dashboard</span>
                    <TrendingUp className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}