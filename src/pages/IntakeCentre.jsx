import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { base44 } from '@/api/base44Client';
import { STATUS_HEX, STATUS_ORDER } from '@/components/intake/intakeDisplay';
import { Heart, Users, ArrowRight } from 'lucide-react';

const ACTIVE_STATUSES = ['Draft', 'Information Required', 'Ready for Review'];

const STREAMS = [
  {
    title: 'Participant Intake',
    desc: 'Details, forms, referee checks and approvals — then a ready participant profile.',
    to: '/intake/participant',
    icon: Heart,
    badge: 'Participant onboarding',
    gradient: 'linear-gradient(160deg, #be185d 0%, #db2777 45%, #f97316 100%)',
    cta: '#be185d',
    map: 'p',
  },
  {
    title: 'Employee Intake',
    desc: 'Applicants, onboarding evidence, approvals and a ready employee profile.',
    to: '/intake/employee',
    icon: Users,
    badge: 'Workforce onboarding',
    gradient: 'linear-gradient(160deg, #6d28d9 0%, #7c3aed 45%, #2563eb 100%)',
    cta: '#6d28d9',
    map: 'e',
  },
];

function ReadinessRing({ value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 88 88" className="h-24 w-24 -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="7" />
        <circle
          cx="44" cy="44" r={r} fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-extrabold tabular-nums text-white">{pct}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">ready</span>
      </div>
    </div>
  );
}

function StreamPanel({ stream, stats }) {
  const map = stats?.[stream.map] || {};
  const total = Object.values(map).reduce((t, n) => t + n, 0);
  const ready = map['Ready for Review'] || 0;
  const active = ACTIVE_STATUSES.reduce((t, s) => t + (map[s] || 0), 0);
  return (
    <Link
      to={stream.to}
      className="group relative flex min-h-[400px] flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center transition-all hover:brightness-105"
      style={{ background: stream.gradient }}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <span className="pointer-events-none absolute left-0 top-0 h-[2px] w-2/3" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.7), transparent)' }} />
      <span className="relative rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/85 ring-1 ring-white/25" style={{ backdropFilter: 'blur(4px)' }}>{stream.badge}</span>
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/30 transition-transform duration-200 group-hover:scale-105" style={{ backdropFilter: 'blur(4px)' }}>
        <stream.icon className="h-8 w-8 text-white" />
      </div>
      <h2 className="relative font-display text-2xl font-extrabold text-white">{stream.title}</h2>
      <p className="relative max-w-sm text-sm leading-6 text-white/75">{stream.desc}</p>
      <ReadinessRing value={ready} total={total} />
      <div className="relative flex flex-wrap justify-center gap-2">
        <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold text-white" style={{ backdropFilter: 'blur(4px)' }}>Active <span className="tabular-nums opacity-80">{stats ? active : '…'}</span></span>
        <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold text-white" style={{ backdropFilter: 'blur(4px)' }}>Ready for review <span className="tabular-nums opacity-80">{stats ? ready : '…'}</span></span>
        <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold text-white" style={{ backdropFilter: 'blur(4px)' }}>Total <span className="tabular-nums opacity-80">{stats ? total : '…'}</span></span>
      </div>
      <span className="relative mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold shadow-lg transition-all group-hover:gap-3" style={{ color: stream.cta }}>
        Open <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export default function IntakeCentre({ embedded = false, profile, profileKind } = {}) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [p, e] = await Promise.all([
          base44.entities.IntakeCase.aggregate({ query: { intake_type: 'Participant' }, groupBy: 'status' }),
          base44.entities.IntakeCase.aggregate({ query: { intake_type: 'Employee' }, groupBy: 'status' }),
        ]);
        if (!live) return;
        const toMap = (rows = []) => Object.fromEntries(rows.map((r) => [r.status, r.count]));
        setStats({ p: toMap(p.rows), e: toMap(e.rows) });
      } catch {
        if (live) setStats({ p: {}, e: {} });
      }
    })();
    return () => { live = false; };
  }, []);

  if (embedded) return (
    <div className="space-y-4">
      <Tabs defaultValue={profileKind === 'participant' ? 'Participant' : 'Employee'}>
        <TabsList><TabsTrigger value={profileKind === 'participant' ? 'Participant' : 'Employee'}>{profileKind === 'participant' ? 'Participant Intake' : 'Employee Intake'}</TabsTrigger></TabsList>
        <TabsContent value={profileKind === 'participant' ? 'Participant' : 'Employee'}><IntakeCaseWorkflow intakeType={profileKind === 'participant' ? 'Participant' : 'Employee'} profile={profile} /></TabsContent>
      </Tabs>
    </div>
  );

  const merged = {};
  ['p', 'e'].forEach((key) => Object.entries(stats?.[key] || {}).forEach(([status, count]) => {
    merged[status] = (merged[status] || 0) + count;
  }));
  const total = Object.values(merged).reduce((t, n) => t + n, 0);

  return (
    <div className="p-3 md:p-4">
      <PageHeader title="Intake Centre" subtitle="Two onboarding portals: choose a stream to open cases, collect evidence, review readiness and create approved profiles." />
      <div className="mt-3 overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-xl">
        <div className="grid md:grid-cols-2">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500"><StreamPanel stream={STREAMS[0]} stats={stats} /></div>
          <div className="hidden w-px md:block" style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700"><StreamPanel stream={STREAMS[1]} stats={stats} /></div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/10 bg-white/5 px-4 py-2.5" style={{ backdropFilter: 'blur(6px)' }}>
          <span className="text-xs font-bold uppercase tracking-wider text-white/60">Pipeline</span>
          {total > 0 ? (
            <>
              <div className="flex h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-white/10">
                {STATUS_ORDER.filter((s) => merged[s]).map((s) => (
                  <span key={s} style={{ flexBasis: `${(merged[s] / total) * 100}%`, backgroundColor: STATUS_HEX[s] || '#94a3b8' }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {STATUS_ORDER.filter((s) => merged[s]).map((s) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs font-semibold text-white/75">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_HEX[s] || '#94a3b8' }} />
                    {s} <span className="tabular-nums text-white/50">{merged[s]}</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <span className="text-xs font-semibold text-white/60">{stats ? 'No cases yet — open a portal above.' : 'Loading pipeline…'}</span>
          )}
        </div>
      </div>
      <div className="mt-3"><RegisterInsights module="intake" /></div>
    </div>
  );
}