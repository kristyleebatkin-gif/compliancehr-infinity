import React from 'react';
import { CalendarClock, ClipboardList, Heart, ShieldAlert, Stethoscope, UserCheck } from 'lucide-react';

const tilesFor = (metrics) => [
  { key: 'activePlans', label: 'Active care plans', icon: ClipboardList, hint: 'Plans marked Active' },
  { key: 'reviewsDue', label: 'Reviews due 30 days', icon: CalendarClock, hint: `${metrics.reviewsOverdue} overdue` },
  { key: 'openReferrals', label: 'Open referrals', icon: Stethoscope, hint: `${metrics.urgentReferrals} urgent` },
  { key: 'restrictivePractice', label: 'Restrictive practice', icon: ShieldAlert, hint: 'Plans recording a restrictive practice' },
  { key: 'consentPending', label: 'Consent pending', icon: UserCheck, hint: 'Plans and referrals awaiting consent' },
  { key: 'awaitingOutcome', label: 'Outcomes missing', icon: Heart, hint: 'Completed referrals with no outcome recorded' },
];

export default function ClinicalKpiStrip({ metrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tilesFor(metrics).map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.key} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</span>
              <Icon className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <div className="mt-1.5 text-2xl font-extrabold leading-none text-foreground">{metrics[tile.key] ?? 0}</div>
            <div className="mt-1.5 text-[11px] font-semibold leading-snug text-muted-foreground">{tile.hint}</div>
          </div>
        );
      })}
    </div>
  );
}