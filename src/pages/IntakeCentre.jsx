import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { base44 } from '@/api/base44Client';
import { Heart, Users, ArrowRight, ShieldCheck, Sparkles, ClipboardList, ClipboardCheck, CheckCircle2, UserCheck } from 'lucide-react';

const ACTIVE_STATUSES = ['Draft', 'Information Required', 'Ready for Review'];

const TILES = [
  { label: 'In progress', keys: ['Draft', 'Information Required'], gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', icon: ClipboardList },
  { label: 'Ready for review', keys: ['Ready for Review'], gradient: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', icon: ClipboardCheck },
  { label: 'Approved', keys: ['Approved'], gradient: 'linear-gradient(135deg, #10b981, #059669)', icon: CheckCircle2 },
  { label: 'Converted to profile', keys: ['Converted to Profile'], gradient: 'linear-gradient(135deg, #ec4899, #e11d48)', icon: UserCheck },
];

const OPTIONS = [
  {
    title: 'Participant Intake',
    desc: 'Complete participant details, collect required forms, review readiness and create an approved participant profile.',
    to: '/intake/participant',
    icon: Heart,
    color: '#be185d',
    gradient: 'from-pink-100 via-rose-50 to-orange-50',
    border: 'border-pink-200',
    badge: 'Participant onboarding',
  },
  {
    title: 'Employee Intake',
    desc: 'Manage applicants, collect onboarding evidence, complete approvals and create an employee profile.',
    to: '/intake/employee',
    icon: Users,
    color: '#6d28d9',
    gradient: 'from-violet-100 via-purple-50 to-blue-50',
    border: 'border-violet-200',
    badge: 'Workforce onboarding',
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

  const count = (map, keys) => keys.reduce((t, k) => t + ((stats?.[map]?.[k]) || 0), 0);
  const grand = (map) => Object.values(stats?.[map] || {}).reduce((t, n) => t + n, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-3 p-3 md:p-4">
      <PageHeader title="Intake Centre" subtitle="Choose an intake stream to open cases, collect evidence, review readiness and create approved profiles." />
      <RegisterInsights module="intake" />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {TILES.map((tile) => (
          <div key={tile.label} className="relative overflow-hidden rounded-2xl p-3.5 text-white shadow-lg" style={{ background: tile.gradient }}>
            <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/20 blur-xl" />
            <tile.icon className="h-5 w-5 opacity-90" />
            <div className="mt-2 text-2xl font-extrabold tabular-nums">{stats ? count('p', tile.keys) + count('e', tile.keys) : '…'}</div>
            <div className="text-xs font-semibold text-white/85">{tile.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <Link
            key={o.to}
            to={o.to}
            className={`group relative flex min-h-52 flex-col overflow-hidden rounded-3xl border bg-gradient-to-br ${o.gradient} ${o.border} p-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:from-card dark:via-card dark:to-card`}
          >
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: o.color }} />
            <div className="relative flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${o.color}, ${o.color}bb)` }}>
                <o.icon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold shadow-sm dark:bg-white/10" style={{ color: o.color }}>{o.badge}</span>
                <div className="mt-1.5 text-xs font-semibold text-foreground/60">
                  {stats ? `${count(o.title === 'Participant Intake' ? 'p' : 'e', ACTIVE_STATUSES)} active · ${grand(o.title === 'Participant Intake' ? 'p' : 'e')} total` : ''}
                </div>
              </div>
            </div>
            <div className="relative mt-3 font-display text-xl font-extrabold">{o.title}</div>
            <div className="relative mt-1.5 flex-1 text-sm leading-6 text-foreground/65">{o.desc}</div>
            <span className="relative mt-3 inline-flex items-center justify-center gap-2 self-start rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all group-hover:gap-3" style={{ backgroundColor: o.color }}>
              Open {o.title} <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-r from-violet-100 via-white to-cyan-100 p-4 shadow-lg shadow-violet-500/5 dark:border-cyan-900 dark:from-violet-950/30 dark:via-card dark:to-cyan-950/25">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/15 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-base font-bold"><Sparkles className="h-4 w-4 text-fuchsia-600" />Secure, guided onboarding</div>
            <p className="mt-1 text-sm leading-6 text-foreground/60">Each stream keeps identity details, evidence, forms and approval steps together.</p>
          </div>
        </div>
      </div>
    </div>
  );
}