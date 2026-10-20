import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { base44 } from '@/api/base44Client';
import { STATUS_HEX, STATUS_ORDER } from '@/components/intake/intakeDisplay';
import { Heart, Users, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

const ACTIVE_STATUSES = ['Draft', 'Information Required', 'Ready for Review'];

const STREAMS = [
  {
    title: 'Participant Intake',
    desc: 'Complete participant details, collect required forms, review readiness and create an approved participant profile.',
    to: '/intake/participant',
    icon: Heart,
    text: '#fff1f5',
    badge: 'Participant onboarding',
    map: 'p',
  },
  {
    title: 'Employee Intake',
    desc: 'Manage applicants, collect onboarding evidence, complete approvals and create an employee profile.',
    to: '/intake/employee',
    icon: Users,
    text: '#f3f0ff',
    badge: 'Workforce onboarding',
    map: 'e',
  },
];

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
  const sum = (map, keys) => keys.reduce((t, k) => t + ((stats?.[map]?.[k]) || 0), 0);
  const grand = (map) => Object.values(stats?.[map] || {}).reduce((t, n) => t + n, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-3 p-3 md:p-4">
      <PageHeader title="Intake Centre" subtitle="Choose an intake stream to open cases, collect evidence, review readiness and create approved profiles." />
      <RegisterInsights module="intake" />

      <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><Activity className="h-4 w-4" /></span>
            Pipeline at a glance
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">{stats ? `${total} cases` : '…'}</span>
        </div>
        {total > 0 ? (
          <>
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              {STATUS_ORDER.filter((s) => merged[s]).map((s) => (
                <span key={s} style={{ flexBasis: `${(merged[s] / total) * 100}%`, backgroundColor: STATUS_HEX[s] || '#94a3b8' }} />
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              {STATUS_ORDER.filter((s) => merged[s]).map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_HEX[s] || '#94a3b8' }} />
                  {s} <span className="tabular-nums text-foreground/45">{merged[s]}</span>
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{stats ? 'No intake cases yet — open a stream below to start your first case.' : 'Loading pipeline…'}</p>
        )}
      </div>

      <div className="space-y-3">
        {STREAMS.map((stream, index) => (
          <Link
            key={stream.to}
            to={stream.to}
            className="group relative block overflow-hidden rounded-2xl p-5 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: index === 0
                ? 'linear-gradient(120deg, #db2777 0%, #ec4899 55%, #f97316 100%)'
                : 'linear-gradient(120deg, #7c3aed 0%, #6d28d9 55%, #2563eb 100%)',
              color: stream.text,
            }}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-14 right-1/3 h-28 w-28 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-md ring-1 ring-white/30" style={{ backdropFilter: 'blur(4px)' }}>
                <stream.icon className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-extrabold">{stream.title}</h2>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">{stream.badge}</span>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 opacity-80">{stream.desc}</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {[
                    { label: 'Active', value: stats ? sum(stream.map, ACTIVE_STATUSES) : null },
                    { label: 'Ready for review', value: stats ? ((stats[stream.map]['Ready for Review']) || 0) : null },
                    { label: 'Total cases', value: stats ? grand(stream.map) : null },
                  ].map((chip) => (
                    <span key={chip.label} className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold" style={{ backdropFilter: 'blur(4px)' }}>
                      {chip.label} <span className="tabular-nums opacity-80">{chip.value === null ? '…' : chip.value}</span>
                    </span>
                  ))}
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold shadow-md transition-all group-hover:gap-3" style={{ color: index === 0 ? '#be185d' : '#6d28d9' }}>
                Open <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-cyan-200 bg-gradient-to-r from-violet-100 via-white to-cyan-100 p-3.5 dark:border-cyan-900 dark:from-violet-950/30 dark:via-card dark:to-cyan-950/25">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <p className="text-sm leading-6 text-foreground/70"><span className="font-bold text-foreground">Secure, guided onboarding.</span> Each stream keeps identity details, evidence, forms and approval steps together, and carries consents, referee checks and documents onto the created profile.</p>
      </div>
    </div>
  );
}