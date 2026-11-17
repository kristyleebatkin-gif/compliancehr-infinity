import React from 'react';
import { Gauge, ShieldCheck, FileCheck2, AlertTriangle, CalendarClock } from 'lucide-react';
import { readinessBand } from '@/lib/v8000Engine';

function tile(tone) {
  return tone === 'unmeasured' ? 'unmeasured' : tone;
}

/** Readiness, trust, coverage, gaps and reviews, each stating the records behind it. */
export default function ReadinessStrip({ position }) {
  if (!position) return null;
  const band = readinessBand(position.readiness.score);
  const pct = (value) => (Number.isFinite(value) ? `${value}%` : 'Not measured');

  const tiles = [
    {
      key: 'readiness',
      icon: Gauge,
      label: 'V8000 readiness',
      value: Number.isFinite(position.readiness.score) ? `${position.readiness.score}%` : 'Not measured',
      tone: band.tone,
      note: Number.isFinite(position.readiness.score)
        ? `${band.label}. Measured on ${position.readiness.coverage}% of the weighting; unmeasured parts are not scored.`
        : 'No controls, evidence or findings are recorded yet, so readiness cannot be calculated.',
    },
    {
      key: 'trust',
      icon: ShieldCheck,
      label: 'Trust',
      value: pct(position.trust),
      tone: position.trust === null ? 'unmeasured' : position.trust >= 75 ? 'good' : position.trust >= 50 ? 'watch' : 'risk',
      note: position.activeControls
        ? `${position.verifiedControls} of ${position.activeControls} active controls hold verified evidence.`
        : 'No active controls recorded.',
    },
    {
      key: 'coverage',
      icon: FileCheck2,
      label: 'Evidence coverage',
      value: pct(position.coverage),
      tone: position.coverage === null ? 'unmeasured' : position.coverage >= 75 ? 'good' : position.coverage >= 50 ? 'watch' : 'risk',
      note: position.activeControls
        ? `${position.holdingControls} of ${position.activeControls} controls hold verified or in-date evidence.`
        : 'No active controls recorded.',
    },
    {
      key: 'gaps',
      icon: AlertTriangle,
      label: 'Open gaps',
      value: String(position.controlsMissing + position.expiredOnActive),
      tone: position.controlsMissing + position.expiredOnActive === 0 ? 'good' : 'risk',
      note: `${position.controlsMissing} control(s) with no current evidence, ${position.expiredOnActive} on expired or rejected evidence.`,
    },
    {
      key: 'reviews',
      icon: CalendarClock,
      label: 'Reviews due',
      value: String(position.controlTestsOverdue + position.findingsOverdue),
      tone: position.controlTestsOverdue + position.findingsOverdue === 0 ? 'good' : 'watch',
      note: `${position.controlTestsOverdue} control test(s) and ${position.findingsOverdue} finding(s) past their date.`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {tiles.map(({ key, icon: Icon, label, value, tone, note }) => (
        <div key={key} className="v8-kpi">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" style={{ color: '#8FD8FF' }} aria-hidden="true" />
            <p className="v8-muted font-bold uppercase tracking-wide">{label}</p>
          </div>
          <p className="v8-kpi-value mt-1" data-tone={tile(tone)}>{value}</p>
          <p className="v8-muted mt-1 leading-snug">{note}</p>
        </div>
      ))}
    </div>
  );
}